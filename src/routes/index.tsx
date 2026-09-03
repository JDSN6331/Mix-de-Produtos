import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf } from "lucide-react";
import {
  BRL,
  BRL2,
  NUM,
  PCT,
  PERIODO,
  aggregate,
  parseDate,
  records,
  type Record as Rec,
  type Row,
} from "@/lib/analytics";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { FilterBar, type Filters } from "@/components/dashboard/FilterBar";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { HorizontalBars, ParetoChart, TrendChart } from "@/components/dashboard/charts";
import {
  ClassBadge,
  Panel,
  Rank,
  SectionHeader,
  ShareBar,
} from "@/components/dashboard/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mix de Produtos | Análise de Vendas por Grupo, Produto e Filial" },
      {
        name: "description",
        content:
          "Painel executivo da modalidade Mix de Produtos: receita, volume, curva ABC, filiais, vendedores, campanhas e descontos do período 17/08 a 01/09/2026.",
      },
      { property: "og:title", content: "Mix de Produtos | Análise de Vendas" },
      {
        property: "og:description",
        content:
          "Painel executivo com receita, volume, curva ABC de produtos, desempenho de filiais, vendedores e campanhas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "grupos", label: "Grupos" },
  { id: "produtos", label: "Produtos" },
  { id: "abc", label: "Curva ABC" },
  { id: "filiais", label: "Filiais" },
  { id: "vendedores", label: "Vendedores" },
  { id: "campanhas", label: "Campanhas" },
  { id: "descontos", label: "Descontos" },
];

const uniq = (fn: (r: Rec) => string) => [...new Set(records.map(fn))].sort();

