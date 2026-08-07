export type Empresa = {
  id: string;
  nome: string;
  sigla: string;
  cidade: string;
  nota: number;
  frota: { modelo: string; lugares: number; recursos: string }[];
  rotas: string[];
  horarios: string[];
  telefone: string;
  whatsapp: string;
  email: string;
  servicos: string[];
};

export const empresas: Empresa[] = [
  {
    id: "executiva-atlantica",
    nome: "Executiva Atlântica",
    sigla: "EA",
    cidade: "Salvador · BA",
    nota: 4.9,
    frota: [
      { modelo: "Sprinter Executiva 416", lugares: 16, recursos: "Wi-Fi · USB · Ar" },
      { modelo: "Micro-ônibus Volare Access", lugares: 28, recursos: "Poltrona reclinável" },
    ],
    rotas: ["Salvador → Praia do Forte", "Salvador → Feira de Santana", "Lauro de Freitas → Aeroporto"],
    horarios: ["05:30", "07:00", "09:15", "13:00", "17:45"],
    telefone: "(71) 3555-1200",
    whatsapp: "5571988887777",
    email: "reservas@atlantica.com.br",
    servicos: ["Fretamento", "Traslado aeroporto", "Turismo executivo", "Contrato corporativo"],
  },
  {
    id: "vip-transportes",
    nome: "VIP Transportes",
    sigla: "VT",
    cidade: "Camaçari · BA",
    nota: 4.7,
    frota: [
      { modelo: "Van Ducato Premium", lugares: 15, recursos: "Wi-Fi · Ar" },
      { modelo: "Micro Marcopolo Senior", lugares: 26, recursos: "Bagageiro amplo" },
    ],
    rotas: ["Camaçari → Salvador", "Camaçari → Polo Industrial", "Dias d'Ávila → Salvador"],
    horarios: ["04:50", "06:20", "12:10", "18:30"],
    telefone: "(71) 3622-4400",
    whatsapp: "5571977776666",
    email: "contato@viptransportes.com.br",
    servicos: ["Fretamento contínuo", "Escolar", "Eventos"],
  },
  {
    id: "rota-norte",
    nome: "Rota Norte Executivo",
    sigla: "RN",
    cidade: "Feira de Santana · BA",
    nota: 4.8,
    frota: [
      { modelo: "Sprinter 515 Executiva", lugares: 20, recursos: "Wi-Fi · Tomadas" },
      { modelo: "Micro Iveco Executive", lugares: 30, recursos: "Ar digital" },
    ],
    rotas: ["Feira → Salvador", "Feira → Alagoinhas", "Feira → Aeroporto"],
    horarios: ["05:00", "08:00", "11:30", "16:00", "20:00"],
    telefone: "(75) 3221-8080",
    whatsapp: "5575966665555",
    email: "atendimento@rotanorte.com.br",
    servicos: ["Linha regular", "Traslado", "Fretamento eventual"],
  },
];

export type Viagem = {
  id: string;
  empresaId: string;
  origem: string;
  destino: string;
  data: string;
  hora: string;
  assentos: string[];
  valor: number;
  status: "confirmada" | "aguardando" | "concluida" | "cancelada";
  motorista: string;
  motoristaWhats: string;
  veiculo: string;
};

export const viagens: Viagem[] = [
  {
    id: "VP-10482",
    empresaId: "executiva-atlantica",
    origem: "Salvador · Shopping Barra",
    destino: "Praia do Forte",
    data: "12 Ago 2026",
    hora: "07:00",
    assentos: ["4A", "4B"],
    valor: 178.0,
    status: "confirmada",
    motorista: "Carlos Menezes",
    motoristaWhats: "5571988887777",
    veiculo: "Sprinter Executiva · PLA-2C41",
  },
  {
    id: "VP-10496",
    empresaId: "rota-norte",
    origem: "Feira de Santana · Rodoviária",
    destino: "Salvador · Aeroporto",
    data: "19 Ago 2026",
    hora: "05:00",
    assentos: ["2C"],
    valor: 92.5,
    status: "aguardando",
    motorista: "Renata Lima",
    motoristaWhats: "5575966665555",
    veiculo: "Micro Iveco Executive · JQF-7B10",
  },
];

export const historico: Viagem[] = [
  {
    id: "VP-09871",
    empresaId: "vip-transportes",
    origem: "Camaçari · Centro",
    destino: "Salvador · Iguatemi",
    data: "22 Jul 2026",
    hora: "06:20",
    assentos: ["1A"],
    valor: 64.0,
    status: "concluida",
    motorista: "João Prado",
    motoristaWhats: "5571977776666",
    veiculo: "Van Ducato Premium · KLM-9A22",
  },
  {
    id: "VP-09640",
    empresaId: "executiva-atlantica",
    origem: "Salvador · Pituba",
    destino: "Feira de Santana",
    data: "03 Jul 2026",
    hora: "13:00",
    assentos: ["5A", "5B", "5C"],
    valor: 240.0,
    status: "concluida",
    motorista: "Carlos Menezes",
    motoristaWhats: "5571988887777",
    veiculo: "Sprinter Executiva · PLA-2C41",
  },
];

export const empresaById = (id: string) => empresas.find((e) => e.id === id);

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const whatsappLink = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
