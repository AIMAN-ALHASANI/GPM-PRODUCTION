import React from 'react';
import PageHeader from '../../components/common/PageHeader';

const Projects = () => {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader title="المشاريع" description="إدارة جميع مشاريع التخرج في النظام" />
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">محتوى المشاريع (قيد التطوير)</p>
      </div>
    </div>
  );
};

export default Projects;