function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    inicio: "",
    fim: "",
    filial: "",
    campanha: "",
    grupo: "",
  });

  const filtered = useMemo(() => {
    const ini = filters.inicio ? new Date(`${filters.inicio}T00:00:00`) : null;
    const fim = filters.fim ? new Date(`${filters.fim}T23:59:59`) : null;
    return records.filter((r) => {
      const d = parseDate(r.data);
      if (ini && d < ini) return false;
      if (fim && d > fim) return false;
      if (filters.filial && r.filial !== filters.filial) return false;
      if (filters.campanha && r.campanha !== filters.campanha) return false;
      if (filters.grupo && r.grupo !== filters.grupo) return false;
      return true;
    });
  }, [filters]);

  const a = useMemo(() => aggregate(filtered), [filtered]);

  const baseCols = (nameHeader: string): Column<Row>[] => [
    { key: "rank", header: "#", width: "56px", cell: (_r, i) => <Rank i={i} /> },
    {
      key: "nome",
      header: nameHeader,
      cell: (r) => <span className="text-foreground">{r.nome.replace(/^L\d+:/, "")}</span>,
    },
    { key: "receita", header: "Receita", align: "right", cell: (r) => BRL2(r.receita) },
    { key: "volume", header: "Volume", align: "right", cell: (r) => NUM(r.volume, 1) },
    {
      key: "ticket",
      header: "Ticket médio",
      align: "right",
      cell: (r) => <span className="text-muted-foreground">{BRL(r.ticket)}</span>,
    },
    { key: "share", header: "Share", align: "right", cell: (r) => <ShareBar pct={r.share} /> },
    {
      key: "pedidos",
      header: "Pedidos",
      align: "right",
      cell: (r) => <span className="text-muted-foreground">{r.pedidos}</span>,
    },
    {
      key: "coop",
      header: "Cooperados",
      align: "right",
      cell: (r) => <span className="text-muted-foreground">{r.cooperados}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/12 text-primary">
              <Leaf className="size-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Mix de Produtos</p>
              <p className="num text-[11px] text-muted-foreground">
                {PERIODO.inicio} — {PERIODO.fim}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-xs">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="rounded px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-16 px-6 py-10">
        <section id="visao-geral" className="scroll-mt-24 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                Relatório executivo
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
                Análise de grupos e produtos vendidos no Mix
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Desempenho consolidado da modalidade Mix de Produtos por grupo, produto, filial,
                vendedor e campanha, com classificação ABC e leitura de descontos concedidos.
              </p>
            </div>
            <p className="num text-xs text-muted-foreground">Gerado em {PERIODO.gerado}</p>
          </div>

          <FilterBar
            filters={filters}
            setFilters={setFilters}
            filiais={uniq((r) => r.filial)}
            campanhas={uniq((r) => r.campanha)}
            grupos={uniq((r) => r.grupo)}
            count={filtered.length}
            total={records.length}
          />

          <KpiGrid kpis={a.kpis} />

          <Panel title="Evolução da receita" subtitle="Receita faturada por data de pedido">
            <div className="px-2 py-4">
              <TrendChart data={a.porDia} />
            </div>
          </Panel>
        </section>

        <section id="grupos" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Mix"
            title="Análise por grupo de produto"
            description="Distribuição de receita e volume entre os grupos que compõem o mix comercializado."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Receita por grupo">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.grupos} metric="receita" colorByIndex />
              </div>
            </Panel>
            <Panel title="Volume por grupo">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.grupos} metric="volume" />
              </div>
            </Panel>
          </div>
          <Panel className="mt-4">
            <DataTable columns={baseCols("Grupo")} rows={a.grupos} />
          </Panel>
        </section>

        <section id="produtos" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Portfólio"
            title="Produtos vendidos"
            description="Os cinco produtos de maior receita e volume, seguidos da tabela completa do período."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Top 5 por receita">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.produtos.slice(0, 5)} metric="receita" height={260} />
              </div>
            </Panel>
            <Panel title="Top 5 por volume">
              <div className="px-2 py-4">
                <HorizontalBars
                  rows={[...a.produtos].sort((x, y) => y.volume - x.volume).slice(0, 5)}
                  metric="volume"
                  height={260}
                />
              </div>
            </Panel>
          </div>
          <Panel
            className="mt-4"
            title="Tabela completa de produtos"
            subtitle={`${a.produtos.length} produtos no período filtrado`}
          >
            <DataTable
              maxHeight="560px"
              rows={a.produtos}
              columns={[
                { key: "rank", header: "#", width: "56px", cell: (_r, i) => <Rank i={i} /> },
                {
                  key: "abc",
                  header: "ABC",
                  width: "64px",
                  cell: (r) => <ClassBadge classe={r.classe ?? "C"} />,
                },
                {
                  key: "produto",
                  header: "Produto",
                  cell: (r) => (
                    <div className="min-w-[18rem]">
                      <p className="text-foreground">{r.nome}</p>
                      <p className="text-xs text-muted-foreground">{r.grupo}</p>
                    </div>
                  ),
                },
                { key: "receita", header: "Receita", align: "right", cell: (r) => BRL2(r.receita) },
                { key: "volume", header: "Volume", align: "right", cell: (r) => NUM(r.volume, 1) },
                { key: "share", header: "Share", align: "right", cell: (r) => <ShareBar pct={r.share} /> },
                {
                  key: "acum",
                  header: "Acumulado",
                  align: "right",
                  cell: (r) => (
                    <span className="text-muted-foreground">{PCT(r.receitaAcumPct ?? 0)}</span>
                  ),
                },
                {
                  key: "pedidos",
                  header: "Pedidos",
                  align: "right",
                  cell: (r) => <span className="text-muted-foreground">{r.pedidos}</span>,
                },
              ]}
            />
          </Panel>
        </section>

        <section id="abc" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Pareto 80/20"
            title="Curva ABC de produtos"
            description="As barras representam a receita individual de cada produto, ordenada do maior para o menor; a linha dourada acompanha o percentual acumulado da receita."
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {(["A", "B", "C"] as const).map((c) => {
              const rows = a.produtos.filter((p) => p.classe === c);
              const receita = rows.reduce((s, r) => s + r.receita, 0);
              const desc =
                c === "A"
                  ? "Até 80% da receita acumulada — itens estratégicos."
                  : c === "B"
                    ? "De 80% a 95% da receita — importância intermediária."
                    : "Últimos 5% da receita — menor impacto individual.";
              return (
                <div key={c} className="panel px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ClassBadge classe={c} />
                    <span className="num text-sm font-semibold text-foreground">
                      {rows.length} produtos
                    </span>
                    <span className="num ml-auto text-sm text-muted-foreground">{BRL(receita)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              );
            })}
          </div>
          <Panel title="Receita individual e acumulada" subtitle="20 principais produtos">
            <div className="px-2 py-4">
              <ParetoChart rows={a.produtos} />
            </div>
          </Panel>
        </section>

        <section id="filiais" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Rede"
            title="Análise por filial"
            description="Comparativo de receita, volume e ticket médio entre as unidades."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Receita por filial">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.filiais} metric="receita" colorByIndex />
              </div>
            </Panel>
            <Panel title="Volume por filial">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.filiais} metric="volume" />
              </div>
            </Panel>
          </div>
          <Panel className="mt-4">
            <DataTable columns={baseCols("Filial")} rows={a.filiais} />
          </Panel>
        </section>

        <section id="vendedores" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Equipe comercial"
            title="Análise por vendedor"
            description="Receita gerada, carteira de cooperados atendidos e participação no total."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Receita por vendedor">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.vendedores} metric="receita" height={340} colorByIndex />
              </div>
            </Panel>
            <Panel title="Volume por vendedor">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.vendedores} metric="volume" height={340} />
              </div>
            </Panel>
          </div>
          <Panel className="mt-4">
            <DataTable columns={baseCols("Vendedor")} rows={a.vendedores} />
          </Panel>
        </section>

        <section id="campanhas" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Comercial"
            title="Análise por campanha"
            description="Peso de cada campanha na receita do período e amplitude de produtos vendidos."
          />
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Panel title="Receita por campanha">
              <div className="px-2 py-4">
                <HorizontalBars rows={a.campanhas} metric="receita" height={240} colorByIndex />
              </div>
            </Panel>
            <Panel>
              <DataTable
                rows={a.campanhas}
                columns={[
                  { key: "rank", header: "#", width: "56px", cell: (_r, i) => <Rank i={i} /> },
                  { key: "nome", header: "Campanha", cell: (r) => r.nome },
                  { key: "receita", header: "Receita", align: "right", cell: (r) => BRL2(r.receita) },
                  { key: "volume", header: "Volume", align: "right", cell: (r) => NUM(r.volume, 1) },
                  { key: "share", header: "Share", align: "right", cell: (r) => <ShareBar pct={r.share} /> },
                  {
                    key: "produtos",
                    header: "Produtos",
                    align: "right",
                    cell: (r) => <span className="text-muted-foreground">{r.produtos}</span>,
                  },
                  {
                    key: "pedidos",
                    header: "Pedidos",
                    align: "right",
                    cell: (r) => <span className="text-muted-foreground">{r.pedidos}</span>,
                  },
                ]}
              />
            </Panel>
          </div>
        </section>

        <section id="descontos" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Rentabilidade"
            title="Análise de descontos"
            description="Descontos manuais aplicados sobre os itens do mix no período."
          />
          {a.descontos.registros === 0 ? (
            <Panel>
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nenhum desconto manual registrado no período.
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Todos os {a.kpis.nRegistros} itens foram faturados com o preço de tabela vigente.
                </p>
              </div>
            </Panel>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="panel px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Valor concedido
                </p>
                <p className="num mt-2 text-2xl font-semibold text-gold">{BRL(a.descontos.valor)}</p>
              </div>
              <div className="panel px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Itens com desconto
                </p>
                <p className="num mt-2 text-2xl font-semibold text-foreground">
                  {a.descontos.registros}
                </p>
              </div>
              <div className="panel px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Desconto médio
                </p>
                <p className="num mt-2 text-2xl font-semibold text-foreground">
                  {PCT(a.descontos.mediaPct)}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <span>Análise de Grupos e Produtos Vendidos no Mix</span>
          <span className="num">
            Período {PERIODO.inicio} a {PERIODO.fim} · gerado em {PERIODO.gerado}
          </span>
        </div>
      </footer>
    </div>
  );
}
