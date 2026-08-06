import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState } from 'react';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}