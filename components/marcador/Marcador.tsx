"use client";

import { OverlayView, InfoWindow, Circle } from "@react-google-maps/api";
import { Icon } from "design-system-zeroz";
import { useState } from "react";

import "./Marcador.scss";

type MarcadorProps = {
  lat: number;
  lng: number;
  tipo: string;
  descricao: string;
  zoom: number;
  minZoom?: number;
  imageUrl?: string;
};

type MarkerType = {
  iconText: string;
  color: string;
};

type MarkerTypes = {
  [K in string]: MarkerType;
};

export function Marcador({
  lat,
  lng,
  tipo,
  descricao,
  zoom,
  minZoom = 14,
  imageUrl,
}: MarcadorProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);

  if (zoom < minZoom) return null;

  const markerTypes: MarkerTypes = {
    "Foco de dengue": { iconText: "place", color: "#E53935" },
    "Vazamento ou encanamento": { iconText: "plumbing", color: "#1E88E5" },
    "Buraco na via / esgoto": { iconText: "warning", color: "#FBC02D" },
    "Animal perdido ou abandonado": { iconText: "pets", color: "#FB8C00" },
    "Árvore caída ou em risco": { iconText: "park", color: "#43A047" },
  };

  const defaultMarker: MarkerType = { iconText: "place", color: "red" };
  const { iconText, color } = markerTypes[tipo] || defaultMarker;

  const infoWindowContent = (
    <div className={`infoWindow ${highlight ? "highlight" : ""}`}>
      <small>{descricao}</small>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Local da ocorrência"
          style={{ width: "100%", objectFit: "cover", maxHeight: "80px" }}
        />
      )}
    </div>
  );

  const handleClick = () => {
    setHighlight(!highlight);
    setOpen(true);
  };

  if (tipo === "Foco de dengue") {
    return (
      <>
        <Circle
          center={{ lat, lng }}
          radius={30}
          options={{
            fillColor: color,
            fillOpacity: 0.1,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
          }}
          onClick={handleClick}
        />
        {open && (
          <InfoWindow
            position={{ lat, lng }}
            onCloseClick={() => setOpen(false)}
            options={{ pixelOffset: new google.maps.Size(0, -30) }}
          >
            {infoWindowContent}
          </InfoWindow>
        )}
      </>
    );
  }

  return (
    <>
      <OverlayView
        position={{ lat, lng }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          className={`marker-info-container ${open ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          style={{
            transform: `translate(-50%, -100%)`,
          }}
        >
          {!open && (
            <div className="marker-icon" style={{ backgroundColor: color }}>
              <Icon icon={iconText} size="sm" />
            </div>
          )}

          {open && (
            <div className="info-content">
              {imageUrl && <img src={imageUrl} alt="Local da ocorrência" />}

              <h4>{tipo}</h4>

              <p>{descricao}</p>
            </div>
          )}
        </div>
      </OverlayView>
    </>
  );
}
