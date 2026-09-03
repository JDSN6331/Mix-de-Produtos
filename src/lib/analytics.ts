import rawRecords from "@/data/mix-records.json";

export type Record = {
  data: string;
  pedido: number;
  matricula: number;
  cooperado: string;
  filial: string;
  campanha: string;
  vendedor: string;
  produto: string;
  grupo: string;
  quantidade: number;
  preco_total: number;
  status: string;
  desconto_pct: number;
  desconto_valor: number;
  valor_pedido: number;
};

export const records = rawRecords as Record[];

export const PERIODO = { inicio: "17/08/2026", fim: "01/09/2026", gerado: "03/09/2026 às 10:21" };

export const parseDate = (str: string) => {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const BRL2 = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const NUM = (v: number, d = 0) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
export const PCT = (v: number) => `${v.toFixed(1)}%`;

type Bucket = {
  receita: number;
  volume: number;
  pedidos: Set<number>;
  cooperados: Set<number>;
  produtos: Set<string>;
  grupo?: string;
};

function groupBy(recs: Record[], key: (r: Record) => string) {
  const map = new Map<string, Bucket>();
  for (const r of recs) {
    const k = key(r);
    let b = map.get(k);
    if (!b) {
      b = {
        receita: 0,
        volume: 0,
        pedidos: new Set(),
        cooperados: new Set(),
        produtos: new Set(),
        grupo: r.grupo,
      };
      map.set(k, b);
    }
    b.receita += r.preco_total;
    b.volume += r.quantidade;
    b.pedidos.add(r.pedido);
    b.cooperados.add(r.matricula);
    b.produtos.add(r.produto);
  }
  return map;
}

export type Row = {
  nome: string;
  grupo?: string;
  receita: number;
  volume: number;
  pedidos: number;
  cooperados: number;
  produtos: number;
  share: number;
  ticket: number;
  receitaAcumPct?: number;
  classe?: "A" | "B" | "C";
};

function toRows(map: Map<string, Bucket>, total: number): Row[] {
  return [...map.entries()]
    .map(([nome, b]) => ({
      nome,
      grupo: b.grupo,
      receita: b.receita,
      volume: b.volume,
      pedidos: b.pedidos.size,
      cooperados: b.cooperados.size,
      produtos: b.produtos.size,
      share: total > 0 ? (b.receita / total) * 100 : 0,
      ticket: b.pedidos.size > 0 ? b.receita / b.pedidos.size : 0,
    }))
    .sort((a, b) => b.receita - a.receita);
}

export function aggregate(recs: Record[]) {
  const receitaTotal = recs.reduce((s, r) => s + r.preco_total, 0);
  const volumeTotal = recs.reduce((s, r) => s + r.quantidade, 0);
  const pedidos = new Set(recs.map((r) => r.pedido));
  const cooperados = new Set(recs.map((r) => r.matricula));
  const produtos = toRows(groupBy(recs, (r) => r.produto), receitaTotal);

  let acum = 0;
  for (const p of produtos) {
    acum += p.receita;
    p.receitaAcumPct = receitaTotal > 0 ? (acum / receitaTotal) * 100 : 0;
    p.classe = p.receitaAcumPct <= 80 ? "A" : p.receitaAcumPct <= 95 ? "B" : "C";
  }

  const porDia = [...groupBy(recs, (r) => r.data).entries()]
    .map(([dia, b]) => ({ dia, receita: b.receita, pedidos: b.pedidos.size, volume: b.volume }))
    .sort((a, b) => parseDate(a.dia).getTime() - parseDate(b.dia).getTime());

  const descontoTotal = recs.reduce((s, r) => s + r.desconto_valor, 0);
  const comDesconto = recs.filter((r) => r.desconto_pct !== 0 || r.desconto_valor !== 0);

  return {
    kpis: {
      receitaTotal,
      volumeTotal,
      nPedidos: pedidos.size,
      ticketMedio: pedidos.size ? receitaTotal / pedidos.size : 0,
      nCooperados: cooperados.size,
      nProdutos: produtos.length,
      nGrupos: new Set(recs.map((r) => r.grupo)).size,
      descontoTotal,
      nRegistros: recs.length,
    },
    grupos: toRows(groupBy(recs, (r) => r.grupo), receitaTotal),
    produtos,
    filiais: toRows(groupBy(recs, (r) => r.filial), receitaTotal),
    vendedores: toRows(groupBy(recs, (r) => r.vendedor), receitaTotal),
    campanhas: toRows(groupBy(recs, (r) => r.campanha), receitaTotal),
    porDia,
    descontos: {
      registros: comDesconto.length,
      valor: descontoTotal,
      mediaPct: comDesconto.length
        ? (comDesconto.reduce((s, r) => s + r.desconto_pct, 0) / comDesconto.length) * 100
        : 0,
      porGrupo: toRows(groupBy(comDesconto, (r) => r.grupo), descontoTotal),
    },
  };
}

export type Analytics = ReturnType<typeof aggregate>;

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];
