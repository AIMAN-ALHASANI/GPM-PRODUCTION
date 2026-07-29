/**
 * GPM Arabic Localization Utility
 * Central translation hub for all English enums → Arabic display values.
 * Do NOT modify backend values. Use these helpers for display only.
 */

// ─── Project & Team Status ────────────────────────────────────────────────────
const PROJECT_STATUS_MAP = {
  Pending:     'قيد الانتظار',
  Approved:    'معتمد',
  Rejected:    'مرفوض',
  InProgress:  'قيد التنفيذ',
  Completed:   'مكتمل',
  Archived:    'مؤرشف',
  Active:      'نشط',
  Inactive:    'غير نشط',
  Draft:       'مسودة',
  UnderReview: 'قيد المراجعة',
  Cancelled:   'ملغى',
};

// ─── Report Types ─────────────────────────────────────────────────────────────
const REPORT_TYPE_MAP = {
  Proposal: 'مقترح',
  Progress: 'تقرير مرحلي',
  Final:    'التقرير النهائي',
  Initial:  'تقرير أولي',
  Weekly:   'تقرير أسبوعي',
  Monthly:  'تقرير شهري',
};

// ─── User Roles ───────────────────────────────────────────────────────────────
const ROLE_MAP = {
  Student:          'الطالب',
  Supervisor:       'المشرف الأكاديمي',
  Admin:            'مدير الكلية',
  HeadOfDepartment: 'رئيس القسم',
  SuperAdmin:       'مدير النظام',
  HOD:              'رئيس القسم',
  Guest:            'زائر',
};

// ─── Request Status ───────────────────────────────────────────────────────────
const REQUEST_STATUS_MAP = {
  Pending:  'قيد الانتظار',
  Approved: 'معتمد',
  Rejected: 'مرفوض',
  Resolved: 'تم الحل',
  Closed:   'مغلق',
};

// ─── Meeting Status ───────────────────────────────────────────────────────────
const MEETING_STATUS_MAP = {
  Scheduled: 'مجدولة',
  Completed: 'مكتملة',
  Cancelled: 'ملغاة',
  Pending:   'قيد الانتظار',
};

// ─── Task Status ──────────────────────────────────────────────────────────────
const TASK_STATUS_MAP = {
  Todo:       'للتنفيذ',
  InProgress: 'قيد التنفيذ',
  Done:       'مكتمل',
  Blocked:    'موقوف',
  Cancelled:  'ملغى',
};

// ─── Task Priority ────────────────────────────────────────────────────────────
const TASK_PRIORITY_MAP = {
  Low:    'منخفض',
  Medium: 'متوسط',
  High:   'مرتفع',
  Urgent: 'عاجل',
};

// ─── Helper: safe lookup with fallback ───────────────────────────────────────
const lookup = (map, value) => {
  if (!value) return '';
  const key = String(value).trim();
  return map[key] ?? value; // fallback to original if not found
};

// ─── Exported Translation Functions ──────────────────────────────────────────

/** Translate project/team/proposal status to Arabic */
export const translateStatus = (status) => lookup(PROJECT_STATUS_MAP, status);

/** Translate report type to Arabic */
export const translateReportType = (type) => lookup(REPORT_TYPE_MAP, type);

/** Translate user role to Arabic */
export const translateRole = (role) => lookup(ROLE_MAP, role);

/** Translate request status to Arabic */
export const translateRequestStatus = (status) => lookup(REQUEST_STATUS_MAP, status);

/** Translate meeting status to Arabic */
export const translateMeetingStatus = (status) => lookup(MEETING_STATUS_MAP, status);

/** Translate task status to Arabic */
export const translateTaskStatus = (status) => lookup(TASK_STATUS_MAP, status);

/** Translate task priority to Arabic */
export const translateTaskPriority = (priority) => lookup(TASK_PRIORITY_MAP, priority);

/**
 * Get Tailwind color classes for a given status value.
 * Returns { bg, text, border, dot } classes.
 */
export const getStatusColors = (status) => {
  const s = String(status ?? '').toLowerCase();

  if (['approved', 'completed', 'done', 'active', 'resolved'].includes(s)) {
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
  }
  if (['rejected', 'cancelled', 'inactive', 'blocked'].includes(s)) {
    return { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' };
  }
  if (['inprogress', 'underreview', 'scheduled'].includes(s)) {
    return { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' };
  }
  if (['archived'].includes(s)) {
    return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' };
  }
  // Default: pending / unknown
  return { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
};

export default {
  translateStatus,
  translateReportType,
  translateRole,
  translateRequestStatus,
  translateMeetingStatus,
  translateTaskStatus,
  translateTaskPriority,
  getStatusColors,
};
