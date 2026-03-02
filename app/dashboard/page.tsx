"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  TrendingUp,
  HandCoins,
  CreditCard,
  Activity,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useTransactions } from "@/hooks/useTransactions";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { TransactionsTable } from "@/components/table/TransactionsTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Transaction } from "@/types/transaction";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useUsers } from "@/hooks/useUsers";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const {
    fetchTransactions,
    deleteTransaction,
    transactions,
    loading,
    hasMore,
  } = useTransactions();
  const { summary, loading: summaryLoading } = useDashboardSummary(
    dateRange.startDate,
    dateRange.endDate,
  );
  const { usersMap } = useUsers();

  useEffect(() => {
    fetchTransactions(true, dateRange.startDate, dateRange.endDate);
  }, [fetchTransactions, dateRange]);

  const handleTransactionSuccess = useCallback(() => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
    fetchTransactions(true, dateRange.startDate, dateRange.endDate); // Refresh
  }, [fetchTransactions, dateRange]);

  const openEditModal = useCallback((transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  }, []);

  const openDeleteDialog = useCallback((id: string) => {
    setTransactionToDelete(id);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setTransactionToDelete(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Overview of your financial performance
          </p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <DateRangeFilter
            onRangeChange={setDateRange}
            initialRange={dateRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Volume"
          amount={summary?.totalVolume || 0}
          icon={Activity}
          trend={{ value: 12.5, isPositive: true }}
        />
        <SummaryCard
          title="Total Charges Collected"
          amount={summary?.totalChargesCollected || 0}
          icon={CreditCard}
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.totalExpenses || 0}
          icon={HandCoins}
        />
        <SummaryCard
          title="Net Profit"
          amount={summary?.totalNetProfit || 0}
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-primary hover:text-primary-hover flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            View All
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <TransactionsTable
          data={transactions.slice(0, 5)}
          loading={loading}
          onLoadMore={() => {}}
          hasMore={false}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          usersMap={usersMap}
        />
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={closeEditModal}
        title={transactionToEdit ? "Edit Transaction" : "Record Transaction"}
      >
        <TransactionForm
          onSuccess={handleTransactionSuccess}
          initialData={transactionToEdit}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={!!transactionToDelete}
        onClose={closeDeleteDialog}
        isLoading={loading}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={async () => {
          if (transactionToDelete) {
            await deleteTransaction(transactionToDelete);
          }
        }}
      />
    </div>
  );
}
