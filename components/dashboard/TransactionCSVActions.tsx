"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  FileUp,
  FileDown,
  Loader2,
  History as HistoryIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { AppButton } from "../ui/AppButton";
import { toast } from "sonner";
import { Transaction } from "@/types/transaction";
import Papa from "papaparse";

interface Props {
  data: Transaction[];
  onImport: (list: any[]) => Promise<void>;
  loading?: boolean;
  usersMap?: Record<string, string>;
  dateRange: { startDate: string; endDate: string };
}

export function TransactionCSVActions({
  data,
  onImport,
  loading,
  usersMap = {},
  dateRange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = data.map((item) => ({
        Date: item.createdAt
          ? format(new Date(item.createdAt), "dd-MM-yyyy HH:mm")
          : "",
        "Card Holder Name": item.cardHolderName,
        "Bank Name": item.bankName,
        "Card Number": item.cardLast4Digits,
        "Mobile Number": item.mobileNumber,
        "Amount Paid": item.amountPaid,
        "MBR %": item.mbrPercent,
        "MBR Amount": item.mbrAmount,
        "Settlement Charge (INR)": item.settlementChargeINR,
        "Customer Charge %": item.customerChargePercent,
        "Customer Charge Amount": item.customerChargeAmount,
        "Cash Margin %": item.cashMarginPercent,
        "Cash Amount": item.cashAmount,
        "Total Cost": item.totalCost,
        "Net Profit": item.netProfit,
        "Created By": usersMap[item.createdBy] || item.createdBy || "System",
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `audit_export_${dateRange.startDate}_to_${dateRange.endDate}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audit data exported successfully");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePLReport = () => {
    if (data.length === 0) {
      toast.error("No data for P&L Report");
      return;
    }

    const report = {
      "Total Revenue (Customer Charges)": data.reduce(
        (sum, item) => sum + (item.customerChargeAmount || 0),
        0,
      ),
      "Total MBR Cost": data.reduce(
        (sum, item) => sum + (item.mbrAmount || 0),
        0,
      ),
      "Total Settlement Charges": data.reduce(
        (sum, item) => sum + (item.settlementChargeINR || 0),
        0,
      ),
      "Total Cash Distributed": data.reduce(
        (sum, item) => sum + (item.cashAmount || 0),
        0,
      ),
      "Total Costs (MBR + Settlement + Cash)": data.reduce(
        (sum, item) => sum + (item.totalCost || 0),
        0,
      ),
      "NET PROFIT": data.reduce((sum, item) => sum + (item.netProfit || 0), 0),
    };

    const csv = Papa.unparse([
      {
        "Report Name": "Profit & Loss Report",
        Period: `${dateRange.startDate} to ${dateRange.endDate}`,
        "Generated At": format(new Date(), "dd-MM-yyyy HH:mm"),
      },
      {}, // Empty row for spacing
      report,
    ]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `PL_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("P&L Report generated");
  };

  const handleBalanceSheet = () => {
    if (data.length === 0) {
      toast.error("No data for Balance Sheet");
      return;
    }

    const report = {
      "Total Gross Volume": data.reduce(
        (sum, item) => sum + (item.amountPaid || 0),
        0,
      ),
      "Total Payouts to Customers": data.reduce(
        (sum, item) => sum + (item.amountPaid - (item.cashAmount || 0)),
        0,
      ),
      "Total Cash Margin Held": data.reduce(
        (sum, item) => sum + (item.cashAmount || 0),
        0,
      ),
      "Card Swiped Volume": data.reduce(
        (sum, item) =>
          sum + (item.cardAmount || item.amountPaid - (item.cashAmount || 0)),
        0,
      ),
      "Number of Transactions": data.length,
    };

    const csv = Papa.unparse([
      {
        "Report Name": "Balance Sheet Report",
        Period: `${dateRange.startDate} to ${dateRange.endDate}`,
        "Generated At": format(new Date(), "dd-MM-yyyy HH:mm"),
      },
      {}, // Empty row for spacing
      report,
    ]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Balance_Sheet_${dateRange.startDate}_to_${dateRange.endDate}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Balance Sheet generated");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async (results) => {
        if (results.data && results.data.length > 0) {
          const confirmed = window.confirm(
            `Found ${results.data.length} transactions. Import them?`,
          );
          if (confirmed) {
            await onImport(results.data);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        } else {
          toast.error("No valid data found in CSV");
        }
      },
      error: (err) => {
        toast.error("Failed to parse CSV: " + err.message);
      },
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        cardHolderName: "John Doe",
        cardLast4Digits: "1234",
        mobileNumber: "9876543210",
        bankName: "HDFC",
        amountPaid: 10000,
        cashMarginPercent: 2,
        mbrPercent: 1.5,
        settlementChargeINR: 50,
        customerChargePercent: 3,
        createdAt: new Date().toISOString(),
      },
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transaction_template.csv";
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Data Management Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Operations
        </span>
        <div className="flex items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleImportClick}
            disabled={loading}
            className="h-9 text-xs border-slate-200 hover:border-primary/30 bg-slate-50/50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileUp className="w-3.5 h-3.5 mr-1.5" />
            )}
            Import
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 text-xs border-slate-200 bg-slate-50/50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
            )}
            Audit Export
          </AppButton>
          <button
            onClick={downloadTemplate}
            className="text-[10px] text-slate-500 hover:text-primary transition-colors pl-2 flex flex-col leading-tight border-l border-slate-200 ml-1"
          >
            Download
            <span className="font-semibold underline">Template</span>
          </button>
        </div>
      </div>

      <div className="hidden lg:block h-10 w-px bg-slate-200/60 self-end mb-1" />

      {/* Reports Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
          Reports
        </span>
        <div className="flex items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handlePLReport}
            className="h-9 text-xs text-primary border-primary/20 hover:bg-emerald-50 hover:border-primary/40 transition-all font-medium"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            P&L Report
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleBalanceSheet}
            className="h-9 text-xs text-blue-600 border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all font-medium"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            Balance Sheet
          </AppButton>
        </div>
      </div>
    </div>
  );
}
