"use client";
import { Button, ContentModal, FooterModal, Modal } from "design-system-zeroz";

interface ModalExcluirSolicitacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  solicitacao?: {
    nome: string;
    descricao: string;
  };
}

export function ModalExcluirSolicitacao({
  isOpen,
  onClose,
  onConfirm,
  solicitacao,
}: ModalExcluirSolicitacaoProps) {
  if (!solicitacao) return null;

  return (
    <Modal
      description="Esta ação não pode ser desfeita."
      hideModal={onClose}
      isOpen={isOpen}
      title="Você deseja excluir esta solicitação?"
      content={
        <ContentModal>
          <p>
            Você está prestes a excluir a solicitação a sua seguinte
            solicitação: <strong>{solicitacao.nome}</strong>.
            <br />
            <br />
            Com a descrição: <strong>{solicitacao.descricao}</strong>
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
            <Button size="md" variant="warning" onClick={onConfirm}>
              Excluir
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
