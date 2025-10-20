"use client";

import { useState } from "react";
import {
  ContentModal,
  FooterModal,
  Input,
  Modal,
  Button,
} from "design-system-zeroz";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

interface ModalCriarContaProps {
  hideModal: () => void;
  isOpen: boolean;
}

export default function ModalCriarConta({ hideModal, isOpen }: ModalCriarContaProps) {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");

  const handleCriarConta = async () => {
    if (!nome || !sobrenome || !email || !senha) {
      console.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      console.log("Conta criada com sucesso:", userCredential.user.email);

      await signInWithEmailAndPassword(auth, email, senha);
      console.log("Login automático realizado com sucesso");

      hideModal();

    } catch (error: any) {
      console.error("Erro ao criar conta:", error.message);
    }
  };

  return (
    <Modal
      hideModal={hideModal}
      isOpen={isOpen}
      dismissible={true}
      title="Crie sua conta"
      description="Preencha os campos abaixo para começar"
      content={
        <ContentModal>
          <div style={{ display: "flex", flexDirection: "row", gap: "var(--s-spacing-small)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-spacing-x-small)" }}>
              <Input label="Nome" type="text" placeholder="Digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Input label="Sobrenome" type="text" placeholder="Digite seu sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
              <Input label="Email" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Senha" type="password" placeholder="Crie uma senha segura" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-spacing-x-small)" }}>
              <Input label="CEP" type="text" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} />
              <Input label="Rua" type="text" placeholder="Nome da rua" value={rua} onChange={(e) => setRua(e.target.value)} />
              <Input label="Bairro" type="text" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
              <Input label="Número" type="number" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
          </div>
        </ContentModal>
      }
      footer={
        <FooterModal>
          <Button size="md" variant="primary" onClick={handleCriarConta}>
            Criar conta
          </Button>
          <p style={{ textAlign: "center" }}>
            Já tem uma conta?{" "}
            <span
              style={{
                color: "var(--s-color-content-primary)",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => console.log("Ir para login")}
            >
              Entrar
            </span>
          </p>
        </FooterModal>
      }
    />
  );
}
