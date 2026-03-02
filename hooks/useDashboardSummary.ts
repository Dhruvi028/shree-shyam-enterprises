import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { DashboardSummary } from "@/types/transaction";
import { toast } from "sonner";

export function useDashboardSummary(startDate: string, endDate: string) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const txRef = collection(db, "transactions");
        const q = query(
          txRef,
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate + "T23:59:59.999Z"),
        );

        const snapshot = await getDocs(q);

        let totalVolume = 0;
        let totalChargesCollected = 0;
        let totalExpenses = 0;
        let totalNetProfit = 0;

        snapshot.forEach((doc) => {
          const tx = doc.data();
          totalVolume += tx.amount || 0;
          totalChargesCollected += tx.customerChargeAmount || 0;
          totalExpenses += tx.totalCost || 0;
          totalNetProfit += tx.netProfit || 0;
        });

        setSummary({
          totalVolume,
          totalChargesCollected,
          totalExpenses,
          totalNetProfit,
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard summary");
        console.error("Aggregation error", error);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchSummary();
    }
  }, [startDate, endDate]);

  return { summary, loading };
}
