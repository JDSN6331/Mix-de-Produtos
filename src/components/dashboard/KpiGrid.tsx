import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  Boxes,
  Layers,
  Package,
  Percent,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";
import type { Analytics } from "@/lib/analytics";
import { BRL, NUM } from "@/lib/analytics";

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const initial = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(initial + (target - initial) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function Kpi({
  label,
  value,
  format,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  icon: typeof Banknote;
  accent?: boolean;
}) {
  const animated = useCountUp(value);
  return (
    <div className="panel group relative px-5 py-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <Icon
          className={accent ? "size-4 shrink-0 text-gold" : "size-4 shrink-0 text-primary"}
          strokeWidth={1.75}
        />
      </div>
      <p className="num mt-3 text-2xl font-semibold text-foreground">{format(animated)}</p>
    </div>
  );
}

export function KpiGrid({ kpis }: { kpis: Analytics["kpis"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label="Receita total" value={kpis.receitaTotal} format={BRL} icon={Banknote} />
      <Kpi
        label="Ticket médio / pedido"
        value={kpis.ticketMedio}
        format={BRL}
        icon={Wallet}
        accent
      />
      <Kpi label="Volume total" value={kpis.volumeTotal} format={(v) => NUM(v)} icon={Boxes} />
      <Kpi label="Pedidos" value={kpis.nPedidos} format={(v) => NUM(v)} icon={ReceiptText} />
      <Kpi label="Cooperados" value={kpis.nCooperados} format={(v) => NUM(v)} icon={Users} />
      <Kpi label="Produtos" value={kpis.nProdutos} format={(v) => NUM(v)} icon={Package} />
      <Kpi label="Grupos" value={kpis.nGrupos} format={(v) => NUM(v)} icon={Layers} />
      <Kpi
        label="Descontos manuais"
        value={kpis.descontoTotal}
        format={BRL}
        icon={Percent}
        accent
      />
    </div>
  );
}
