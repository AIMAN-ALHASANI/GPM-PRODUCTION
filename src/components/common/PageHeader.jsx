import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white break-words">{title}</h2>
        {description && <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base leading-relaxed">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
