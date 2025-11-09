"use client";

import { OverlayView } from "@react-google-maps/api";
import { Icon } from "design-system-zeroz";
import { useState } from "react";

import "./Marcador.scss";

type MarcadorProps = {
  lat: number;
  lng: number;
  tipo: string;
  status: "pendente" | "em_analise" | "em_execucao" | "concluida" | "rejeitada";
  zoom: number;
  minZoom?: number;
  id: string;
  isOpen: boolean;
  onOpenChange?: (id: string) => void;
};

export type MarkerType = {
  iconText: string;
};

export const STATUS_COLORS: Record<MarcadorProps["status"], string> = {
  em_analise: "#FACC15",
  pendente: "#f97316",
  em_execucao: "#1E88E5",
  concluida: "#10B981",
  rejeitada: "#E53935",
};

export const MARKER_TYPES: Record<string, MarkerType> = {
  "Foco de dengue": { iconText: "coronavirus" },
  "Buraco na via / esgoto": { iconText: "warning" },
  "Animal perdido ou abandonado": { iconText: "pets" },
  "Árvore caída ou em risco": { iconText: "park" },
  "Iluminação pública queimada": { iconText: "lightbulb" },
  "Lixo ou entulho em via pública": { iconText: "delete" },
};

export function Marcador({
  lat,
  lng,
  tipo,
  status,
  zoom,
  minZoom = 14,
  onOpenChange,
  isOpen,
  id,
}: MarcadorProps & { isOpen: boolean }) {
  if (zoom < minZoom) return null;

  const { iconText } = MARKER_TYPES[tipo] || { iconText: "place" };

  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div style={{ position: "relative" }}>
        <div
          className="marker-icon"
          style={{
            backgroundColor: STATUS_COLORS[status],
            transform: "translate(-50%, -100%)",
            cursor: "pointer",
            touchAction: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onOpenChange?.(id);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onOpenChange?.(id);
          }}
        >
          <Icon icon={iconText} size="sm" />
        </div>
      </div>
    </OverlayView>
  );
}
