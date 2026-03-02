"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AppInput } from "../ui/AppInput";
import { AppSelect } from "../ui/AppSelect";
import { AppButton } from "../ui/AppButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { BANK_OPTIONS } from "@/lib/constants";
import { Transaction } from "@/types/transaction";

interface TransactionFormData {
  cardHolderName: string;
  cardLast4Digits: string;
  mobileNumber: string;
  bankName: string;
  amountPaid: number;
  cashMarginPercent: number;
  mbrPercent: number;
  settlementChargeINR: number;
  customerChargePercent: number;
}

export function TransactionForm({
  onSuccess,
  initialData,
}: {
  onSuccess: () => void;
  initialData?: Transaction | null;
}) {
  const { profile } = useAuth();
  const { createTransaction, updateTransaction, loading } = useTransactions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    defaultValues: initialData
      ? {
          cardHolderName: initialData.cardHolderName,
          cardLast4Digits: initialData.cardLast4Digits,
          mobileNumber: initialData.mobileNumber,
          bankName: initialData.bankName,
          amountPaid:
            initialData.amountPaid ??
            (initialData as any).amount ??
            (initialData as any).payoutAmount ??
            0,
          cashMarginPercent: initialData.cashMarginPercent || 0,
          mbrPercent: initialData.mbrPercent || 0,
          settlementChargeINR: initialData.settlementChargeINR || 0,
          customerChargePercent: initialData.customerChargePercent || 0,
        }
      : {
          amountPaid: 0,
          cashMarginPercent: profile?.settings?.defaultCashMarginPercent || 0,
          mbrPercent: 0,
          customerChargePercent: profile?.settings?.defaultCustomerCharge || 0,
          settlementChargeINR: profile?.settings?.defaultSettlementCharge || 0,
        },
  });

  // Update defaults when profile loads and we're not editing
  useEffect(() => {
    if (profile && !initialData) {
      reset((prev) => ({
        ...prev,
        customerChargePercent: profile.settings?.defaultCustomerCharge || 0,
        settlementChargeINR: profile.settings?.defaultSettlementCharge || 0,
        cashMarginPercent: profile.settings?.defaultCashMarginPercent || 0,
      }));
    }
  }, [profile, initialData, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amountPaid: Number(data.amountPaid),
        cashMarginPercent: Number(data.cashMarginPercent),
        mbrPercent: Number(data.mbrPercent),
        settlementChargeINR: Number(data.settlementChargeINR),
        customerChargePercent: Number(data.customerChargePercent),
      };

      if (initialData?.id) {
        await updateTransaction(initialData.id, payload);
      } else {
        await createTransaction(payload);
      }

      reset();
      onSuccess();
    } catch (error) {
      // Error handled by hook toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          label="Cardholder Name"
          error={errors.cardHolderName?.message}
          {...register("cardHolderName", {
            required: "Cardholder name is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
          })}
        />
        <AppInput
          label="Card Number(Last 4)"
          maxLength={4}
          error={errors.cardLast4Digits?.message}
          leftAddon="•••• •••• •••• "
          {...register("cardLast4Digits", {
            required: "Last 4 digits are required",
            pattern: {
              value: /^[0-9]{4}$/,
              message: "Must be exactly 4 digits",
            },
          })}
          placeholder=" 1234"
        />
        <AppInput
          label="Mobile Number"
          type="tel"
          maxLength={10}
          error={errors.mobileNumber?.message}
          {...register("mobileNumber", {
            required: "Mobile number is required",
            pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" },
          })}
        />
        <AppSelect
          label="Bank Name"
          error={errors.bankName?.message}
          options={BANK_OPTIONS}
          placeholder="Select a bank"
          defaultValue=""
          {...register("bankName", { required: "Bank selection is required" })}
        />
      </div>

      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          type="number"
          step="0.01"
          label="Amount"
          error={errors.amountPaid?.message}
          {...register("amountPaid", {
            required: "Amount is required",
            min: { value: 1, message: "Amount must be at least 1" },
            valueAsNumber: true,
          })}
        />
        <AppInput
          type="number"
          step="0.01"
          label="Cash Margin (%)"
          error={errors.cashMarginPercent?.message}
          {...register("cashMarginPercent", {
            required: "Cash margin is required",
            min: { value: 0, message: "Cannot be negative" },
            max: { value: 100, message: "Cannot exceed 100%" },
            valueAsNumber: true,
          })}
        />
        <AppInput
          type="number"
          step="0.01"
          label="MBR %"
          error={errors.mbrPercent?.message}
          {...register("mbrPercent", {
            required: "MBR is required",
            min: { value: 0, message: "Cannot be negative" },
            max: { value: 100, message: "Cannot exceed 100%" },
            valueAsNumber: true,
          })}
        />
        <AppInput
          type="number"
          step="0.01"
          label="Settlement Charge (INR)"
          error={errors.settlementChargeINR?.message}
          {...register("settlementChargeINR", {
            required: "Settlement charge is required",
            min: { value: 0, message: "Cannot be negative" },
            valueAsNumber: true,
          })}
        />
        <AppInput
          type="number"
          step="0.01"
          label="Customer Charge %"
          error={errors.customerChargePercent?.message}
          {...register("customerChargePercent", {
            required: "Customer charge is required",
            min: { value: 0, message: "Cannot be negative" },
            max: { value: 100, message: "Cannot exceed 100%" },
            valueAsNumber: true,
          })}
        />
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t mt-4">
        <AppButton type="submit" disabled={loading}>
          {loading
            ? "Processing..."
            : initialData
              ? "Update Transaction"
              : "Submit Transaction"}
        </AppButton>
      </div>
    </form>
  );
}
