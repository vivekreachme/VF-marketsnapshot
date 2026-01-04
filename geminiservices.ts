
import { GoogleGenAI, Type } from "@google/genai";
import { MarketSnapshotData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchMarketSnapshot = async (): Promise<MarketSnapshotData> => {
  const prompt = `Fetch the latest closing market data for Indian markets as of today or the most recent trading day. 
  Include: 
  - Nifty 50, Sensex, Nifty Bank values and changes.
  - Gold (10gm) price and change.
  - Brent Crude Oil price and change.
  - USD/INR rate and change.
  - Top 5 Gainers of Nifty 50 (Company, Price, % Change).
  - Top 5 Losers of Nifty 50 (Company, Price, % Change).
  - FII and DII Cash segment data (Daily and Month-Till-Date).
  - Nifty 50 Advance/Decline ratio.
  
  Return the data in a strict JSON format matching the schema provided.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
              nifty50: { 
                type: Type.OBJECT, 
                properties: { 
                  value: { type: Type.STRING }, 
                  change: { type: Type.STRING }, 
                  percentChange: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN }
                },
                required: ["value", "change", "percentChange", "isPositive"]
              },
              sensex: { 
                type: Type.OBJECT, 
                properties: { 
                  value: { type: Type.STRING }, 
                  change: { type: Type.STRING }, 
                  percentChange: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN }
                },
                required: ["value", "change", "percentChange", "isPositive"]
              },
              niftyBank: { 
                type: Type.OBJECT, 
                properties: { 
                  value: { type: Type.STRING }, 
                  change: { type: Type.STRING }, 
                  percentChange: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN }
                },
                required: ["value", "change", "percentChange", "isPositive"]
              },
            },
            required: ["nifty50", "sensex", "niftyBank"]
          },
          commodities: {
            type: Type.OBJECT,
            properties: {
              gold: { 
                type: Type.OBJECT, 
                properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } },
                required: ["value", "change", "percentChange", "isPositive"]
              },
              oil: { 
                type: Type.OBJECT, 
                properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } },
                required: ["value", "change", "percentChange", "isPositive"]
              },
              usdInr: { 
                type: Type.OBJECT, 
                properties: { value: { type: Type.STRING }, change: { type: Type.STRING }, percentChange: { type: Type.STRING }, isPositive: { type: Type.BOOLEAN } },
                required: ["value", "change", "percentChange", "isPositive"]
              }
            },
            required: ["gold", "oil", "usdInr"]
          },
          gainers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { company: { type: Type.STRING }, price: { type: Type.STRING }, percentChange: { type: Type.STRING } },
              required: ["company", "price", "percentChange"]
            }
          },
          losers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { company: { type: Type.STRING }, price: { type: Type.STRING }, percentChange: { type: Type.STRING } },
              required: ["company", "price", "percentChange"]
            }
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

  return JSON.parse(response.text);
};
