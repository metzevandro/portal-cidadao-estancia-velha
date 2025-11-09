"use client";
import { useState, useRef, useEffect, MutableRefObject } from "react";
import { useLoadScript } from "@react-google-maps/api";
import limites from "../../mapAPI/estancia-velha.json";
import { cidadeBounds } from "@/types/cidade";
import { Solicitacao } from "./types";
import { MapComponents } from "./Mapa";
import { AsideForm } from "./Aside";
import { NotificationMap } from "./Notification";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  serverTimestamp,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/app/_context";
import { Skeleton } from "design-system-zeroz";

const LIBRARIES = ["places"] as const;

export function SolicitacaoMapa({
  loggedIn,
  onNovaSolicitacao,
  onOpenAside,
  userId,
}: {
  loggedIn: boolean;
  onNovaSolicitacao?: () => void;
  onOpenAside?: MutableRefObject<((shouldOpen: boolean) => void) | null>;
  userId?: string;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES as unknown as any,
  });
  const [marcadorAberto, setMarcadorAberto] = useState(false);

  const [editingMarker, setEditingMarker] = useState<Solicitacao | null>(null);
  const currentUser = useUser();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newMarker, setNewMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");

  const [imageFile, setImageFile] = useState<FileList | null>(null);
  const [zoom, setZoom] = useState(10);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState<
    "primary" | "secondary" | "warning" | "success"
  >("primary");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationIcon, setNotificationIcon] = useState("");

  const [bairro, setBairro] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const mapRef = useRef<google.maps.Map | null>(null);

  const [loadingSolicitacao, setLoadingSolicitacao] = useState(false);

  let polygonCoords = (
    limites.features[0].geometry.coordinates[0] as [number, number][]
  ).map((coord) => ({ lat: coord[1], lng: coord[0] }));

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

  useEffect(() => {
    const solicitacoesRef = collection(db, "solicitacoes");
    const q = query(solicitacoesRef, orderBy("criadoEm", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        let solicitacoesData: Solicitacao[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;

          return {
            id: doc.id,
            lat: Number(data.lat),
            lng: Number(data.lng),
            tipo: data.tipo || "",
            descricao: data.descricao || "",
            bairro: data.bairro || "",
            imageUrl: data.imageUrl || "",
            status: (data.status as Solicitacao["status"]) || "pendente",
            userId: data.userId || "",
            cep: data.cep || "",
            rua: data.rua || "",
            numero: data.numero || "",
          };
        });

        if (userId) {
          solicitacoesData = solicitacoesData.filter(
            (s) => s.userId === userId,
          );
        }

        setSolicitacoes(solicitacoesData);
      },
      (error) => {
        showNotification(
          "Erro",
          "Não foi possível carregar as solicitações do Firebase.",
          "warning",
          "warning",
        );
      },
    );

    return () => unsubscribe();
  }, [userId]);

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

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    if (!loggedIn) {
      return showNotification(
        "Erro ao fazer a solicitação.",
        "É necessário uma conta para fazer solicitações.",
        "warning",
        "warning",
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

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== "OK" || !results || !results[0]) {
        return showNotification(
          "Erro",
          "Não foi possível identificar o endereço. Clique mais próximo a uma via.",
          "warning",
          "warning",
        );
      }

      const address = results[0].address_components;
      const hasStreet = address.some((c) => c.types.includes("route"));

      if (!hasStreet) {
        return showNotification(
          "Localização incompleta",
          "Clique próximo a uma rua.",
          "warning",
          "warning",
        );
      }

      setNewMarker({ lat, lng });
      setFormVisible(true);
    });
  };

  const handleSubmit = async ({
    bairro: bairroFinal,
    rua: ruaFinal,
    numero: numeroFinal,
  }: {
    bairro: string;
    rua: string;
    numero: string;
  }) => {
    if (!newMarker) return;
    if (loadingSolicitacao) return;

    try {
      if (editingMarker) {
        setLoadingSolicitacao(true);
        await updateDoc(doc(db, "solicitacoes", editingMarker.id), {
          tipo: tipo || "Não especificado",
          descricao,
          bairro: bairroFinal || editingMarker.bairro,
          imageUrl,
          status: editingMarker.status,
        });
        showNotification(
          "Sucesso",
          "Sua solicitação foi atualizada com sucesso!",
          "success",
          "check_circle",
        );
      } else {
        setLoadingSolicitacao(true);

        await addDoc(collection(db, "solicitacoes"), {
          lat: newMarker.lat,
          lng: newMarker.lng,
          tipo: tipo,
          descricao,
          bairro: bairroFinal,
          imageUrl,
          criadoEm: serverTimestamp(),
          status: "em_analise",
          userId: currentUser?.user?.uid || "",
          cep,
          rua: ruaFinal,
          numero: numeroFinal,
        });
        showNotification(
          "Sucesso",
          "Sua solicitação foi criada com sucesso!",
          "success",
          "check_circle",
        );
        onNovaSolicitacao?.();
      }

      setNewMarker(null);
      setTipo("");
      setDescricao("");
      setImageUrl("");
      setImageFile(null);
      setFormVisible(false);
      setEditingMarker(null);
      setLoadingSolicitacao(false);
    } catch (err) {
      setLoadingSolicitacao(false);
      showNotification(
        "Ops!",
        "Houve um problema ao salvar sua solicitação. Tente novamente.",
        "warning",
        "warning",
      );
    }
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

  const [searchValue, setSearchValue] = useState("");

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
      setSearchValue("");
      setCep("");
      setRua("");
      setNumero("");
      setBairro("");
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

  useEffect(() => {
    if (!onOpenAside) return;

    const opener = (shouldOpen: boolean) => {
      if (shouldOpen && !loggedIn) {
        showNotification(
          "Erro ao fazer a solicitação.",
          "É necessário uma conta para fazer solicitações.",
          "warning",
          "warning",
        );
        return;
      }

      if (shouldOpen) {
        setNewMarker(null);
        setTipo("");
        setDescricao("");
        setImageUrl("");
        setImageFile(null);
        setSearchValue("");
        setCep("");
        setRua("");
        setNumero("");
        setBairro("");
      }

      setFormVisible(shouldOpen);
    };

    onOpenAside.current = opener;
    return () => {
      if (onOpenAside) onOpenAside.current = null;
    };
  }, [onOpenAside, loggedIn]);

  if (loadError) return <div>Erro ao carregar o mapa</div>;
  if (!isLoaded) return <p>Carregando...</p>;

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
    gestureHandling: "cooperative",
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

  const handleDeleteMarker = async (marker: Solicitacao) => {
    try {
      await deleteDoc(doc(db, "solicitacoes", marker.id));
      showNotification(
        "Sucesso",
        "Sua solicitação foi excluída com sucesso!",
        "success",
        "check_circle",
      );
      onNovaSolicitacao?.();
    } catch (error) {
      showNotification(
        "Erro",
        "Não foi possível excluir sua solicitação. Tente novamente.",
        "warning",
        "warning",
      );
    }
  };

  const handleConfirmStatusChange = async (
  marker: Solicitacao,
  novoStatus: Solicitacao["status"]
) => {
  try {
    const ref = doc(db, "solicitacoes", marker.id);
    await updateDoc(ref, { status: novoStatus });

    showNotification(
      "Status atualizado",
      `A solicitação foi movida para "${novoStatus.replace("_", " ")}".`,
      "success",
      "check_circle"
    );

    onNovaSolicitacao?.();
  } catch (err) {
    showNotification(
      "Erro",
      "Não foi possível atualizar o status.",
      "warning",
      "warning"
    );
  }
};


  return (
    <>
      <MapComponents
      onChangeStatus={handleConfirmStatusChange}
        onDeleteMarker={handleDeleteMarker}
        setMarcadorAberto={setMarcadorAberto}
        bairroSelecionado={bairro}
        setBairroSelecionado={setBairro}
        currentUserId={currentUser?.user?.uid || ""}
        onEditMarker={(marker) => {
          setEditingMarker(marker);
          setNewMarker({ lat: marker.lat, lng: marker.lng });
          setTipo(marker.tipo);
          setDescricao(marker.descricao || "");
          setImageUrl(marker.imageUrl || "");
          setBairro(marker.bairro || "");
          setFormVisible(true);
        }}
        polygonCoords={polygonCoords}
        polygonCenter={polygonCenter}
        solicitacoes={solicitacoes}
        zoom={zoom}
        mapOptions={mapOptions}
        handleMapClick={handleMapClick}
        handleOnLoad={handleOnLoad}
        handleZoomChanged={handleZoomChanged}
        marcadorAberto={marcadorAberto}
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
      />
      <AsideForm
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        cep={cep}
        numero={numero}
        setNumero={setNumero}
        setCep={setCep}
        rua={rua}
        setRua={setRua}
        isLoading={loadingSolicitacao}
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
        bairro={bairro}
        setBairro={setBairro}
        handleSubmit={({ bairro, rua, numero }) =>
          handleSubmit({ bairro, rua, numero })
        }
        editingMarker={editingMarker}
        onLocationSelect={(lat, lng) => {
          setNewMarker({ lat, lng });
        }}
      />
    </>
  );
}
