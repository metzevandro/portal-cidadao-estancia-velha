import BELA_VISTA from "../mapAPI/bela-vista.json";
import CAMPO_GRANDE from "../mapAPI/campo-grande.json";
import CENTRO from "../mapAPI/centro.json";
import COLINAS_VERDES from "../mapAPI/colinas-verdes.json";
import ENCOSTA_DO_SOL from "../mapAPI/encosta-do-sol.json";
import FLOR_DA_ROSA from "../mapAPI/flor-da-rosa.json";
import FLORESTA from "../mapAPI/floresta.json";
import INDUSTRIAL from "../mapAPI/industrial.json";
import LAGO_AZUL from "../mapAPI/lago-azul.json";
import LIRA from "../mapAPI/lira.json";
import PEDRAS from "../mapAPI/pedras.json";
import QUINTAS from "../mapAPI/quintas.json";
import RINCAO_DA_SAUDADE from "../mapAPI/rincao-da-saudade.json";
import RINCAO_DOS_ILHEUS from "../mapAPI/rincao-dos-ilheus.json";
import RINCAO_GAUCHO from "../mapAPI/rincao-gaucho.json";
import SOL_NASCENTE from "../mapAPI/sol-nascente.json";
import UNIAO from "../mapAPI/uniao.json";

export const bairros = {
  "Bela Vista": BELA_VISTA,
  "Campo Grande": CAMPO_GRANDE,
  Centro: CENTRO,
  "Colinas Verdes": COLINAS_VERDES,
  "Encosta do Sol": ENCOSTA_DO_SOL,
  "Flor da Rosa": FLOR_DA_ROSA,
  Floresta: FLORESTA,
  Industrial: INDUSTRIAL,
  "Lago Azul": LAGO_AZUL,
  Lira: LIRA,
  Pedras: PEDRAS,
  Quintas: QUINTAS,
  "Rincão da Saudade": RINCAO_DA_SAUDADE,
  "Rincão dos Ilhéus": RINCAO_DOS_ILHEUS,
  "Rincão Gaúcho": RINCAO_GAUCHO,
  "Sol Nascente": SOL_NASCENTE,
  União: UNIAO,
};

export const bairrosBounds: Record<string, { lat: number; lng: number }[]> = {};

for (const [nome, limites] of Object.entries(bairros)) {
  const coords = (
    limites.features[0].geometry.coordinates[0] as [number, number][]
  ).map(([lng, lat]) => ({ lat, lng }));
  bairrosBounds[nome] = coords;
}

export const isPointInPolygon = (
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[],
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng;
    const xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
};

export function findNeighborhood(lat: number, lng: number): string {
  const point = { lat, lng };

  for (const [bairro, coords] of Object.entries(bairrosBounds)) {
    if (isPointInPolygon(point, coords)) {
      return bairro;
    }
  }

  return "Desconhecido";
}
