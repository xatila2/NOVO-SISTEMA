import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Store {
  id: string;
  name: string;
}

export interface Seller {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  storeId?: string;
}

export interface Sale {
  id: string;
  date: string;
  vendedora: string;
  storeId?: string;
  amount: number;
  status: string;
  condicional: boolean;
  clientesAtendidos?: number;
  vendasFeitas?: number;
  condicionaisEnviadas?: number;
  pecasVendidas?: number;
  posVendasFeitos?: number;
  followUpsFeitos?: number;
  novasMensagensEnviadas?: number;
  item?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'Criação' | 'Edição' | 'Exclusão';
  saleId: string;
  vendedora: string;
  amount: number;
  userRole: string; // admin, gerente, etc.
  details: string;
}

export interface Level {
  id: string;
  name: string;
  amount: string;
  reward: string;
  commission: string; // customizable commission rate percentage, e.g. "1.5"
}

export interface PostSale {
  id: string;
  date: string; // YYYY-MM-DD
  vendedora: string;
  clientName: string;
  clientContact?: string;
  notes: string;
  status: 'Feliz / Satisfeito' | 'Dúvida / Ajuste' | 'Sem Retorno' | 'Pendente';
  type: 'Pós-Venda 15 dias' | 'Pós-Venda 30 dias' | 'Feedback' | 'Outra';
}

export interface FollowUp {
  id: string;
  date: string; // YYYY-MM-DD
  vendedora: string;
  clientName: string;
  clientContact?: string;
  daysStuck: number;
  lastContact: string; // YYYY-MM-DD
  stuckValue?: number;
  notes: string;
  status: 'Pendente' | 'Contatado' | 'Vendido (Recuperado)' | 'Perdido / Sem Retorno';
}

interface DataContextType {
  stores: Store[];
  addStore: (store: Omit<Store, 'id'>) => void;
  updateStore: (id: string, store: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  
  sellers: Seller[];
  addSeller: (seller: Omit<Seller, 'id'>) => void;
  updateSeller: (id: string, seller: Partial<Seller>) => void;
  deleteSeller: (id: string) => void;
  
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>, callerRole?: string) => void;
  updateSale: (id: string, sale: Partial<Sale>, callerRole?: string) => void;
  deleteSale: (id: string, callerRole?: string) => void;

