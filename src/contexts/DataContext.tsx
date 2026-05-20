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
  
  activeStoreFilter: string;
  setActiveStoreFilter: (id: string) => void;

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
      item: randomItem
    });
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>(defaultStores);
  const [sellers, setSellers] = useState<Seller[]>(defaultSellers);
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeStoreFilter, setActiveStoreFilter] = useState<string>('todas');
  
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

  return (
    <DataContext.Provider value={{
      stores, addStore, updateStore, deleteStore,
      sellers, addSeller, updateSeller, deleteSeller,
      sales, addSale, updateSale, deleteSale,
      activeStoreFilter, setActiveStoreFilter,
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
