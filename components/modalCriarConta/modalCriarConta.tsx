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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface ModalCriarContaProps {
  hideModal: () => void;
  openLogin: () => void;
  isOpen: boolean;
}

export default function ModalCriarConta({
  hideModal,
  isOpen,
  openLogin,
}: ModalCriarContaProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleCriarConta = async () => {
    if (!nome || !email || !senha) {
      console.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );

      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, "users", user.uid), {
        nome,
        email,
        role: "User",
        createdAt: new Date(),
      });

      await signInWithEmailAndPassword(auth, email, senha);

      hideModal();

      setNome("");
      setEmail("");
      setSenha("");
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--s-spacing-x-small)",
            }}
          >
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Ex: Eduardo da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <Input
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Ex: **********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
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
            <Button size="md" variant="primary" onClick={handleCriarConta}>
              Criar conta
            </Button>
            <p style={{ textAlign: "center" }}>
              Já possui uma conta?{" "}
              <span
                style={{
                  cursor: "pointer",
                  color: "var(--s-color-content-highlight)",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onClick={() => {
                  hideModal();
                  openLogin();
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
                Faça login
              </span>
            </p>
          </div>
        </FooterModal>
      }
    />
  );
}
