"use client";
import { useEffect, useState } from "react";
import { Pizza } from "@/charts/Pizza/Pizza";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Page } from "design-system-zeroz";
import Barra from "@/charts/Barra/Barra";
import "./dashboard.scss";

export default function page() {
  const [solicitacoes, setSolicitacoes] = useState<
    Array<{
      lat: number;
      lng: number;
      tipo: string;
      bairro: string;
      status?: string;
    }>
  >([]);

  useEffect(() => {
    let mounted = true;
    const fetchSolicitacoes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "solicitacoes"));
        const data = snapshot.docs.map((doc) => {
          const d = doc.data() as any;
          return {
            lat: Number(d.lat) || 0,
            lng: Number(d.lng) || 0,
            tipo: d.tipo || "",
            bairro: d.bairro || "",
            status: String(d.status || "pendente"),
          };
        });
        if (mounted) setSolicitacoes(data);
      } catch (err) {
        console.error("Erro ao carregar solicitações para Pizza:", err);
      }
    };

    fetchSolicitacoes();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Page namePage="Análise de Solicitações">
      <div className="dashboard-charts">
        <Pizza solicitacoes={solicitacoes} />
        <Barra solicitacoes={solicitacoes} />
      </div>
    </Page>
  );
}
