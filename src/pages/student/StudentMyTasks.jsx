import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useMyTeam from '../../hooks/useMyTeam';
import taskService from '../../services/taskService';
import teamService from '../../services/teamService';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.Message === 'string') return data.Message;
  if (typeof data?.title === 'string') return data.title;
  if (data?.errors && typeof data.errors === 'object')
    return Object.values(data.errors).flat().join(' ');
  if (typeof error?.message === 'string') return error.message;
  return 'حدث خطأ غير متوقع';
}

function getStatusConfig(status) {
  switch (status) {
    case 'Pending':
      return {
        label: 'قيد الانتظار',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        border: 'border-amber-400',
      };
    case 'InProgress':
      return {
        label: 'قيد التنفيذ',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        dot: 'bg-blue-500',
        border: 'border-blue-400',
      };
    case 'Completed':
      return {
        label: 'مكتملة',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-400',
      };
    default:
      return {
        label: status || 'غير محدد',
        bg: 'bg-slate-100 dark:bg-slate-700',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-300',
      };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : parts[0][0] || '?';
}

// ─── Status Badge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Stats Card ─────────────────────────────────────────────────────────────────

const StatsCard = ({ title, value, icon, colorClass, borderClass }) => (
  <div
    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border-r-4 ${borderClass} shadow-sm flex items-center gap-4`}
  >
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
        {title}
      </p>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
        {value < 10 ? `0${value}` : value}
      </p>
    </div>
  </div>
);

// ─── Skeleton Loader ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 ml-4" />
    </div>
    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2" />
    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5 mb-5" />
    <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16" />
      </div>
    </div>
  </div>
);

// ─── Empty State ────────────────────────────────────────────────────────────────

const EmptyState = ({ isLeader }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-5xl text-primary opacity-60">
        assignment
      </span>
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
      لا توجد مهام بعد
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
      {isLeader
        ? 'ابدأ بإنشاء مهمة جديدة لفريقك عبر زر "إنشاء مهمة" أعلاه.'
        : 'لم يتم تعيين أي مهام لك حتى الآن. سيقوم قائد الفريق بتعيين المهام قريباً.'}
    </p>
    {isLeader && (
      <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
        <span className="material-symbols-outlined text-sm">arrow_upward</span>
        انقر على "إنشاء مهمة" للبدء
      </div>
    )}
  </div>
);

// ─── Leader Task Card ───────────────────────────────────────────────────────────

const LeaderTaskCard = ({ task, onEdit, onDelete, onStatusChange, isUpdatingStatus }) => {
  const cfg = getStatusConfig(task.status);
  const [localStatus, setLocalStatus] = useState(task.status);

  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setLocalStatus(newStatus);
    await onStatusChange(task.taskID, newStatus);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border ${cfg.border} border-opacity-40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      {/* Color stripe top */}
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
              {task.title}
            </h3>
            {task.projectTitle && (
              <p className="text-[11px] text-primary font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">folder</span>
                {task.projectTitle}
              </p>
            )}
          </div>
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {task.description || 'لا يوجد وصف'}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
              {getInitials(task.assignedTo)}
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                مُعيَّن إلى
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {task.assignedTo || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-500 text-sm">
                calendar_today
              </span>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                تاريخ التسليم
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Created at */}
        <p className="text-[10px] text-slate-400 mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">schedule</span>
          أُنشئت في {formatDate(task.createdAt)}
        </p>

        {/* Status change + Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
          {/* Status dropdown for leader */}
          <div className="relative">
            <select
              value={localStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className={`appearance-none text-[11px] font-bold px-3 py-1.5 pr-7 rounded-lg border ${cfg.bg} ${cfg.text} border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-50 disabled:cursor-wait`}
            >
              <option value="Pending">قيد الانتظار</option>
              <option value="InProgress">قيد التنفيذ</option>
              <option value="Completed">مكتملة</option>
            </select>
            <span className="material-symbols-outlined absolute left-1.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none opacity-60">
              expand_more
            </span>
          </div>

          {/* Edit / Delete buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              تعديل
            </button>
            <button
              onClick={() => onDelete(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Member Task Card ───────────────────────────────────────────────────────────

const MemberTaskCard = ({ task, onStatusChange, isUpdatingStatus }) => {
  const cfg = getStatusConfig(task.status);
  const [localStatus, setLocalStatus] = useState(task.status);

  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setLocalStatus(newStatus);
    await onStatusChange(task.taskID, newStatus);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
              {task.title}
            </h3>
            {task.projectTitle && (
              <p className="text-[11px] text-primary font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">folder</span>
                {task.projectTitle}
              </p>
            )}
          </div>
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {task.description || 'لا يوجد وصف'}
        </p>

        {/* Due date */}
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-slate-400 text-base">
            calendar_today
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            تاريخ التسليم:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(task.dueDate)}
            </span>
          </span>
        </div>

        {/* Status dropdown (member only updates own) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            تحديث الحالة
          </label>
          <div className="relative">
            <select
              value={localStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold px-4 py-2.5 pr-9 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              <option value="Pending">قيد الانتظار</option>
              <option value="InProgress">قيد التنفيذ</option>
              <option value="Completed">مكتملة</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Create / Edit Task Modal ───────────────────────────────────────────────────

const TaskModal = ({
  isOpen,
  mode, // 'create' | 'edit'
  initialData,
  teamMembers,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedToUserID: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  // Populate form on open / when initialData changes
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedToUserID: String(initialData.assignedToUserID || ''),
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setForm({ title: '', description: '', assignedToUserID: '', dueDate: '' });
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'عنوان المهمة مطلوب';
    if (!form.assignedToUserID) e.assignedToUserID = 'يرجى اختيار العضو';
    if (!form.dueDate) e.dueDate = 'تاريخ التسليم مطلوب';
    else if (new Date(form.dueDate) < new Date(new Date().toDateString()))
      e.dueDate = 'لا يمكن أن يكون تاريخ التسليم في الماضي';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      assignedToUserID: Number(form.assignedToUserID),
      dueDate: form.dueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">
                {mode === 'create' ? 'add_task' : 'edit_note'}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {mode === 'create' ? 'إنشاء مهمة جديدة' : 'تعديل المهمة'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              عنوان المهمة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="مثال: تصميم واجهة تسجيل الدخول"
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                errors.title
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all text-slate-900 dark:text-white`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              الوصف
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="وصف تفصيلي للمهمة..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Assigned Member + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assigned Member */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                تعيين إلى <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.assignedToUserID}
                  onChange={(e) => handleChange('assignedToUserID', e.target.value)}
                  className={`w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                    errors.assignedToUserID
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all text-slate-900 dark:text-white`}
                >
                  <option value="">اختر العضو</option>
                  {teamMembers.map((m) => (
                    <option key={m.userID || m.UserID} value={m.userID || m.UserID}>
                      {m.fullName || m.FullName}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                  expand_more
                </span>
              </div>
              {errors.assignedToUserID && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.assignedToUserID}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                تاريخ التسليم <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                  errors.dueDate
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 dark:border-slate-700'
                } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all text-slate-900 dark:text-white`}
              />
              {errors.dueDate && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'create' ? 'جاري الإنشاء...' : 'جاري الحفظ...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    {mode === 'create' ? 'add_task' : 'save'}
                  </span>
                  <span>{mode === 'create' ? 'إنشاء المهمة' : 'حفظ التغييرات'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Confirm Delete Modal ───────────────────────────────────────────────────────

const ConfirmDeleteModal = ({ isOpen, task, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        dir="rtl"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-rose-600 text-2xl">
              delete_forever
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            حذف المهمة
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            هل أنت متأكد من حذف المهمة:
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-white mb-6">
            "{task.title}"
          </p>
          <p className="text-xs text-rose-500 mb-6">
            ⚠️ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">delete</span>
              )}
              {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── No Team Banner ─────────────────────────────────────────────────────────────

const NoTeamBanner = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-5">
      <span className="material-symbols-outlined text-4xl text-amber-600">group_off</span>
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
      لست عضواً في فريق بعد
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
      يجب أن تكون عضواً في فريق لعرض المهام وإدارتها.
    </p>
    <Link
      to="/student/team"
      className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-sm">group_add</span>
      إنشاء أو الانضمام لفريق
    </Link>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

const StudentMyTasks = () => {
  const { user } = useAuth();
  const { team, hasTeam, isLoading: isTeamLoading } = useMyTeam();

  // Determine if the current user is the team leader
  const teamLeaderID = team?.LeaderUserID ?? team?.leaderUserID;
  const currentUserId = Number(user?.id);
  const isLeader = hasTeam && !!teamLeaderID && currentUserId === Number(teamLeaderID);

  // ── State ──
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Load Tasks ──
  const loadTasks = useCallback(async () => {
    if (!hasTeam) return;
    setIsLoadingTasks(true);
    try {
      const data = await taskService.getMyTeamTasks();
      // Normalize response — could be array or wrapped object
      const list = Array.isArray(data) ? data : (data?.data || data?.value || []);
      // Normalize field names (backend may return camelCase or PascalCase)
      const normalized = list.map((t) => ({
        taskID: t.taskID ?? t.TaskID,
        title: t.title ?? t.Title,
        description: t.description ?? t.Description,
        status: t.status ?? t.Status ?? 'Pending',
        dueDate: t.dueDate ?? t.DueDate,
        createdAt: t.createdAt ?? t.CreatedAt,
        assignedTo: t.assignedTo ?? t.AssignedTo,
        assignedToUserID: t.assignedToUserID ?? t.AssignedToUserID,
        createdBy: t.createdBy ?? t.CreatedBy,
        teamName: t.teamName ?? t.TeamName,
        projectID: t.projectID ?? t.ProjectID,
        projectTitle: t.projectTitle ?? t.ProjectTitle,
      }));
      setTasks(normalized);
    } catch (err) {
      // 404 just means no tasks yet — that's fine
      if (err?.response?.status !== 404) {
        toast.error(extractErrorMessage(err) || 'فشل تحميل المهام');
      }
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [hasTeam]);

  // ── Load Team Members (leader only — for modal dropdown) ──
  const loadTeamMembers = useCallback(async () => {
    if (!isLeader || !team) return;
    const teamId = team.TeamID ?? team.teamID;
    if (!teamId) return;
    try {
      const data = await teamService.getTeamMembers(teamId);
      const list = Array.isArray(data) ? data : (data?.data || []);
      setTeamMembers(list);
    } catch {
      // Silent — non-critical
    }
  }, [isLeader, team]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'InProgress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  // ── Filtered Tasks ──
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  // ── Create Task ──
  const handleCreate = async (dto) => {
    setIsSubmitting(true);
    try {
      await taskService.createTask({
        title: dto.title,
        description: dto.description,
        assignedToUserID: dto.assignedToUserID,
        dueDate: dto.dueDate,
      });
      toast.success('تم إنشاء المهمة بنجاح ✅');
      setCreateModalOpen(false);
      await loadTasks();
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('leader'))
        toast.error('فقط قائد الفريق يمكنه إنشاء المهام');
      else if (msg.toLowerCase().includes('not part'))
        toast.error('العضو المختار لا ينتمي لهذا الفريق');
      else if (msg.toLowerCase().includes('past'))
        toast.error('لا يمكن أن يكون تاريخ التسليم في الماضي');
      else toast.error(msg || 'فشل إنشاء المهمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Update Task ──
  const handleUpdate = async (dto) => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await taskService.updateTask(selectedTask.taskID, {
        title: dto.title,
        description: dto.description,
        assignedToUserID: dto.assignedToUserID,
        dueDate: dto.dueDate,
      });
      toast.success('تم تحديث المهمة بنجاح ✅');
      setEditModalOpen(false);
      setSelectedTask(null);
      await loadTasks();
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('leader'))
        toast.error('فقط قائد الفريق يمكنه تعديل المهام');
      else if (msg.toLowerCase().includes('not found'))
        toast.error('المهمة غير موجودة');
      else toast.error(msg || 'فشل تحديث المهمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete Task ──
  const handleDelete = async () => {
    if (!selectedTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(selectedTask.taskID);
      toast.success('تم حذف المهمة بنجاح 🗑️');
      setDeleteModalOpen(false);
      setSelectedTask(null);
      await loadTasks();
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('leader'))
        toast.error('فقط قائد الفريق يمكنه حذف المهام');
      else if (msg.toLowerCase().includes('not found'))
        toast.error('المهمة غير موجودة');
      else toast.error(msg || 'فشل حذف المهمة');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Update Status ──
  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingStatusId(taskId);
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      toast.success('تم تحديث حالة المهمة ✅');
      // Optimistically update local state for instant feedback
      setTasks((prev) =>
        prev.map((t) => (t.taskID === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('authorized'))
        toast.error('لا تملك صلاحية تحديث هذه المهمة');
      else if (msg.toLowerCase().includes('not found'))
        toast.error('المهمة غير موجودة');
      else toast.error(msg || 'فشل تحديث الحالة');
      // Revert on failure
      await loadTasks();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ── Open Edit Modal ──
  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  // ── Open Delete Modal ──
  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
        <Link to="/student/dashboard" className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">المهام</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
              {isLeader ? 'قائد الفريق' : 'عضو الفريق'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLeader ? 'إدارة المهام' : 'مهامي'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {isLeader
                ? 'إنشاء وتعيين وإدارة جميع مهام فريقك من مكان واحد.'
                : 'عرض المهام المعيَّنة لك وتحديث حالتها.'}
            </p>
          </div>

          {/* Create Task Button (leader only) */}
          {isLeader && (
            <button
              id="create-task-btn"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-lg">add_task</span>
              إنشاء مهمة
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex gap-8">
            <NavLink
              to="/student/team"
              end
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm'
                  : 'flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm'
              }
            >
              <span className="material-symbols-outlined">group</span>
              الفريق
            </NavLink>
            <NavLink
              to="/student/tasks"
              end
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm'
                  : 'flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm'
              }
            >
              <span className="material-symbols-outlined">assignment</span>
              المهام
              {stats.total > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.total}
                </span>
              )}
            </NavLink>
          </nav>
        </div>

        {/* ── No Team State ── */}
        {!isTeamLoading && !hasTeam && <NoTeamBanner />}

        {/* ── Has Team → Main Content ── */}
        {(hasTeam || isTeamLoading) && (
          <>
            {/* Stats Cards (visible to leader always; member sees them too for reference) */}
            {isLeader && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="إجمالي المهام"
                  value={stats.total}
                  icon="assignment"
                  colorClass="bg-primary/10 text-primary"
                  borderClass="border-primary"
                />
                <StatsCard
                  title="قيد الانتظار"
                  value={stats.pending}
                  icon="schedule"
                  colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                  borderClass="border-amber-500"
                />
                <StatsCard
                  title="قيد التنفيذ"
                  value={stats.inProgress}
                  icon="autorenew"
                  colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                  borderClass="border-blue-500"
                />
                <StatsCard
                  title="مكتملة"
                  value={stats.completed}
                  icon="task_alt"
                  colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                  borderClass="border-emerald-500"
                />
              </div>
            )}

            {/* Filter Tabs */}
            {tasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'الكل', count: stats.total },
                  { key: 'Pending', label: 'قيد الانتظار', count: stats.pending },
                  { key: 'InProgress', label: 'قيد التنفيذ', count: stats.inProgress },
                  { key: 'Completed', label: 'مكتملة', count: stats.completed },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      statusFilter === tab.key
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        statusFilter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Loading Skeletons ── */}
            {(isLoadingTasks || isTeamLoading) && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* ── Empty State ── */}
            {!isLoadingTasks && !isTeamLoading && filteredTasks.length === 0 && (
              <EmptyState isLeader={isLeader} />
            )}

            {/* ── Leader: All Team Tasks ── */}
            {!isLoadingTasks && !isTeamLoading && isLeader && filteredTasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredTasks.map((task) => (
                  <LeaderTaskCard
                    key={task.taskID}
                    task={task}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onStatusChange={handleStatusChange}
                    isUpdatingStatus={updatingStatusId === task.taskID}
                  />
                ))}
              </div>
            )}

            {/* ── Member: Only Assigned Tasks ── */}
            {!isLoadingTasks && !isTeamLoading && !isLeader && filteredTasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredTasks.map((task) => (
                  <MemberTaskCard
                    key={task.taskID}
                    task={task}
                    onStatusChange={handleStatusChange}
                    isUpdatingStatus={updatingStatusId === task.taskID}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Create Task Modal */}
      <TaskModal
        isOpen={createModalOpen}
        mode="create"
        initialData={null}
        teamMembers={teamMembers}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={editModalOpen}
        mode="edit"
        initialData={selectedTask}
        teamMembers={teamMembers}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        task={selectedTask}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StudentMyTasks;
