"use client";
import { useRef, useLayoutEffect, useState } from "react";
import { BarChart, Card, CardContent, CardHeader } from "design-system-zeroz";
import { STATUS_COLORS } from "@/components/marcador/Marcador";

type Item = {
  lat: number;
  lng: number;
  tipo: string;
  bairro: string;
  status?: string;
};

type ChartRow = {
  month: string;
  "Em análise": number;
  Pendente: number;
  Concluída: number;
  Rejeitada: number;
};

export default function Barra({
  solicitacoes = [],
}: {
  solicitacoes?: Item[];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);

  const grouped: Record<
    string,
    {
      em_analise: number;
      pendente: number;
      concluida: number;
      rejeitada: number;
    }
  > = solicitacoes.reduce(
    (acc, cur) => {
      const tipo = (cur.tipo || "Não especificado").toString();
      const status = String(cur.status ?? "pendente").toLowerCase();

      if (!acc[tipo])
        acc[tipo] = { em_analise: 0, pendente: 0, concluida: 0, rejeitada: 0 };

      if (status.includes("analise") || status === "em_analise")
        acc[tipo].em_analise++;
      else if (status.includes("concluida") || status === "concluida")
        acc[tipo].concluida++;
      else if (status.includes("rejeit")) acc[tipo].rejeitada++;
      else acc[tipo].pendente++;

      return acc;
    },
    {} as Record<
      string,
      {
        em_analise: number;
        pendente: number;
        concluida: number;
        rejeitada: number;
      }
    >,
  );

  const humanize = (s: string) =>
    s
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const chartData: ChartRow[] = Object.entries(grouped).map(
    ([tipo, counts]) => ({
      month: humanize(tipo),
      "Em análise": counts.em_analise,
      Pendente: counts.pendente,
      Concluída: counts.concluida,
      Rejeitada: counts.rejeitada,
    }),
  );

  const lineStyles: Record<string, { color: string }> = {
    "Em análise": { color: STATUS_COLORS.em_analise },
    Pendente: { color: STATUS_COLORS.pendente },
    Concluída: { color: STATUS_COLORS.concluida },
    Rejeitada: { color: STATUS_COLORS.rejeitada },
  };

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        const width = wrapperRef.current.clientWidth;
        setChartWidth(width);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    if (wrapperRef.current) observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="chart-wrapper">
      <Card
        header={
          <CardHeader
            title="Solicitações por Tipo"
            description="Quantidade por tipo (por fase)"
          />
        }
        content={
          <CardContent>
            <div
              ref={wrapperRef}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {chartWidth > 0 && (
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={300}
                  caption
                  lineStyles={lineStyles}
                />
              )}
            </div>
          </CardContent>
        }
      />
    </div>
  );
}
