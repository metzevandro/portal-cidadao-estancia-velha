import { useState, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import limites from "../../mapAPI/estancia-velha-limites.json";
import { bairrosBounds, findNeighborhood } from "@/types/bairros";
import { cidadeBounds } from "@/types/cidade";
import { Solicitacao } from "./types";
import { MapComponents } from "./Mapa";
import { AsideForm } from "./Aside";
import { NotificationMap } from "./Notification";

import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export function SolicitacaoMapa({
  local,
  loggedIn,
}: {
  local: string;
  loggedIn: boolean;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newMarker, setNewMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<FileList | null>(null);
  const [zoom, setZoom] = useState(15);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [bairroSelecionado, setBairroSelecionado] = useState("");
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  let polygonCoords: { lat: number; lng: number }[] = [];
  if (bairrosBounds[local]) {
    polygonCoords = bairrosBounds[local];
  } else {
    polygonCoords = (
      limites.features[0].geometry.coordinates[0] as [number, number][]
    ).map((coord) => ({ lat: coord[1], lng: coord[0] }));
  }

  const showNotification = (title: string, message: string) => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationOpen(true);
    setTimeout(() => {
      setNotificationOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
    }, 5000);
  };

  const isPointInPolygon = (
    point: google.maps.LatLng,
    polygon: { lat: number; lng: number }[],
  ) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat,
        yi = polygon[i].lng;
      const xj = polygon[j].lat,
        yj = polygon[j].lng;
      const intersect =
        yi > point.lng() !== yj > point.lng() &&
        point.lat() < ((xj - xi) * (point.lng() - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const smoothZoom = (
    map: google.maps.Map,
    targetZoom: number,
    step: number = 0.5,
  ) => {
    const currentZoom = map.getZoom() || 0;
    if (Math.abs(currentZoom - targetZoom) < step) {
      map.setZoom(targetZoom);
      return;
    }
    const nextZoom =
      currentZoom < targetZoom ? currentZoom + step : currentZoom - step;
    map.setZoom(nextZoom);
    setTimeout(() => smoothZoom(map, targetZoom, step), 50);
  };

  const handlePlacesChanged = () => {
    if (!searchBox || !mapRef.current) return;

    const places = searchBox.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    const map = mapRef.current;

    if (place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      const point = new google.maps.LatLng(location.lat(), location.lng());
      const estanciaVelhaCoords = cidadeBounds["Estância Velha"];

      if (!isPointInPolygon(point, estanciaVelhaCoords)) {
        showNotification(
          "Localização Inválida!",
          "O local selecionado está fora dos limites do município de Estância Velha.",
        );
        return;
      }

      if (place.geometry.viewport) {
        const boundsCenter = place.geometry.viewport.getCenter();
        if (boundsCenter) {
          map.panTo(boundsCenter);
          smoothZoom(map, map.getZoom() || 15);
        }
      } else {
        map.panTo(location);
        smoothZoom(map, 17);
      }
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    if (!loggedIn) {
      return showNotification(
        "Erro ao fazer a solicitação.",
        "É necessário uma conta para fazer solicitações.",
      );
    }

    const target = event.domEvent?.target as HTMLElement;
    const isMarkerClick =
      target?.closest(".marker-overlay") ||
      target?.closest(".gm-ui-hover-effect");
    if (isMarkerClick) return;

    const polygon = new google.maps.Polygon({
      paths: cidadeBounds["Estância Velha"],
    });
    const isInside = google.maps.geometry.poly.containsLocation(
      event.latLng,
      polygon,
    );

    if (isInside) {
      setNewMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setFormVisible(true);
    } else {
      showNotification(
        "Localização Inválida!",
        `Por favor, selecione um local dentro dos limites de ${bairroSelecionado || "Estância Velha"}.`,
      );
    }
  };

  const handleSubmit = () => {
    if (!newMarker) return;
    const point = new google.maps.LatLng(newMarker.lat, newMarker.lng);
    if (!isPointInPolygon(point, cidadeBounds["Estância Velha"])) {
      showNotification(
        "Localização Inválida!",
        "Por favor, selecione um local dentro dos limites do município.",
      );
      return;
    }

    let bairro = findNeighborhood(newMarker.lat, newMarker.lng);
    if (bairro === "Desconhecido") {
      if (!bairroSelecionado) {
        showNotification(
          "Localização Inválida!",
          "Por favor, selecione o bairro de Estância Velha.",
        );
        return;
      }
      bairro = bairroSelecionado;
    }

    const novaSolicitacao: Solicitacao = {
      lat: newMarker.lat,
      lng: newMarker.lng,
      tipo: tipo || "Não especificado",
      descricao,
      imageUrl,
      bairro,
    };

    setSolicitacoes((prev) => [...prev, novaSolicitacao]);
    setNewMarker(null);
    setTipo("");
    setDescricao("");
    setImageUrl("");
    setImageFile(null);
    setFormVisible(false);
    setBairroSelecionado("");
  };

  const handleOnLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    polygonCoords.forEach((coord) => bounds.extend(coord));
    const center = bounds.getCenter();
    if (center) {
      map.panTo(center);
      smoothZoom(map, 15);
    }
  };

  const handleZoomChanged = () => {
    if (mapRef.current) setZoom(mapRef.current.getZoom() || 0);
  };

  const toggleAside = () => {
    if (!formVisible) {
      setFormVisible(true);
    } else {
      setFormVisible(false);
      setNewMarker(null);
      setTipo("");
      setDescricao("");
      setImageUrl("");
      setImageFile(null);
    }
  };

  const getPolygonCentroid = (coords: { lat: number; lng: number }[]) => {
    let area = 0,
      x = 0,
      y = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const f = coords[i].lat * coords[j].lng - coords[j].lat * coords[i].lng;
      area += f;
      x += (coords[i].lat + coords[j].lat) * f;
      y += (coords[i].lng + coords[j].lng) * f;
    }
    area /= 2;
    x /= 6 * area;
    y /= 6 * area;
    return { lat: x, lng: y };
  };

  const polygonCenter = getPolygonCentroid(polygonCoords);

  if (loadError) return <div>Erro ao carregar o mapa</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  const mapOptions: google.maps.MapOptions = {
    restriction: {
      latLngBounds: (() => {
        const bounds = new google.maps.LatLngBounds();
        polygonCoords.forEach((coord) => bounds.extend(coord));
        return bounds;
      })(),
      strictBounds: false,
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "administrative.locality",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "administrative.neighborhood",
        stylers: [{ visibility: "off" }],
      },
      { featureType: "poi.business", stylers: [{ visibility: "off" }] },
      { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ],
  };
  return (
    <>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <MapComponents
            polygonCoords={polygonCoords}
            polygonCenter={polygonCenter}
            solicitacoes={solicitacoes}
            zoom={zoom}
            mapOptions={mapOptions}
            handleMapClick={handleMapClick}
            handleOnLoad={handleOnLoad}
            handleZoomChanged={handleZoomChanged}
            searchBox={searchBox}
            setSearchBox={setSearchBox}
            handlePlacesChanged={handlePlacesChanged}
            local={local}
          />
          <AsideForm
            formVisible={formVisible}
            toggleAside={toggleAside}
            tipo={tipo}
            setTipo={setTipo}
            descricao={descricao}
            setDescricao={setDescricao}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            newMarker={newMarker}
            bairroSelecionado={bairroSelecionado}
            setBairroSelecionado={setBairroSelecionado}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
      <NotificationMap
        title={notificationTitle}
        isOpen={notificationOpen}
        message={notificationMessage}
        onClose={() => {
          setNotificationOpen(false);
          setNotificationMessage("");
        }}
      />
    </>
  );
}
