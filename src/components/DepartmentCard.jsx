import React from 'react';

const DepartmentCard = React.memo(({ dept, onEdit }) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-right">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-3xl">account_balance</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(dept)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all hover:text-primary" title="تعديل">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{dept.departmentName}</h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4 justify-end">
                    <span className="text-sm font-bold">{dept.collegeName || dept.college?.collegeName || 'غير محدد'}</span>
                    <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المعرف المرجعي</p>
                    <p className="text-xs font-mono text-slate-500">DEPT-{dept.departmentID.toString().padStart(4, '0')}</p>
                </div>
            </div>
        </div>
    );
});

export default DepartmentCard;
