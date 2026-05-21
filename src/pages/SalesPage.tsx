import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Plus, Filter, UploadCloud, FileImage, FileSpreadsheet, CheckCircle2, ArrowRight, Pencil, Trash2, History, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData, Sale } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function SalesPage() {
  const { sales, addSale, updateSale, deleteSale, sellers, auditLogs, stores, selectedPeriod, setSelectedPeriod, periods } = useData();
  const { role: userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'lancamentos' | 'historico'>('lancamentos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Partial<Sale> | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success'>('idle');
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [sellerFilter, setSellerFilter] = useState<string>('todas');
  const [visibleCount, setVisibleCount] = useState(15);
  const [dateOrder, setDateOrder] = useState<'asc' | 'desc'>('asc'); // Default ascending as requested
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 15);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget]);

  const handleImport = () => {
    setImportStatus('uploading');
    setAnalyzeStep(0);
    setTimeout(() => {
      setImportStatus('analyzing');
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setAnalyzeStep(step);
        if (step >= 6) {
          clearInterval(interval);
          setImportStatus('success');
        }
      }, 400);

    }, 1500);
  };

  const completeImport = () => {
    setIsImportModalOpen(false);
    toast.success("Importação de dados concluída.");
  };

  const filteredSales = useMemo(() => {
    const matched = sales.filter((sale) => {
      const sellerMatch = sellerFilter === 'todas' || sale.vendedora === sellerFilter;
      const periodMatch = !sale.date || sale.date.startsWith(selectedPeriod);
      return sellerMatch && periodMatch;
    });
    return [...matched].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sales, sellerFilter, dateOrder, selectedPeriod]);

  const visibleSales = filteredSales.slice(0, visibleCount);

  // Grouping Sales by Calendar Day
  const salesGroupedByDay = useMemo(() => {
    const groups: { dayKey: string; dateObj: Date; salesList: Sale[] }[] = [];
    
    visibleSales.forEach(sale => {
      const dateObj = new Date(sale.date);
      const dayKey = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const capitalizedKey = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
      
      const existing = groups.find(g => g.dayKey === capitalizedKey);
      if (existing) {
        existing.salesList.push(sale);
      } else {
        groups.push({
          dayKey: capitalizedKey,
          dateObj,
          salesList: [sale]
        });
      }
    });
    
    return groups;
  }, [visibleSales]);

  const handleSave = () => {
    if (!editingSale?.amount || editingSale.amount <= 0) {
      toast.error('Informe um valor de venda válido.');
      return;
    }
    
    const selectedStoreId = editingSale.storeId || stores[0]?.id || 'loja-1';
    const selectedSeller = editingSale.vendedora || sellers[0]?.name || 'Ana Paula';
    const selectedPecas = Number(editingSale.pecasVendidas) || 1;
    const selectedClientes = Number(editingSale.clientesAtendidos) || 1;
    const selectedVendas = Number(editingSale.vendasFeitas) || 1;
    const selectedCondicionais = Number(editingSale.condicionaisEnviadas) || 0;
    const selectedPosVendas = Number(editingSale.posVendasFeitos) || 0;
    const selectedFollowUps = Number(editingSale.followUpsFeitos) || 0;
    const selectedMensagens = Number(editingSale.novasMensagensEnviadas) || 0;

    const selectedItem = editingSale?.item || 'Vestido Midi Seda';

    if (editingSale?.id) {
      updateSale(editingSale.id, {
        ...editingSale,
        amount: Number(editingSale.amount),
        vendedora: selectedSeller,
        storeId: selectedStoreId,
        pecasVendidas: selectedPecas,
        clientesAtendidos: selectedClientes,
        vendasFeitas: selectedVendas,
        condicionaisEnviadas: selectedCondicionais,
        posVendasFeitos: selectedPosVendas,
        followUpsFeitos: selectedFollowUps,
        novasMensagensEnviadas: selectedMensagens,
        status: editingSale.status || 'Fechada',
        condicional: editingSale.status === 'Condicional' || selectedCondicionais > 0,
        item: selectedItem
      }, userRole);
      toast.success("Lançamento atualizado com sucesso.");
    } else {
      addSale({
        date: editingSale?.date || new Date().toISOString(),
        vendedora: selectedSeller,
        storeId: selectedStoreId,
        amount: Number(editingSale.amount),
        status: editingSale?.status || 'Fechada',
        condicional: editingSale?.status === 'Condicional' || selectedCondicionais > 0,
        clientesAtendidos: selectedClientes,
        vendasFeitas: selectedVendas,
        condicionaisEnviadas: selectedCondicionais,
        pecasVendidas: selectedPecas,
        posVendasFeitos: selectedPosVendas,
        followUpsFeitos: selectedFollowUps,
        novasMensagensEnviadas: selectedMensagens,
        item: selectedItem,
      }, userRole);
      toast.success("Venda registrada com sucesso.");
    }
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111]">Lançamentos Diários</h1>
          <p className="text-gray-500 text-sm">Registre as vendas diárias, condicionais e peças vendidas, ou importe relatórios do sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          
          <Dialog open={isImportModalOpen} onOpenChange={(open) => {
            setIsImportModalOpen(open);
            if (!open) setImportStatus('idle');
          }}>
            <DialogTrigger render={
              <Button variant="outline" className="border-gray-250 text-gray-700 bg-white hover:bg-gray-50">
                <UploadCloud className="w-4 h-4 mr-2" /> Importar Dados
              </Button>
            } />
            <DialogContent className="sm:max-w-md bg-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-extrabold text-gray-800">Importar Relatório de Vendas</DialogTitle>
              </DialogHeader>
              
              {importStatus === 'idle' && (
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    Faça o upload de uma foto do fechamento de caixa ou de uma planilha de vendas. A IA analisará as informações e distribuirá os valores por loja e vendedora.
                  </p>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-gray-50 hover:bg-gray-100 hover:border-[#D4AF37] transition-colors cursor-pointer" onClick={handleImport}>
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#111111] border border-gray-100">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#111111] border border-gray-100">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="font-bold text-[#111111] text-center text-sm">Clique para enviar ou arraste o arquivo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF ou CSV</p>
                  </div>
                </div>
              )}

              {importStatus === 'uploading' && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-[#111111]">Enviando relatório...</p>
                </div>
              )}

              {importStatus === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#111111] rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-[#111111]">Analisando dados com inteligência artificial...</p>
                  <p className="text-xs text-gray-500 mt-2">Mapeando lançamentos {Math.min(analyzeStep, 6)} de 6...</p>
                  <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-[#111111] h-full transition-all duration-300" style={{ width: `${(Math.min(analyzeStep, 6) / 6) * 100}%` }}></div>
                  </div>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="font-extrabold text-xl text-[#111111]">Importação Finalizada!</h3>
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 my-4 w-full text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-bold">Total Lançamentos:</span>
                      <span className="font-bold text-[#111111] text-xs">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-bold font-sans">Valor Total Identificado:</span>
                      <span className="font-black text-xs text-green-700">{formatCurrency(97321.96)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-6 font-medium">Os registros foram importados e distribuídos com sucesso.</p>
                  <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-zinc-800 rounded-xl" onClick={completeImport}>
                    Mapear no Relatório <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isModalOpen || isEditModalOpen} onOpenChange={(open) => {
             if(isModalOpen) setIsModalOpen(open);
             if(isEditModalOpen) setIsEditModalOpen(open);
             if(!open) setEditingSale(null);
          }}>
            <DialogTrigger render={
              <Button className="bg-[#111111] text-[#D4AF37] hover:bg-zinc-800 font-bold shadow-sm" onClick={() => { setEditingSale(null); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
              </Button>
            } />
            <DialogContent className="bg-white rounded-3xl max-w-lg shadow-2xl border border-gray-100">
              <DialogHeader className="border-b pb-3 border-gray-100">
                <DialogTitle className="font-extrabold text-[#111111] text-lg flex items-center gap-2">
                  {editingSale?.id ? '✏️ Editar Lançamento de Vendas' : '📝 Registrar Lançamento Diário'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500">Valor do Lançamento (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-gray-400">R$</span>
                      <Input
                        type="number"
                        value={editingSale?.amount === undefined || editingSale?.amount === null ? '' : editingSale.amount}
                        onChange={e => setEditingSale(prev => ({...(prev || {}), amount: e.target.value === '' ? undefined : Number(e.target.value)}))}
                        placeholder="0.00"
                        className="pl-9 font-extrabold text-base border-gray-200 focus-visible:ring-[#D4AF37] focus-visible:border-[#D4AF37] h-11 rounded-xl shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500">Data / Hora</Label>
                    <Input
                      type="datetime-local"
                      className="h-11 text-xs text-gray-700 shadow-sm border-gray-200 rounded-xl"
                      value={editingSale?.date ? new Date(new Date(editingSale.date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                      onChange={e => setEditingSale(prev => ({...(prev || {}), date: e.target.value ? new Date(e.target.value).toISOString() : undefined}))}
                    />
                  </div>
                </div>


                      {/* Micro-inputs with responsive increment controls */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-b py-4 border-gray-100">
                  {/* Clientes Atendidos */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Clientes Atendidos</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(1, (editingSale?.clientesAtendidos || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), clientesAtendidos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.clientesAtendidos === undefined || editingSale?.clientesAtendidos === null ? '' : editingSale.clientesAtendidos}
                        onChange={e => {
                          const num = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), clientesAtendidos: num as any}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.clientesAtendidos || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), clientesAtendidos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Vendas Feitas */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Vendas Concluídas</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(1, (editingSale?.vendasFeitas || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), vendasFeitas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.vendasFeitas === undefined || editingSale?.vendasFeitas === null ? '' : editingSale.vendasFeitas}
                        onChange={e => {
                          const num = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), vendasFeitas: num as any}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.vendasFeitas || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), vendasFeitas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Peças Vendidas */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Peças Vendidas</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(1, (editingSale?.pecasVendidas || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), pecasVendidas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.pecasVendidas === undefined || editingSale?.pecasVendidas === null ? '' : editingSale.pecasVendidas}
                        onChange={e => {
                          const num = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), pecasVendidas: num as any}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.pecasVendidas || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), pecasVendidas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Condicionais Enviadas */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Condicionais Env.</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(0, (editingSale?.condicionaisEnviadas || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), condicionaisEnviadas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.condicionaisEnviadas === undefined || editingSale?.condicionaisEnviadas === null ? '' : editingSale.condicionaisEnviadas}
                        onChange={e => {
                          const num = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), condicionaisEnviadas: num as any}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.condicionaisEnviadas || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), condicionaisEnviadas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pós-Vendas Feitos no Dia */}
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/40 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Pós-Vendas Feitos</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(0, (editingSale?.posVendasFeitos || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), posVendasFeitos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-[#fffbeb] text-amber-900 border border-amber-250/50 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.posVendasFeitos === undefined || editingSale?.posVendasFeitos === null ? 0 : editingSale.posVendasFeitos}
                        onChange={e => {
                          const num = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), posVendasFeitos: num}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.posVendasFeitos || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), posVendasFeitos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-[#fffbeb] text-amber-900 border border-amber-250/50 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Follow-ups Feitos */}
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/40 flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Follow-Up Feitos</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(0, (editingSale?.followUpsFeitos || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), followUpsFeitos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-[#fffbeb] text-amber-900 border border-amber-250/50 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.followUpsFeitos === undefined || editingSale?.followUpsFeitos === null ? 0 : editingSale.followUpsFeitos}
                        onChange={e => {
                          const num = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), followUpsFeitos: num}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.followUpsFeitos || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), followUpsFeitos: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-[#fffbeb] text-amber-900 border border-amber-250/50 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Novas Mensagens Enviadas */}
                  <div className="p-3 bg-cyan-50/40 rounded-2xl border border-cyan-200/30 flex flex-col justify-between gap-1 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">SMS / Mensagens Env.</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(0, (editingSale?.novasMensagensEnviadas || 0) - 1);
                          setEditingSale(prev => ({...(prev || {}), novasMensagensEnviadas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-cyan-50/50 text-cyan-900 border border-cyan-250/30 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editingSale?.novasMensagensEnviadas === undefined || editingSale?.novasMensagensEnviadas === null ? 0 : editingSale.novasMensagensEnviadas}
                        onChange={e => {
                          const num = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                          setEditingSale(prev => ({...(prev || {}), novasMensagensEnviadas: num}));
                        }}
                        className="w-8 bg-transparent text-center font-black text-xs text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (editingSale?.novasMensagensEnviadas || 0) + 1;
                          setEditingSale(prev => ({...(prev || {}), novasMensagensEnviadas: val}));
                        }}
                        className="w-8 h-8 bg-white hover:bg-cyan-50/50 text-cyan-900 border border-cyan-250/30 rounded-xl flex items-center justify-center font-black text-sm select-none active:scale-95 transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Selections and controls */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500">Vendedora Responsável</Label>
                    <Select value={editingSale?.vendedora || (sellers[0]?.name)} onValueChange={v => setEditingSale(prev => ({...(prev || {}), vendedora: v}))}>
                      <SelectTrigger className="w-full text-xs h-10 border-gray-200 shadow-sm bg-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sellers.map(s => <SelectItem key={s.id} value={s.name} className="text-xs font-semibold">{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Loja de Origem selection controls */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500">Loja de Origem</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {stores.map(store => {
                          const isSelected = (editingSale?.storeId || stores[0]?.id) === store.id;
                          return (
                            <button
                              key={store.id}
                              type="button"
                              onClick={() => setEditingSale(prev => ({...(prev || {}), storeId: store.id}))}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#111111] text-[#D4AF37] border-[#D4AF37] shadow-sm font-black'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#D4AF37]' : 'bg-gray-300'}`} />
                              {store.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Select buttons */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500">Status</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { value: 'Fechada', label: 'Fechada', icon: '💰' },
                          { value: 'Condicional', label: 'Condig', icon: '📦' },
                          { value: 'Devolução', label: 'Devol', icon: '🔄' }
                        ].map(opt => {
                          const isSelected = (editingSale?.status || 'Fechada') === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setEditingSale(prev => ({...(prev || {}), status: opt.value as any, condicional: opt.value === 'Condicional'}))}
                              className={`py-2 px-1 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                                isSelected
                                  ? 'bg-[#111111] text-[#D4AF37] border-[#D4AF37] shadow-sm font-black'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <span className="text-xs">{opt.icon}</span>
                              <span className="truncate">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-zinc-800 mt-6 rounded-xl font-bold py-5" onClick={handleSave}>
                  Salvar Registro de Lançamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-all duration-150 ${
            activeTab === 'lancamentos'
              ? 'border-[#111111] text-[#111111] font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Lançamentos Recentes
        </button>
        {(userRole === 'admin' || userRole === 'gerente') && (
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === 'historico'
                ? 'border-[#D4AF37] text-gray-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
            Histórico de Alterações dos Lançamentos (Admin)
          </button>
        )}
      </div>

      {activeTab === 'lancamentos' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 shadow-sm text-xs font-bold">
                  <SelectValue placeholder="Filtrar Vendedora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas" className="text-xs font-semibold">Todas as Vendedoras</SelectItem>
                  {sellers.map(s => <SelectItem key={s.id} value={s.name} className="text-xs font-semibold">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 shadow-sm text-xs font-bold">
                  <SelectValue placeholder="Filtrar Período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-xs font-semibold">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setDateOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="h-9 px-3 gap-1.5 text-xs font-bold border-gray-200 bg-white shadow-sm hover:bg-slate-50"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                Ordenação: {dateOrder === 'asc' ? 'Ordem Crescente (Data) ↑' : 'Ordem Decrescente (Data) ↓'}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 font-medium">
              Listando <span className="font-black text-[#111111]">{visibleSales.length}</span> de <span className="font-black text-[#111111]">{filteredSales.length}</span> lançamentos.
            </div>
          </div>

          <div className="space-y-8 mt-4">
            {salesGroupedByDay.map(({ dayKey, salesList }) => {
              const dayTotalAmount = salesList.reduce((acc, curr) => acc + curr.amount, 0);
              const dayTotalPecas = salesList.reduce((acc, curr) => acc + (curr.pecasVendidas || 0), 0);
              
              return (
                <div key={dayKey} className="space-y-3 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-[#111111] text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="font-extrabold text-xs tracking-tight text-[#D4AF37] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-ping" />
                      {dayKey}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="border-[#D4AF37]/35 text-[#D4AF37] text-[10px] font-black px-2 py-0.5 uppercase bg-white/5">
                        Lançado: {formatCurrency(dayTotalAmount)}
                      </Badge>
                      <Badge variant="outline" className="border-gray-800 text-gray-300 text-[10px] font-bold px-2 py-0.5 uppercase bg-white/5">
                        Volume: {dayTotalPecas} Peças
                      </Badge>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <Table className="min-w-[950px]">
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-6 font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2 w-[12%]">Horário</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2">Vendedora</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2">Loja</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2">Valor, Volume & Peça</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2">Métricas de Conversão (Por Cliente)</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider py-2">Status</TableHead>
                          <TableHead className="font-bold text-gray-400 uppercase text-[9px] tracking-wider text-right pr-6 py-2">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesList.map((sale, idx) => {
                          const storeObj = stores.find(s => s.id === sale.storeId);
                          const storeName = storeObj ? storeObj.name : 'Geral';
                          
                          const listClients = sale.clientesAtendidos || 0;
                          const listSales = sale.vendasFeitas || 0;
                          const conversionValue = listClients > 0 ? (listSales / listClients) * 100 : 0;
                          const calculatedTicket = listSales > 0 ? sale.amount / listSales : 0;
                          
                          // Line colors alternate row-by-row inside the same day group
                          const bgClass = idx % 2 === 0 
                            ? 'bg-slate-50/70 border-l-4 border-l-[#D4AF37]/80 hover:bg-slate-100/60' 
                            : 'bg-white border-l-4 border-l-zinc-300 hover:bg-zinc-50/60';

                          return (
                            <TableRow key={sale.id} className={`${bgClass} transition-colors border-b border-gray-150`}>
                              <TableCell className="pl-6 py-3.5 font-semibold text-xs text-[#111111] whitespace-nowrap">
                                <span className="text-gray-400 font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded mr-1">Fração</span>
                                {new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </TableCell>
                              <TableCell className="font-extrabold text-xs text-zinc-900">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-black text-sm text-[#111111]">{sale.vendedora}</span>
                                  <span className="text-[9px] text-[#A88A2A] font-extrabold uppercase tracking-widest">Team Staff</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5 font-black text-xs text-slate-700">
                                <Badge className="bg-sky-50 text-sky-800 border-sky-100 uppercase text-[10px] font-black rounded-lg px-2 py-0.5">
                                  {storeName}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <div className="flex flex-col gap-1">
                                  <span className="font-black text-xs text-[#111111]">{formatCurrency(sale.amount)}</span>
                                  <span className="text-[10px] text-gray-500 font-bold">{sale.pecasVendidas || 0} peças vendidas</span>
                                  {false && (
                                    <div className="mt-1">
                                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 font-extrabold px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                                        👚 {sale.item}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Atendidos:</span>
                                    <span className="font-black text-xs text-zinc-700">{listClients}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Vendas:</span>
                                    <span className="font-black text-xs text-zinc-700">{listSales}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Ticket Médio:</span>
                                    <span className="font-black text-xs text-green-700">{formatCurrency(calculatedTicket)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Tx. Conversão:</span>
                                    <span className={`text-xs font-black ${conversionValue >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                      {conversionValue.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 col-span-2">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Condicionais Enviados:</span>
                                    <span className="font-black text-xs text-[#0B6E8F]">{sale.condicionaisEnviadas || 0} un.</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <Badge variant={sale.condicional ? 'outline' : 'default'} className={
                                  sale.status === 'Condicional' ? 'bg-[#D4AF37]/10 text-[#a88a2a] border-[#D4AF37]/35 font-bold text-[10px]' : 
                                  sale.status === 'Fechada' ? 'bg-[#111111] text-[#D4AF37] font-bold text-[10px]' : 'bg-gray-100 text-gray-600 font-bold text-[10px]'
                                }>
                                  {sale.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right pr-6 py-3.5 whitespace-nowrap">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => { setEditingSale(sale); setIsEditModalOpen(true); }} 
                                  className="text-gray-400 hover:text-[#111111] h-8 w-8"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => { deleteSale(sale.id, userRole); toast.success("Lançamento excluído com sucesso."); }} 
                                  className="text-gray-400 hover:text-red-500 h-8 w-8"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}

            {visibleCount < filteredSales.length && (
              <div className="py-6 text-center text-gray-500 text-sm font-semibold">
                <span ref={observerTarget} className="flex items-center justify-center gap-2">
                  Carregando mais lançamentos diários...
                </span>
              </div>
            )}

            {filteredSales.length === 0 && (
              <div className="text-center py-12 text-gray-400 font-semibold bg-white rounded-3xl border p-4">
                Nenhum lançamento encontrado para a vendedora ou período selecionado.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Trilha de Auditoria Geral (Exclusivo Gerente / Admin)</h4>
              <p className="text-xs text-amber-700/80 mt-1">Este log do sistema registra todas as criações, edições e exclusões de lançamentos diários para auditoria de desempenho e prevenção de inconsistências no fechamento.</p>
            </div>
          </div>

          <Card className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <CardHeader className="py-4 border-b bg-gray-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111111]">
                <History className="w-5 h-5 text-[#D4AF37]" />
                Registros de Alterações e Edições
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="pl-6 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Registro (Data/Hora)</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Ação</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Executor</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Vendedora</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Valor Vinculado</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider pr-6">Detalhe da Operação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50 transition-colors border-b">
                        <TableCell className="pl-6 py-4 text-xs font-semibold text-[#111111] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString('pt-BR')} 
                          <span className="text-gray-400 font-normal ml-2">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                            log.action === 'Criação' ? 'bg-green-100/80 text-green-700' :
                            log.action === 'Edição' ? 'bg-amber-100/80 text-amber-700' :
                            'bg-red-100/80 text-red-700'
                          }`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#111111] text-[#D4AF37] uppercase">
                            {log.userRole || 'Gerente'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 font-bold text-xs text-[#2F2F2F]">{log.vendedora}</TableCell>
                        <TableCell className="py-4 font-black text-xs text-[#111111]">{formatCurrency(log.amount)}</TableCell>
                        <TableCell className="py-4 text-xs font-medium text-gray-500 pr-6">{log.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-gray-400 text-sm font-medium">
                        Nenhuma alteração registrada ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
