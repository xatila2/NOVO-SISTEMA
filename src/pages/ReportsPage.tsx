import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Download, Filter, ArrowUpDown, CircleDollarSign, TrendingUp, Users, ShoppingBag, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';

export function ReportsPage() {
  const [levelFilter, setLevelFilter] = useState<string>('todos');
  const [minItems, setMinItems] = useState<string>('');
  const [minPerformance, setMinPerformance] = useState<string>('');
  const [sortBy, setSortBy] = useState<'realized' | 'items' | 'progress' | 'commissionEarned' | 'ticketMedio' | 'taxaConversao'>('realized');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { sales, sellers, levels, baseCommission, sellersTarget, stores, selectedPeriod, setSelectedPeriod, periods } = useData();

  // Dynamically aggregate sales per seller
  const teamData = useMemo(() => {
    return sellers.map(seller => {
      const sellerSales = sales.filter(s => s.vendedora === seller.name && s.date && s.date.startsWith(selectedPeriod));
      const totalVendido = sellerSales.reduce((acc, curr) => acc + curr.amount, 0);
      const totalClientesAtendidos = sellerSales.reduce((acc, curr) => acc + (curr.clientesAtendidos || 0), 0);
      const totalVendasFeitas = sellerSales.filter(s => s.vendedora === seller.name && s.status === 'Fechada').reduce((acc, curr) => acc + (curr.vendasFeitas || 0), 0);
      const totalCondicionaisEnviadas = sellerSales.reduce((acc, curr) => acc + (curr.condicionaisEnviadas || 0), 0);
      const totalPecasVendidas = sellerSales.reduce((acc, curr) => acc + (curr.pecasVendidas || 0), 0);
      const totalPosVendas = sellerSales.reduce((acc, curr) => acc + (curr.posVendasFeitos || 0), 0);
      const totalFollowUps = sellerSales.reduce((acc, curr) => acc + (curr.followUpsFeitos || 0), 0);
      const totalNovasMensagens = sellerSales.reduce((acc, curr) => acc + (curr.novasMensagensEnviadas || 0), 0);

      const ticketMedio = totalVendasFeitas > 0 ? totalVendido / totalVendasFeitas : 0;
      const taxaConversao = totalClientesAtendidos > 0 ? (totalVendasFeitas / totalClientesAtendidos) * 100 : 0;

      // Find target configuration
      const sellerTargetObj = sellersTarget.find(st => st.name === seller.name);
      const targetAmount = sellerTargetObj ? Number(sellerTargetObj.target) : 30000;
      const progress = targetAmount > 0 ? (totalVendido / targetAmount) * 100 : 0;

      // Find reached level and commission
      const sortedLevels = [...levels]
        .filter(l => l.amount && !isNaN(Number(l.amount)))
        .sort((a, b) => Number(a.amount) - Number(b.amount));
      
      let reachedLevel = null;
      let commissionRate = Number(baseCommission) || 1.0;

      for (const lvl of sortedLevels) {
        if (totalVendido >= Number(lvl.amount)) {
          reachedLevel = lvl;
          commissionRate = Number(lvl.commission);
        }
      }

      const commissionEarned = totalVendido * (commissionRate / 100);
      const storeObj = stores.find(s => s.id === seller.storeId);

      return {
        id: seller.id,
        name: seller.name,
        storeName: storeObj ? storeObj.name : 'Geral',
        realized: totalVendido,
        target: targetAmount,
        progress,
        items: totalPecasVendidas,
        clientesAtendidos: totalClientesAtendidos,
        vendasFeitas: totalVendasFeitas,
        condicionaisEnviadas: totalCondicionaisEnviadas,
        ticketMedio,
        taxaConversao,
        posVendas: totalPosVendas,
        followUps: totalFollowUps,
        novasMensagens: totalNovasMensagens,
        level: reachedLevel ? reachedLevel.name : 'Abaixo da Meta',
        commissionRate,
        commissionEarned
      };
    });
  }, [sales, sellers, levels, baseCommission, sellersTarget, stores, selectedPeriod]);

  const filteredTeam = useMemo(() => {
    return teamData
      .filter((member) => {
        if (levelFilter !== 'todos' && member.level !== levelFilter) return false;
        if (minItems !== '' && member.items < parseInt(minItems, 10)) return false;
        if (minPerformance !== '' && member.progress < parseInt(minPerformance, 10)) return false;
        return true;
      })
      .sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        return (a[sortBy] - b[sortBy]) * order;
      });
  }, [teamData, levelFilter, minItems, minPerformance, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const topTicketMedio = useMemo(() => {
    return [...teamData]
      .filter(t => t.ticketMedio > 0)
      .sort((a, b) => b.ticketMedio - a.ticketMedio)
      .slice(0, 3);
  }, [teamData]);

  const topConversao = useMemo(() => {
    return [...teamData]
      .filter(t => t.taxaConversao > 0)
      .sort((a, b) => b.taxaConversao - a.taxaConversao)
      .slice(0, 3);
  }, [teamData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111]">Dashboard de Comissões e Relatórios</h1>
          <p className="text-gray-500 text-sm">Visão consolidada de metas acumuladas, peças, conversões, ticket médio e comissão de cada vendedora.</p>
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-700 bg-white shadow-sm ring-1 ring-gray-100 hover:bg-gray-50/50 hidden sm:flex">
          <Download className="w-4 h-4 mr-2" /> Exportar Planilha
        </Button>
      </div>

      <Card className="rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/55 border-b border-gray-150 px-6 py-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-[#111111] text-base font-extrabold">Desempenho Geral no Período</CardTitle>
            <CardDescription className="text-xs">Clique nas colunas de Volume, Peças, Comissão, Ticket Médio e Conversão para ordenar.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ms-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[170px] bg-white text-xs h-9 border-gray-200 font-bold">
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

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[170px] bg-white text-xs h-9 border-gray-200">
                <SelectValue placeholder="Nível Atingido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Níveis</SelectItem>
                <SelectItem value="Abaixo da Meta">Abaixo da Meta</SelectItem>
                {levels.map(l => (
                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              placeholder="Mín. Peças" 
              className="w-[110px] bg-white text-xs h-9 border-gray-200" 
              value={minItems}
              onChange={(e) => setMinItems(e.target.value)}
            />
            <Input 
              type="number" 
              placeholder="Mín. Meta (%)" 
              className="w-[110px] bg-white text-xs h-9 border-gray-200" 
              value={minPerformance}
              onChange={(e) => setMinPerformance(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-gray-50/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Vendedora</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none" onClick={() => handleSort('realized')}>
                  <div className="flex items-center gap-1">Volume de Vendas <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none" onClick={() => handleSort('items')}>
                  <div className="flex items-center gap-1">Peças Vendidas <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Clientes Atendidos</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none" onClick={() => handleSort('ticketMedio')}>
                  <div className="flex items-center gap-1">Ticket Médio <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none" onClick={() => handleSort('taxaConversao')}>
                  <div className="flex items-center gap-1">Tx. Conversão <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Pós-Venda</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Follow-Up</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">SMS / Msg</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Nível Conquistado</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none" onClick={() => handleSort('commissionEarned')}>
                  <div className="flex items-center gap-1">Comissão Acumulada <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
                <TableHead className="w-[12%] font-bold text-gray-400 uppercase text-[10px] tracking-wider cursor-pointer select-none pr-6" onClick={() => handleSort('progress')}>
                   <div className="flex items-center gap-1">Progresso <ArrowUpDown className="w-3 h-3 text-[#D4AF37]"/></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeam.map((member) => {
                const hasReachedAny = member.level !== 'Abaixo da Meta';
                return (
                  <TableRow key={member.id} className="hover:bg-gray-50/70 border-b">
                    <TableCell className="pl-6 py-4.5 font-bold text-[#111111]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#111111] text-[#D4AF37] flex items-center justify-center font-extrabold text-xs border border-gray-200">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#111111] leading-none mb-1">{member.name}</p>
                          <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-500 uppercase px-1.5 py-0">
                            Loja: {member.storeName}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4.5">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-[#111111]">{formatCurrency(member.realized)}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Meta: {formatCurrency(member.target)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4.5 font-bold text-xs text-slate-700">{member.items} un.</TableCell>
                    <TableCell className="py-4.5 font-medium text-xs text-slate-500">{member.clientesAtendidos} atendimentos</TableCell>
                    <TableCell className="py-4.5 font-extrabold text-xs text-[#0B6E8F]">{formatCurrency(member.ticketMedio)}</TableCell>
                    <TableCell className="py-4.5">
                      <Badge className={`text-xs font-bold leading-none ${member.taxaConversao >= 70 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : member.taxaConversao >= 40 ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-50'}`}>
                        {member.taxaConversao.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4.5 text-xs font-semibold text-zinc-600">
                      {member.posVendas} contatos
                    </TableCell>
                    <TableCell className="py-4.5 text-xs font-semibold text-zinc-600">
                      {member.followUps} seguidos
                    </TableCell>
                    <TableCell className="py-4.5 text-xs font-semibold text-zinc-600">
                      {member.novasMensagens} envs.
                    </TableCell>
                    <TableCell className="py-4.5">
                      <Badge className={`text-xs font-black uppercase rounded-lg px-2.5 py-1 ${
                        hasReachedAny 
                          ? 'bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/45' 
                          : 'bg-gray-100 text-gray-400 font-bold'
                        }`}
                      >
                        {member.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4.5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-green-700">{formatCurrency(member.commissionEarned)}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic">Taxa Aplicada: {member.commissionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4.5 pr-6">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-extrabold text-gray-500 leading-none">
                          <span>{member.progress.toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={member.progress > 100 ? 100 : member.progress} 
                          indicatorClassName={member.progress >= 100 ? "bg-[#111111]" : "bg-[#D4AF37]"} 
                          className="w-full bg-slate-100 h-2 rounded-full" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredTeam.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500 font-semibold">Nenhum resultado de vendedora encontrado para os filtros.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm bg-white">
           <CardHeader className="bg-gray-50/50 py-4.5 px-6 border-b">
             <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-gray-700">
               <TrendingUp className="w-4 h-4 text-[#0B6E8F]" /> Top 3 Ticket Médio do Período
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4 space-y-3">
              {topTicketMedio.map((member, i) => (
                <div key={member.id} className="flex justify-between items-center bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                  <div className="font-bold text-xs text-gray-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0B6E8F] text-white flex items-center justify-center font-black text-[10px]">
                      {i + 1}
                    </span>
                    {member.name}
                  </div>
                  <div className="font-black text-sm text-[#0B6E8F]">{formatCurrency(member.ticketMedio)} <span className="text-[10px] text-gray-400 font-bold font-sans">/ venda</span></div>
                </div>
              ))}
              {topTicketMedio.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados para calcular médias.</p>
              )}
           </CardContent>
         </Card>

         <Card className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm bg-white">
           <CardHeader className="bg-gray-50/50 py-4.5 px-6 border-b">
             <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-gray-700">
               <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Top 3 Taxas de Conversão (%)
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4 space-y-3">
              {topConversao.map((member, i) => (
                <div key={member.id} className="flex justify-between items-center bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                  <div className="font-bold text-xs text-gray-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-gray-900 flex items-center justify-center font-black text-[10px]">
                      {i + 1}
                    </span>
                    {member.name}
                  </div>
                  <div className="font-black text-sm text-gray-800 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-lg">
                    {member.taxaConversao.toFixed(1)}% <span className="text-[10px] text-slate-400 font-medium">conversão</span>
                  </div>
                </div>
              ))}
              {topConversao.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados para calcular a taxa de conversão.</p>
              )}
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
