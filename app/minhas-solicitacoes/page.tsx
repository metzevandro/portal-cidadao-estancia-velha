"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SolicitacaoMapa } from "@/components/mapa/Solicitação";
import { EmptyState, Page, Button } from "design-system-zeroz";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatusCard } from "@/components/card/card";
import "../globals.scss";
import { useUser } from "../_context";

export default function MinhasSolicitacoesPage() {
  const user = useUser();
  const [totalSolicitacoes, setTotalSolicitacoes] = useState(0);
  const [totalEmAnalise, setTotalEmAnalise] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [totalConcluida, setTotalConcluidas] = useState(0);
  const openAsideRef = useRef<((shouldOpen: boolean) => void) | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!user.user?.uid) return;

    const q = query(
      collection(db, "solicitacoes"),
      where("userId", "==", user?.user?.uid),
    );
    const snapshot = await getDocs(q);
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
  }, [user.user?.uid]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <Page
      namePage="Minhas Solicitações"
      description={
        user
          ? `Você tem um total de ${totalSolicitacoes} solicitações à Prefeitura de Estância Velha!`
          : ""
      }
      withActionPrimary={user.user ? true : false}
      buttonContentPrimary="Adicionar Solicitação"
      onClickActionPrimary={() => {
        openAsideRef.current?.(true);
      }}
    >
      {user.user ? (
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
            userId={user.user?.uid}
          />
        </section>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <EmptyState
            icon="login"
            title="Você ainda não está logado"
            description="Faça login para visualizar e gerenciar suas solicitações enviadas à Prefeitura."
          />
        </div>
      )}
    </Page>
  );
}
