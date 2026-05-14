import { useState, useEffect } from 'react';
import { Target, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

const mockData = [
  { day: '01', sales: 1200 },
  { day: '02', sales: 2100 },
  { day: '03', sales: 1800 },
  { day: '04', sales: 2400 },
  { day: '05', sales: 1900 },
  { day: '06', sales: 3100 },
  { day: '07', sales: 2800 },
  { day: '08', sales: 2200 },
  { day: '09', sales: 3500 },
  { day: '10', sales: 4000 },
];

const mockSellerQuantity = [
  { name: 'Ana Paula', quantity: 245, revenue: 14500, ticketMedio: 215, condicionais: 3 },
  { name: 'Beatriz R.', quantity: 182, revenue: 9800, ticketMedio: 198, condicionais: 1 },
  { name: 'Carla T.', quantity: 134, revenue: 7600, ticketMedio: 245, condicionais: 0 },
  { name: 'Diana M.', quantity: 98, revenue: 5200, ticketMedio: 180, condicionais: 2 },
];

export function Dashboard() {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [viewMode, setViewMode] = useState<'mensal'|'semanal'>('mensal');
  
  const target = viewMode === 'mensal' ? 42850 : 10500;
  const realized = viewMode === 'mensal' ? 26000 : 8200;
  
  const diasRestantes = viewMode === 'mensal' ? 12 : 2;
  const metaDiaria = (target - realized) / diasRestantes;
  const clientesAtendidos = viewMode === 'mensal' ? 107 : 33;
  
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
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
  }, [realized, target]);

  return (
    <div className="flex-1 flex flex-col h-full gap-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#111111] tracking-tight">Dashboard de Metas</h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#D4AF37] font-bold uppercase tracking-widest">Loja Centro • {viewMode === 'mensal' ? new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : 'Semana Atual'}</p>
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
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-semibold text-gray-600">Sincronizado via ERP</span>
          </div>
          <button className="bg-[#D4AF37] text-[#111111] px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#c4a132] transition-colors">
            Nova Venda
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-[repeat(8,minmax(0,1fr))] gap-4 pb-16 md:pb-0">
        
        {/* Realizado Acumulado */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
          className="md:col-span-3 md:row-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
        >
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Realizado Acumulado</span>
          <div className="flex flex-col mt-4">
            <span className="text-4xl font-black text-[#111111]">{formatCurrency(animatedValue)}</span>
            <span className="text-sm text-green-600 font-bold mt-1">+12% vs. mês anterior</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-[#111111] w-[71%]"></div>
          </div>
        </motion.section>

        {/* Recomendação Diária */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-3 md:row-span-2 bg-[#111111] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
               <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-wider">Meta Diária Recomendada</span>
               <h3 className="text-4xl font-black mt-2 text-white">{formatCurrency(metaDiaria)}</h3>
               <p className="text-xs text-[#D4AF37] mt-2 font-medium">Baseado em <strong>{diasRestantes} dias úteis</strong> restantes ({viewMode})</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-1">
                <div className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded text-[10px] font-bold uppercase">Foco: Ticket Médio</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp className="w-32 h-32 text-[#D4AF37]" />
          </div>
        </motion.section>

        {/* Níveis de Meta */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-6 md:row-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Progresso por Nível</span>
            <span className="text-xs bg-[#D4AF37]/20 text-[#8c7424] px-2 py-1 rounded-full font-bold">Nível 2 Ativo</span>
          </div>
          <div className="relative py-4">
            <div className="h-3 w-full bg-gray-100 rounded-full flex overflow-hidden">
              <div className="h-full bg-green-500 w-[40%] border-r border-white relative group">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="h-full bg-[#D4AF37] w-[31%] border-r border-white relative group">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="h-full bg-gray-200 w-[29%]"></div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-tighter text-center">
              <div className="w-[40%] text-left">
                <span className="block text-green-600">Nível 1 (Básico)</span>
                <span>R$ 25k</span>
              </div>
              <div className="w-[31%] text-left">
                <span className="block text-[#a88a2a]">Nível 2 (Desafio)</span>
                <span>R$ 50k</span>
              </div>
              <div className="w-[29%] text-right">
                <span className="block text-gray-400">Nível 3 (Superação)</span>
                <span>R$ 75k</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Resumo da Equipe (Movido para cima) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-12 md:row-span-2 bg-[#111111] rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" /> Desempenho Diário por Vendedora (Qtd & Receita)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            {mockSellerQuantity.map((seller, idx) => {
              const goal = 16000; 
              const percent = Math.min(100, Math.round((seller.revenue / goal) * 100));
              return (
                <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#111111] font-bold text-sm shrink-0">
                      {seller.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{seller.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{seller.quantity} ITENS VENDIDOS</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col mb-2">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xl font-black text-white">{formatCurrency(seller.revenue)}</span>
                      <span className="text-xs font-bold text-[#D4AF37]">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-white/40">Meta Indiv.: {formatCurrency(goal)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-white/40">Ticket Médio</span>
                        <span className="text-sm font-bold text-white">{formatCurrency(seller.ticketMedio)}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-bold text-white/40">Condicionais</span>
                        <span className="text-sm font-bold text-white">{seller.condicionais} enviadas</span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Evolução de Vendas */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.4 }}
          className="md:col-span-8 md:row-span-4 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col"
        >
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-6">Tendência de Vendas Acumuladas</span>
          <div className="flex-1 min-h-[150px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} fontSize={10} tick={{ fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <YAxis hide={true} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#111111' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#111111" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Forecast Mensal */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.5 }}
          className="md:col-span-4 md:row-span-4 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
        >
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Forecast Mensal</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-4xl font-black text-[#111111]">{formatCurrency(64200)}</span>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center">+7% <TrendingUp className="w-3 h-3 ml-1" /></span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-4">Projeção calculada automaticamente com base no ritmo atual e histórico de repetição das vendedoras ativas.</p>
          <div className="h-px bg-gray-100 my-4"></div>
          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
            <span>Ticket Médio da Loja</span>
            <span className="text-[#111111]">{formatCurrency(242)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-gray-500 mt-2">
            <span>Clientes Atendidos</span>
            <span className="text-[#111111]">{clientesAtendidos}</span>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
