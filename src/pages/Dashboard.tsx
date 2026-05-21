import { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Crown, 
  Award, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Users, 
  RefreshCw, 
  Trophy, 
  Sparkles, 
  Percent, 
  Zap,
  TrendingDown,
  Activity,
  Phone,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { formatCurrency, calculateRemainingWorkingDays } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useData } from '@/contexts/DataContext';

// Fallback mock data if there are no sales in context yet
const fallbackData = [
  { day: '01', sales: 1200 }, { day: '05', sales: 2400 },
  { day: '10', sales: 3100 }, { day: '15', sales: 2800 },
  { day: '20', sales: 4000 },
];
const fallbackWeeklyData = [
  { day: 'Seg', sales: 1200 }, { day: 'Ter', sales: 2100 }, { day: 'Qua', sales: 1800 },
  { day: 'Qui', sales: 2400 }, { day: 'Sex', sales: 3100 }, { day: 'Sáb', sales: 4000 }, { day: 'Dom', sales: 1500 }
];

export function Dashboard() {
  const { sales, sellers, levels, sellersTarget, stores, activeStoreFilter, setActiveStoreFilter, postSales, followUps, selectedPeriod, setSelectedPeriod, periods } = useData();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal'>('mensal');

  // Interactive titles with localStorage persistence
  const [pageTitle, setPageTitle] = useState(() => localStorage.getItem('pageTitle') || 'Metas de Vendas');
  const [isEditingPageTitle, setIsEditingPageTitle] = useState(false);
  const [rankingTitle, setRankingTitle] = useState(() => localStorage.getItem('rankingTitle') || 'Desempenho Comercial da Equipe');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Interactive filters & customizations
  const [rankingMetric, setRankingMetric] = useState<'totalVendido' | 'totalPecas' | 'taxaConversao' | 'ticketMedio' | 'totalClientes' | 'totalCondicionais'>('totalVendido');
  const [rankingDirection, setRankingDirection] = useState<'asc' | 'desc'>('desc');
  const [goalMultiplier, setGoalMultiplier] = useState<number>(1.0);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [visibleKPIs, setVisibleKPIs] = useState({
    progresso: true, pecas: true, clientes: true, ticket: true, conversao: true, condicionais: true
  });

  // 1. Dynamic Seller KPIs from Context
  const sellersData = useMemo(() => {
    const [yearStr, monthStr] = selectedPeriod.split('-');
    const simYear = parseInt(yearStr, 10);
    const simMonth = parseInt(monthStr, 10) - 1;

    return sellers.map(seller => {
      // Filter sales for this seller
      let fs = sales.filter(s => s.vendedora === seller.name);
      // Filter by active store
      const isStoreActiveObj = activeStoreFilter === 'todas' || seller.storeId === 'ambas' || seller.storeId === activeStoreFilter;
      if (!isStoreActiveObj) return { ...seller, totalVendido: 0, totalPecas: 0, totalClientes: 0, totalVendas: 0, totalCondicionais: 0, ticketMedio: 0, taxaConversao: 0, individualTarget: 25000, isStoreActiveObj: false };

      // Period Sales
      const periodSales = fs.filter(s => {
        if (activeStoreFilter !== 'todas' && s.storeId !== activeStoreFilter) {
          return false;
        }
        const d = new Date(s.date);
        if (viewMode === 'mensal') {
          return d.getFullYear() === simYear && d.getMonth() === simMonth;
        } else {
          const isTodaySim = new Date('2026-05-20T17:35:57Z');
          const sevenAgo = new Date(isTodaySim.getTime() - 7 * 24 * 60 * 60 * 1000);
          return d >= sevenAgo && d <= isTodaySim;
        }
      });

      const totalVendido = periodSales.reduce((acc, curr) => acc + curr.amount, 0);
      const totalPecas = periodSales.reduce((acc, curr) => acc + (curr.pecasVendidas || 0), 0);
      const totalClientes = periodSales.reduce((acc, curr) => acc + (curr.clientesAtendidos || 0), 0);
      const totalVendas = periodSales.reduce((acc, curr) => acc + (curr.vendasFeitas || 0), 0);
      const totalCondicionais = periodSales.reduce((acc, curr) => acc + (curr.condicionaisEnviadas || 0), 0);
      const totalPosVendas = periodSales.reduce((acc, curr) => acc + (curr.posVendasFeitos || 0), 0);
      const totalFollowUps = periodSales.reduce((acc, curr) => acc + (curr.followUpsFeitos || 0), 0);
      const totalNovasMensagens = periodSales.reduce((acc, curr) => acc + (curr.novasMensagensEnviadas || 0), 0);

      const ticketMedio = totalVendas > 0 ? totalVendido / totalVendas : 0;
      const taxaConversao = totalClientes > 0 ? (totalVendas / totalClientes) * 100 : 0;

      const targetObj = sellersTarget.find(t => t.name === seller.name);
      const rawTarget = targetObj ? Number(targetObj.target) : 25000;
      const individualTarget = viewMode === 'mensal' ? rawTarget : rawTarget / 4;

      return {
        ...seller,
        totalVendido,
        totalPecas,
        totalClientes,
        totalVendas,
        totalCondicionais,
        totalPosVendas,
        totalFollowUps,
        totalNovasMensagens,
        ticketMedio,
        taxaConversao,
        individualTarget,
        isStoreActiveObj: true
      };
    }).filter(s => s.isStoreActiveObj);
  }, [sales, sellers, sellersTarget, activeStoreFilter, viewMode]);

  // Sort rank by selected metric
  const sortedSellers = useMemo(() => {
    return [...sellersData].sort((a, b) => {
      const valA = a[rankingMetric] || 0;
      const valB = b[rankingMetric] || 0;
      return rankingDirection === 'desc' ? valB - valA : valA - valB;
    });
  }, [sellersData, rankingMetric, rankingDirection]);

  // Overall store stats
  const activeSellersInStore = useMemo(() => {
    return sellers.filter(s => activeStoreFilter === 'todas' || s.storeId === 'ambas' || s.storeId === activeStoreFilter);
  }, [sellers, activeStoreFilter]);

  const monthTargetBase = useMemo(() => {
    return activeSellersInStore.reduce((acc, s) => {
      const targetObj = sellersTarget.find(t => t.name === s.name);
      return acc + (targetObj ? Number(targetObj.target) : 25000);
    }, 0) || 100000;
  }, [activeSellersInStore, sellersTarget]);

  const target = viewMode === 'mensal' ? monthTargetBase : monthTargetBase / 4;
  const realized = useMemo(() => {
    return sellersData.reduce((acc, s) => acc + s.totalVendido, 0);
  }, [sellersData]);

  const totalClientesServidos = useMemo(() => {
    return sellersData.reduce((acc, s) => acc + s.totalClientes, 0);
  }, [sellersData]);

  const totalVendasRealizadas = useMemo(() => {
    return sellersData.reduce((acc, s) => acc + s.totalVendas, 0);
  }, [sellersData]);

  const ticketMedioGeral = useMemo(() => {
    return totalVendasRealizadas > 0 ? realized / totalVendasRealizadas : 0;
  }, [realized, totalVendasRealizadas]);

  // Remaining days (simulated May 20, 2026, May ends in 31)
  const diasRestantes = useMemo(() => {
    const [yearStr, monthStr] = selectedPeriod.split('-');
    const simYear = parseInt(yearStr, 10);
    const simMonth = parseInt(monthStr, 10) - 1;

    if (viewMode === 'mensal') {
      const todaySim = new Date('2026-05-20T17:35:57Z');
      return calculateRemainingWorkingDays(todaySim, simMonth, simYear, []);
    }
    return 2; // Default for weekly
  }, [viewMode, selectedPeriod]);

  const metaDiaria = (target - realized) > 0 ? (target - realized) / diasRestantes : 0;

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepTime = Math.floor(duration / steps);
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedValue((realized / steps) * currentStep);
      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValue(realized);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [realized]);

  // Gamification Levels active check
  const activeLevelIndex = useMemo(() => {
    let index = -1;
    levels.forEach((lvl, i) => {
      if (realized >= Number(lvl.amount)) index = i;
    });
    return index;
  }, [levels, realized]);

  // Dynamic charts
  const dynamicMonthlyChart = useMemo(() => {
    const [yearStr, monthStr] = selectedPeriod.split('-');
    const simYear = parseInt(yearStr, 10);
    const simMonth = parseInt(monthStr, 10) - 1;

    const totalDaysInMonth = new Date(simYear, simMonth + 1, 0).getDate();

    const dayAgg: { [key: string]: number } = {};
    for (let i = 1; i <= totalDaysInMonth; i++) {
       dayAgg[i.toString().padStart(2, '0')] = 0;
    }
    const storeSales = sales.filter(s => activeStoreFilter === 'todas' || s.storeId === activeStoreFilter);
    storeSales.forEach(s => {
      const d = new Date(s.date);
      if (d.getFullYear() === simYear && d.getMonth() === simMonth) {
        const dayStr = d.getDate().toString().padStart(2, '0');
        dayAgg[dayStr] = (dayAgg[dayStr] || 0) + s.amount;
      }
    });
    const result = Object.keys(dayAgg).sort().map(d => ({ day: d, sales: dayAgg[d] }));
    return result.some(item => item.sales > 0) ? result : fallbackData;
  }, [sales, activeStoreFilter, selectedPeriod]);

  const dynamicWeeklyChart = useMemo(() => {
    const daysAbbrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyAgg = daysAbbrev.map(day => ({ day, sales: 0 }));
    const storeSales = sales.filter(s => activeStoreFilter === 'todas' || s.storeId === activeStoreFilter);
    storeSales.forEach(s => {
      const d = new Date(s.date);
      // Last 7 days
      const currentDayName = daysAbbrev[d.getDay()];
      const item = weeklyAgg.find(w => w.day === currentDayName);
      if (item) item.sales += s.amount;
    });
    return weeklyAgg.some(item => item.sales > 0) ? weeklyAgg : fallbackWeeklyData;
  }, [sales, activeStoreFilter]);

  const timeTotals = useMemo(() => {
    const faturamento = sellersData.reduce((acc, s) => acc + s.totalVendido, 0) || 1;
    const atendimentos = sellersData.reduce((acc, s) => acc + s.totalClientes, 0) || 1;
    const vendas = sellersData.reduce((acc, s) => acc + s.totalVendas, 0) || 1;
    const pecas = sellersData.reduce((acc, s) => acc + s.totalPecas, 0) || 1;
    const condicionais = sellersData.reduce((acc, s) => acc + s.totalCondicionais, 0) || 1;
    return { faturamento, atendimentos, vendas, pecas, condicionais };
  }, [sellersData]);

  // Extract top leaders safely for the podium representation
  const top1 = sortedSellers[0];
  const top2 = sortedSellers[1];
  const top3 = sortedSellers[2];

  const renderPodiumValue = (vendedora: any) => {
    if (!vendedora) return '';
    const val = vendedora[rankingMetric];
    if (rankingMetric === 'totalVendido' || rankingMetric === 'ticketMedio') {
      return formatCurrency(val);
    }
    if (rankingMetric === 'taxaConversao') {
      return `${Number(val).toFixed(1)}%`;
    }
    return `${val} un.`;
  };

  // Forecast computation
  const forecastValue = (realized / 20) * 31;
  const missingGoalAmount = (target - realized) > 0 ? (target - realized) : 0;
  const percentOfGoal = Math.round((realized / target) * 100) || 0;

  return (
    <div className="flex-1 flex flex-col h-auto min-h-full gap-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shrink-0">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            {isEditingPageTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    localStorage.setItem('pageTitle', e.target.value);
                  }}
                  onBlur={() => setIsEditingPageTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingPageTitle(false);
                  }}
                  className="bg-white text-[#111111] font-black text-2xl px-3 py-1.5 rounded-xl border-2 border-gray-400 focus:outline-none focus:border-[#D4AF37] max-w-sm w-full shadow-inner"
                  autoFocus
                />
                <button 
                  onClick={() => setIsEditingPageTitle(false)}
                  className="px-3.5 py-2 bg-[#111111] hover:bg-zinc-800 text-[#D4AF37] font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <h1 
                onDoubleClick={() => setIsEditingPageTitle(true)}
                className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight hover:text-[#D4AF37] transition-colors cursor-pointer group flex items-center gap-2"
                title="Dê dois cliques rápido para alterar o título"
              >
                <span>{pageTitle}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] normal-case text-gray-400 font-bold border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-lg">
                  ✏️ dbl-click para editar
                </span>
              </h1>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={activeStoreFilter}
                onChange={(e) => setActiveStoreFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="todas">Todas as Lojas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-750 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[#D4AF37] font-bold uppercase tracking-widest">
              {activeStoreFilter === 'todas' ? 'Geral' : stores.find(s => s.id === activeStoreFilter)?.name} • {viewMode === 'mensal' ? (periods.find(p => p.value === selectedPeriod)?.label || selectedPeriod) : 'Semana de Lançamentos'}
            </p>
            <div className="flex items-center bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('mensal')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'mensal' ? 'bg-white shadow text-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setViewMode('semanal')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'semanal' ? 'bg-white shadow text-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Semanal
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-semibold text-gray-600">Sincronizado em Tempo Real</span>
          </div>
        </div>
      </header>

      {/* LINHA 1 (Topo do Dashboard): Métricas Consolidadas Compactas e Otimizadas em Altura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {/* Card 1: Faturamento Acumulado */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0b0c10] rounded-2xl p-4 border border-zinc-800 shadow-[0_0_20px_rgba(34,211,238,0.02)] flex flex-col justify-between h-[120px] hover:border-zinc-700 transition-all cursor-default"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5 leading-none">
              💰 Faturamento Acumulado
            </span>
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2.5 py-0.5 rounded-full font-black border border-emerald-900/40 animate-pulse flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ATIVO
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">
              {formatCurrency(animatedValue)}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold mt-1 truncate">Faturamento total acumulado no período</span>
          </div>
          <div className="w-full mt-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 mb-0.5 leading-none">
              <span>Meta Global: {formatCurrency(target).replace(',00', '')}</span>
              <span className="text-cyan-400 font-mono font-bold">{percentOfGoal}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_#22d3ee]" style={{ width: `${Math.min(100, percentOfGoal)}%` }}></div>
            </div>
          </div>
        </motion.section>

        {/* Card 2: Meta Diária Restante */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#0b0c10] rounded-2xl p-4 border border-zinc-800 shadow-[0_0_20px_rgba(34,211,238,0.02)] flex flex-col justify-between h-[120px] hover:border-zinc-700 transition-all cursor-default"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold text-[#D4AF37] tracking-wider flex items-center gap-1.5 leading-none">
              ⏱️ Meta Diária Restante
            </span>
            <span className="text-[10px] bg-zinc-900 text-[#D4AF37] px-2.5 py-0.5 rounded-full font-black border border-zinc-850 leading-none">
              {diasRestantes} dias rest.
            </span>
          </div>
          <div className="mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-[#D4AF37] tracking-tight font-mono leading-none">
              {formatCurrency(metaDiaria)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-tight">
              Valor de venda diário necessário para atingir os objetivos comerciais do mês.
            </p>
          </div>
        </motion.section>

        {/* Card 3: Progresso & Meta da Loja */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0b0c10] rounded-2xl p-4 border border-zinc-800 shadow-[0_0_20px_rgba(34,211,238,0.02)] flex flex-col justify-between h-[120px] hover:border-zinc-700 transition-all cursor-default"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5 leading-none">
              🎯 Progresso da Meta
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 leading-none ${
              missingGoalAmount === 0 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' 
                : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
            }`}>
              {missingGoalAmount === 0 ? '🏆 BATEU META' : '🚀 EM BUSCA'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 flex-grow min-h-0">
            {/* Crescent Moon Mini version */}
            <div className="relative w-24 h-12 flex-shrink-0 flex items-center overflow-hidden">
              <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="miniCrescentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#8A2BE2" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                  <filter id="miniMoonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Backdrop track */}
                <path d="M 20,70 A 60,60 0 0,1 140,70" fill="none" stroke="#18181b" strokeWidth="12" strokeLinecap="round" />
                {/* Progress path */}
                <path 
                  d="M 20,70 A 60,60 0 0,1 140,70" 
                  fill="none" 
                  stroke="url(#miniCrescentGradient)" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeDasharray="188.49" 
                  strokeDashoffset={188.49 - (188.49 * Math.min(100, percentOfGoal)) / 100} 
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  filter="url(#miniMoonGlow)"
                />
              </svg>
              {/* Center Text overlay */}
              <div className="absolute inset-0 top-1 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white font-mono leading-none">{percentOfGoal}%</span>
                <span className="text-[7px] font-extrabold text-zinc-500 uppercase tracking-widest mt-0.5 leading-none">Atingido</span>
              </div>
            </div>

            {/* Right-side stats text, extremely compact */}
            <div className="flex-1 min-w-0 text-right flex flex-col justify-center leading-tight gap-0.5">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase">Soma Total</span>
              <span className="text-xs font-black text-zinc-200 font-mono">{formatCurrency(realized).replace(',00', '')}</span>
              {missingGoalAmount > 0 ? (
                <span className="text-[9px] font-black text-orange-400 capitalize mt-0.5">Faltam {formatCurrency(missingGoalAmount).replace(',00', '')}</span>
              ) : (
                <span className="text-[9px] font-black text-emerald-400 capitalize mt-0.5">Superou! 🎉</span>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* DETALHAMENTO COMPLETO DAS VENDEDORAS */}
      <div className="bg-gradient-to-br from-[#121622] via-[#0b0d12] to-[#040507] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-visible select-none">
        {/* Glow lasers */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />
        <div className="absolute -left-10 top-1/3 w-64 h-64 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute -right-10 bottom-1/3 w-64 h-64 bg-cyan-600/10 rounded-full filter blur-[120px] pointer-events-none" />

        {/* Título da Seção */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse">
                <Users className="w-5 h-5 text-cyan-400" />
              </span>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rankingTitle}
                    onChange={(e) => {
                      setRankingTitle(e.target.value);
                      localStorage.setItem('rankingTitle', e.target.value);
                    }}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                    }}
                    className="bg-black text-white font-extrabold text-sm sm:text-base px-3 py-1 rounded-xl border border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-transparent max-w-sm w-full"
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsEditingTitle(false)}
                    className="px-3 py-1 bg-cyan-500 text-black font-black rounded-lg text-xs hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <h2 
                  onDoubleClick={() => setIsEditingTitle(true)}
                  className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-400 tracking-tight flex items-center flex-wrap gap-2 cursor-pointer group"
                  title="Duplo clique para redefinir o nome"
                >
                  <span className="uppercase tracking-wide">{rankingTitle}</span>
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity text-[9px] lowercase normal-case text-cyan-400 bg-zinc-950 border border-cyan-900/50 px-2 py-0.5 rounded-lg">
                    ✏️ dbl-click editar
                  </span>
                </h2>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-2 font-medium">
              Desempenho de vendas de cada vendedora atualizado em tempo real segundo os dados consolidados da loja.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start lg:self-center">
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2 shadow-inner"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              {showConfigPanel ? 'Ocultar Simulador' : 'Ajustar Meta Individual'}
            </button>
            <button
              onClick={() => setRankingDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-purple-500/50 transition-all flex items-center gap-2 shadow-inner"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              {rankingDirection === 'desc' ? 'Maiores Primeiro' : 'Menores Primeiro'}
            </button>
          </div>
        </div>

        {/* Simulador Drawer de Metas */}
        <AnimatePresence>
          {showConfigPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-black/60 p-5 rounded-2xl border border-zinc-900 mb-8 space-y-4 shadow-2xl backdrop-blur-md"
            >
              <div className="max-w-xl space-y-2">
                <span className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400 animate-pulse" /> Simulador de Multiplicador de Meta
                </span>
                <p className="text-[11px] text-zinc-400">Arraste para ajustar o peso comercial das vendedoras de forma global. As porcentagens de progresso abaixo recalcularão sob demanda:</p>
                <div className="flex items-center gap-4 pt-2">
                  <input
                    type="range" min="0.5" max="2.0" step="0.1" value={goalMultiplier}
                    onChange={(e) => setGoalMultiplier(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                  <span className="px-3 py-1 bg-[#111111] text-[#D4AF37] font-mono font-black text-xs rounded-xl border border-zinc-800 shadow-[0_0_10px_rgba(212,175,55,0.15)]">{goalMultiplier.toFixed(1)}x</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTAGEM DE DETALHAMENTO DO RANKING COMPLETO DE TODAS AS VENDEDORAS */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block p-1 border-l-2 border-cyan-400 pl-3">
            Detalhamento Completo das Vendedoras
          </span>
          <span className="text-[10px] text-zinc-500 font-bold bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded-md">Total: {sortedSellers.length} Vendedoras</span>
        </div>

        {/* Cards das Vendedoras (Visual zebra-striping, espaçamento responsivo e fontes aumentadas/legíveis) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {sortedSellers.map((seller, idx) => {
              const personalGoal = seller.individualTarget * goalMultiplier;
              const progressPct = Math.round((seller.totalVendido / personalGoal) * 100) || 0;
              
              // Percentages calculation for each card
              const marketShare = ((seller.totalVendido / timeTotals.faturamento) * 100) || 0;
              const attendanceShare = ((seller.totalClientes / timeTotals.atendimentos) * 100) || 0;
              const conversionRate = seller.taxaConversao || 0;
              const piecesShare = ((seller.totalPecas / timeTotals.pecas) * 100) || 0;
              const conditionalShare = ((seller.totalCondicionais / timeTotals.condicionais) * 100) || 0;

              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const isEven = idx % 2 === 0;

              // Alternating base backgrounds to clearly divide adjacent cards visually
              // and prevent confusion from similar dark tones.
              let bgClass = isEven 
                ? 'bg-[#06070a]/90 border-[#1a1b26]' 
                : 'bg-[#13151f]/95 border-[#2c2d3c]';
              
              let cardBorderClass = `${bgClass} hover:shadow-[0_0_25px_rgba(255,255,255,0.015)]`;
              let gradientHeader = isEven 
                ? 'from-[#07090e]/80 via-black to-black' 
                : 'from-[#191c28]/80 via-[#101116] to-[#0c0d12]';
              
              if (isFirst) {
                cardBorderClass = 'bg-[#080705]/95 border-yellow-500/60 hover:border-yellow-450 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]';
                gradientHeader = 'from-yellow-950/20 via-[#0e0c06] to-[#060502]';
              } else if (isSecond) {
                cardBorderClass = 'bg-[#05080b]/95 border-cyan-500/60 hover:border-cyan-450 hover:shadow-[0_0_25px_rgba(34,211,238,0.1)]';
                gradientHeader = 'from-cyan-950/20 via-[#060a0f] to-[#030507]';
              } else if (isThird) {
                cardBorderClass = 'bg-[#070509]/95 border-purple-500/60 hover:border-purple-450 hover:shadow-[0_0_25px_rgba(168,85,247,0.08)]';
                gradientHeader = 'from-purple-950/10 via-[#0c0813] to-[#050308]';
              }

              return (
                <motion.div
                  key={seller.id} layout
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`rounded-3xl border flex flex-col justify-between overflow-hidden relative group backdrop-blur-md transition-all duration-300 ${cardBorderClass}`}
                >
                  {/* Glowing card border lights */}
                  <div className={`absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-l from-transparent opacity-60 ${
                    isFirst ? 'via-yellow-400' : isSecond ? 'via-cyan-400' : isThird ? 'via-purple-400' : 'via-zinc-600'
                  }`} />
                  
                  {/* Card Header information */}
                  <div className={`p-4 pb-3 bg-gradient-to-b border-b border-zinc-900/40 flex items-center justify-between ${gradientHeader}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        {/* Avatar ring of neon gradients */}
                        <div className={`w-11 h-11 rounded-full p-[2px] flex items-center justify-center bg-gradient-to-br ${
                          isFirst ? 'from-yellow-400 to-[#D4AF37]' : isSecond ? 'from-cyan-400 to-blue-500' : isThird ? 'from-purple-400 to-fuchsia-400' : 'from-zinc-700 to-zinc-850'
                        }`}>
                          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-zinc-100 font-extrabold text-sm uppercase font-mono">
                            {seller.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        {/* Absolute small numeric index number */}
                        <span className="absolute -bottom-1 -right-1.5 w-5.5 h-5.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-center font-extrabold font-mono shadow-md">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-black block">{seller.role}</span>
                        <h4 className="font-extrabold text-base text-white truncate group-hover:text-cyan-400 transition-colors leading-tight">{seller.name}</h4>
                      </div>
                    </div>

                    {/* Rank Flag */}
                    <div className="shrink-0 flex items-center self-start">
                      {isFirst ? (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-black uppercase rounded-md border border-yellow-500/25 shadow-md">👑 Rainha</span>
                      ) : isSecond ? (
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase rounded-md border border-cyan-500/25">🥈 Princesa</span>
                      ) : isThird ? (
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase rounded-md border border-purple-500/25">🥉 Destaque</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-[10.5px] font-bold rounded-md">#{idx + 1}º Lugar</span>
                      )}
                    </div>
                  </div>

                  {/* Card values body (Com tamanho dos textos e números aumentados para melhor visualização) */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3.5 bg-black/20">
                    
                    {/* PROGRESSO DA META INDIVIDUAL */}
                    <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-900/80 overflow-hidden relative">
                      <div className="flex justify-between items-center mb-1.5 leading-none">
                        <span className="text-xs sm:text-sm font-extrabold text-zinc-200 tracking-wider uppercase flex items-center gap-1">
                          <Target className="w-4 h-4 text-cyan-400 shrink-0" /> Meta Individual
                        </span>
                        <span className="text-base sm:text-lg font-black font-mono text-cyan-400">
                          {progressPct}%
                        </span>
                      </div>

                      {/* Neon glow slider bar */}
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mt-1.5 mb-2.5 shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_#22d3ee]" 
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] sm:text-xs text-zinc-400 font-bold uppercase font-mono leading-none">
                        <span>Alvo: <span className="font-mono text-xs sm:text-sm text-zinc-200 font-extrabold">{formatCurrency(personalGoal).replace(',00', '')}</span></span>
                        {progressPct >= 100 ? (
                          <span className="text-emerald-400 font-black flex items-center gap-0.5 text-xs sm:text-sm animate-pulse">Bateu! 🔥</span>
                        ) : (
                          <span>Falta: <span className="font-mono text-xs sm:text-sm text-zinc-200 font-extrabold">{formatCurrency(Math.max(0, personalGoal - seller.totalVendido)).replace(',00', '')}</span></span>
                        )}
                      </div>
                    </div>

                    {/* DADOS DETALHADOS REVERSOS (Atendimento, Vendas, Itens, Condicional) */}
                    <div className="space-y-3">
                      {/* Atendimento */}
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wide leading-none py-1">
                        <span className="text-purple-400 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-purple-400 shrink-0" /> Atendimentos
                        </span>
                        <span className="text-purple-300 font-mono text-sm font-black">
                          {seller.totalClientes} cli.
                        </span>
                      </div>

                      {/* Vendas */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wide leading-none">
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" /> Vendas (Conversão)
                          </span>
                          <span className="text-emerald-300 font-mono text-sm font-black">
                            {seller.totalVendas} un. <span className="text-[11px] text-[#A3E635] font-bold ml-1">({conversionRate.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900/60 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, conversionRate)}%` }} />
                        </div>
                      </div>

                      {/* Itens */}
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wide leading-none py-1">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-amber-500 shrink-0" /> Itens / Peças
                        </span>
                        <span className="text-amber-350 font-mono text-sm font-black">
                          {seller.totalPecas} un.
                        </span>
                      </div>

                      {/* Condicional */}
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wide leading-none py-1">
                        <span className="text-pink-400 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-pink-400 shrink-0" /> Condicionais
                        </span>
                        <span className="text-pink-300 font-mono text-sm font-black">
                          {seller.totalCondicionais} env.
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-900" />

                    {/* VALOR DE FATURAMENTO TOTAL & PARTICIPAÇÃO DE SHARE DO TIME */}
                    <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-900/80">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Faturamento</span>
                        <span className="font-mono text-lg sm:text-xl font-black text-emerald-400 whitespace-nowrap leading-none mt-1.5 block">
                          {formatCurrency(seller.totalVendido).replace(',00', '')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Share Loja</span>
                        <span className="text-sm sm:text-base font-black text-cyan-400 font-mono inline-block bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20 leading-none mt-1.5 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                          {marketShare.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* PODIUM 3D - REPRESENTAÇÃO FÍSICA FUTURISTA (Abaixo da Dobra) */}
        {sortedSellers.length >= 3 && (
          <div className="mt-12 pt-10 border-t border-zinc-900/40">
            <div className="flex flex-col items-center justify-center mb-8">
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)] animate-pulse">
                🏆 Arena da Vitória • Pódio Tridimensional de Liderança
              </span>
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest mt-2">Visão Tridimensional das Campeãs de Vendas</p>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center pb-2">
              <div className="flex items-end justify-center gap-4 lg:gap-8 w-full max-w-3xl pt-14 pb-4">
                {/* 2º LUGAR (Princesa - Esquerda) */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col items-center flex-1"
                >
                  {/* Avatar & Brilhos */}
                  <div className="relative group mb-3">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full filter blur-md opacity-30 group-hover:opacity-60 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-cyan-300 text-lg">
                        {top2?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 text-black border-2 border-[#0b0c10] flex items-center justify-center text-xs font-black">
                      2
                    </span>
                  </div>
                  
                  {/* Informações */}
                  <div className="text-center mb-4 min-w-0 max-w-[160px]">
                    <h4 className="font-extrabold text-sm text-gray-200 truncate">{top2?.name}</h4>
                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">🥈 Princesa</p>
                    <p className="text-xs font-mono font-black text-gray-100 mt-1">
                      {renderPodiumValue(top2)}
                    </p>
                  </div>
                  
                  {/* Bloco Pedestal */}
                  <div className="w-28 lg:w-36 h-32 bg-gradient-to-b from-cyan-950/50 via-[#101925] to-black border-t-2 border-x border-cyan-500/35 rounded-t-2xl shadow-[0_-10px_20px_rgba(6,182,212,0.1)] flex flex-col justify-end p-3 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-cyan-900/10 select-none">#2</div>
                    <div className="w-full space-y-1 z-10 text-center">
                      <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-black block">Vendas</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">{top2?.totalVendas} Trans.</span>
                    </div>
                  </div>
                </motion.div>

                {/* 1º LUGAR (Rainha - Centro - Mais alto) */}
                <motion.div 
                  initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                  className="flex flex-col items-center flex-1 -mt-10"
                >
                  {/* Coroa Animada */}
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="z-20 -mb-2"
                  >
                    <Crown className="w-8 h-8 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
                  </motion.div>

                  {/* Avatar & Brilhos */}
                  <div className="relative group mb-3">
                    <div className="absolute inset-0 bg-yellow-500 rounded-full filter blur-lg opacity-40 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-[#D4AF37] p-[3px] shadow-[0_0_30px_rgba(212,175,55,0.5)] ring-2 ring-[#D4AF37]/30">
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-yellow-300 text-xl">
                        {top1?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D4AF37] text-zinc-950 border-2 border-[#0b0c10] flex items-center justify-center text-sm font-black animate-pulse">
                      1
                    </span>
                  </div>
                  
                  {/* Informações */}
                  <div className="text-center mb-4 min-w-0 max-w-[160px]">
                    <h4 className="font-extrabold text-base text-gray-100 truncate tracking-tight">{top1?.name}</h4>
                    <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest animate-pulse">👑 Rainha</p>
                    <p className="text-sm font-mono font-black text-yellow-400 mt-1">
                      {renderPodiumValue(top1)}
                    </p>
                  </div>
                  
                  {/* Bloco Pedestal */}
                  <div className="w-32 lg:w-44 h-48 bg-gradient-to-b from-yellow-900/40 via-yellow-950/50 to-black border-t-2 border-x border-[#D4AF37]/50 rounded-t-2xl shadow-[0_-15px_30px_rgba(212,175,55,0.2)] flex flex-col justify-end p-4 relative overflow-hidden">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-[#D4AF37]/5 select-none animate-pulse">#1</div>
                    <div className="w-full space-y-1.5 z-10 text-center">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Faturamento</span>
                      <span className="text-sm font-mono font-black text-[#D4AF37]">{formatCurrency(top1?.totalVendido).replace(',00', '')}</span>
                    </div>
                  </div>
                </motion.div>

                {/* 3º LUGAR (Destaque - Direita) */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
                  className="flex flex-col items-center flex-1"
                >
                  {/* Avatar & Brilhos */}
                  <div className="relative group mb-3">
                    <div className="absolute inset-0 bg-purple-500 rounded-full filter blur-md opacity-25 group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-purple-300 text-lg">
                        {top3?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 text-white border-2 border-[#0b0c10] flex items-center justify-center text-xs font-black">
                      3
                    </span>
                  </div>
                  
                  {/* Informações */}
                  <div className="text-center mb-4 min-w-0 max-w-[160px]">
                    <h4 className="font-extrabold text-sm text-gray-200 truncate">{top3?.name}</h4>
                    <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">🥉 Destaque</p>
                    <p className="text-xs font-mono font-black text-gray-100 mt-1">
                      {renderPodiumValue(top3)}
                    </p>
                  </div>
                  
                  {/* Bloco Pedestal */}
                  <div className="w-28 lg:w-36 h-24 bg-gradient-to-b from-purple-950/40 via-[#161223] to-black border-t-2 border-x border-purple-500/35 rounded-t-2xl shadow-[0_-10px_20px_rgba(168,85,247,0.08)] flex flex-col justify-end p-3 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-purple-900/10 select-none">#3</div>
                    <div className="w-full space-y-1 z-10 text-center">
                      <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-black block">Peças</span>
                      <span className="text-xs font-mono font-bold text-purple-300">{top3?.totalPecas} Itens</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACOMPANHAMENTO DE RELACIONAMENTO ADMINISTRATIVO (PÓS-VENDAS & FOLLOW-UP) */}
      <div className="bg-[#0b0c10] border border-cyan-950/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-cyan-950/50 pb-5">
          <div className="space-y-1">
            <h3 className="text-sm uppercase font-black tracking-widest text-[#22d3ee] flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" /> Acompanhamento de Relacionamento & Metas Adicionais
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              Monitoramento em tempo real do Pós-Venda Diário e do Acompanhamento de Vendas Paradas (Follow-Up).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-2xl border border-cyan-950/60 text-[11px] font-bold text-zinc-300">
            <span>Meta Diária de Pós-Vendas:</span>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-black rounded-md">
              Mín. 3 contatos/dia
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* COMPLIANCE DAS COLEGAS DE EQUIPE */}
          <div className="lg:col-span-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-4">
                🎯 Compliance de Pós-Vendas de Hoje
              </span>
              
              <div className="space-y-4">
                {sellers.filter(s => s.role === 'Vendedora').map(seller => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const doneToday = postSales.filter(ps => ps.vendedora === seller.name && ps.date === todayStr).length;
                  const ratio = (doneToday / 3) * 100;
                  const hasBeaten = doneToday >= 3;

                  return (
                    <div key={seller.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-zinc-100">{seller.name}</span>
                        <span className={`font-mono font-bold ${hasBeaten ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          {doneToday} de 3 {hasBeaten ? '🏆' : ''}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasBeaten 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_#34d399]' 
                              : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                          }`} 
                          style={{ width: `${Math.min(100, ratio)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-900/40 text-[10px] text-zinc-500 font-medium">
              💡 Esse dashboard incentiva o monitoramento saudável. Pós-vendas de hoje já estão incluídos no controle diário da vendedora.
            </div>
          </div>

          {/* PAINEL DE METRICAS DE VENDAS PARADAS (FOLLOW-UP) */}
          <div className="lg:col-span-7 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-3">
                ⏳ Visão Geral de Vendas Paradas (Follow-up)
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                <div className="bg-zinc-900/60 border border-cyan-950 p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Acompanhando</span>
                  <p className="text-xl font-black text-zinc-100 mt-1 font-mono">{followUps.filter(f => f.status === 'Pendente' || f.status === 'Contatado').length}</p>
                </div>
                <div className="bg-zinc-900/60 border border-rose-950/50 p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider">Alto Risco (7d+)</span>
                  <p className="text-xl font-black text-rose-400 mt-1 font-mono">{followUps.filter(f => f.status === 'Pendente' && f.daysStuck >= 7).length}</p>
                </div>
                <div className="bg-zinc-900/60 border border-emerald-950/50 p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Recuperadas (Mês)</span>
                  <p className="text-xl font-black text-emerald-400 mt-1 font-mono">{followUps.filter(f => f.status === 'Vendido (Recuperado)').length}</p>
                </div>
              </div>

              {/* LISTA RESUMIDA DAS CLIENTES PARADAS MAIS CRÍTICAS */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Vendas paradas mais críticas (Atenção urgente)</span>
                
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {followUps.filter(fu => fu.status === 'Pendente').sort((a,b) => b.daysStuck - a.daysStuck).slice(0, 3).map(fu => (
                    <div key={fu.id} className="flex justify-between items-center text-xs p-2 bg-zinc-950 border border-zinc-900 rounded-lg hover:border-cyan-900/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-zinc-200">{fu.clientName}</span>
                          <span className="text-[9px] text-[#22d3ee] font-mono">({fu.vendedora})</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 max-w-sm truncate">{fu.notes}</p>
                      </div>
                      <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black rounded-md">
                        {fu.daysStuck} dias parado
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-zinc-900/40">
              <span className="text-[10px] text-zinc-400 font-medium">Soma do potencial de vendas paradas hoje:</span>
              <span className="font-mono text-cyan-400 font-extrabold text-xs">
                {formatCurrency(followUps.filter(f => f.status === 'Pendente').reduce((acc, curr) => acc + (curr.stuckValue || 0), 0))}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Gráficos de Evolução Diária & Forecast Estimado */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-2">
        <motion.section
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
          className="col-span-1 md:col-span-8 bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col h-[200px]"
        >
          <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">Evolução do Faturamento diário no mês (May 2026)</span>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicMonthlyChart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={5} fontSize={10} tick={{ fill: '#9CA3AF', fontWeight: 'bold' }} />
                <YAxis hide={true} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
                <Area type="monotone" dataKey="sales" stroke="#111111" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Forecast Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="col-span-1 md:col-span-4 bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between h-[200px]"
        >
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Forecast Mensal Estimado</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-[#111111] tracking-tight">{formatCurrency(forecastValue)}</span>
            </div>
            <p className="text-[9px] text-gray-500 font-medium mt-1 leading-tight">Ritmo médio de faturamento projetado até o último dia útil {viewMode === 'mensal' ? '(31 dias)' : ''}.</p>
          </div>
          <div className="h-px bg-gray-150 my-1.5"></div>
          <div className="space-y-1 text-[10px] font-bold text-gray-500">
            <div className="flex justify-between">
              <span>Ticket Médio Geral</span>
              <span className="text-[#111111]">{formatCurrency(ticketMedioGeral)}</span>
            </div>
            <div className="flex justify-between">
              <span>Clientes Atendidos</span>
              <span className="text-[#111111]">{totalClientesServidos}</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
