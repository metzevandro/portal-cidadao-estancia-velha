"use client";
import { PieChart } from "design-system-zeroz";

type PizzaProps = {
  solicitacoes: Array<{
    lat: number;
    lng: number;
    tipo: string;
    bairro: string;
  }>;
};

export function Pizza({ solicitacoes = [] }: PizzaProps) {
  const bairrosCount = solicitacoes.reduce(
    (acc, curr) => {
      acc[curr.bairro] = (acc[curr.bairro] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(bairrosCount).map(([bairro, quantity]) => ({
    keyName: bairro,
    quantity,
    fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }));

  return (
    <PieChart
      nameKey="keyName"
      type="pie"
      caption={false}
      label="quantity"
      dataKey="quantity"
      data={data}
      width={400}
      height={400}
      innerRadius={70}
      outerRadius={120}
    />
  );
}
