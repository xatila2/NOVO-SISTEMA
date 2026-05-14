import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { SalesPage } from './pages/SalesPage';
import { VendedoraDashboard } from './pages/VendedoraDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/minha-meta" element={<VendedoraDashboard />} />
          <Route path="/configurar" element={<SettingsPage />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/equipe" element={<TeamPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}
