import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import SuperAdminSidebar from '../sidebars/SuperAdminSidebar';

const SuperAdminLayout = () => {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SuperAdminSidebar />
        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
