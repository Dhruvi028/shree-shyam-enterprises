import { useState, useCallback, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Transaction } from "@/types/transaction";
import { toast } from "sonner";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingBus = useRef(false);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const hasMoreRef = useRef(true);

  const calculateFields = (data: any) => {
    const amountPaid = Number(data.amountPaid || 0);
    const cashMarginPercent = Number(data.cashMarginPercent || 0);
    const mbrPercent = Number(data.mbrPercent || 0);
    const settlementChargeINR = Number(data.settlementChargeINR || 0);
    const customerChargePercent = Number(data.customerChargePercent || 0);

    const cashAmount = amountPaid * (cashMarginPercent / 100);
    const customerChargeAmount = amountPaid * (customerChargePercent / 100);
    const mbrAmount = amountPaid * (mbrPercent / 100);
    const totalCost = mbrAmount + settlementChargeINR;
    const netProfit = customerChargeAmount - totalCost;
    const cardAmount = amountPaid + customerChargeAmount - cashAmount;

    return {
      amountPaid,
      cashAmount,
      cashMarginPercent,
      cardAmount,
      mbrPercent,
      settlementChargeINR,
      customerChargePercent,
      mbrAmount,
      customerChargeAmount,
      totalCost,
      netProfit,
    };
  };

  const createTransaction = async (data: any) => {
    try {
      if (!auth.currentUser) {
        throw new Error("Must be logged in to create a transaction");
      }

      const calculated = calculateFields(data);

      const transactionData = {
        ...data,
        ...calculated,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(db, "transactions"),
        transactionData,
      );

      toast.success("Transaction created successfully!");
      return { id: docRef.id, ...transactionData };
    } catch (error: any) {
      toast.error(error.message || "Failed to create transaction");
      throw error;
    }
  };

  const updateTransaction = async (id: string, data: any) => {
    try {
      if (!auth.currentUser) {
        throw new Error("Must be logged in to update a transaction");
      }

      const calculated = calculateFields(data);

      const transactionData = {
        ...data,
        ...calculated,
        updatedAt: new Date().toISOString(),
      };

      const docRef = doc(db, "transactions", id);
      await updateDoc(docRef, transactionData);

      toast.success("Transaction updated successfully!");
      return { id, ...transactionData };
    } catch (error: any) {
      toast.error(error.message || "Failed to update transaction");
      throw error;
    }
  };

  const importTransactions = async (list: any[]) => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const { writeBatch, collection, doc } =
        await import("firebase/firestore");
      const batch = writeBatch(db);
      const txRef = collection(db, "transactions");

      for (const item of list) {
        const calculated = calculateFields(item);
        const newDoc = doc(txRef);
        batch.set(newDoc, {
          ...item,
          ...calculated,
          createdBy: auth.currentUser!.uid,
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }

      await batch.commit();
      toast.success(`Imported ${list.length} transactions!`);
      fetchTransactions(true);
    } catch (error: any) {
      toast.error("Failed to import transactions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Transaction deleted successfully!");

      // Update local state directly to be optimistic without re-fetching everything
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete transaction");
      throw error;
    }
  };

  const fetchTransactions = useCallback(
    async (
      reset = false,
      startDate?: string,
      endDate?: string,
      pageSize = 20,
    ) => {
      if (isFetchingBus.current || (!hasMoreRef.current && !reset)) return;

      isFetchingBus.current = true;
      setLoading(true);
      try {
        const txRef = collection(db, "transactions");
        let q = query(txRef, orderBy("createdAt", "desc"), limit(pageSize));

        if (startDate) {
          q = query(q, where("createdAt", ">=", startDate));
        }
        if (endDate) {
          q = query(q, where("createdAt", "<=", endDate + "T23:59:59.999Z"));
        }

        if (!reset && lastDocRef.current) {
          q = query(q, startAfter(lastDocRef.current));
        }

        const snapshot = await getDocs(q);
        const fetched: Transaction[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        if (reset) {
          setTransactions(fetched);
        } else {
          setTransactions((prev) => [...prev, ...fetched]);
        }

        const last = snapshot.docs[snapshot.docs.length - 1] || null;
        lastDocRef.current = last;

        const more = snapshot.docs.length === pageSize;
        hasMoreRef.current = more;
        setHasMore(more);
      } catch (error: any) {
        toast.error("Failed to fetch transactions");
        console.error(error);
      } finally {
        setLoading(false);
        isFetchingBus.current = false;
      }
    },
    [], // Stable identity
  );

  return {
    createTransaction,
    updateTransaction,
    importTransactions,
    deleteTransaction,
    fetchTransactions,
    transactions,
    loading,
    hasMore,
  };
}
