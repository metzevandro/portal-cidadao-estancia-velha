"use client";

import { useState } from "react";
import {
  ContentModal,
  FooterModal,
  Input,
  Modal,
  Button,
} from "design-system-zeroz";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface ModalLoginProps {
  hideModal: () => void;
  isOpen: boolean;
  openCriarConta: () => void;
}

export default function ModalLogin({
  hideModal,
  isOpen,
  openCriarConta,
}: ModalLoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) {
      console.error("Preencha todos os campos!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );
      const user = userCredential.user;

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();

      console.log("ROLE do usuário ->", data?.role);

      hideModal();
      setEmail("");
      setSenha("");
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
        </ContentModal>
      }
      footer={
        <FooterModal>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--s-spacing-xx-small)",
            }}
          >
            <Button size="md" variant="primary" onClick={handleLogin}>
              Entrar
            </Button>
            <p style={{ textAlign: "center" }}>
              Ainda não tem uma conta?{" "}
              <span
                style={{
                  cursor: "pointer",
                  color: "var(--s-color-content-highlight)",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onClick={() => {
                  hideModal();
                  openCriarConta();
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color =
                    "var(--s-color-content-highlight-light)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color =
                    "var(--s-color-content-highlight)")
                }
              >
                Crie agora
              </span>
            </p>
          </div>
        </FooterModal>
      }
    />
  );
}
