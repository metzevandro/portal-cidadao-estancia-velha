"use client";
import { Button, ContentModal, FooterModal, Modal } from "design-system-zeroz";

interface ModalStatusSolicitacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  solicitacao?: {
    nome: string;
    descricao: string;
    status: string;
  };
}

const formatStatus = (status: string) => {
  if (!status) return "";
  
  return status
    .replace(/_/g, " ") 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
};

export function ModalStatusSolicitacao({
  isOpen,
  onClose,
  onConfirm,
  solicitacao,
}: ModalStatusSolicitacaoProps) {
  if (!solicitacao) return null;

  const statusFormatado = formatStatus(solicitacao.status);

  return (
    <Modal
      description="Confirme a troca de status da solicitação."
      hideModal={onClose}
      isOpen={isOpen}
      title="Alterar status da solicitação?"
      content={
        <ContentModal>
          <p>
            Deseja realmente alterar o status da solicitação{" "}
            <strong>{solicitacao.nome}</strong>?
            <br /> <br />
            Status atual: <strong>{statusFormatado}</strong>
          </p>
        </ContentModal>
      }
      dismissible={true}
      footer={
        <FooterModal>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              gap: "var(--s-spacing-xx-small)",
            }}
          >
            <Button size="md" variant="primary" onClick={onConfirm}>
              Confirmar
            </Button>
            <Button size="md" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </FooterModal>
      }
    />
  );
}
