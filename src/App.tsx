import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { ParcelPage } from './pages/ParcelPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataHealthPage } from './pages/DataHealthPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="parcel/:id" element={<ParcelPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="data-health" element={<DataHealthPage />} />
        {/* Land Explorer could be ResultsPage with map view, or we can route it there for now */}
        <Route path="explorer" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
