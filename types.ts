
export interface IndexData {
  value: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
}

export interface StockInfo {
  company: string;
  price: string;
  percentChange: string;
}

export interface FIIDIIData {
  grossPurchase: string;
  grossSales: string;
  net: string;
}

export interface MarketSnapshotData {
  date: string;
  indices: {
    nifty50: IndexData;
    sensex: IndexData;
    niftyBank: IndexData;
  };
  commodities: {
    gold: IndexData;
    oil: IndexData;
    usdInr: IndexData;
  };
  gainers: StockInfo[];
  losers: StockInfo[];
  advanceDecline: {
    advances: number;
    declines: number;
    advancePercent: string;
    declinePercent: string;
  };
  fii: {
    mtd: FIIDIIData;
    daily: FIIDIIData;
  };
  dii: {
    mtd: FIIDIIData;
    daily: FIIDIIData;
  };
}
