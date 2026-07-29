import React from 'react';
import PageHeader from '../../components/common/PageHeader';

const TeamManagement = () => {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader title="إدارة الفريق" description="التحكم في بيانات وأعضاء الفريق" />
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">محتوى إدارة الفريق (قيد التطوير)</p>
      </div>
    </div>
  );
};

export default TeamManagement;
