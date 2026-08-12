import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

import { OverviewPage } from './pages/OverviewPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { ParcelPage } from './pages/ParcelPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataHealthPage } from './pages/DataHealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>

      {/* Standalone Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main BHUMI-X Application */}
      <Route path="/" element={<AppShell />}>

        <Route index element={<OverviewPage />} />

        <Route
          path="overview"
          element={<OverviewPage />}
        />

        <Route
          path="explorer"
          element={<ExplorerPage />}
        />

        <Route
          path="analysis"
          element={<AnalysisPage />}
        />

        <Route
          path="results"
          element={<ResultsPage />}
        />

        <Route
          path="parcel/:id"
          element={<ParcelPage />}
        />

        <Route
          path="simulator"
          element={<SimulatorPage />}
        />

        <Route
          path="reports"
          element={<ReportsPage />}
        />

        <Route
          path="data-health"
          element={<DataHealthPage />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<SettingsPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Route>

    </Routes>
  );
}