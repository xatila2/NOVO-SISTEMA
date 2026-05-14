import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Plus, Filter, UploadCloud, FileImage, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialMockSales = [
  { id: '1', date: '2026-05-13T10:30:00Z', vendedora: 'Ana Paula', amount: 350.00, status: 'Fechada', condicional: false },
  { id: '2', date: '2026-05-13T11:15:00Z', vendedora: 'Beatriz R.', amount: 890.50, status: 'Condicional', condicional: true },
  { id: '3', date: '2026-05-13T12:00:00Z', vendedora: 'Ana Paula', amount: 120.00, status: 'Fechada', condicional: false },
  { id: '4', date: '2026-05-12T16:45:00Z', vendedora: 'Carla T.', amount: 450.00, status: 'Devolução', condicional: false },
];

export function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success'>('idle');
  const [sales, setSales] = useState(initialMockSales);

  const handleImport = () => {
    setImportStatus('uploading');
    setTimeout(() => {
      setImportStatus('analyzing');
      setTimeout(() => {
        setImportStatus('success');
      }, 1500);
    }, 1500);
  };

  const completeImport = () => {
    const importedSales = [
      { id: 'import_1', date: '2025-12-31T18:00:00Z', vendedora: 'Kelinha', amount: 15659.99, status: 'Fechada', condicional: false },
      { id: 'import_2', date: '2025-12-31T18:00:00Z', vendedora: 'Helen', amount: 16421.99, status: 'Fechada', condicional: false },
      { id: 'import_3', date: '2025-12-31T18:00:00Z', vendedora: 'Dheinielly', amount: 27468.98, status: 'Fechada', condicional: false },
      { id: 'import_4', date: '2025-12-31T18:00:00Z', vendedora: 'Iasmim', amount: 8180.00, status: 'Fechada', condicional: false },
      { id: 'import_5', date: '2025-12-31T18:00:00Z', vendedora: 'Jaine', amount: 26864.00, status: 'Fechada', condicional: false },
      { id: 'import_6', date: '2025-12-31T18:00:00Z', vendedora: 'Yasmin Jussara', amount: 2727.00, status: 'Fechada', condicional: false },
    ];
    setSales([...importedSales, ...sales]);
    setIsImportModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111]">Lançamentos Diários</h1>
          <p className="text-gray-500">Registre vendas manualmente ou importe relatórios do sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          
          <Dialog open={isImportModalOpen} onOpenChange={(open) => {
            setIsImportModalOpen(open);
            if (!open) setImportStatus('idle');
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#111111] text-[#111111] hover:bg-gray-50">
                <UploadCloud className="w-4 h-4 mr-2" /> Importar Dados
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar Relatório de Vendas</DialogTitle>
              </DialogHeader>
              
              {importStatus === 'idle' && (
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    Faça o upload de uma foto do fechamento (cupom fiscal/extrato ERP) ou uma planilha CSV. A IA irá analisar e vincular os valores às vendedoras.
                  </p>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 hover:border-[#D4AF37] transition-colors cursor-pointer" onClick={handleImport}>
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#111111]">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#111111]">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="font-bold text-[#111111] text-center">Clique para enviar ou arraste o arquivo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF ou CSV</p>
                  </div>
                </div>
              )}

              {importStatus === 'uploading' && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-[#111111]">Enviando arquivo...</p>
                </div>
              )}

              {importStatus === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#111111] rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-[#111111]">Analisando dados com IA...</p>
                  <p className="text-xs text-gray-500 mt-2">Extraindo vendedoras, datas e valores</p>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="font-bold text-xl text-[#111111]">Importação Concluída!</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-6">Foram identificados 6 registros de vendas no valor total de R$ 97.321,96 (Relatório 01/12 a 31/12).</p>
                  <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-[#222]" onClick={completeImport}>
                    Concluir e Ver Registros <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#111111] text-[#D4AF37] hover:bg-[#222] font-bold">
                <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Venda / Condicional (Manual)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Itens</Label>
                    <Input type="number" placeholder="1" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qtd. Clientes Atendidos</Label>
                    <Input type="number" placeholder="Ex: 1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Condicionais Enviadas</Label>
                    <Input type="number" placeholder="Ex: 0" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Data</Label>
                     <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-2">
                     <Label>Tipo</Label>
                     <Select defaultValue="venda">
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="venda">Venda Fechada</SelectItem>
                         <SelectItem value="condicional">Condicional</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label>Vendedora</Label>
                  <Select defaultValue="ana">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Ana Paula</SelectItem>
                      <SelectItem value="beatriz">Beatriz R.</SelectItem>
                      <SelectItem value="carla">Carla T.</SelectItem>
                      <SelectItem value="diana">Diana M.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-[#222]" onClick={() => setIsModalOpen(false)}>Salvar Registro</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-3xl border-gray-200 overflow-hidden shadow-sm">
        <CardHeader className="py-4 flex flex-row items-center justify-between border-b bg-gray-50">
          <div className="flex gap-2 text-sm font-bold">
            <Button variant="ghost" size="sm" className="h-8 text-[#111111] bg-white shadow-sm ring-1 ring-gray-200">Todas</Button>
            <Button variant="ghost" size="sm" className="h-8 text-gray-500">Condicionais</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-gray-500 bg-white">
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-gray-500 bg-white">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-bold text-gray-400 uppercase text-xs">Data/Hora</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">Vendedora</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">Valor</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="pl-6 py-3 font-medium text-[#111111]">
                    {new Date(sale.date).toLocaleDateString('pt-BR')} <span className="text-gray-400 font-normal ml-2">{new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </TableCell>
                  <TableCell className="font-bold text-[#111111]">{sale.vendedora}</TableCell>
                  <TableCell className="font-black text-[#D4AF37]">{formatCurrency(sale.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.condicional ? 'outline' : 'default'} className={
                      sale.status === 'Condicional' ? 'bg-[#D4AF37]/10 text-[#a88a2a] border-[#D4AF37]/30 font-bold' : 
                      sale.status === 'Fechada' ? 'bg-[#111111] text-[#D4AF37] font-bold' : 'bg-gray-100 text-gray-600 font-bold'
                    }>
                      {sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

