import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Row } from "@/lib/analytics";
import { BRL, NUM, PCT } from "@/lib/analytics";

const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" };
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];

const tooltipStyle = {
  backgroundColor: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
  boxShadow: "0 12px 32px oklch(0 0 0 / 0.4)",
};

const compact = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;

const short = (s: string, n = 26) => (s.length > n ? `${s.slice(0, n)}…` : s);

export function HorizontalBars({
  rows,
  metric = "receita",
  height = 300,
  colorByIndex = false,
}: {
  rows: Row[];
  metric?: "receita" | "volume";
  height?: number;
  colorByIndex?: boolean;
}) {
  const data = rows.map((r) => ({ name: short(r.nome.replace(/^L\d+:/, "")), value: r[metric] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
        <XAxis
          type="number"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          tickFormatter={compact}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
          contentStyle={tooltipStyle}
          formatter={(v: number) => [metric === "receita" ? BRL(v) : NUM(v, 1), metric === "receita" ? "Receita" : "Volume"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={colorByIndex ? PALETTE[i % PALETTE.length] : metric === "receita" ? "var(--chart-1)" : "var(--chart-2)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
}: {
  data: { dia: string; receita: number; pedidos: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="dia" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={compact} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => BRL(v)} />
        <Line
          type="monotone"
          dataKey="receita"
          name="Receita"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ParetoChart({ rows }: { rows: Row[] }) {
  const data = rows.slice(0, 20).map((r) => ({
    name: short(r.nome, 18),
    receita: r.receita,
    acum: r.receitaAcumPct ?? 0,
    classe: r.classe,
  }));
  const color = (c?: string) =>
    c === "A" ? "var(--chart-1)" : c === "B" ? "var(--chart-2)" : "var(--muted-foreground)";
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 78, left: 8 }}>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...AXIS, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          angle={-40}
          textAnchor="end"
          interval={0}
        />
        <YAxis yAxisId="l" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={compact} />
        <YAxis
          yAxisId="r"
          orientation="right"
          domain={[0, 100]}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
          contentStyle={tooltipStyle}
          formatter={(v: number, n: string) => (n === "Acumulado" ? PCT(v) : BRL(v))}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
        <Bar yAxisId="l" dataKey="receita" name="Receita" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={color(d.classe)} />
          ))}
        </Bar>
        <Line
          yAxisId="r"
          type="monotone"
          dataKey="acum"
          name="Acumulado"
          stroke="var(--gold)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
