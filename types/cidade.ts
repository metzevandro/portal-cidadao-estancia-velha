import ESTANCIA_VELHA from "../mapAPI/estancia-velha.json";

export const cidade = {
  "Estância Velha": ESTANCIA_VELHA,
};

export const cidadeBounds: Record<string, { lat: number; lng: number }[]> = {};

for (const [nome, limites] of Object.entries(cidade)) {
  const coords = (
    limites.features[0].geometry.coordinates[0] as [number, number][]
  ).map(([lng, lat]) => ({ lat, lng }));
  cidadeBounds[nome] = coords;
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

  for (const [bairro, coords] of Object.entries(cidadeBounds)) {
    if (isPointInPolygon(point, coords)) {
      return bairro;
    }
  }

  return "Desconhecido";
}
