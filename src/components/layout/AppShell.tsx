import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Notifications from '../ui/Notifications';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-14 h-[calc(100vh-3.5rem)] overflow-auto">
        <Outlet />
      </main>
      <Notifications />
    </div>
  );
}
