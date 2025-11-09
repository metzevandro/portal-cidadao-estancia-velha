"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SolicitacaoMapa } from "@/components/mapa/Solicitação";
import { Page } from "design-system-zeroz";
import { useUser } from "./_context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatusCard } from "@/components/card/card";

import "./globals.scss";

export default function Home() {
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
      namePage="Bem-vindo, Estanciense!"
      description="Crie sua solicitação à Prefeitura de Estância Velha!"
      withActionPrimary={user.user ? true : false}
      buttonContentPrimary="Adicionar Solicitação"
      onClickActionPrimary={() => {
        openAsideRef.current?.(true);
      }}
    >
      <section className="dashboard-layout">
        <div className="cards-container">
          <StatusCard title="Solicitações" count={totalSolicitacoes} />
          <StatusCard title="Em análise" count={totalEmAnalise} />
          <StatusCard title="Pendentes" count={totalPendente} />
          <StatusCard title="Concluídas" count={totalConcluida} />
        </div>

        <SolicitacaoMapa
          loggedIn={user.user ? true : false}
          onNovaSolicitacao={fetchCounts}
          onOpenAside={openAsideRef}
        />
      </section>
    </Page>
  );
}
