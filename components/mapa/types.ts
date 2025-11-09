export type TipoSolicitacao = {
  id: string;
  nome: string;
};

export type Solicitacao = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  tipo: string;
  descricao: string;
  imageUrl: string;
  bairro: string;
  rua: string;
  numero: string;
  cep: string;
  status: "pendente" | "em_analise" | "concluida" | "rejeitada";
};
