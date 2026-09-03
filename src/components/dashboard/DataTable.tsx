import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  width?: string;
  cell: (row: T, index: number) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  maxHeight,
}: {
  columns: Column<T>[];
  rows: T[];
  maxHeight?: string;
}) {
  return (
    <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "whitespace-nowrap border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 transition-colors hover:bg-secondary/50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 align-middle",
                    c.align === "right" ? "num text-right" : "text-left",
                  )}
                >
                  {c.cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhum registro para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
