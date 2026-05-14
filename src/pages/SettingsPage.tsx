import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Level {
  id: string;
  name: string;
  amount: string;
  reward: string;
}

export function SettingsPage() {
  const [distributionMode, setDistributionMode] = useState<string>('global');
  const [timeDistributionMode, setTimeDistributionMode] = useState<string>('mensal');
  
  const [weeksTarget, setWeeksTarget] = useState([
    { id: 1, name: 'Semana 1 (1 a 7)', target: '25000', percentage: '25' },
    { id: 2, name: 'Semana 2 (8 a 14)', target: '25000', percentage: '25' },
    { id: 3, name: 'Semana 3 (15 a 21)', target: '25000', percentage: '25' },
    { id: 4, name: 'Semana 4 (22 a 31)', target: '25000', percentage: '25' },
  ]);

  const [sellersTarget, setSellersTarget] = useState([
    { id: 1, name: 'Ana Paula', target: '25000', percentage: '25' },
    { id: 2, name: 'Beatriz R.', target: '18500', percentage: '18.5' },
    { id: 3, name: 'Carla T.', target: '18500', percentage: '18.5' },
    { id: 4, name: 'Diana M.', target: '38000', percentage: '38' },
  ]);

  const [levels, setLevels] = useState<Level[]>([
    { id: '1', name: 'Alvo', amount: '100000', reward: 'Comissão 1%' },
    { id: '2', name: 'Desafio', amount: '120000', reward: 'Comissão 1.5% + Day off' },
  ]);

  const storeGoal = Number(levels[0]?.amount) || 0;
  const totalPercentage = sellersTarget.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
  const remainingPercentage = 100 - totalPercentage;
  
  const totalWeeklyPercentage = weeksTarget.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
  const remainingWeeklyPercentage = 100 - totalWeeklyPercentage;

  const addLevel = () => {
    if (levels.length >= 4) {
      toast.error('Limite máximo de 4 níveis atingido.');
      return;
    }
    setLevels([...levels, { id: Math.random().toString(), name: '', amount: '', reward: '' }]);
  };

  const removeLevel = (id: string) => {
    if (levels.length <= 1) return;
    setLevels(levels.filter(l => l.id !== id));
  };

  const updateLevel = (id: string, field: keyof Level, value: string) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const saveSettings = () => {
    toast.success('Metas configuradas com sucesso!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurar Metas</h1>
        <p className="text-gray-500">Defina os objetivos mensais e os níveis de recompensa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>Parâmetros base para as metas do período.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês Base</Label>
              <Select defaultValue="05-2026">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="04-2026">Abril 2026</SelectItem>
                  <SelectItem value="05-2026">Maio 2026</SelectItem>
                  <SelectItem value="06-2026">Junho 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Loja</Label>
              <Select defaultValue="loja-centro">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja-centro">Loja Centro</SelectItem>
                  <SelectItem value="loja-shopping">Loja Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2 border-t pt-4 mt-4">
            <Label className="text-base font-bold">Distribuição da Meta por Vendedora</Label>
            <p className="text-xs text-gray-500 mb-2">Escolha se a meta será definida globalmente para a loja ou individualmente por vendedora.</p>
            <Select value={distributionMode} onValueChange={setDistributionMode}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modo de distribuição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Meta Global (Igual para a Loja)</SelectItem>
                <SelectItem value="individual">Meta Individual por Vendedora (R$ ou %)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border-t pt-4 mt-4">
            <Label className="text-base font-bold">Distribuição da Meta no Tempo (Semanal)</Label>
            <p className="text-xs text-gray-500 mb-2">Escolha a visão de acompanhamento (Linear Mensal ou Personalizado por Semana).</p>
            <Select value={timeDistributionMode} onValueChange={setTimeDistributionMode}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modo no tempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal (Proporcional aos dias úteis)</SelectItem>
                <SelectItem value="semanal">Semanal (Personalizado por R$ ou %)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Dias Úteis no Mês</Label>
            <Input defaultValue="24" readOnly className="bg-gray-50" />
            <p className="text-xs text-gray-500">Calculado automaticamente descontando feriados e domingos.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Níveis da Meta (Gamificação)</CardTitle>
            <CardDescription>Configure de 2 a 4 níveis progressivos.</CardDescription>
          </div>
          <Button onClick={addLevel} variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar Nível
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {levels.map((level, index) => (
            <div key={level.id} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 relative group">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700">Nível {index + 1}</h4>
                {levels.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                    onClick={() => removeLevel(level.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Nível</Label>
                  <Input 
                    placeholder="Ex: Alvo, Superação, Diamante" 
                    value={level.name}
                    onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor da Meta (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 50000"
                    value={level.amount}
                    onChange={(e) => updateLevel(level.id, 'amount', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Recompensa (Opcional)</Label>
                  <Input 
                    placeholder="Ex: Folga, Prêmio R$200, Comissão maior"
                    value={level.reward}
                    onChange={(e) => updateLevel(level.id, 'reward', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {distributionMode === 'individual' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#111111]">Metas por Vendedora</h3>
                  <p className="text-sm text-gray-500">Ajuste os valores nominais (R$) ou a representatividade da vendedora no mês.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-gray-400">Total Distribuído:</span>
                  <div className={`text-2xl font-black ${Math.abs(remainingPercentage) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
                    {totalPercentage.toFixed(1)}%
                  </div>
                  {Math.abs(remainingPercentage) >= 0.01 && (
                    <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md inline-block mt-1">
                      {remainingPercentage > 0 ? 'Falta: ' : 'Excedente: '}{Math.abs(remainingPercentage).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {sellersTarget.map((seller, idx) => (
                  <div key={seller.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111111] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                        {seller.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="font-semibold text-sm">{seller.name}</span>
                    </div>
                    <div className="col-span-6 md:col-span-4 space-y-1">
                      <Label className="text-xs text-gray-400">Valor (R$)</Label>
                      <Input 
                        type="number" 
                        value={seller.target}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          const newTargets = [...sellersTarget];
                          newTargets[idx].target = valStr;
                          
                          if (storeGoal > 0 && valStr !== '') {
                            const newPerc = ((Number(valStr) / storeGoal) * 100).toFixed(2);
                            newTargets[idx].percentage = String(Number(newPerc)); // remove trailing zero
                          }
                          
                          setSellersTarget(newTargets);
                        }}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-4 space-y-1">
                      <Label className="text-xs text-gray-400">Percentual (%)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="pr-8"
                          value={seller.percentage}
                          onChange={(e) => {
                            const percStr = e.target.value;
                            const newTargets = [...sellersTarget];
                            newTargets[idx].percentage = percStr;
                            
                            if (storeGoal > 0 && percStr !== '') {
                              const newTarget = ((Number(percStr) / 100) * storeGoal).toFixed(0);
                              newTargets[idx].target = String(newTarget);
                            }
                            
                            setSellersTarget(newTargets);
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {timeDistributionMode === 'semanal' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#111111]">Metas Semanais</h3>
                  <p className="text-sm text-gray-500">Distribua a meta global nas semanas do mês selecionado.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-gray-400">Total Distribuído:</span>
                  <div className={`text-2xl font-black ${Math.abs(remainingWeeklyPercentage) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
                    {totalWeeklyPercentage.toFixed(1)}%
                  </div>
                  {Math.abs(remainingWeeklyPercentage) >= 0.01 && (
                    <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md inline-block mt-1">
                      {remainingWeeklyPercentage > 0 ? 'Falta: ' : 'Excedente: '}{Math.abs(remainingWeeklyPercentage).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {weeksTarget.map((week, idx) => (
                  <div key={week.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111111] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                        {week.id}
                      </div>
                      <span className="font-semibold text-sm">{week.name}</span>
                    </div>
                    <div className="col-span-6 md:col-span-4 space-y-1">
                      <Label className="text-xs text-gray-400">Valor (R$)</Label>
                      <Input 
                        type="number" 
                        value={week.target}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          const newTargets = [...weeksTarget];
                          newTargets[idx].target = valStr;
                          
                          if (storeGoal > 0 && valStr !== '') {
                            const newPerc = ((Number(valStr) / storeGoal) * 100).toFixed(2);
                            newTargets[idx].percentage = String(Number(newPerc)); 
                          }
                          
                          setWeeksTarget(newTargets);
                        }}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-4 space-y-1">
                      <Label className="text-xs text-gray-400">Percentual (%)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="pr-8"
                          value={week.percentage}
                          onChange={(e) => {
                            const percStr = e.target.value;
                            const newTargets = [...weeksTarget];
                            newTargets[idx].percentage = percStr;
                            
                            if (storeGoal > 0 && percStr !== '') {
                              const newTarget = ((Number(percStr) / 100) * storeGoal).toFixed(0);
                              newTargets[idx].target = String(newTarget);
                            }
                            
                            setWeeksTarget(newTargets);
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end mt-4">
            <Button onClick={saveSettings} className="bg-[#111111] text-[#D4AF37] hover:bg-[#222]">
              <Check className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
