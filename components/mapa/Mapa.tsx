"use client";
import { GoogleMap, Polygon, OverlayView } from "@react-google-maps/api";
import { Marcador } from "../marcador/Marcador";
import { Solicitacao } from "./types";
import React, { useState, useRef, useEffect } from "react";
import { Button, ButtonIcon, EmptyState } from "design-system-zeroz";
import { ModalExcluirSolicitacao } from "./ModalExcluir";
import { useUser } from "@/app/_context";
import "./styles.scss";
import { ModalStatusSolicitacao } from "./ModalStatus";

interface MapProps {
  polygonCoords: { lat: number; lng: number }[];
  polygonCenter: { lat: number; lng: number };
  solicitacoes: Solicitacao[];
  zoom: number;
  mapOptions: google.maps.MapOptions;
  handleMapClick: (event: google.maps.MapMouseEvent) => void;
  handleOnLoad: (map: google.maps.Map) => void;
  handleZoomChanged: () => void;
  currentUserId: string;
  onEditMarker: (marker: Solicitacao) => void;
  bairroSelecionado: string;
  setBairroSelecionado: (bairro: string) => void;
  marcadorAberto: boolean;
  setMarcadorAberto: (aberto: boolean) => void;
  onDeleteMarker: (marker: Solicitacao) => void;
  onChangeStatus: (
    marker: Solicitacao,
    novoStatus: Solicitacao["status"],
  ) => void;
}

