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
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";

interface ModalLoginProps {
  hideModal: () => void;
  isOpen: boolean;
}

export default function ModalLogin({ hideModal, isOpen }: ModalLoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
  if (!email || !senha) {
    console.error("Preencha todos os campos!");
    return;
  }

  console.log("Tentando login com:", {
    email: email,
    emailTrim: email.trim(),
    senha: senha,
  });

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha);
    console.log("Login realizado com sucesso:", userCredential.user.email);
    hideModal();
  } catch (error: any) {
    console.error("Erro ao fazer login:", error.message);
  }
};


  return (
    <Modal
      hideModal={hideModal}
      isOpen={isOpen}
      dismissible={true}
      title="Bem-vindo(a) de volta!"
      description="Entre com suas credenciais para continuar"
      content={
        <ContentModal>
          <Input
  label="E-mail"
  type="email"
  placeholder="Digite seu e-mail"
  value={email}
  onChange={(e: any) => {
    console.log("DEBUG: evento do Input =", e);
    console.log("DEBUG: valor vindo =", e.target?.value);
    setEmail(e.target?.value ?? "");
  }}
/>

          <Input
            label="Senha"
            type="password"
            placeholder="Ex: ********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <p
            style={{ textAlign: "right", cursor: "pointer" }}
            onClick={() => console.log("Esqueceu a senha")}
          >
            Esqueceu a senha?
          </p>
        </ContentModal>
      }
      footer={
        <FooterModal>
          <Button size="md" variant="primary" onClick={handleLogin}>
            Entrar
          </Button>
          <p style={{ textAlign: "center" }}>
            Não tem conta?{" "}
            <span
              style={{
                color: "var(--s-color-content-primary)",
                cursor: "pointer",
              }}
              onClick={() => console.log("Criar conta")}
            >
              Criar conta
            </span>
          </p>
        </FooterModal>
      }
    />
  );
}
