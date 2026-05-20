import { formatCurrency, calculateRemainingWorkingDays } from '@/lib/utils';
import { Star, Target, Calendar, ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

export function VendedoraDashboard() {
  const metaNoMês = 40000;
  const realizado = 25000;
  const percentual = (realizado / metaNoMês) * 100;
  
  const today = new Date();
  const remainingDays = calculateRemainingWorkingDays(today, today.getMonth(), today.getFullYear(), []);
  
  const faltamHoje = (metaNoMês - realizado) / remainingDays;
  const unidadesHoje = Math.ceil(faltamHoje / 175); // assuming 175 ticket medio
  const totalVendidas = 142; // mock value

  return (
    <div className="flex flex-col h-auto min-h-full gap-6 pb-16 md:pb-10 font-sans max-w-5xl mx-auto w-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#111111] tracking-tight">Olá, Mariana!</h1>
          <p className="text-sm text-[#D4AF37] font-bold uppercase tracking-widest">Nível atual: Vendedora Desafio</p>
        </div>
        <div className="hidden sm:block">
          <Badge className="bg-[#111111] text-[#D4AF37] hover:bg-[#222] px-4 py-2 text-xs font-bold uppercase rounded-lg border-none shadow-md">
            <Star className="w-3 h-3 mr-2 fill-current" /> Nível 2
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Meta do Mês</span>
          </div>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-[#111111]">{formatCurrency(realizado)}</span>
            <span className="text-sm text-gray-500 font-bold ml-2">/ {formatCurrency(metaNoMês)}</span>
          </div>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-500">
              <span>Progresso Realizado</span>
              <span className="text-[#D4AF37]">{percentual.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full flex overflow-hidden">
               <div className="h-full bg-[#111111] transition-all" style={{ width: `${percentual}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Próximo nível (Superação) aos {formatCurrency(50000)}</p>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#111111] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-wider flex items-center">
                <Target className="w-4 h-4 mr-2" /> O que fazer hoje
              </span>
              <h3 className="text-4xl font-black mt-4">{formatCurrency(faltamHoje)}</h3>
              <span className="text-gray-300 text-sm mt-1 block">Meta recomendada para o dia</span>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl p-4 backdrop-blur-sm border border-[#D4AF37]/20">
                <ShoppingBagIcon className="w-5 h-5 mr-3" />
                <span>Isso equivale a <strong>~{unidadesHoje} peças</strong></span>
              </div>
              
              <button className="w-full bg-[#D4AF37] text-[#111111] py-3 rounded-xl font-bold shadow-md hover:bg-[#c4a132] transition-colors">
                Registrar Venda
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Métricas & Pendências</span>
        
        <div className="grid gap-3 md:grid-cols-3">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm transition-colors cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#111111] shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm">{totalVendidas} itens vendidos</h4>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Total no mês</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 border border-gray-200 rounded-3xl p-5 bg-white shadow-sm hover:border-[#D4AF37] transition-colors cursor-pointer group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#997f2e] shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm">2 Condicionais Abertas</h4>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Follow-up hoje</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
          </div>

          <div className="col-span-1 border border-gray-200 rounded-3xl p-5 bg-white shadow-sm hover:border-[#D4AF37] transition-colors cursor-pointer group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111111]/10 flex items-center justify-center text-[#111111] shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm">Revisar Meta Semanal</h4>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Gaps identificados</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
