"use client";

import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  Image,
  InputSelect,
  InputTextArea,
  Input,
  Icon,
} from "design-system-zeroz";
import { useEffect, useState } from "react";
import { Solicitacao } from "./types";
import { Autocomplete } from "@react-google-maps/api";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ajuste conforme seu projeto
import "./styles.scss";

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
  bairro: string;
  setBairro: (bairro: string) => void;
  handleSubmit: (data: {
    bairro: string;
    rua: string;
    numero: string;
  }) => void | Promise<void>;
  isLoading: boolean;
  editingMarker: Solicitacao | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  cep: string;
  setCep: (cep: string) => void;
  rua: string;
  setRua: (rua: string) => void;
  numero: string;
  setNumero: (numero: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

const bairrosList: string[] = [
  "Campo Grande",
  "Industrial",
  "Das Rosas",
  "Rincão da Saudade",
  "Lira",
  "Bela Vista",
  "Centro",
  "Lago Azul",
  "Encosta do Sol",
  "União",
  "Sol Nascente",
  "Rincão dos Ilhéus",
  "Floresta",
  "Rincão Gaúcho",
  "Colinas Verdes",
  "Das Águas",
  "Das Pedras",
];

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
  bairro,
  setBairro,
  handleSubmit,
  isLoading,
  editingMarker,
  onLocationSelect,
  cep,
  setCep,
  rua,
  setRua,
  setNumero,
  numero,
  searchValue,
  setSearchValue,
}: AsideFormProps) {
  const [tiposDeOcorrencia, setTiposDeOcorrencia] = useState<
    { id: string; nome: string }[]
  >([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [searchBox, setSearchBox] = useState<any>(null);
  const [searchError, setSearchError] = useState(false);
  const [searchErrorText, setSearchErrorText] = useState("");

  const [bairroInternal, setBairroInternal] = useState(
    bairro || bairrosList[0],
  );
  const [ruaInternal, setRuaInternal] = useState(rua || "");
  const [numeroInternal, setNumeroInternal] = useState(numero || "");
  const [bairrosOptions] = useState<string[]>(bairrosList);
  const [isEstanciaVelha, setIsEstanciaVelha] = useState(false);

  useEffect(() => {
    async function fetchTipos() {
      try {
        const tiposRef = collection(db, "tipoSolicitacao");
        const snapshot = await getDocs(tiposRef);

        const tipos = snapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome as string,
        }));

        setTiposDeOcorrencia(tipos);
      } catch (error) {
        console.error("Erro ao buscar tipos de solicitação:", error);
      } finally {
        setLoadingTipos(false);
      }
    }
    fetchTipos();
  }, []);

  useEffect(() => {
    if (!tipo && tiposDeOcorrencia.length > 0) {
      setTipo(tiposDeOcorrencia[0].nome);
    }
  }, [tipo, setTipo, tiposDeOcorrencia]);

  useEffect(() => {
    if (bairro) setBairroInternal(bairro);
  }, [bairro]);
  useEffect(() => {
    if (rua) setRuaInternal(rua);
  }, [rua]);
  useEffect(() => {
    if (numero) setNumeroInternal(numero);
  }, [numero]);

  useEffect(() => {
    if (!newMarker || !window.google) return;
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat: newMarker.lat, lng: newMarker.lng } },
      (results, status) => {
        if (status !== "OK" || !results || !results[0]) return;

        const components = results[0].address_components;
        const isEstanciaVelha = components.some(
          (comp) => comp.long_name === "Estância Velha",
        );

        if (!isEstanciaVelha) {
          setSearchError(true);
          setSearchErrorText(
            "Somente endereços em Estância Velha são permitidos.",
          );
        } else {
          setSearchError(false);
          setSearchErrorText("");
          setIsEstanciaVelha(true);
        }

        let bairroFound = "";
        let cepFound = "";
        let ruaFound = "";
        let numeroFound = "";

        components.forEach((comp) => {
          if (
            !bairroFound &&
            (comp.types.includes("neighborhood") ||
              comp.types.includes("sublocality_level_1"))
          )
            bairroFound = comp.long_name;
          if (comp.types.includes("postal_code")) cepFound = comp.long_name;
          if (comp.types.includes("route")) ruaFound = comp.long_name;
          if (comp.types.includes("street_number"))
            numeroFound = comp.long_name;
        });

        setBairro(bairroFound);
        setBairroInternal(bairroFound);
        setCep(cepFound);
        setRua(ruaFound);
        setRuaInternal(ruaFound);
        setNumero(numeroFound);
        setNumeroInternal(numeroFound);
        setSearchValue(results[0].formatted_address);
      },
    );
  }, [newMarker]);

  const handlePlacesChanged = () => {
    if (!searchBox) return;
    let places: any[] = [];
    if (typeof searchBox.getPlaces === "function") {
      places = searchBox.getPlaces();
    } else if (typeof searchBox.getPlace === "function") {
      const p = searchBox.getPlace();
      if (p) places = [p];
    }
    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place || !place.geometry) return;

    const isEstanciaVelha = place.address_components?.some(
      (c: any) => c.long_name === "Estância Velha",
    );
    if (!isEstanciaVelha) {
      setSearchError(true);
      setSearchErrorText(
        "Por favor, escolha um endereço dentro de Estância Velha.",
      );
      return;
    }

    const location = place.geometry.location;
    const lat =
      typeof location.lat === "function" ? location.lat() : location.lat;
    const lng =
      typeof location.lng === "function" ? location.lng() : location.lng;
    onLocationSelect?.(lat, lng);

    let bairroFound = "";
    let cepFound = "";
    let ruaFound = "";
    let numeroFound = "";

    place.address_components.forEach((comp: any) => {
      if (
        !bairroFound &&
        (comp.types.includes("neighborhood") ||
          comp.types.includes("sublocality_level_1"))
      )
        bairroFound = comp.long_name;
      if (comp.types.includes("postal_code")) cepFound = comp.long_name;
      if (comp.types.includes("route")) ruaFound = comp.long_name;
      if (comp.types.includes("street_number")) numeroFound = comp.long_name;
    });

    setBairro(bairroFound);
    setBairroInternal(bairroFound);
    setCep(cepFound);
    setRua(ruaFound);
    setRuaInternal(ruaFound);
    setNumero(numeroFound);
    setNumeroInternal(numeroFound);
    setSearchValue(place.formatted_address || "");
  };

  const isFormValid =
    (bairroInternal || bairro) &&
    (ruaInternal || rua) &&
    (numeroInternal || numero) &&
    tipo &&
    descricao.trim() !== "" &&
    imageUrl &&
    isEstanciaVelha;

  return (
    <Aside
      isOpen={formVisible}
      title={editingMarker ? "Editar solicitação" : "Nova solicitação"}
      description={
        editingMarker
          ? "Atualize as informações desta solicitação."
          : "Clique no mapa para marcar o local do problema ou pesquise o endereço e preencha as informações abaixo."
      }
      toggleAside={toggleAside}
      content={
        <AsideContent>
          <Autocomplete
            onLoad={(auto) => {
              setSearchBox(auto);
            }}
            onPlaceChanged={() => {
              handlePlacesChanged();
              const input = document.getElementById(
                "place-search-input",
              ) as HTMLInputElement | null;
              if (input?.value) setSearchValue(input.value);
            }}
          >
            <Input
              id="place-search-input"
              label="Pesquisar"
              placeholder="Pesquisar local"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              error={searchError}
              textError={searchErrorText}
            />
          </Autocomplete>

          <div className="endereco">
            <Input label="CEP" value={cep} disabled />
            <InputSelect
              label="Bairro"
              value={bairroInternal}
              options={bairrosOptions}
              onChange={(value: string) => setBairroInternal(value)}
              disabled={!!bairro || searchValue === ""}
            />
            <Input
              label="Rua"
              value={ruaInternal}
              onChange={(e) => setRuaInternal(e.target.value)}
              disabled={!!rua || searchValue === ""}
            />
            <Input
              label="Número"
              value={numeroInternal}
              onChange={(e) => setNumeroInternal(e.target.value)}
              disabled={!!numero || searchValue === ""}
            />
          </div>

          <InputSelect
            label="Tipo de ocorrência"
            value={tipo}
            disabled={loadingTipos}
            onChange={(value: string) => setTipo(value)}
            options={tiposDeOcorrencia.map((t) => t.nome)}
          />

          <div className="endereco">
            <InputTextArea
              placeholder="Descreva o que está acontecendo..."
              label="Descrição detalhada"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <div className="aside-image-wrapper">
                {imageUrl && (
                  <Image
                    width="120px"
                    height="120px"
                    src={imageUrl}
                    alt="Imagem enviada"
                  />
                )}
                <label className="aside-image-upload">
                  {imageUrl ? (
                    <div>
                      <Icon icon="image" size="md" />
                      <p>Trocar Imagem</p>
                    </div>
                  ) : (
                    <div>
                      <Icon icon="image_search" size="md" />
                      <p>Adicionar Imagem</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const files = e.target.files;
                      setImageFile(files);
                      if (files && files.length > 0) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setImageUrl(reader.result as string);
                        reader.readAsDataURL(files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
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
            <Button
              size="md"
              variant={`${isLoading ? "is-loading" : "primary"}`}
              onClick={() => {
                handleSubmit({
                  bairro: bairroInternal,
                  rua: ruaInternal,
                  numero: numeroInternal,
                });
              }}
              disabled={!isFormValid}
            >
              {editingMarker ? "Salvar alterações" : "Enviar solicitação"}
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
