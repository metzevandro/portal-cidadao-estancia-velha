"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Page } from "design-system-zeroz";
import { useUser } from "../_context";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { StatusCard } from "@/components/card/card";
import { SolicitacaoMapa } from "@/components/mapa/Solicitação";

export default function GerenciarSolicitacoesPage() {
  const user = useUser();

  const [totalSolicitacoes, setTotalSolicitacoes] = useState(0);
  const [totalEmAnalise, setTotalEmAnalise] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [totalConcluida, setTotalConcluidas] = useState(0);
  const openAsideRef = useRef<((shouldOpen: boolean) => void) | null>(null);

  const fetchCounts = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "solicitacoes"));
    const data = snapshot.docs.map((doc) => doc.data());

    setTotalSolicitacoes(data.length);
    setTotalEmAnalise(
      data.filter(
        (s: any) => (s.status ?? "").trim().toLowerCase() === "em_analise",
      ).length,
    );
    setTotalPendente(
      data.filter(
        (s: any) => (s.status ?? "").trim().toLowerCase() === "pendente",
      ).length,
    );
    setTotalConcluidas(
      data.filter(
        (s: any) => (s.status ?? "").trim().toLowerCase() === "concluida",
      ).length,
    );
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <Page
      namePage="Gerencie as Solicitações dos Cidadãos de Estância Velha"
      description="Para gerenciar as solicitações, utilize o mapa abaixo clicando em cada solicitação. Para trocar de status, basta clicar no status desejado no card ao lado do mapa."
    >
      <section className="dashboard-layout">
        <div className="cards-container">
          <StatusCard title="Solicitações" count={totalSolicitacoes} />

          <StatusCard title="Em análise" count={totalEmAnalise} />
          <StatusCard title="Pendentes" count={totalPendente} />
          <StatusCard title="Concluídas" count={totalConcluida} />
        </div>

        <SolicitacaoMapa
          loggedIn={!!user}
          onNovaSolicitacao={fetchCounts}
          onOpenAside={openAsideRef}
        />
      </section>
    </Page>
  );
}
