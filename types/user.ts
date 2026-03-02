export interface UserSettings {
  defaultSettlementCharge?: number;
  defaultCustomerCharge?: number;
  defaultCashMarginPercent?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: "admin" | "partner";
  displayName: string | null;
  createdAt?: string;
  settings?: UserSettings;
}
