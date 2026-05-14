import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const initialTeam: TeamMember[] = [
  { id: '1', name: 'Ana Paula', email: 'ana@loja.com', role: 'Vendedora', status: 'Ativo' },
  { id: '2', name: 'Beatriz R.', email: 'beatriz@loja.com', role: 'Vendedora', status: 'Ativo' },
  { id: '3', name: 'Carla T.', email: 'carla@loja.com', role: 'Gerente', status: 'Ativo' },
  { id: '4', name: 'Diana M.', email: 'diana@loja.com', role: 'Vendedora', status: 'Ativo' },
];

export function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({ role: 'Vendedora', status: 'Ativo' });

  const handleSave = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    setTeam([...team, { id: Math.random().toString(), ...newMember as TeamMember }]);
    setIsModalOpen(false);
    setNewMember({ role: 'Vendedora', status: 'Ativo' });
    toast.success("Membro adicionado com sucesso!");
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter(t => t.id !== id));
    toast.success("Membro removido.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Equipe</h1>
          <p className="text-gray-500">Gerencie as vendedoras e acessos da loja.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] text-[#111111] hover:bg-[#c4a132] font-bold">
              <Plus className="w-4 h-4 mr-2" /> Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Vendedora / Gerente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Ex: Mariana Silva" value={newMember.name || ''} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>E-mail (para login)</Label>
                <Input type="email" placeholder="mariana@loja.com" value={newMember.email || ''} onChange={e => setNewMember({...newMember, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Cargo / Permissão</Label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({...newMember, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendedora">Vendedora</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-[#222]" onClick={handleSave}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-[#111111] flex items-center">
            <User className="w-5 h-5 mr-2 text-[#D4AF37]" />
            Membros da Equipe ({team.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-bold text-gray-400 uppercase text-xs">Membro</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">E-mail</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">Cargo</TableHead>
                <TableHead className="font-bold text-gray-400 uppercase text-xs">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold text-gray-400 uppercase text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50/50">
                  <TableCell className="pl-6 font-semibold text-[#111111] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#111111]/10 flex items-center justify-center text-[#111111] font-bold text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    {member.name}
                  </TableCell>
                  <TableCell className="text-gray-500">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={member.role === 'Gerente' ? 'border-[#D4AF37] text-[#8c7424]' : 'bg-gray-100 text-gray-600'}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center text-sm text-green-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {member.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#111111]">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => handleRemove(member.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
