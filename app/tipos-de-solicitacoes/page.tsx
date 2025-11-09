"use client";

import { useUser } from "@/app/_context";
import {
  Page,
  DataTable,
  Button,
  Modal,
  ContentModal,
  FooterModal,
  Aside,
  AsideContent,
  AsideFooter,
  Input,
} from "design-system-zeroz";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  where,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TipoSolicitacao } from "@/components/mapa/types";
import { NotificationMap } from "@/components/mapa/Notification";

export default function TiposDeSolicitacoesPage() {
  const { isAdmin } = useUser();
  const router = useRouter();
  const [tipos, setTipos] = useState<TipoSolicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openAside, setOpenAside] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState<
    "primary" | "secondary" | "warning" | "success"
  >("primary");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationIcon, setNotificationIcon] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const showNotification = (
    title: string,
    message: string,
    variant: "primary" | "secondary" | "warning" | "success",
    icon: string,
  ) => {
    setNotificationTitle(title);
    setNotificationVariant(variant);
    setNotificationMessage(message);
    setNotificationIcon(icon);
    setNotificationOpen(true);
    setTimeout(() => {
      setNotificationOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
    }, 5000);
  };

  const [updateSelectedRows, setUpdateSelectedRows] = useState<
    ((ids: string[]) => void) | null
  >(null);
  const [editingTipo, setEditingTipo] = useState<TipoSolicitacao | null>(null);
  const [nome, setNome] = useState("");

  const handleUpdateSelectedRows = useCallback((updateSelectedRows: any) => {
    setUpdateSelectedRows(() => updateSelectedRows);
  }, []);

  useEffect(() => {
    if (!isAdmin) router.push("/");
  }, [isAdmin]);

  async function fetchData() {
    try {
      const snapshot = await getDocs(collection(db, "tipoSolicitacao"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TipoSolicitacao[];

      setTipos(lista);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleOpenCreate() {
    setEditingTipo(null);
    setNome("");
    setOpenAside(true);
  }

  async function handleSave() {
    try {
      const nomeTrimmed = nome.trim().toLowerCase();

      const nomeJaExiste = tipos.some(
        (t) =>
          t.nome.trim().toLowerCase() === nomeTrimmed &&
          (!editingTipo || t.id !== editingTipo.id),
      );

      if (nomeJaExiste) {
        showNotification(
          "Nome já existe",
          `Já existe um tipo com o nome "${nome}". Escolha outro nome.`,
          "warning",
          "error",
        );
        return;
      }

      if (editingTipo) {
        await updateDoc(doc(db, "tipoSolicitacao", editingTipo.id), { nome });
        setTipos((prev) =>
          prev.map((t) => (t.id === editingTipo.id ? { ...t, nome } : t)),
        );

        showNotification(
          "Tipo atualizado",
          `O tipo "${nome}" foi atualizado com sucesso.`,
          "success",
          "check_circle",
        );

        if (updateSelectedRows) updateSelectedRows([]);
      } else {
        const newDoc = await addDoc(collection(db, "tipoSolicitacao"), {
          nome,
        });
        setTipos((prev) => [...prev, { id: newDoc.id, nome }]);

        showNotification(
          "Tipo criado",
          `O tipo "${nome}" foi criado com sucesso.`,
          "success",
          "check_circle",
        );

        if (updateSelectedRows) updateSelectedRows([]);
      }

      setOpenAside(false);
      setNome("");
      setEditingTipo(null);
      setSelectedRows([]);
    } catch (e) {
      showNotification(
        "Erro ao salvar",
        `Ocorreu um erro ao salvar o tipo: ${e}`,
        "warning",
        "error",
      );
    }
  }

  function handleOpenEdit() {
    const tipo = tipos.find((t) => t.id === selectedRows[0]);
    if (!tipo) return;

    setEditingTipo(tipo);
    setNome(tipo.nome);
    setOpenAside(true);
  }

  async function handleDelete() {
    try {
      for (const id of selectedRows) {
        const tipo = tipos.find((t) => t.id === id);
        if (!tipo) continue;

        const solicitacoesRef = collection(db, "solicitacoes");

        const q = query(solicitacoesRef, where("tipoId", "==", tipo.nome));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          showNotification(
            "Exclusão não permitida",
            `O tipo "${tipo.nome}" está vinculado a solicitações e não pode ser excluído.`,
            "warning",
            "error",
          );
          setOpenModal(false);
          if (updateSelectedRows) updateSelectedRows([]);
          return;
        }
      }

      for (const id of selectedRows) {
        await deleteDoc(doc(db, "tipoSolicitacao", id));
      }

      setTipos((prev) => prev.filter((t) => !selectedRows.includes(t.id)));
      setSelectedRows([]);
      setOpenModal(false);
      if (updateSelectedRows) updateSelectedRows([]);

      showNotification(
        "Excluído",
        selectedRows.length > 1
          ? `${selectedRows.length} tipos foram excluídos.`
          : "Tipo excluído com sucesso.",
        "success",
        "delete",
      );
    } catch (e) {
      showNotification("Erro ao excluir", `${e}`, "warning", "error");
    }
  }

  return (
    <>
      <Page
        namePage="Tipos de Solicitações"
        buttonContentPrimary="Novo Tipo"
        withActionPrimary
        onClickActionPrimary={handleOpenCreate}
        description="Gerencie os tipos de solicitações que os cidadãos podem escolher ao criar uma nova solicitação."
      >
        <DataTable
          skeleton={loading}
          columns={["nome"]}
          data={tipos}
          textRowsSelected="Linhas Selecionadas"
          rowsPerPage={4}
          withCheckbox
          onUpdateSelectedRows={handleUpdateSelectedRows}
          onSelectedRowsChange={(rows: string[]) => setSelectedRows(rows)}
          headerSelectedChildren={
            <>
              {selectedRows.length === 1 && (
                <Button
                  size="md"
                  variant="secondary"
                  typeIcon="edit"
                  onClick={handleOpenEdit}
                >
                  Editar
                </Button>
              )}
              {selectedRows.length > 0 && (
                <Button
                  size="md"
                  variant="secondary"
                  typeIcon="delete"
                  onClick={() => setOpenModal(true)}
                >
                  Excluir
                </Button>
              )}
            </>
          }
        />
      </Page>
      <Modal
        hideModal={() => {
          setOpenModal(false);
          if (updateSelectedRows) updateSelectedRows([]);
        }}
        isOpen={openModal}
        dismissible
        title={
          selectedRows.length > 1
            ? "Excluir tipos selecionados?"
            : "Excluir este tipo?"
        }
        description="Esta ação não pode ser desfeita."
        content={
          <ContentModal>
            <p style={{ color: "var(--s-color-content-light)" }}>
              {selectedRows.length > 1 ? (
                <>
                  Você está prestes a excluir {selectedRows.length} itens:{" "}
                  <strong style={{ color: "var(--s-color-content-default)" }}>
                    {tipos
                      .filter((t) => selectedRows.includes(t.id))
                      .map((t) => t.nome)
                      .join(", ")}
                    .
                  </strong>
                </>
              ) : (
                <>
                  Você está prestes a excluir o item:{" "}
                  <strong style={{ color: "var(--s-color-content-default)" }}>
                    {tipos.find((t) => t.id === selectedRows[0])?.nome || ""}.
                  </strong>
                </>
              )}
            </p>
          </ContentModal>
        }
        footer={
          <FooterModal>
            <div
              style={{
                display: "flex",
                width: "fit-content",
                gap: "var(--s-spacing-xx-small)",
              }}
            >
              <Button size="md" variant="warning" onClick={handleDelete}>
                Excluir
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setOpenModal(false);
                  if (updateSelectedRows) updateSelectedRows([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </FooterModal>
        }
      />
      <Aside
        isOpen={openAside}
        toggleAside={() => {
          setOpenAside(false);
          if (updateSelectedRows) updateSelectedRows([]);
        }}
        title={
          editingTipo
            ? "Editar Tipo de Solicitação"
            : "Criar Tipo de Solicitação"
        }
        description={
          editingTipo
            ? `${editingTipo.id} - ${editingTipo.nome}`
            : "Preencha os dados para criar um novo tipo de solicitação."
        }
        content={
          <AsideContent>
            <Input
              label="Tipo"
              placeholder="Ex: Iluminação pública queimada"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </AsideContent>
        }
        footer={
          <AsideFooter>
            <div
              style={{
                display: "flex",
                width: "fit-content",
                gap: "var(--s-spacing-xx-small)",
              }}
            >
              <Button
                disabled={nome.trim().length === 0}
                size="md"
                variant="primary"
                onClick={handleSave}
              >
                {editingTipo ? "Salvar" : "Confirmar"}
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setOpenAside(false);
                  if (updateSelectedRows) updateSelectedRows([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </AsideFooter>
        }
      />
      <NotificationMap
        icon={notificationIcon}
        variant={notificationVariant}
        title={notificationTitle}
        isOpen={notificationOpen}
        message={notificationMessage}
        onClose={() => {
          setNotificationOpen(false);
          setNotificationMessage("");
        }}
      />{" "}
    </>
  );
}
