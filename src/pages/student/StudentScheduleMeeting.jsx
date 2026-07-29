import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SupervisorSelectCard = ({ supervisor, onSelect }) => (
  <div className="relative group">
    <div 
      onClick={onSelect}
      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
        <img alt="Supervisor Avatar" className="w-full h-full object-cover" src={supervisor.avatar} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 dark:text-white">{supervisor.name}</h4>
        <p className="text-sm text-slate-500">{supervisor.title}</p>
      </div>
      <span className="material-symbols-outlined text-slate-400">expand_more</span>
    </div>
  </div>
);

const MeetingTypeButtons = ({ selectedType, onTypeChange }) => (
  <div className="flex gap-3">
    <button 
      type="button"
      onClick={() => onTypeChange('online')}
      className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
        selectedType === 'online' 
          ? 'bg-primary text-white' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 hover:border-primary/40'
      }`}
    >
      <span className="material-symbols-outlined text-base">videocam</span> عبر الإنترنت
    </button>
    <button 
      type="button"
      onClick={() => onTypeChange('in_person')}
      className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
        selectedType === 'in_person' 
          ? 'bg-primary text-white' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 hover:border-primary/40'
      }`}
    >
      <span className="material-symbols-outlined text-base">location_on</span> حضوري
    </button>
  </div>
);

