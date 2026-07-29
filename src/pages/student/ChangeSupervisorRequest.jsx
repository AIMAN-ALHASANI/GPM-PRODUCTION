import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import requestService from '../../services/requestService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const ChangeSupervisorRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    NewSupervisorID: '',
    Reason: ''
  });
  const [supervisors, setSupervisors] = useState([]);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await userService.getCollegeSupervisors();
        const rawList = Array.isArray(data) ? data : (data?.data || []);
        const normalized = rawList.map(s => {
          const id = Number(s.userID ?? s.UserID ?? s.id ?? s.Id);
          const fullName = s.fullName ?? s.FullName ?? s.name ?? s.Name ?? "مشرف بدون اسم";
          return { id, fullName };
        }).filter(s => Number.isInteger(s.id) && s.id > 0);
        setSupervisors(normalized);
      } catch (err) {
        console.error('Error fetching supervisors:', err);
        toast.error('تعذر تحميل قائمة المشرفين');
      } finally {
        setIsLoadingSupervisors(false);
      }
    };
    fetchSupervisors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.NewSupervisorID || !formData.Reason) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestService.changeSupervisor(formData);
      toast.success('تم إرسال طلب تغيير المشرف بنجاح');
      navigate('/student/dashboard');
    } catch (error) {
      // Error handled by apiClient
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">طلب تغيير مشرف</span>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">طلب تغيير المشرف</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">يرجى اختيار المشرف الجديد وتوضيح سبب الطلب.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المشرف الجديد</label>
            {isLoadingSupervisors ? (
              <div className="text-sm text-slate-400 animate-pulse">جاري تحميل قائمة المشرفين...</div>
            ) : (
              <select
                value={formData.NewSupervisorID}
                onChange={(e) => setFormData({ ...formData, NewSupervisorID: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                dir="rtl"
                required
              >
                <option value="">-- اختر المشرف الجديد --</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">سبب التغيير</label>
            <textarea
              value={formData.Reason}
              onChange={(e) => setFormData({ ...formData, Reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px]"
              placeholder="اشرح سبب رغبتك في تغيير المشرف..."
              required
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeSupervisorRequest;
