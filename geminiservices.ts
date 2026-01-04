import { GoogleGenAI, Type } from "@google/genai";
import { MarketSnapshotData, GroundingSource } from "../types";

export const fetchMarketSnapshot = async (): Promise<MarketSnapshotData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const prompt = `Act as a senior market analyst for an Indian Stock Broker. 
  Fetch and provide the COMPLETE closing market data for Indian markets as of today: ${today}.
  
  Data requirements:
  1. Indices: Nifty 50, Sensex, Nifty Bank (Value, Absolute Change, % Change).
  2. Commodities: Gold (10gm MCX), Brent Crude Oil ($), USD/INR Rate.
  3. Market Action: Top 5 Nifty 50 Gainers and Losers (Company, Price, % Change).
  4. Market Breadth: Advance/Decline ratio for NSE.
  5. Institutional Flows: FII and DII Cash segment Net Buy/Sell for today AND Month-Till-Date (MTD) in ₹ Crores.
  
  Return the results ONLY as a valid JSON object matching the provided schema. Ensure 'isPositive' is correctly set based on the change.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            indices: {
              type: Type.OBJECT,
              properties: {
                nifty50: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] },
                sensex: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] },
                niftyBank: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] }
              },
              required: ["nifty50", "sensex", "niftyBank"]
            },
            commodities: {
              type: Type.OBJECT,
              properties: {
                gold: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] },
                oil: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] },
                usdInr: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } }, required: ["value", "change", "percentChange", "isPositive"] }
              },
              required: ["gold", "oil", "usdInr"]
            },
            gainers: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { company: { type: Type.STRING }, price: { type: Type.STRING }, percentChange: { type: Type.STRING } }, required: ["company", "price", "percentChange"] }
            },
            losers: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { company: { type: Type.STRING }, price: { type: Type.STRING }, percentChange: { type: Type.STRING } }, required: ["company", "price", "percentChange"] }
            },
            advanceDecline: {
              type: Type.OBJECT,
              properties: { advances: { type: Type.NUMBER }, declines: { type: Type.NUMBER }, advancePercent: { type: Type.STRING }, declinePercent: { type: Type.STRING } },
              required: ["advances", "declines", "advancePercent", "declinePercent"]
            },
            fii: {
              type: Type.OBJECT,
              properties: {
                daily: { type: Type.OBJECT, properties: { grossPurchase: { type: Type.STRING }, grossSales: { type: Type.STRING }, net: { type: Type.STRING } }, required: ["grossPurchase", "grossSales", "net"] },
                mtd: { type: Type.OBJECT, properties: { grossPurchase: { type: Type.STRING }, grossSales: { type: Type.STRING }, net: { type: Type.STRING } }, required: ["grossPurchase", "grossSales", "net"] }
              },
              required: ["daily", "mtd"]
            },
            dii: {
              type: Type.OBJECT,
              properties: {
                daily: { type: Type.OBJECT, properties: { grossPurchase: { type: Type.STRING }, grossSales: { type: Type.STRING }, net: { type: Type.STRING } }, required: ["grossPurchase", "grossSales", "net"] },
                mtd: { type: Type.OBJECT, properties: { grossPurchase: { type: Type.STRING }, grossSales: { type: Type.STRING }, net: { type: Type.STRING } }, required: ["grossPurchase", "grossSales", "net"] }
              },
              required: ["daily", "mtd"]
            }
          },
          required: ["date", "indices", "commodities", "gainers", "losers", "advanceDecline", "fii", "dii"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI data retrieval failed");
    
    const parsedData: MarketSnapshotData = JSON.parse(text);
    
    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri
          });
        }
      });
    }
    
    return { ...parsedData, sources };
  } catch (error) {
    console.error("Market data fetch failed:", error);
    throw error;
  }
};