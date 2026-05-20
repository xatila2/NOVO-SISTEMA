import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Plus, Trash2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

export function SettingsPage() {
  const [distributionMode, setDistributionMode] = useState<string>('global');
  const [timeDistributionMode, setTimeDistributionMode] = useState<string>('mensal');
  
  const {
    levels, setLevels,
    baseCommission, setBaseCommission,
    sellersTarget, setSellersTarget,
    weeksTarget, setWeeksTarget
  } = useData();

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
    setLevels([...levels, { id: Math.random().toString(), name: '', amount: '', reward: '', commission: '1.0' }]);
  };

  const removeLevel = (id: string) => {
    if (levels.length <= 1) return;
    setLevels(levels.filter(l => l.id !== id));
  };

  const updateLevel = (id: string, field: 'name' | 'amount' | 'reward' | 'commission', value: string) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const saveSettings = () => {
    // Validation
    const invalidLevels = levels.some(l => !l.name || Number(l.amount) <= 0 || Number(l.commission) < 0);
    if (invalidLevels) {
      toast.error('Preencha nomes, valores e porcentagens de comissões válidas para todos os níveis.');
      return;
    }
    
    if (Number(baseCommission) < 0) {
      toast.error('A comissão base deve ser valor positivo ou zero.');
      return;
    }
    
    if (distributionMode === 'individual') {
      const invalidSellers = sellersTarget.some(s => Number(s.target) < 0 || Number(s.percentage) < 0 || Number(s.percentage) > 100);
      if (invalidSellers || totalPercentage > 100.1 || totalPercentage < 99.9) {
         toast.error('A distribuição individual deve somar exatamente 100% e os valores devem ser positivos.');
         return;
      }
    }
    
    if (timeDistributionMode === 'semanal') {
      const invalidWeeks = weeksTarget.some(w => Number(w.target) < 0 || Number(w.percentage) < 0 || Number(w.percentage) > 100);
      if (invalidWeeks || totalWeeklyPercentage > 100.1 || totalWeeklyPercentage < 99.9) {
         toast.error('A distribuição semanal deve somar exatamente 100% e os valores devem ser positivos.');
         return;
      }
    }

    toast.success('Metas e comissões salvas com sucesso!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-4 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Configurar Metas</h1>
        <p className="text-gray-500 text-sm">Defina os objetivos mensais e os níveis de recompensa.</p>
      </div>

      <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50">
          <CardTitle className="text-lg">Configurações Gerais</CardTitle>
          <CardDescription>Parâmetros base para as metas do período.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês Base</Label>
              <Select defaultValue="05-2026">
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
            <p className="text-xs text-gray-400 mb-2">Escolha se a meta será definida globalmente para a loja ou individualmente por vendedora.</p>
            <Select value={distributionMode} onValueChange={setDistributionMode}>
              <SelectTrigger className="w-full">
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
            <p className="text-xs text-gray-400 mb-2">Escolha a visão de acompanhamento (Linear Mensal ou Personalizado por Semana).</p>
            <Select value={timeDistributionMode} onValueChange={setTimeDistributionMode}>
              <SelectTrigger className="w-full">
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
            <Input defaultValue="24" readOnly className="bg-gray-50 border-gray-200 text-gray-500 font-bold" />
            <p className="text-xs text-gray-450">Calculado automaticamente descontando feriados e domingos.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50">
          <div>
            <CardTitle className="text-lg">Níveis da Meta (Gamificação)</CardTitle>
            <CardDescription>Configure de 2 a 4 níveis progressivos com suas respectivas comissões.</CardDescription>
          </div>
          <Button onClick={addLevel} variant="outline" size="sm" className="flex items-center gap-1 border-gray-200">
            <Plus className="w-4 h-4" /> Adicionar Nível
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-800">Comissão Base de Vendas (Sem Meta)</h4>
              <p className="text-xs text-amber-700/80">Percentual padrão pago de comissão caso a vendedora ou a loja não atinja nenhum nível estipulado no mês.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-32">
                <Input 
                  type="number" 
                  step="0.1" 
                  value={baseCommission} 
                  onChange={e => setBaseCommission(e.target.value)} 
                  className="pr-8 bg-white border-amber-200 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-black">%</span>
              </div>
            </div>
          </div>

          {levels.map((level, index) => (
            <div key={level.id} className="p-4 border rounded-2xl bg-gray-50/50 space-y-4 relative group hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#111111] text-[#D4AF37] font-black items-center justify-center rounded-full text-xs">
                    {index + 1}
                  </span>
                  Configurações para {level.name || `Nível ${index + 1}`}
                </h4>
                {levels.length > 2 && (
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
                  <Label className="text-xs text-gray-500 font-bold">Nome do Nível</Label>
                  <Input 
                    placeholder="Ex: Alvo, Superação, Diamante" 
                    value={level.name}
                    onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-bold">Valor da Meta (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 50000"
                    value={level.amount}
                    onChange={(e) => updateLevel(level.id, 'amount', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-bold">Comissão do Nível (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Ex: 1.5"
                      value={level.commission || ''}
                      onChange={(e) => updateLevel(level.id, 'commission', e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-black">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-bold">Recompensa Adicional (Opcional)</Label>
                  <Input 
                    placeholder="Ex: Folga, Prêmio R$200, Viagem"
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
                        min="0"
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
                          min="0"
                          max="100"
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
                        min="0"
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
                          min="0"
                          max="100" 
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50">
          <CardTitle className="text-lg">Notificações e Alertas</CardTitle>
          <CardDescription>Configure avisos quando a vendedora ou loja atingir uma certa porcentagem da meta mensal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Canais de Notificação</Label>
              <Select defaultValue="in-app-email">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione os canais..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-app">Apenas no Aplicativo</SelectItem>
                  <SelectItem value="email">Apenas por E-mail</SelectItem>
                  <SelectItem value="in-app-email">E-mail e Aplicativo</SelectItem>
                  <SelectItem value="none">Desativado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disparar alerta ao atingir (%) da meta</Label>
              <div className="relative">
                <Input type="number" defaultValue="80" max="100" min="1" className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={saveSettings} className="bg-[#111111] text-[#D4AF37] hover:bg-[#222] font-bold">
          <Check className="mr-2 h-4 w-4" /> Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
