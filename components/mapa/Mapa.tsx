"use client";
import {
  GoogleMap,
  Polygon,
  StandaloneSearchBox,
  OverlayView,
} from "@react-google-maps/api";
import { Marcador } from "../marcador/Marcador";
import { Solicitacao } from "./types";
import { Input } from "design-system-zeroz";

interface MapProps {
  polygonCoords: { lat: number; lng: number }[];
  polygonCenter: { lat: number; lng: number };
  solicitacoes: Solicitacao[];
  zoom: number;
  mapOptions: google.maps.MapOptions;
  handleMapClick: (event: google.maps.MapMouseEvent) => void;
  handleOnLoad: (map: google.maps.Map) => void;
  handleZoomChanged: () => void;
  searchBox: google.maps.places.SearchBox | null;
  setSearchBox: (box: google.maps.places.SearchBox) => void;
  handlePlacesChanged: () => void;
  local: string;
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
  searchBox,
  setSearchBox,
  handlePlacesChanged,
  local,
}: MapProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <StandaloneSearchBox
          onLoad={(ref) => setSearchBox(ref)}
          onPlacesChanged={handlePlacesChanged}
        >
          <Input
            style={{ width: "250px" }}
            type="text"
            placeholder="Ex: Rua Guilherme Blauth Filho, 161"
          />
        </StandaloneSearchBox>
      </div>

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
            {local}
          </h4>
        </OverlayView>

        {solicitacoes.map((marker, index) => (
          <Marcador
            key={index}
            lat={marker.lat}
            lng={marker.lng}
            tipo={marker.tipo}
            descricao={marker.descricao}
            zoom={zoom}
            minZoom={15}
            imageUrl={marker.imageUrl}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
