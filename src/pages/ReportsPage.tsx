import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockTeam = [
  { id: 1, name: 'Mariana', level: 'Desafio', progress: 62, realized: 25000, target: 40000, items: 145 },
  { id: 2, name: 'Julia', level: 'Alvo', progress: 100, realized: 31000, target: 30000, items: 198 },
  { id: 3, name: 'Ana', level: 'Básico', progress: 85, realized: 17000, target: 20000, items: 92 },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios da Equipe</h1>
          <p className="text-gray-500">Acompanhamento detalhado por vendedora.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho no Mês Atual</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="pl-6">Vendedora</TableHead>
                <TableHead>Volume (R$)</TableHead>
                <TableHead>Peças</TableHead>
                <TableHead>Nível Atual</TableHead>
                <TableHead className="w-[30%]">Progresso da Meta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTeam.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="pl-6 font-medium">{member.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(member.realized)}</span>
                      <span className="text-xs text-gray-400">Meta: {formatCurrency(member.target)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.items}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      member.progress >= 100 ? 'border-green-200 text-green-700 bg-green-50' : ''
                    }>
                      {member.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{member.progress.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={member.progress > 100 ? 100 : member.progress} 
                        indicatorClassName={member.progress >= 100 ? "bg-green-500" : "bg-[#0B6E8F]"} 
                        className="w-full bg-gray-100 h-2" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-4">
         <Card>
           <CardHeader>
             <CardTitle className="text-base text-gray-700">Destaques (Top 3 Ticket Médio)</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <div className="font-medium text-gray-800">1. Julia</div>
                  <div className="font-bold text-[#0B6E8F]">{formatCurrency(156.56)}</div>
                </div>
                <div className="flex justify-between items-center p-3">
                  <div className="font-medium text-gray-600">2. Mariana</div>
                  <div className="font-medium text-gray-700">{formatCurrency(172.41)}</div>
                </div>
                <div className="flex justify-between items-center p-3">
                  <div className="font-medium text-gray-600">3. Ana</div>
                  <div className="font-medium text-gray-700">{formatCurrency(184.78)}</div>
                </div>
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
