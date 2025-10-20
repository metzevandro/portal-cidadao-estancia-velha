"use client";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  ImageUploader,
  InputSelect,
  InputTextArea,
} from "design-system-zeroz";
import { bairrosBounds, findNeighborhood } from "@/types/bairros";
import { tiposDeOcorrencia } from "./constants";

interface AsideFormProps {
  formVisible: boolean;
  toggleAside: () => void;
  tipo: string;
  setTipo: (tipo: string) => void;
  descricao: string;
  setDescricao: (desc: string) => void;
  imageFile: FileList | null;
  setImageFile: (file: FileList | null) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  newMarker: { lat: number; lng: number } | null;
  bairroSelecionado: string;
  setBairroSelecionado: (bairro: string) => void;
  handleSubmit: () => void;
}

export function AsideForm({
  formVisible,
  toggleAside,
  tipo,
  setTipo,
  descricao,
  setDescricao,
  imageFile,
  setImageFile,
  imageUrl,
  setImageUrl,
  newMarker,
  bairroSelecionado,
  setBairroSelecionado,
  handleSubmit,
}: AsideFormProps) {
  return (
    <Aside
      isOpen={formVisible}
      title="Nova solicitação"
      description="Clique no mapa para marcar o local do problema e preencha as informações abaixo."
      toggleAside={toggleAside}
      content={
        <AsideContent>
          <InputSelect
            label="Tipo de ocorrência"
            onChange={(value: string) => setTipo(value)}
            value={tipo}
            options={tiposDeOcorrencia}
          />
          <InputTextArea
            placeholder="Descreva o que está acontecendo..."
            label="Descrição detalhada"
            value={descricao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescricao(e.target.value)
            }
          />
          <ImageUploader
            labelDropzone="Adicionar imagem"
            iconDropzone="upload"
            proportion="1/1"
            description="Envie uma imagem para ajudar na identificação do local"
            value={imageFile}
            onChange={(files: FileList | null) => {
              setImageFile(files);
              if (files && files.length > 0) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(files[0]);
              } else {
                setImageUrl("");
              }
            }}
          />
          {findNeighborhood(newMarker?.lat!, newMarker?.lng!) ===
            "Desconhecido" && (
            <InputSelect
              label="Selecione o bairro"
              onChange={(value: string) => setBairroSelecionado(value)}
              value={bairroSelecionado}
              options={Object.keys(bairrosBounds).filter(
                (b) => b !== "Desconhecido",
              )}
            />
          )}
        </AsideContent>
      }
      footer={
        <AsideFooter>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              gap: "var(--s-spacing-xx-small",
            }}
          >
            <Button size="md" variant="primary" onClick={handleSubmit}>
              Enviar solicitação
            </Button>
            <Button size="md" variant="secondary" onClick={toggleAside}>
              Cancelar
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
}
