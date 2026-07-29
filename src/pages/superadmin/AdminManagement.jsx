import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdminService';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    collegeId: ''
  });
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminsAndColleges();
  }, []);

  const fetchAdminsAndColleges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [adminsRes, collegesRes] = await Promise.all([
        superAdminService.getAdmins(),
        superAdminService.getCollegeStats()
      ]);

      if (adminsRes.success) setAdmins(adminsRes.data);
      if (collegesRes.success) setColleges(collegesRes.data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الحسابات والكليات.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      collegeId: colleges[0]?.collegeID || ''
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName,
      email: admin.email,
      password: '', // Password not editable on simple details update
      collegeId: admin.collegeID
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleToggleStatus = async (admin) => {
    try {
      const updatedStatus = !admin.isActive;
      const res = await superAdminService.toggleAdminStatus(admin.userID, updatedStatus);
      if (res.success) {
        setAdmins(admins.map(a => a.userID === admin.userID ? { ...a, isActive: updatedStatus } : a));
      } else {
        alert(res.message || 'فشل تغيير حالة الحساب');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء تحديث حالة الحساب');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (editingAdmin) {
        // Update Action (Note: Password and College changes might be restricted depending on endpoint implementation)
        const payload = {
          fullName: formData.fullName,
          email: formData.email
        };
        const res = await superAdminService.updateAdmin(editingAdmin.userID, payload);
        if (res.success) {
          setShowModal(false);
          fetchAdminsAndColleges();
        } else {
          setSubmitError(res.message || 'فشل تعديل حساب المدير');
        }
      } else {
        // Create Action
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          collegeID: parseInt(formData.collegeId)
        };
        const res = await superAdminService.createAdmin(payload);
        if (res.success) {
          setShowModal(false);
          fetchAdminsAndColleges();
        } else {
          setSubmitError(res.message || 'فشل إنشاء حساب المدير');
        }
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'خطأ في العملية. تأكد من صحة البيانات أو تفرد البريد الإلكتروني.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خطأ في التحميل</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">مدراء الكليات</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">إدارة وتعيين حسابات المشرفين والمدراء الرئيسيين لكل كلية في النظام.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all text-sm font-semibold shadow-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          إضافة مدير جديد
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
              <th className="px-6 py-4">الاسم الكامل</th>
              <th className="px-6 py-4">البريد الإلكتروني</th>
              <th className="px-6 py-4">الكلية المعين عليها</th>
              <th className="px-6 py-4">تاريخ الإنشاء</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {admins?.map((admin) => (
              <tr key={admin.userID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{admin.fullName}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{admin.email}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{admin.collegeName}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums">
                  {new Date(admin.createdAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    admin.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {admin.isActive ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(admin)}
                      className="p-1 text-slate-500 hover:text-primary transition-colors"
                      title="تعديل البيانات"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      className={`p-1 transition-colors ${
                        admin.isActive ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'
                      }`}
                      title={admin.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {admin.isActive ? 'block' : 'check_circle'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!admins || admins.length === 0) && (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">لا يوجد مدراء كليات مسجلين في النظام حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAdmin ? 'تعديل بيانات مدير الكلية' : 'إنشاء حساب مدير كلية جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-semibold rounded-lg">
                  {submitError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">الاسم الكامل</label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="مثال: د. أحمد محمد محمود"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">البريد الإلكتروني</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="admin@college.edu"
                />
              </div>

              {!editingAdmin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">كلمة المرور</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {!editingAdmin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">الكلية المعين عليها</label>
                  <select
                    value={formData.collegeId}
                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    {colleges?.map((col) => (
                      <option key={col.collegeID} value={col.collegeID}>{col.collegeName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : editingAdmin ? 'تعديل الحساب' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