  postSales: PostSale[];
  addPostSale: (postSale: Omit<PostSale, 'id'>) => void;
  updatePostSale: (id: string, postSale: Partial<PostSale>) => void;
  deletePostSale: (id: string) => void;

  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (id: string, followUp: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  
  activeStoreFilter: string;
  setActiveStoreFilter: (id: string) => void;

  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  periods: { value: string; label: string }[];

  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

  levels: Level[];
  setLevels: React.Dispatch<React.SetStateAction<Level[]>>;
  baseCommission: string;
  setBaseCommission: React.Dispatch<React.SetStateAction<string>>;
  sellersTarget: any[];
  setSellersTarget: React.Dispatch<React.SetStateAction<any[]>>;
  weeksTarget: any[];
  setWeeksTarget: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultStores: Store[] = [
  { id: 'loja-1', name: 'Bis' },
  { id: 'loja-2', name: 'Boutique' }
];

const defaultSellers: Seller[] = [
  { id: '1', name: 'Ana Paula', email: 'ana@metavarejo.com.br', role: 'Gerente', status: 'Ativo', storeId: 'loja-1' },
  { id: '2', name: 'Beatriz R.', email: 'beatriz@metavarejo.com.br', role: 'Vendedora', status: 'Ativo', storeId: 'loja-1' },
  { id: '3', name: 'Carla T.', email: 'carla@metavarejo.com.br', role: 'Vendedora', status: 'Férias', storeId: 'loja-2' },
  { id: '4', name: 'Diana M.', email: 'diana@metavarejo.com.br', role: 'Vendedora', status: 'Ativo', storeId: 'loja-2' },
];

const mockClothingItems = [
  "Vestido Midi Seda", "Blusa Linho Soft", "Calça Alfaiataria Crepe",
  "Casaco Cardigan Tricô", "Cropped Renda Premium", "Camisa Viscose Soft",
  "Jeans Wide Leg", "Saia Plissada Guipir", "Blazer Alfaiataria Luxe",
  "T-Shirt Estampada Algodão", "Short Clochard Crepe"
];

const generateMockSales = (sellers: Seller[], stores: Store[]) => {
  const result: Sale[] = [];
  const statusLabels = ['Fechada', 'Condicional', 'Devolução'];
  for (let i = 0; i < 50; i++) {
    const isCondicional = Math.random() > 0.7;
    const seller = sellers[Math.floor(Math.random() * sellers.length)];
    const clientesAtendidos = Math.floor(Math.random() * 5) + 1;
    const statusSale = isCondicional ? 'Condicional' : statusLabels[Math.floor(Math.random() * statusLabels.length)];
    const vendasFeitas = statusSale === 'Fechada' ? Math.floor(Math.random() * clientesAtendidos) + 1 : 0;
    const condicionaisEnviadas = statusSale === 'Condicional' ? Math.floor(Math.random() * clientesAtendidos) + 1 : 0;
    const pecasVendidas = vendasFeitas > 0 ? vendasFeitas * (Math.floor(Math.random() * 3) + 1) : 0;
    const randomItem = mockClothingItems[Math.floor(Math.random() * mockClothingItems.length)];
    const posVendasFeitos = Math.floor(Math.random() * 5); // 0 to 4 daily pos-sales contacts
    const followUpsFeitos = Math.floor(Math.random() * 4); // 0 to 3 daily followups
    const novasMensagensEnviadas = Math.floor(Math.random() * 15) + 3; // 3 to 17 daily messages sent
    
    result.push({
      id: `mock_${i}`,
      date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      vendedora: seller.name,
      storeId: seller.storeId || stores[0].id,
      amount: Math.floor(Math.random() * 1000) + 50,
      status: statusSale,
      condicional: isCondicional,
      clientesAtendidos,
      vendasFeitas,
      condicionaisEnviadas,
      pecasVendidas,
      posVendasFeitos,
      followUpsFeitos,
      novasMensagensEnviadas,
      item: randomItem
    });
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getAvailablePeriods = (sales: Sale[], postSales: PostSale[], followUps: FollowUp[]) => {
  const months = new Set<string>();
  
  // Default current month
  const todayStr = new Date().toISOString().substring(0, 7); // "2026-05"
  months.add(todayStr);

  // Generate all months of 2026 to ensure full coverage
  for (let m = 1; m <= 12; m++) {
    const padded = m < 10 ? `0${m}` : `${m}`;
    months.add(`2026-${padded}`);
  }
  
  sales.forEach(s => {
    if (s.date) months.add(s.date.substring(0, 7));
  });
  postSales.forEach(ps => {
    if (ps.date) months.add(ps.date.substring(0, 7));
  });
  followUps.forEach(fu => {
    if (fu.date) months.add(fu.date.substring(0, 7));
  });

  const monthNames: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  return Array.from(months)
    .sort()
    .reverse()
    .map(p => {
      const [year, month] = p.split('-');
      const monthName = monthNames[month] || month;
      return {
        value: p,
        label: `${monthName} de ${year}`
      };
    });
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>(defaultStores);
  const [sellers, setSellers] = useState<Seller[]>(defaultSellers);
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeStoreFilter, setActiveStoreFilter] = useState<string>('todas');
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    // We can default to the 2026-05 (simulated month) or the current real month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    // If we want to align with current simulated date '2026-05-20', we can lock the default
    return '2026-05';
  });

  // Pós-Vendas state with realistic mock data
  const [postSales, setPostSales] = useState<PostSale[]>([
    {
      id: 'ps_1',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Beatriz R.',
      clientName: 'Ana Flávia Pinheiro',
      clientContact: '(11) 98765-4321',
      type: 'Pós-Venda 15 dias',
      notes: 'Ficou maravilhada com o caimento do Vestido Midi de Seda. Elogiou o atendimento e disse que quer ver novidades brevemente.',
      status: 'Feliz / Satisfeito'
    },
    {
      id: 'ps_2',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Diana M.',
      clientName: 'Mariana de Souza Costa',
      clientContact: '(21) 99122-3344',
      type: 'Pós-Venda 30 dias',
      notes: 'Entrou em contato. A cliente relatou dúvida sobre como lavar a blusa de viscose de forma a evitar encolhimento. Vendedora instruiu por áudio.',
      status: 'Dúvida / Ajuste'
    },
    {
      id: 'ps_3',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
      vendedora: 'Beatriz R.',
      clientName: 'Clara Albuquerque',
      clientContact: 'clara@albuquerque.com',
      type: 'Feedback',
      notes: 'Mensagem padrão enviada perguntando se gostou das calças. Mensagem recebida, mas sem retorno ainda.',
      status: 'Sem Retorno'
    },
    {
      id: 'ps_4',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      vendedora: 'Diana M.',
      clientName: 'Fernanda de Souza',
      clientContact: '(11) 98888-7711',
      type: 'Pós-Venda 15 dias',
      notes: 'Adorou as peças! Disse que a calça jeans wide leg virou seu xodó e usa toda semana.',
      status: 'Feliz / Satisfeito'
    },
    {
      id: 'ps_5',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Carla T.',
      clientName: 'Sonia Mendes Fagundes',
      clientContact: '(11) 97722-1100',
      type: 'Pós-Venda 15 dias',
      notes: 'Inserir contato na agenda para ligar de tarde e coletar feedback da jaqueta de couro.',
      status: 'Pendente'
    }
  ]);

  // Follow-ups state with realistic mock data (sales that are stopped/stuck)
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: 'fu_1',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Beatriz R.',
      clientName: 'Camila Martins',
      clientContact: '(11) 99344-5566',
      daysStuck: 8,
      lastContact: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      stuckValue: 690,
      notes: 'Gostou do Blazer Alfaiataria Creme de R$ 690,00. Ficou de confirmar se o marido ia passar o cartão para retirar no condicional. Retomar contato urgente.',
      status: 'Pendente'
    },
    {
      id: 'fu_2',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Diana M.',
      clientName: 'Gabriela Rocha',
      clientContact: '(11) 98711-2233',
      daysStuck: 5,
      lastContact: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      stuckValue: 340,
      notes: 'Calça Jeans de R$ 340 separada. Respondeu hoje dizendo que adora a modelagem e que tentará passar na loja no sábado de manhã.',
      status: 'Contatado'
    },
    {
      id: 'fu_3',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
      vendedora: 'Beatriz R.',
      clientName: 'Patrícia Reis Mendonça',
      clientContact: '(11) 96544-1100',
      daysStuck: 15,
      lastContact: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      stuckValue: 850,
      notes: 'Levou condicional, não atendeu nenhuma das 3 tentativas de contato e não devolveu as peças até agora. Gerente acionada para reaver a sacola.',
      status: 'Perdido / Sem Retorno'
    },
    {
      id: 'fu_4',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
      vendedora: 'Diana M.',
      clientName: 'Letícia Abreu',
      clientContact: '(11) 97711-4400',
      daysStuck: 3,
      lastContact: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      stuckValue: 490,
      notes: 'Venda convertida online! Enviou fotos adicionais do Cropped Renda e ela acabou efetuando o pagamento via Pix.',
      status: 'Vendido (Recuperado)'
    },
    {
      id: 'fu_5',
      date: new Date().toISOString().split('T')[0],
      vendedora: 'Carla T.',
      clientName: 'Alessandra Lemos',
      clientContact: '(11) 91222-3399',
      daysStuck: 6,
      lastContact: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      stuckValue: 1200,
      notes: 'Sacola condicional com 4 peças incríveis (R$ 1.200) ainda está na residência da cliente. Precisa chamá-la para agendar a retirada ou fechamento.',
      status: 'Pendente'
    }
  ]);

  const addPostSale = (ps: Omit<PostSale, 'id'>) => {
    setPostSales(prev => [...prev, { ...ps, id: Math.random().toString() }]);
  };
  const updatePostSale = (id: string, ps: Partial<PostSale>) => {
    setPostSales(prev => prev.map(item => item.id === id ? { ...item, ...ps } : item));
  };
  const deletePostSale = (id: string) => {
    setPostSales(prev => prev.filter(item => item.id !== id));
  };

  const addFollowUp = (fu: Omit<FollowUp, 'id'>) => {
    setFollowUps(prev => [...prev, { ...fu, id: Math.random().toString() }]);
  };
  const updateFollowUp = (id: string, fu: Partial<FollowUp>) => {
    setFollowUps(prev => prev.map(item => item.id === id ? { ...item, ...fu } : item));
  };
  const deleteFollowUp = (id: string) => {
    setFollowUps(prev => prev.filter(item => item.id !== id));
  };

  const [baseCommission, setBaseCommission] = useState<string>('1.0');
  const [levels, setLevels] = useState<Level[]>([
    { id: '1', name: 'Nível 1 - Básico', amount: '80000', reward: 'Premiação R$ 100', commission: '1.2' },
    { id: '2', name: 'Nível 2 - Desafio', amount: '100000', reward: 'Prefeitura e Folga', commission: '1.5' },
    { id: '3', name: 'Nível 3 - Superação', amount: '120000', reward: 'Comissão 2.0% + Viagem Curta', commission: '2.0' },
    { id: '4', name: 'Nível 4 - Insuperável', amount: '150000', reward: 'Comissão 3.0% + Viagem Internacional', commission: '3.0' }
  ]);
  
  const [sellersTarget, setSellersTarget] = useState([
    { id: '1', name: 'Ana Paula', target: '25000', percentage: '25' },
    { id: '2', name: 'Beatriz R.', target: '18500', percentage: '18.5' },
    { id: '3', name: 'Carla T.', target: '18500', percentage: '18.5' },
    { id: '4', name: 'Diana M.', target: '38000', percentage: '38' },
  ]);

  const [weeksTarget, setWeeksTarget] = useState([
    { id: 1, name: 'Semana 1 (1 a 7)', target: '25000', percentage: '25' },
    { id: 2, name: 'Semana 2 (8 a 14)', target: '25000', percentage: '25' },
    { id: 3, name: 'Semana 3 (15 a 21)', target: '25000', percentage: '25' },
    { id: 4, name: 'Semana 4 (22 a 31)', target: '25000', percentage: '25' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_initial_1',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      action: 'Criação',
      saleId: 'mock_1',
      vendedora: 'Ana Paula',
      amount: 450,
      userRole: 'gerente',
      details: 'Lançamento de venda fechada criado manualmente'
    },
    {
      id: 'log_initial_2',
      timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      action: 'Edição',
      saleId: 'mock_3',
      vendedora: 'Beatriz R.',
      amount: 850,
      userRole: 'admin',
      details: 'Valor corrigido de R$ 750,00 para R$ 850,00'
    }
  ]);
  
  useEffect(() => {
    setSales(generateMockSales(defaultSellers, defaultStores));
  }, []);

  const addStore = (store: Omit<Store, 'id'>) => setStores([...stores, { ...store, id: Math.random().toString() }]);
  const updateStore = (id: string, store: Partial<Store>) => setStores(stores.map(s => s.id === id ? { ...s, ...store } : s));
  const deleteStore = (id: string) => setStores(stores.filter(s => s.id !== id));

  const addSeller = (seller: Omit<Seller, 'id'>) => setSellers([...sellers, { ...seller, id: Math.random().toString() }]);
  const updateSeller = (id: string, seller: Partial<Seller>) => setSellers(sellers.map(s => s.id === id ? { ...s, ...seller } : s));
  const deleteSeller = (id: string) => setSellers(sellers.filter(s => s.id !== id));

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addSale = (sale: Omit<Sale, 'id'>, callerRole: string = 'gerente') => {
    const newId = Math.random().toString();
    const newSale = { ...sale, id: newId };
    setSales(prevSales => [newSale, ...prevSales]);
    addAuditLog({
      action: 'Criação',
      saleId: newId,
      vendedora: sale.vendedora,
      amount: sale.amount,
      userRole: callerRole,
      details: `Novo lançamento de venda (${sale.status}) de R$ ${sale.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    });
  };

  const updateSale = (id: string, sale: Partial<Sale>, callerRole: string = 'gerente') => {
    const oldSale = sales.find(s => s.id === id);
    setSales(prevSales => prevSales.map(s => s.id === id ? { ...s, ...sale } : s));
    if (oldSale) {
      let changeDetails = [];
      if (sale.amount !== undefined && sale.amount !== oldSale.amount) {
        changeDetails.push(`Valor alterado de R$ ${oldSale.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} para R$ ${sale.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      }
      if (sale.vendedora !== undefined && sale.vendedora !== oldSale.vendedora) {
        changeDetails.push(`Vendedora alterada de ${oldSale.vendedora} para ${sale.vendedora}`);
      }
      if (sale.status !== undefined && sale.status !== oldSale.status) {
        changeDetails.push(`Status alterado de ${oldSale.status} para ${sale.status}`);
      }
      if (sale.clientesAtendidos !== undefined && sale.clientesAtendidos !== oldSale.clientesAtendidos) {
        changeDetails.push(`Atendimentos alterados de ${oldSale.clientesAtendidos || 0} para ${sale.clientesAtendidos}`);
      }
      
      addAuditLog({
        action: 'Edição',
        saleId: id,
        vendedora: sale.vendedora || oldSale.vendedora,
        amount: sale.amount !== undefined ? sale.amount : oldSale.amount,
        userRole: callerRole,
        details: changeDetails.join(' | ') || 'Configurações de lançamento atualizadas'
      });
    }
  };

  const deleteSale = (id: string, callerRole: string = 'gerente') => {
    const oldSale = sales.find(s => s.id === id);
    setSales(prevSales => prevSales.filter(s => s.id !== id));
    if (oldSale) {
      addAuditLog({
        action: 'Exclusão',
        saleId: id,
        vendedora: oldSale.vendedora,
        amount: oldSale.amount,
        userRole: callerRole,
        details: `Lançamento de R$ ${oldSale.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} de ${oldSale.vendedora} foi excluído`
      });
    }
  };

  const periods = React.useMemo(() => {
    return getAvailablePeriods(sales, postSales, followUps);
  }, [sales, postSales, followUps]);

  return (
    <DataContext.Provider value={{
      stores, addStore, updateStore, deleteStore,
      sellers, addSeller, updateSeller, deleteSeller,
      sales, addSale, updateSale, deleteSale,
      postSales, addPostSale, updatePostSale, deletePostSale,
      followUps, addFollowUp, updateFollowUp, deleteFollowUp,
      activeStoreFilter, setActiveStoreFilter,
      selectedPeriod, setSelectedPeriod, periods,
      auditLogs, addAuditLog,
      levels, setLevels,
      baseCommission, setBaseCommission,
      sellersTarget, setSellersTarget,
      weeksTarget, setWeeksTarget
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
