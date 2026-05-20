import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Target, Users, Settings, LogOut, DollarSign, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const location = useLocation();
  const { role: userRole, setRole } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home, roles: ['admin', 'gerente'] },
    { label: 'Minha Meta', path: '/minha-meta', icon: Target, roles: ['vendedora'] },
    { label: 'Vendas', path: '/vendas', icon: DollarSign, roles: ['admin', 'gerente', 'vendedora'] },
    { label: 'Relatórios', path: '/relatorios', icon: BarChart2, roles: ['admin', 'gerente'] },
    { label: 'Equipe', path: '/equipe', icon: Users, roles: ['admin', 'gerente'] },
    { label: 'Configurar Metas', path: '/configurar', icon: Settings, roles: ['admin', 'gerente'] },
  ];

  // In a real app we'd get this from useAuth context

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="h-screen w-full bg-[#F4F5F7] text-[#2F2F2F] flex overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-20 bg-[#111111] hidden md:flex flex-col items-center py-8 gap-10 border-r border-[#222222] shrink-0">
        <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center font-bold text-[#111111] text-xl shadow-lg shrink-0">
          V
        </div>
        <nav className="flex flex-col gap-8 text-white/40">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  "cursor-pointer transition-colors",
                  isActive ? "text-[#D4AF37]" : "hover:text-white"
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            )
          })}
        </nav>
        <button 
          className="mt-auto mb-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
          title="Sair"
        >
          <LogOut className="h-5 w-5 ml-1" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden p-4 md:p-8 gap-6 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 bg-[#D4AF37] rounded-lg flex items-center justify-center font-bold text-[#111111] text-sm shadow">
              V
            </div>
            <span className="font-bold text-lg text-[#2F2F2F]">Meta Varejo</span>
          </div>
          <select 
            className="text-xs p-1 rounded border border-gray-300"
            value={userRole}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="admin">Admin</option>
            <option value="gerente">Gerente</option>
            <option value="vendedora">Vendedora</option>
          </select>
        </header>

        {/* Desktop Role Switcher (Mock) */}
        <div className="hidden md:flex absolute top-4 right-8 z-50 items-center gap-2">
           <span className="text-xs text-gray-400">Ver como:</span>
           <select 
            className="text-xs p-1 px-2 rounded-lg border border-gray-200 bg-white shadow-sm font-medium"
            value={userRole}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="admin">Admin</option>
            <option value="gerente">Gerente</option>
            <option value="vendedora">Vendedora</option>
          </select>
        </div>

        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {filteredNav.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg min-w-[64px]",
                isActive ? "text-[#D4AF37]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-tight leading-none uppercase">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
