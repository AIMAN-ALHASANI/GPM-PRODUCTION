import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shown on any student page when the student is not yet in a team.
 * Props:
 *   featureName — string describing what they can't do yet
 *                 e.g. "إنشاء مقترح", "رفع التقارير", "جدولة الاجتماعات"
 */
const NoTeamGate = ({ featureName = 'الوصول إلى هذه الميزة' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
    {/* Icon */}
    <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-amber-500">group_off</span>
    </div>

    {/* Heading */}
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        أنت لست ضمن فريق حاليًا
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm">
        لا يمكنك <span className="font-semibold text-slate-700 dark:text-slate-300">{featureName}</span> حتى تنضم إلى فريق أو تُنشئ فريقاً جديداً.
      </p>
    </div>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        to="/student/team"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
      >
        <span className="material-symbols-outlined">add_circle</span>
        إنشاء فريق
      </Link>
      <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-default">
        <span className="material-symbols-outlined text-sm">hourglass_empty</span>
        انتظار الانضمام إلى فريق
      </div>
    </div>
  </div>
);

export default NoTeamGate;
