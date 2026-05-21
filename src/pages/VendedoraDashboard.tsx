import { useState, useMemo, FormEvent } from 'react';
import { formatCurrency, calculateRemainingWorkingDays } from '@/lib/utils';
import { useData, PostSale, FollowUp } from '@/contexts/DataContext';
import { 
  Star, Target, Calendar, ChevronRight, Package, User, PlusCircle, 
  MessageSquare, UserCheck, AlertCircle, TrendingUp, ShieldAlert,
  Clock, CheckCircle, Flame, Sparkles, Send, X, AlertTriangle, BookOpen, ThumbsUp, EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function VendedoraDashboard() {
  const { 
    sellers, postSales, addPostSale, updatePostSale, deletePostSale,
    followUps, addFollowUp, updateFollowUp, deleteFollowUp, sales,
    selectedPeriod, setSelectedPeriod, periods, sellersTarget
  } = useData();

  // Active Seller select for demo fluidity (the user requested simple control check)
  // Default to Beatriz R. as she is an active seller in Loja 1
  const [activeSellerName, setActiveSellerName] = useState('Beatriz R.');
  
  // Tab states for Relationship Control
  const [activeSegment, setActiveSegment] = useState<'pos_vendas' | 'follow_ups'>('pos_vendas');

  // Modal open states
  const [isPostSaleModalOpen, setIsPostSaleModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // New Post-Sale form state
  const [newPostSale, setNewPostSale] = useState({
    clientName: '',
    clientContact: '',
    type: 'Pós-Venda 15 dias' as PostSale['type'],
    notes: '',
    status: 'Feliz / Satisfeito' as PostSale['status']
  });

  // New Follow-up form state
  const [newFollowUp, setNewFollowUp] = useState({
    clientName: '',
    clientContact: '',
    daysStuck: 3,
    stuckValue: '',
    notes: '',
    status: 'Pendente' as FollowUp['status']
  });

  const activeSeller = useMemo(() => {
    return sellers.find(s => s.name === activeSellerName) || sellers[1];
  }, [sellers, activeSellerName]);

  const [yearStr, monthStr] = selectedPeriod.split('-');
  const simYear = parseInt(yearStr, 10);
  const simMonth = parseInt(monthStr, 10) - 1;

  // Filter sales for this seller in the selected month
  const sellerMonthSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date);
      return s.vendedora === activeSellerName && d.getFullYear() === simYear && d.getMonth() === simMonth;
    });
  }, [sales, activeSellerName, simYear, simMonth]);

  const targetObj = useMemo(() => {
    return sellersTarget ? sellersTarget.find(t => t.name === activeSellerName) : null;
  }, [sellersTarget, activeSellerName]);

  const metaNoMês = targetObj ? Number(targetObj.target) : 40000;
  
  // Calculate realizado dynamically!
  const realizado = useMemo(() => {
    return sellerMonthSales.reduce((acc, curr) => acc + curr.amount, 0);
  }, [sellerMonthSales]);

  const percentual = metaNoMês > 0 ? (realizado / metaNoMês) * 100 : 0;
  
  const today = new Date();
  const remainingDays = useMemo(() => {
    return calculateRemainingWorkingDays(today, simMonth, simYear, []);
  }, [simMonth, simYear]);

  const faltamHoje = Math.max(0, (metaNoMês - realizado) / remainingDays);
  const unidadesHoje = Math.ceil(faltamHoje / 175); // assuming 175 ticket medio
  
  // List filtered specifically for the current working seller
  const sellerPostSales = useMemo(() => {
    return postSales.filter(ps => ps.vendedora === activeSellerName && ps.date.startsWith(selectedPeriod));
  }, [postSales, activeSellerName, selectedPeriod]);

  const sellerFollowUps = useMemo(() => {
    return followUps.filter(fu => fu.vendedora === activeSellerName && fu.date.startsWith(selectedPeriod));
  }, [followUps, activeSellerName, selectedPeriod]);

  // Daily target compliance for after-sales
  // Minimum requirement: e.g. 3 pós-vendas daily
  const dailyPostSaleTarget = 3;
  
  const sellerSalesTodayList = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sales.filter(s => s.vendedora === activeSellerName && s.date.split('T')[0] === todayStr);
  }, [sales, activeSellerName]);

  const donePostSalesToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const psCount = sellerPostSales.filter(ps => ps.date === todayStr).length;
    const salePSCount = sellerSalesTodayList.reduce((acc, curr) => acc + (curr.posVendasFeitos || 0), 0);
    return psCount + salePSCount;
  }, [sellerPostSales, sellerSalesTodayList]);

  const doneFollowUpsToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const fuCount = sellerFollowUps.filter(fu => fu.date === todayStr && fu.status !== 'Pendente').length;
    const saleFUCount = sellerSalesTodayList.reduce((acc, curr) => acc + (curr.followUpsFeitos || 0), 0);
    return fuCount + saleFUCount;
  }, [sellerFollowUps, sellerSalesTodayList]);

  const doneMessagesToday = useMemo(() => {
    const saleMsgCount = sellerSalesTodayList.reduce((acc, curr) => acc + (curr.novasMensagensEnviadas || 0), 0);
    return saleMsgCount;
  }, [sellerSalesTodayList]);

  // Follow-ups breakdown
  const pendingFollowUpsCount = useMemo(() => {
    return sellerFollowUps.filter(fu => fu.status === 'Pendente').length;
  }, [sellerFollowUps]);

  const criticalFollowUpsCount = useMemo(() => {
    return sellerFollowUps.filter(fu => fu.status === 'Pendente' && fu.daysStuck >= 7).length;
  }, [sellerFollowUps]);

  // Total sales for feedback mockup
  const totalVendidasCount = activeSellerName === 'Beatriz R.' ? 164 : activeSellerName === 'Diana M.' ? 188 : 86;

  // Handlers for Post-Sale
  const handleCreatePostSale = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostSale.clientName.trim()) {
      toast.error('Informe o nome da cliente.');
      return;
    }
    
    addPostSale({
      date: new Date().toISOString().split('T')[0],
      vendedora: activeSellerName,
      clientName: newPostSale.clientName,
      clientContact: newPostSale.clientContact,
      type: newPostSale.type,
      notes: newPostSale.notes || 'Nenhuma observação',
      status: newPostSale.status
    });

    toast.success('Pós-Venda lançado com sucesso!');
    setIsPostSaleModalOpen(false);
    setNewPostSale({
      clientName: '',
      clientContact: '',
      type: 'Pós-Venda 15 dias',
      notes: '',
      status: 'Feliz / Satisfeito'
    });
  };

  // Handlers for Follow-Up
  const handleCreateFollowUp = (e: FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.clientName.trim()) {
      toast.error('Informe o nome da cliente.');
      return;
    }

    addFollowUp({
      date: new Date().toISOString().split('T')[0],
      vendedora: activeSellerName,
      clientName: newFollowUp.clientName,
      clientContact: newFollowUp.clientContact,
      daysStuck: Number(newFollowUp.daysStuck) || 1,
      lastContact: new Date(Date.now() - (Number(newFollowUp.daysStuck) || 1) * 86400000).toISOString().split('T')[0],
      stuckValue: newFollowUp.stuckValue ? Number(newFollowUp.stuckValue) : undefined,
      notes: newFollowUp.notes || 'Nenhuma observação',
      status: newFollowUp.status
    });

    toast.success('Acompanhamento (Follow-Up) registrado!');
    setIsFollowUpModalOpen(false);
    setNewFollowUp({
      clientName: '',
      clientContact: '',
      daysStuck: 3,
      stuckValue: '',
      notes: '',
      status: 'Pendente'
    });
  };

  const handleUpdatePostSaleStatus = (id: string, currentStatus: PostSale['status']) => {
    const statuses: PostSale['status'][] = ['Feliz / Satisfeito', 'Dúvida / Ajuste', 'Sem Retorno', 'Pendente'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    updatePostSale(id, { status: statuses[nextIdx] });
    toast.message(`Status alterado para: ${statuses[nextIdx]}`);
  };

  const handleUpdateFollowUpStatus = (id: string, currentStatus: FollowUp['status']) => {
    const statuses: FollowUp['status'][] = ['Pendente', 'Contatado', 'Vendido (Recuperado)', 'Perdido / Sem Retorno'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    updateFollowUp(id, { status: statuses[nextIdx] });
    toast.message(`Status alterado para: ${statuses[nextIdx]}`);
  };

  return (
    <div className="flex flex-col h-auto min-h-full gap-6 pb-20 md:pb-10 font-sans max-w-5xl mx-auto w-full">
      
      {/* HEADER E SELECTOR DE TESTE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white/70 backdrop-blur border border-white p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#111111] text-[#D4AF37] rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border border-neutral-800">
            {activeSeller?.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">Olá, {activeSeller?.name}!</h1>
            <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Nível atual: Vendedora Desafio
            </p>
          </div>
        </div>
        
        {/* Dynamic selector to let users simulate different sellers fluidly, plus month-period filter */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-150">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Simular:</span>
            <select 
              value={activeSellerName} 
              onChange={(e) => setActiveSellerName(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:ring-1 focus:ring-[#D4AF37] font-bold text-gray-700"
            >
              {sellers.filter(s => s.role === 'Vendedora').map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-150">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Mês:</span>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:ring-1 focus:ring-[#D4AF37] font-bold text-gray-700"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* PAINEL DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metas Financieras */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
          id="meta-venda-card"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Meta do Mês (Faturamento)</span>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-lg">
              Ativa
            </Badge>
          </div>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-black text-[#111111] tracking-tight">{formatCurrency(realizado)}</span>
            <span className="text-sm text-gray-400 font-semibold ml-2">/ {formatCurrency(metaNoMês)}</span>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-zinc-500" /> Progresso Realizado</span>
              <span className="text-[#111111] bg-gray-100 px-2 py-0.5 rounded-md font-mono">{percentual.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-neutral-800 to-black transition-all" style={{ width: `${percentual}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Próximo nível (Superação) aos {formatCurrency(50000)}</p>
          </div>
        </motion.section>

        {/* METRICAS DE HOJE - FOCO DIARIO E POS-VENDAS */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#111111] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
          id="meta-diaria-card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-extrabold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-current animate-pulse text-[#D4AF37]" /> Foco do Dia
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="text-3xl font-black mt-2 text-white">{formatCurrency(faltamHoje)}</h3>
              <p className="text-zinc-400 text-xs mt-0.5 font-medium">Recomendado por dia útil para bater a meta</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wide">Meta de Peças</span>
                <span className="text-xs font-black text-[#D4AF37] mt-1 flex items-center gap-1">
                  👚 ~{unidadesHoje} un.
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wide">Pós-Venda Hoje</span>
                <span className="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1">
                  📞 {donePostSalesToday} / {dailyPostSaleTarget}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wide">Follow-Up Hoje</span>
                <span className="text-xs font-black text-cyan-400 mt-1 flex items-center gap-1">
                  ⏳ {doneFollowUpsToday} feito
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wide">Mensagens Hoje</span>
                <span className="text-xs font-black text-purple-400 mt-1 flex items-center gap-1">
                  💬 {doneMessagesToday} envs.
                </span>
              </div>
            </div>

            {/* PROGRESS BAR DE POS-VENDAS */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                <span>Meta Diária de Pós-Vendas</span>
                <span className={donePostSalesToday >= dailyPostSaleTarget ? "text-emerald-400" : "text-[#D4AF37]"}>
                  {donePostSalesToday >= dailyPostSaleTarget ? "Meta batida! 🎉" : `${dailyPostSaleTarget - donePostSalesToday} pendentes`}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all rounded-full" 
                  style={{ width: `${Math.min(100, (donePostSalesToday / dailyPostSaleTarget) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* METRICAS DE ACOMPANHAMENTO RAPIDO */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#111111] text-xs uppercase tracking-tight">Vendas no Mês</h4>
              <p className="text-sm font-black text-gray-900 mt-0.5">{totalVendidasCount} peças</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#111111] text-xs uppercase tracking-tight">Vendas Paradas (Pendente)</h4>
              <p className="text-sm font-black text-gray-900 mt-0.5">{pendingFollowUpsCount} clientes</p>
            </div>
          </div>
          {pendingFollowUpsCount > 0 && (
            <Badge className="bg-rose-500 text-white font-bold font-mono text-[9px] rounded-lg">
              Acompanhar
            </Badge>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#997f2e] shrink-0">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#111111] text-xs uppercase tracking-tight">Grave Sem Contato (7d+)</h4>
              <p className="text-sm font-black text-gray-900 mt-0.5">{criticalFollowUpsCount} paradas</p>
            </div>
          </div>
          {criticalFollowUpsCount > 0 && (
            <Badge className="bg-amber-500 text-white font-bold font-mono text-[9px] rounded-lg animate-pulse">
              Urgente
            </Badge>
          )}
        </div>
      </div>

      {/* ÁREA INTERATIVA DE RELACIONAMENTO */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        
        {/* Título e Switch de Segmento */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-gray-100">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#111111] tracking-tight">Painel de Ações de Relacionamento</h2>
            <p className="text-xs text-gray-500 font-medium">Controle de contatos cotidianos para reaquecer e encantar clientes.</p>
          </div>

          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveSegment('pos_vendas')}
              className={`px-4 py-2 text-xs font-extrabold tracking-tight rounded-xl transition-all ${
                activeSegment === 'pos_vendas'
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              📞 Pós-Vendas ({sellerPostSales.length})
            </button>
            <button
              onClick={() => setActiveSegment('follow_ups')}
              className={`px-4 py-2 text-xs font-extrabold tracking-tight rounded-xl transition-all ${
                activeSegment === 'follow_ups'
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              ⏳ Vendas Paradas ({sellerFollowUps.length})
            </button>
          </div>
        </div>

        {/* CONTEÚDO ATIVO */}
        <div className="mt-6 flex flex-col gap-4">
          
          {/* LANÇAMENTOS RAPIDOS */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-black text-gray-400 tracking-wider">
              {activeSegment === 'pos_vendas' ? 'Lista de Contatos de Pós-Venda' : 'Acompanhamento de Vendas Paradas'}
            </h3>
            
            {activeSegment === 'pos_vendas' ? (
              <button 
                onClick={() => setIsPostSaleModalOpen(true)}
                className="bg-[#111111] hover:bg-[#222] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Lançar Pós-Venda
              </button>
            ) : (
              <button 
                onClick={() => setIsFollowUpModalOpen(true)}
                className="bg-[#111111] hover:bg-[#222] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Registrar Venda Parada
              </button>
            )}
          </div>

          {/* TABELA / TILES DINÂMICOS DE PÓS-VENDAS */}
          {activeSegment === 'pos_vendas' && (
            <div className="grid gap-3 grid-cols-1">
              {sellerPostSales.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center text-gray-400 text-xs">
                  Nenhum pós-venda registrado por {activeSellerName} ainda.
                </div>
              ) : (
                sellerPostSales.map((ps) => (
                  <div 
                    key={ps.id} 
                    className="p-5 border border-gray-150 rounded-2xl bg-gray-50 hover:bg-zinc-50/50 hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-500 font-bold shrink-0 mt-0.5">
                        👤
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#111111]">{ps.clientName}</h4>
                          {ps.clientContact && <span className="text-[10px] text-gray-400 font-mono font-medium">{ps.clientContact}</span>}
                          <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 py-0 px-2 rounded-md">
                            {ps.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-2xl">
                          &ldquo;{ps.notes}&rdquo;
                        </p>
                        <span className="text-[9px] text-gray-400 font-bold block mt-1">🗓️ Registrado em {new Date(ps.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button 
                        onClick={() => handleUpdatePostSaleStatus(ps.id, ps.status)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all flex items-center gap-1 shadow-sm ${
                          ps.status === 'Feliz / Satisfeito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' :
                          ps.status === 'Dúvida / Ajuste' ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' :
                          ps.status === 'Sem Retorno' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200' :
                          'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {ps.status === 'Feliz / Satisfeito' && <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
                        {ps.status === 'Dúvida / Ajuste' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {ps.status === 'Sem Retorno' && <EyeOff className="w-3.5 h-3.5 text-zinc-505" />}
                        {ps.status === 'Pendente' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {ps.status}
                      </button>
                      
                      <button 
                        onClick={() => {
                          deletePostSale(ps.id);
                          toast.success('Pós-venda deletado');
                        }}
                        className="p-1.5 border border-transparent rounded-lg hover:bg-red-50 hover:border-red-150 text-gray-400 hover:text-red-600 transition-all"
                        title="Deletar registro"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TABELA / TILES DINÂMICOS DE FOLLOW-UPS */}
          {activeSegment === 'follow_ups' && (
            <div className="grid gap-3 grid-cols-1">
              {sellerFollowUps.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center text-gray-400 text-xs">
                  Nenhum registro de cliente parado ou pendente por {activeSellerName}.
                </div>
              ) : (
                sellerFollowUps.map((fu) => (
                  <div 
                    key={fu.id} 
                    className={`p-5 border rounded-2xl transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden ${
                      fu.status === 'Vendido (Recuperado)' ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/40' :
                      fu.status === 'Perdido / Sem Retorno' ? 'bg-zinc-100/50 border-zinc-200 hover:border-zinc-300' :
                      fu.daysStuck >= 7 ? 'bg-rose-50/30 border-rose-150 hover:border-rose-300 hover:bg-rose-50/55' :
                      'bg-gray-50 border-gray-150 hover:border-gray-300 hover:bg-zinc-50/50'
                    }`}
                  >
                    {/* Alerta de Urgência no canto */}
                    {fu.status === 'Pendente' && fu.daysStuck >= 7 && (
                      <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider py-0.5 px-3 rounded-bl-lg">
                        Grave: {fu.daysStuck} Dias Parado
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold border ${
                        fu.status === 'Vendido (Recuperado)' ? 'bg-emerald-100/60 border-emerald-200 text-emerald-600' :
                        fu.status === 'Perdido / Sem Retorno' ? 'bg-zinc-200 border-zinc-300 text-zinc-500' :
                        fu.daysStuck >= 7 ? 'bg-rose-100 border-rose-200 text-rose-600' :
                        'bg-white border-gray-200 text-gray-700'
                      }`}>
                        {fu.status === 'Vendido (Recuperado)' ? '🎉' : '🛍️'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#111111]">{fu.clientName}</h4>
                          {fu.clientContact && <span className="text-[10px] text-gray-400 font-mono font-medium">{fu.clientContact}</span>}
                          
                          {fu.stuckValue && (
                            <span className="text-[10px] font-mono text-zinc-800 bg-gray-100 px-1.5 py-0.5 rounded-md font-extrabold">
                              {formatCurrency(fu.stuckValue)} potencial
                            </span>
                          )}

                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                            fu.daysStuck >= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-[#997f2e]'
                          }`}>
                            {fu.daysStuck} dias parado
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-2xl">
                          &ldquo;{fu.notes}&rdquo;
                        </p>
                        <span className="text-[9px] text-gray-400 font-bold block mt-1">🗓️ Último contato em {new Date(fu.lastContact + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button 
                        onClick={() => handleUpdateFollowUpStatus(fu.id, fu.status)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all flex items-center gap-1 shadow-sm ${
                          fu.status === 'Vendido (Recuperado)' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' :
                          fu.status === 'Contatado' ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100' :
                          fu.status === 'Perdido / Sem Retorno' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200' :
                          'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {fu.status}
                      </button>
                      
                      <button 
                        onClick={() => {
                          deleteFollowUp(fu.id);
                          toast.success('Registro de venda parada removido');
                        }}
                        className="p-1.5 border border-transparent rounded-lg hover:bg-red-50 hover:border-red-150 text-gray-400 hover:text-red-600 transition-all"
                        title="Remover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* FORM MODAL DE PÓS-VENDA */}
      <AnimatePresence>
        {isPostSaleModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsPostSaleModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-[#111111] text-base mb-1 flex items-center gap-2">
                📞 Lançar Ação de Pós-Venda
              </h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-6">
                Meta Diária: Manter o relacionamento vivo!
              </p>

              <form onSubmit={handleCreatePostSale} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Nome da Cliente *</label>
                  <input 
                    type="text" required
                    value={newPostSale.clientName} onChange={(e) => setNewPostSale(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Ex: Clara Albuquerque Mendonça"
                    className="w-full text-sm font-semibold h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-4"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Telefone / Canal de Contato</label>
                  <input 
                    type="text"
                    value={newPostSale.clientContact} onChange={(e) => setNewPostSale(prev => ({ ...prev, clientContact: e.target.value }))}
                    placeholder="Ex: (11) 98765-4321, Instagram, etc."
                    className="w-full text-sm font-medium h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Tipo da Ligação/Mensagem</label>
                    <select 
                      value={newPostSale.type} onChange={(e) => setNewPostSale(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full text-xs font-bold h-11 border-gray-200 rounded-xl px-2.5 bg-white"
                    >
                      <option value="Pós-Venda 15 dias">Pós-Venda 15 dias</option>
                      <option value="Pós-Venda 30 dias">Pós-Venda 30 dias</option>
                      <option value="Feedback">Feedback Geral</option>
                      <option value="Outra">Outra</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Status do Feedback</label>
                    <select 
                      value={newPostSale.status} onChange={(e) => setNewPostSale(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full text-xs font-bold h-11 border-gray-200 rounded-xl px-2.5 bg-white"
                    >
                      <option value="Feliz / Satisfeito">Feliz / Satisfeito</option>
                      <option value="Dúvida / Ajuste">Dúvida / Ajuste</option>
                      <option value="Sem Retorno">Sem Retorno</option>
                      <option value="Pendente">Ainda Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Feedbacks / O que falou na conversa</label>
                  <textarea 
                    value={newPostSale.notes} onChange={(e) => setNewPostSale(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ex: Amou o toque macio do cetim, mas disse que a barra do vestido ficou um pouco longa e pode precisar de costureira parceira."
                    rows={3}
                    className="w-full text-xs font-medium border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl p-3"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#111111] hover:bg-[#222] text-white py-3 font-bold rounded-xl shadow-md transition-colors text-sm"
                >
                  Confirmar e Registrar Pós-Venda
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORM MODAL DE FOLLOW-UP */}
      <AnimatePresence>
        {isFollowUpModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsFollowUpModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-[#111111] text-base mb-1 flex items-center gap-2">
                ⏳ Monitorar Venda Parada / Pendência
              </h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-6">
                Impeça que orçamentos frios e condicionais fiquem sem retorno!
              </p>

              <form onSubmit={handleCreateFollowUp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Nome da Cliente *</label>
                  <input 
                    type="text" required
                    value={newFollowUp.clientName} onChange={(e) => setNewFollowUp(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Ex: Gabriela de Souza Rocha"
                    className="w-full text-sm font-semibold h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Telefone / WhatsApp</label>
                    <input 
                      type="text"
                      value={newFollowUp.clientContact} onChange={(e) => setNewFollowUp(prev => ({ ...prev, clientContact: e.target.value }))}
                      placeholder="Ex: (11) 98711-2233"
                      className="w-full text-sm font-medium h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-3"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Valor Estimado (R$)</label>
                    <input 
                      type="number"
                      value={newFollowUp.stuckValue} onChange={(e) => setNewFollowUp(prev => ({ ...prev, stuckValue: e.target.value }))}
                      placeholder="Ex: 500"
                      className="w-full text-sm font-semibold h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Dias Parados</label>
                    <input 
                      type="number"
                      value={newFollowUp.daysStuck} onChange={(e) => setNewFollowUp(prev => ({ ...prev, daysStuck: Number(e.target.value) }))}
                      min={1} max={90}
                      className="w-full text-sm font-semibold h-11 border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl px-4"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Status Inicial</label>
                    <select 
                      value={newFollowUp.status} onChange={(e) => setNewFollowUp(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full text-xs font-bold h-11 border-gray-200 rounded-xl px-2 bg-white"
                    >
                      <option value="Pendente">Ainda Sem Resposta (Pendente)</option>
                      <option value="Contatado">Conversando / Em Contato</option>
                      <option value="Vendido (Recuperado)">Vendido! (Venda Convertida)</option>
                      <option value="Perdido / Sem Retorno">Perdido / Sem Retorno</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">O que motivou a parada / Notas adicionais</label>
                  <textarea 
                    value={newFollowUp.notes} onChange={(e) => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ex: Levou 3 peças no condicional no sábado passado, disse que ia viajar. Precisa ligar gentilmente pra saber se serviu e quando pode devolver."
                    rows={3}
                    className="w-full text-xs font-medium border-gray-200 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-xl p-3"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#111111] hover:bg-[#222] text-white py-3 font-bold rounded-xl shadow-md transition-colors text-sm"
                >
                  Registrar Registro de Venda Parada
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