export function MapComponents({
  polygonCoords,
  polygonCenter,
  solicitacoes,
  zoom,
  mapOptions,
  handleMapClick,
  handleOnLoad,
  handleZoomChanged,
  currentUserId,
  onEditMarker,
  marcadorAberto,
  setMarcadorAberto,
  onDeleteMarker,
  onChangeStatus,
}: MapProps) {
  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
  const informacoesRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { isAdmin } = useUser();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (informacoesRef.current) {
      setHeight(informacoesRef.current.offsetHeight);
    }
  }, [informacoesRef.current]);

  const handleOpenChange = (id: string | null) => {
    setOpenMarkerId(id);
    setMarcadorAberto(!!id);

    if (id) {
      setTimeout(() => {
        document.querySelector(".info")?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  const openMarker = openMarkerId
    ? solicitacoes.find((s) => s.id === openMarkerId)
    : null;

  const [modalOpenDelete, setModalOpenDelete] = useState(false);
  const [markerToDelete, setMarkerToDelete] = useState<Solicitacao | null>(
    null,
  );

  const handleDeleteClick = (marker: Solicitacao) => {
    setMarkerToDelete(marker);
    setModalOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!markerToDelete) return;
    onDeleteMarker(markerToDelete);
    setModalOpenDelete(false);
    setMarkerToDelete(null);
    setOpenMarkerId(null);
  };

  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [markerToChangeStatus, setMarkerToChangeStatus] =
    useState<Solicitacao | null>(null);
  const [novoStatusTemp, setNovoStatusTemp] = useState<
    "pendente" | "em_analise" | "concluida" | "rejeitada" | null
  >(null);

  const handleStatusClick = (
    novoStatus: "pendente" | "em_analise" | "concluida" | "rejeitada",
  ) => {
    if (!isAdmin || !openMarker) return;
    if (novoStatus === openMarker.status) return;

    setMarkerToChangeStatus(openMarker);
    setNovoStatusTemp(novoStatus);
    setModalStatusOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!markerToChangeStatus || !novoStatusTemp) return;

    onChangeStatus(markerToChangeStatus, novoStatusTemp);

    setModalStatusOpen(false);
    setMarkerToChangeStatus(null);
    setNovoStatusTemp(null);
  };

  return (
    <>
      <div className="map-wrapper">
        <GoogleMap
          onZoomChanged={handleZoomChanged}
          onLoad={handleOnLoad}
          zoom={zoom}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={mapOptions}
          onClick={handleMapClick}
        >
          <Polygon
            paths={polygonCoords}
            options={{
              fillColor: "gray",
              fillOpacity: 0.1,
              strokeColor: "black",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: false,
            }}
          />

          <OverlayView
            position={polygonCenter}
            mapPaneName={OverlayView.OVERLAY_LAYER}
          >
            <h4
              style={{
                color: "#24b57f",
                stroke: "black",
                whiteSpace: "nowrap",
                transform: "translate(-50%, -50%)",
                position: "absolute",
              }}
            >
              Estância Velha
            </h4>
          </OverlayView>

          {solicitacoes.map((marker) => (
            <Marcador
              key={marker.id}
              id={marker.id}
              lat={marker.lat}
              lng={marker.lng}
              tipo={marker.tipo}
              status={marker.status}
              zoom={zoom}
              isOpen={openMarkerId === marker.id}
              onOpenChange={() =>
                handleOpenChange(openMarkerId === marker.id ? null : marker.id)
              }
            />
          ))}
        </GoogleMap>
      </div>
      <div className="info" id="marker-info" ref={informacoesRef}>
        <div
          className="informacoes-marcador"
          style={{
            height: isSmallScreen ? "fit-content" : `${height}px`,
            overflowY: "scroll",
          }}
        >
          {openMarker ? (
            <div
              className="aba-lateral"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--s-spacing-x-small)",
                  }}
                >
                  <h3>{openMarker.tipo}</h3>
                  <p
                    style={{
                      color: "var(--s-color-content-light)",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                    }}
                  >
                    {openMarker.descricao}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--s-spacing-nano)",
                    }}
                  >
                    {[
                      { key: "em_analise", label: "Análise" },
                      { key: "pendente", label: "Pendente" },
                      { key: "concluida", label: "Concluída" },
                    ].map((fase, index) => (
                      <React.Fragment key={fase.key}>
                        <p
                          className={`status ${openMarker.status === fase.key ? `ativa ${fase.key}` : `${fase.key}`}`}
                          style={{
                            cursor: isAdmin ? "pointer" : "default",
                            opacity: isAdmin ? 1 : 0.7,
                          }}
                          onClick={() =>
                            handleStatusClick(
                              fase.key as
                                | "pendente"
                                | "em_analise"
                                | "concluida"
                                | "rejeitada",
                            )
                          }
                        >
                          {fase.label}
                        </p>
                        {index < 2 && <small>›</small>}
                      </React.Fragment>
                    ))}
                  </div>

                  <img
                    src={openMarker.imageUrl || "notfound"}
                    className="image-preview"
                  />
                  <small
                    style={{
                      color: "var(--s-color-content-light)",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                    }}
                  >
                    {openMarker.rua}, {openMarker.numero} - {openMarker.bairro}{" "}
                    - {openMarker.cep}
                  </small>
                  {openMarker &&
                    (currentUserId === openMarker.userId ||
                      isAdmin === true) && (
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--s-spacing-xx-small)",
                        }}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onEditMarker(openMarker)}
                        >
                          Editar
                        </Button>
                        <ButtonIcon
                          size="sm"
                          variant="warning"
                          typeIcon="delete"
                          buttonType="default"
                          onClick={() => handleDeleteClick(openMarker)}
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
              }}
            >
              <EmptyState
                icon="location_on"
                title="Nenhum marcador selecionado"
                description="Clique em um marcador no mapa para ver detalhes e opções de interação."
              />
            </div>
          )}
        </div>
      </div>

      <ModalExcluirSolicitacao
        isOpen={modalOpenDelete}
        onClose={() => setModalOpenDelete(false)}
        onConfirm={handleConfirmDelete}
        solicitacao={
          markerToDelete
            ? { nome: markerToDelete.tipo, descricao: markerToDelete.descricao }
            : { nome: "", descricao: "" }
        }
      />

      <ModalStatusSolicitacao
        isOpen={modalStatusOpen}
        onClose={() => setModalStatusOpen(false)}
        onConfirm={handleConfirmStatusChange}
        solicitacao={
          markerToChangeStatus
            ? {
                nome: markerToChangeStatus.tipo,
                descricao: markerToChangeStatus.descricao,
                status: markerToChangeStatus.status,
              }
            : { nome: "", descricao: "", status: "" }
        }
      />
    </>
  );
}
