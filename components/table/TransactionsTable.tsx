"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { BANK_OPTIONS } from "@/lib/constants";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Transaction } from "@/types/transaction";
import { formatINR } from "@/lib/utils";
import { AppButton } from "../ui/AppButton";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  data: Transaction[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  usersMap?: Record<string, string>;
}

const columnHelper = createColumnHelper<Transaction>();

export function TransactionsTable({
  data,
  loading,
  onLoadMore,
  hasMore,
  onEdit,
  onDelete,
  pageSize = 20,
  onPageSizeChange,
  usersMap = {},
}: Props) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => format(new Date(info.getValue()), "dd MMM yy, hh:mm a"),
      }),
      columnHelper.accessor("cardHolderName", {
        header: "Card Holder",
        cell: (info) => (
          <span className="font-medium text-slate-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("bankName", {
        header: "Bank",
        cell: (info) => {
          const bank = BANK_OPTIONS.find((b) => b.value === info.getValue());
          return <span>{bank ? bank.label : info.getValue()}</span>;
        },
      }),
      columnHelper.accessor("cardLast4Digits", {
        header: "Card Number",
        cell: (info) => (
          <span className="text-slate-500">
            •••• •••• •••• {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("mobileNumber", {
        header: "Mobile",
        cell: (info) => (
          <span className="text-slate-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("amountPaid", {
        header: "Amount Paid",
        cell: (info) => (
          <span className="font-semibold">{formatINR(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("customerChargeAmount", {
        header: "Cust. Charge",
        cell: (info) => (
          <span className="text-slate-600">{formatINR(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("settlementChargeINR", {
        header: "Settlement",
        cell: (info) => (
          <span className="text-slate-600">{formatINR(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("mbrAmount", {
        header: "MBR",
        cell: (info) => (
          <span className="text-slate-600">{formatINR(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("netProfit", {
        header: "Net Profit",
        cell: (info) => (
          <span
            className={
              info.getValue() >= 0
                ? "text-primary font-bold"
                : "text-red-600 font-bold"
            }
          >
            {formatINR(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("createdBy", {
        header: "Created By",
        cell: (info) => (
          <span className="text-slate-500 text-xs capitalize">
            {usersMap[info.getValue()] || ""}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2 justify-end">
            <AppButton
              variant="outline"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(info.row.original);
              }}
              className="h-9 w-9 p-0 flex items-center justify-center"
              title="Edit Transaction"
            >
              <Pencil className="w-4 h-4 pointer-events-none" />
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(info.row.original.id);
              }}
              className="h-9 w-9 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 flex items-center justify-center"
              title="Delete Transaction"
            >
              <Trash2 className="w-4 h-4 pointer-events-none" />
            </AppButton>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 font-semibold whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Fetching data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white border-b last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-slate-600">
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-20 p-1.5 transition-all outline-none"
            >
              {[10, 20, 30, 40, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm text-slate-500 tabular-nums">
            Showing {data.length} records
          </span>
          {hasMore && (
            <AppButton
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loading}
              className="h-9 px-4 min-w-[100px]"
            >
              {loading ? "Loading..." : "Show More"}
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}
