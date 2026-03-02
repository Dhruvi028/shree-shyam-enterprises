"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { TransactionsTable } from "@/components/table/TransactionsTable";
import { Transaction } from "@/types/transaction";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { TransactionCSVActions } from "@/components/dashboard/TransactionCSVActions";
import { useUsers } from "@/hooks/useUsers";

export default function TransactionsPage() {
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

  const [pageSize, setPageSize] = useState(20);

  const {
    fetchTransactions,
    importTransactions,
    deleteTransaction,
    transactions,
    loading,
    hasMore,
  } = useTransactions();

  const { usersMap } = useUsers();

  useEffect(() => {
    fetchTransactions(true, dateRange.startDate, dateRange.endDate, pageSize);
  }, [fetchTransactions, dateRange, pageSize]);

  const handleTransactionSuccess = useCallback(() => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
    fetchTransactions(true, dateRange.startDate, dateRange.endDate, pageSize); // Refresh
  }, [fetchTransactions, dateRange, pageSize]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
  }, []);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm">
            Manage all your financial transactions
          </p>
        </div>
        <AppButton
          type="button"
          onClick={() => {
            setTransactionToEdit(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </AppButton>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <DateRangeFilter
          onRangeChange={setDateRange}
          initialRange={dateRange}
        />

        <div className="hidden lg:block h-12 w-px bg-slate-100 mx-2" />

        <TransactionCSVActions
          data={transactions}
          onImport={importTransactions}
          loading={loading}
          usersMap={usersMap}
          dateRange={dateRange}
        />
      </div>

      <div className="mt-8 space-y-4">
        <TransactionsTable
          data={transactions}
          loading={loading}
          onLoadMore={() =>
            fetchTransactions(
              false,
              dateRange.startDate,
              dateRange.endDate,
              pageSize,
            )
          }
          hasMore={hasMore}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
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
