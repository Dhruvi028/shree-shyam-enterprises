export interface Transaction {
  id: string;
  cardHolderName: string;
  cardLast4Digits: string;
  mobileNumber: string;
  bankName: string;
  amountPaid: number; // The total payout amount to the customer (e.g., 1,00,000)
  cashAmount: number; // The cash margin received (e.g., 20,000)
  cashMarginPercent: number; // The percentage of amountPaid that is cash margin
  cardAmount: number; // Calculated: The swiped portion (Amount - Cash)
  mbrPercent: number;
  settlementChargeINR: number;
  customerChargePercent: number;

  // Calculated values
  mbrAmount: number;
  customerChargeAmount: number;
  totalCost: number;
  netProfit: number;

  // Metadata
  createdBy: string;
  createdAt: string; // ISO string from server timestamp
}

export interface DashboardSummary {
  totalVolume: number;
  totalChargesCollected: number;
  totalExpenses: number;
  totalNetProfit: number;
}
