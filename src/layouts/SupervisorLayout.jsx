import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import SupervisorSidebar from '../sidebars/SupervisorSidebar';

const SupervisorLayout = () => {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SupervisorSidebar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupervisorLayout;