const DateTimePicker = ({ value, onChange, error }) => (
  <div className="relative">
    <input 
      type="date" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-3 pl-10 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none`} 
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-base">calendar_month</span>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const TimeSlotsGrid = ({ slots, onSelect, error }) => (
  <div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {slots.map((slot, index) => (
        <button 
          key={index}
          type="button"
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={`py-3 text-xs font-bold rounded-xl transition-all ${
            !slot.available 
              ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border' 
              : slot.selected 
                ? 'bg-primary text-white border-primary border shadow-md' 
                : 'border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
  </div>
);

const AgendaTextarea = ({ value, onChange, error }) => (
  <div>
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none outline-none`} 
      placeholder="صف الغرض من هذا الاجتماع، العوائق المحددة، أو الإنجازات التي تم الوصول إليها..." 
      rows="5"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FormActions = ({ onCancel, isSubmitting }) => (
  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
    <button 
      type="submit"
      disabled={isSubmitting}
      className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
    >
      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
    </button>
    <button 
      type="button"
      onClick={onCancel}
      className="w-full sm:w-auto text-slate-500 font-semibold px-8 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-center"
    >
      إلغاء
    </button>
  </div>
);

const SupervisorStatusCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
      <h3 className="font-bold text-lg text-slate-800 dark:text-white">حالة المشرف</h3>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">وقت الاستجابة</span>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">&lt; ٢٤ ساعة</span>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed px-1">
        يقوم د. ثورن بمراجعة الطلبات عادةً أيام الثلاثاء والخميس صباحًا. تحديد جلستك خلال هذه الفترات قد يؤدي إلى موافقة أسرع.
      </p>
      <div className="pt-3 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
        <span className="material-symbols-outlined text-3xl text-slate-400">bar_chart</span>
        <p className="text-[10px] text-slate-400 mt-1">مخطط عبء العمل الأسبوعي</p>
      </div>
    </div>
  </div>
);

const MeetingTipsCard = () => (
  <div className="bg-primary text-white rounded-xl p-6 relative overflow-hidden">
    <div className="absolute -left-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <span className="material-symbols-outlined text-amber-200">lightbulb</span>
      <h3 className="font-bold text-lg">نصائح الاجتماع</h3>
    </div>
    <ul className="space-y-4 relative z-10">
      <li className="flex gap-3 items-start">
        <span className="material-symbols-outlined text-sm mt-0.5 text-amber-200">check_circle</span>
        <p className="text-sm font-medium leading-snug">قم بإعداد جدول أعمالك قبل يومين على الأقل.</p>
      </li>
      <li className="flex gap-3 items-start">
        <span className="material-symbols-outlined text-sm mt-0.5 text-amber-200">check_circle</span>
        <p className="text-sm font-medium leading-snug">اربط المستندات ذات الصلة بمستودع مشروعك قبل الاجتماع.</p>
      </li>
      <li className="flex gap-3 items-start">
        <span className="material-symbols-outlined text-sm mt-0.5 text-amber-200">check_circle</span>
        <p className="text-sm font-medium leading-snug">كن مستعدًا لمناقشة الخطوات التالية والإنجازات.</p>
      </li>
    </ul>
  </div>
);

const InspirationalQuoteCard = ({ quote, author }) => (
  <div className="px-3 italic text-slate-500 text-sm border-r-4 border-primary/30 pr-5 py-3 bg-white dark:bg-slate-900 rounded-xl">
    <p>"{quote}"</p>
    <span className="block mt-2 font-bold not-italic text-slate-600 dark:text-slate-400 text-xs">— {author}</span>
  </div>
);

const StudentScheduleMeeting = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    supervisor: {
      id: 1,
      name: "د. أريث ثورن",
      title: "منسق المشاريع الرئيسي",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqV2qKGcmgTIqKfHKkdtPICFTzRr5XFA24by85WHWhgQcNAblCbA5_JGUqWX-D1C9z30uoP1HPmceRnwpBrQqCy6syjmqs-UCcREwg2uTvLHGrQw_hIinKDFjsjEEWD7sB0cBHpnAnOGsfkujb7UbfEiz_QnBZHCcpgjIDliEw2wEalYi1_79dezLH4nbHhXX9WnDRm4NU5oiaEOl9954E_lmOfQCI3_HHrWMsx2GCzCw0uWDmR80_5gyQCMpKD772yT18f2wYoxjP"
    },
    meetingType: "online",
    date: "2024-09-10",
    timeSlot: "١١:٣٠ ص",
    agenda: ""
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { time: "٠٩:٠٠ ص", available: true, selected: false },
    { time: "١١:٣٠ ص", available: true, selected: true },
    { time: "٠٢:٠٠ م", available: true, selected: false },
    { time: "٠٤:٣٠ م", available: false, selected: false }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleMeetingTypeChange = (type) => {
    setFormData({ ...formData, meetingType: type });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
    if (errors.date) setErrors({ ...errors, date: null });
  };

  const handleTimeSlotSelect = (time) => {
    setFormData({ ...formData, timeSlot: time });
    setAvailableTimeSlots(slots => 
      slots.map(slot => ({
        ...slot,
        selected: slot.time === time
      }))
    );
    if (errors.timeSlot) setErrors({ ...errors, timeSlot: null });
  };

  const handleAgendaChange = (text) => {
    setFormData({ ...formData, agenda: text });
    if (errors.agenda) setErrors({ ...errors, agenda: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) {
      newErrors.date = "يرجى تحديد تاريخ الاجتماع";
    }
    if (!formData.timeSlot) {
      newErrors.timeSlot = "يرجى تحديد وقت الاجتماع";
    }
    if (!formData.agenda || formData.agenda.trim().length < 10) {
      newErrors.agenda = "يرجى تقديم وصف لا يقل عن 10 أحرف";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      console.log("Submitting meeting request...", formData);
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/student/meetings');
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/student/meetings" className="hover:text-primary">الاجتماعات</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">جدولة اجتماع جديد</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">طلب جلسة</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">جدولة اجتماع جديد</h1>
            <p className="text-slate-500 max-w-2xl text-base">اقترح جلسة رسمية مع مشرفك الأكاديمي. اختر الموعد المناسب وحدد أهدافك بوضوح.</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Schedule Meeting Form */}
          <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Supervisor Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">اختيار المشرف</label>
                <SupervisorSelectCard 
                  supervisor={formData.supervisor}
                  onSelect={() => console.log('Supervisor selection clicked')}
                />
              </div>

              {/* Meeting Type & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">نوع الاجتماع</label>
                  <MeetingTypeButtons 
                    selectedType={formData.meetingType}
                    onTypeChange={handleMeetingTypeChange}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">اختر التاريخ</label>
                  <DateTimePicker 
                    value={formData.date}
                    onChange={handleDateChange}
                    error={errors.date}
                  />
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">المواعيد المتاحة (الـ ٤٨ ساعة القادمة)</label>
                <TimeSlotsGrid 
                  slots={availableTimeSlots}
                  onSelect={handleTimeSlotSelect}
                  error={errors.timeSlot}
                />
              </div>

              {/* Agenda */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">جدول الأعمال والوصف</label>
                <AgendaTextarea 
                  value={formData.agenda}
                  onChange={handleAgendaChange}
                  error={errors.agenda}
                />
              </div>

              {/* Action Buttons */}
              <FormActions 
                onCancel={() => navigate('/student/meetings')}
                isSubmitting={isSubmitting}
              />
            </form>
          </section>

          {/* Right Column - Supporting Information */}
          <div className="lg:col-span-4 space-y-6">
            <SupervisorStatusCard />
            <MeetingTipsCard />
            <InspirationalQuoteCard 
              quote="الإنتاجية ليست حادثة أبدًا. إنها دائمًا نتيجة الالتزام بالتميز والتخطيط الذكي والتركيز المجهد."
              author="نقابة التميز الأكاديمي"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleMeeting;
