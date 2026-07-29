import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import requestService from '../../services/requestService';
import toast from 'react-hot-toast';

const ChangeProjectRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    NewProjectTitle: '',
    NewProjectDescription: '',
    Reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.NewProjectTitle || !formData.NewProjectDescription || !formData.Reason) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestService.changeProject(formData);
      toast.success('تم إرسال طلب تغيير المشروع بنجاح');
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
        <span className="text-slate-900 dark:text-white font-medium">طلب تغيير مشروع</span>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">طلب تغيير المشروع</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">يرجى إدخال تفاصيل المشروع الجديد وسبب التغيير.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان المشروع الجديد</label>
            <input
              type="text"
              value={formData.NewProjectTitle}
              onChange={(e) => setFormData({ ...formData, NewProjectTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="أدخل عنوان المشروع الجديد"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">وصف المشروع الجديد</label>
            <textarea
              value={formData.NewProjectDescription}
              onChange={(e) => setFormData({ ...formData, NewProjectDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
              placeholder="اشرح فكرة المشروع الجديد..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">سبب التغيير</label>
            <textarea
              value={formData.Reason}
              onChange={(e) => setFormData({ ...formData, Reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
              placeholder="اشرح سبب رغبتك في تغيير المشروع..."
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

export default ChangeProjectRequest;
