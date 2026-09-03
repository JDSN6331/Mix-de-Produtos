import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type Filters = {
  inicio: string;
  fim: string;
  filial: string;
  campanha: string;
  grupo: string;
};

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[9rem] rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({
  filters,
  setFilters,
  filiais,
  campanhas,
  grupos,
  count,
  total,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  filiais: string[];
  campanhas: string[];
  grupos: string[];
  count: number;
  total: number;
}) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const dirty = Object.values(filters).some(Boolean);

  return (
    <div className="panel flex flex-wrap items-end gap-4 px-5 py-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Período inicial
        </span>
        <input
          type="date"
          value={filters.inicio}
          onChange={(e) => set({ inicio: e.target.value })}
          className="h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Período final
        </span>
        <input
          type="date"
          value={filters.fim}
          onChange={(e) => set({ fim: e.target.value })}
          className="h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>
      <Select
        label="Filial"
        value={filters.filial}
        options={filiais}
        onChange={(v) => set({ filial: v })}
      />
      <Select
        label="Campanha"
        value={filters.campanha}
        options={campanhas}
        onChange={(v) => set({ campanha: v })}
      />
      <Select
        label="Grupo"
        value={filters.grupo}
        options={grupos}
        onChange={(v) => set({ grupo: v })}
      />
      <button
        type="button"
        onClick={() => setFilters({ inicio: "", fim: "", filial: "", campanha: "", grupo: "" })}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors",
          dirty
            ? "border-primary/50 text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:bg-secondary",
        )}
      >
        <RotateCcw className="size-3.5" strokeWidth={2} />
        Limpar
      </button>
      <span className="ml-auto num text-xs text-muted-foreground">
        {count} de {total} registros
      </span>
    </div>
  );
}
