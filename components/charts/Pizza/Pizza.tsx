"use client";
import { useState, useRef, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, PieChart } from "design-system-zeroz";

type PizzaProps = {
  solicitacoes?: Array<{
    lat: number;
    lng: number;
    tipo: string;
    bairro: string;
  }>;
};

const getColorForIndex = (index: number) => {
  const i = (index % 10) + 1;
  return `var(--s-color-chart-${i})`;
};

export function Pizza({ solicitacoes = [] }: PizzaProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.getBoundingClientRect().width;
        setSize(w);
      }
    };

    updateSize();
    const id = requestAnimationFrame(updateSize);

    const observer = new ResizeObserver(updateSize);
    if (wrapperRef.current) observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  const bairrosCount = solicitacoes.reduce(
    (acc, curr) => {
      const b = curr.bairro || "Não informado";
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const bairrosData = Object.entries(bairrosCount).map(
    ([bairro, quantity], idx) => ({
      keyName: bairro,
      quantity,
      fill: getColorForIndex(idx),
    }),
  );

  return (
    <div className="chart-wrapper">
      <Card
        header={
          <CardHeader
            description="Quantidade de solicitações por bairro"
            title="Solicitações por Bairro"
          />
        }
        content={
          <CardContent>
            <div
              ref={wrapperRef}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PieChart
                nameKey="keyName"
                type="donut"
                labelFormatter={(value: string) => `${value}`}
                caption={true}
                label="Solicitações"
                dataKey="quantity"
                data={bairrosData}
                width={size}
                height={360}
                innerRadius={70}
                outerRadius={120}
                skeleton={false}
              />
            </div>
          </CardContent>
        }
      />
    </div>
  );
}
