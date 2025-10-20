"use client";

import { SolicitacaoMapa } from "@/components/mapa/Solicitação";
import { bairros } from "@/types/bairros";
import { InputSelect, Page } from "design-system-zeroz";
import { useState } from "react";

export default function Home() {
  const [bairroSelecionado, setBairroSelecionado] = useState("Estância Velha");

  const opcoes = ["Estância Velha", ...Object.keys(bairros)];

  return (
    <div className="pagina-inicial">
      <section className="mapa" title="Escolha seu bairro">
        <h2>Bem-vindo ao Portal da Cidadania de Estância Velha!</h2>
        <InputSelect
          label="Bairro"
          onChange={setBairroSelecionado}
          options={opcoes}
          value={bairroSelecionado}
        />

        <SolicitacaoMapa loggedIn={false} local={bairroSelecionado} />
      </section>
    </div>
  );
}
