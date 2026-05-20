import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, User, Store as StoreIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Store, Seller } from '@/contexts/DataContext';

export function TeamPage() {
  const { role: userRole } = useAuth();
  const { stores, addStore, updateStore, deleteStore, sellers, addSeller, updateSeller, deleteSeller } = useData();
  
  const [activeTab, setActiveTab] = useState<'vendedoras' | 'lojas'>('vendedoras');

  // Modal states for Sellers
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Partial<Seller> | null>(null);

  // Modal states for Stores
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Partial<Store> | null>(null);

  const handleSaveSeller = () => {
    if (!editingSeller?.name || !editingSeller?.email) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    if (editingSeller.id) {
      updateSeller(editingSeller.id, editingSeller);
      toast.success("Membro atualizado com sucesso!");
    } else {
      addSeller({
        name: editingSeller.name,
        email: editingSeller.email,
        role: editingSeller.role || 'Vendedora',
        status: editingSeller.status || 'Ativo',
        storeId: editingSeller.storeId || (stores[0]?.id)
      });
      toast.success("Membro adicionado com sucesso!");
    }
    setIsSellerModalOpen(false);
  };

  const handleRemoveSeller = (id: string) => {
    deleteSeller(id);
    toast.success("Membro removido.");
  };

  const handleSaveStore = () => {
    if (!editingStore?.name) {
      toast.error("Preencha o nome da loja.");
      return;
    }
    if (editingStore.id) {
      updateStore(editingStore.id, editingStore);
      toast.success("Loja atualizada com sucesso!");
    } else {
      addStore({ name: editingStore.name });
      toast.success("Loja adicionada com sucesso!");
    }
    setIsStoreModalOpen(false);
  };

  const handleRemoveStore = (id: string) => {
    deleteStore(id);
    toast.success("Loja removida.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Equipe e Lojas</h1>
          <p className="text-gray-500">Gerencie as lojas, vendedoras e acessos.</p>
        </div>
        {(userRole === 'admin' || userRole === 'gerente') && (
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'lojas' ? 'default' : 'outline'} 
              className={activeTab === 'lojas' ? 'bg-[#111111] text-[#D4AF37] hover:bg-[#222]' : ''}
              onClick={() => { setActiveTab('lojas'); }}
            >
              <StoreIcon className="w-4 h-4 mr-2" /> Lojas
            </Button>
            <Button 
              variant={activeTab === 'vendedoras' ? 'default' : 'outline'}
              className={activeTab === 'vendedoras' ? 'bg-[#111111] text-[#D4AF37] hover:bg-[#222]' : ''}
              onClick={() => { setActiveTab('vendedoras'); }}
            >
              <User className="w-4 h-4 mr-2" /> Vendedoras
            </Button>
            <Button 
              className="bg-[#D4AF37] text-[#111111] hover:bg-[#c4a132] font-bold ml-2"
              onClick={() => {
                if (activeTab === 'vendedoras') {
                  setEditingSeller({ role: 'Vendedora', status: 'Ativo', storeId: stores[0]?.id });
                  setIsSellerModalOpen(true);
                } else {
                  setEditingStore({ name: '' });
                  setIsStoreModalOpen(true);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Registro
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'vendedoras' ? (
        <Card className="border-gray-200 shadow-sm overflow-hidden rounded-3xl">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-[#111111] flex items-center">
              <User className="w-5 h-5 mr-2 text-[#D4AF37]" />
              Membros da Equipe ({sellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 font-bold text-gray-400 uppercase text-xs">Membro</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase text-xs">Loja</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase text-xs">E-mail</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase text-xs">Cargo</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase text-xs">Status</TableHead>
                  {(userRole === 'admin' || userRole === 'gerente') && (
                    <TableHead className="text-right pr-6 font-bold text-gray-400 uppercase text-xs">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6 font-semibold text-[#111111] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111111]/10 flex items-center justify-center text-[#111111] font-bold text-xs shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="whitespace-nowrap">{member.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-500">{stores.find(s => s.id === member.storeId)?.name || 'N/A'}</TableCell>
                    <TableCell className="text-gray-500 whitespace-nowrap">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={member.role === 'Gerente' ? 'border-[#D4AF37] text-[#8c7424]' : 'bg-gray-100 text-gray-600'}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center text-sm font-medium ${member.status === 'Ativo' ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${member.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {member.status}
                      </span>
                    </TableCell>
                    {(userRole === 'admin' || userRole === 'gerente') && (
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#111111]" onClick={() => { setEditingSeller(member); setIsSellerModalOpen(true); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => handleRemoveSeller(member.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 shadow-sm overflow-hidden rounded-3xl">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-[#111111] flex items-center">
              <StoreIcon className="w-5 h-5 mr-2 text-[#D4AF37]" />
              Lojas Cadastradas ({stores.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 font-bold text-gray-400 uppercase text-xs">ID</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase text-xs">Nome da Loja</TableHead>
                  {(userRole === 'admin' || userRole === 'gerente') && (
                    <TableHead className="text-right pr-6 font-bold text-gray-400 uppercase text-xs">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6 text-gray-500">#{store.id}</TableCell>
                    <TableCell className="font-semibold text-[#111111]">{store.name}</TableCell>
                    {(userRole === 'admin' || userRole === 'gerente') && (
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#111111]" onClick={() => { setEditingStore(store); setIsStoreModalOpen(true); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => handleRemoveStore(store.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Seller Modal */}
      <Dialog open={isSellerModalOpen} onOpenChange={setIsSellerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSeller?.id ? 'Editar Membro' : 'Cadastrar Membro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: Mariana Silva" value={editingSeller?.name || ''} onChange={e => setEditingSeller(prev => ({...prev, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>E-mail (para login)</Label>
              <Input type="email" placeholder="mariana@loja.com" value={editingSeller?.email || ''} onChange={e => setEditingSeller(prev => ({...prev, email: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Loja</Label>
              <Select value={editingSeller?.storeId} onValueChange={(v) => setEditingSeller(prev => ({...prev, storeId: v}))}>
                <SelectTrigger><SelectValue placeholder="Selecione a loja..." /></SelectTrigger>
                <SelectContent>
                  {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select value={editingSeller?.role} onValueChange={(v) => setEditingSeller(prev => ({...prev, role: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendedora">Vendedora</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editingSeller?.status} onValueChange={(v) => setEditingSeller(prev => ({...prev, status: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Férias">Férias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-[#222]" onClick={handleSaveSeller}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Store Modal */}
      <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStore?.id ? 'Editar Loja' : 'Cadastrar Loja'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              <Input placeholder="Ex: Loja Centro, Filial 2" value={editingStore?.name || ''} onChange={e => setEditingStore(prev => ({...prev, name: e.target.value}))} />
            </div>
            <Button className="w-full bg-[#111111] text-[#D4AF37] hover:bg-[#222]" onClick={handleSaveStore}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
