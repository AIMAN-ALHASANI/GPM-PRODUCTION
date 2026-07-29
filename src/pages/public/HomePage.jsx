import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import archiveService from '../../services/archiveService';
import Logo from '../../assets/Logo';
import { formatNumber } from '../../utils/formatNumber';
import heroImage from '../../assets/hero.webp';

// ── Animated Counter Hook ──────────────────────────────────────────────────────
function useAnimatedCounter(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const StatDisplay = ({ value, label, loading, isPrimary }) => {
  const animValue = useAnimatedCounter(value);
  return (
    <div className={`p-8 rounded-2xl text-center card-hover transition-all border ${isPrimary
      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-premium'
      }`}>
      <span className={`text-4xl font-extrabold block mb-2 ${isPrimary ? 'text-white' : 'text-primary'}`}>
        {loading ? (
          <span className={`inline-block w-16 h-8 animate-pulse rounded ${isPrimary ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}></span>
        ) : (
          `${formatNumber(animValue)}+`
        )}
      </span>
      <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-white/80' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('جميع الأقسام');
  const [selectedYear, setSelectedYear] = useState('جميع السنوات');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const [departments, setDepartments] = useState(['جميع الأقسام']);
  const [academicYears, setAcademicYears] = useState(['جميع السنوات']);
  const [statistics, setStatistics] = useState({ completedProjects: 0, activeStudents: 0, activeSupervisors: 0 });
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingArchive, setLoadingArchive] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  // Fetch initial metadata, stats, and featured projects
  useEffect(() => {
    // Statistics
    archiveService.getPublicStatistics()
      .then(data => {
        setStatistics(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error fetching statistics:', err);
        setLoadingStats(false);
      });

    // Featured Projects
    archiveService.getPublicFeaturedProjects()
      .then(data => {
        setFeaturedProjects(data);
        setLoadingFeatured(false);
      })
      .catch(err => {
        console.error('Error fetching featured projects:', err);
        setLoadingFeatured(false);
      });

    // Filters lists
    Promise.all([
      archiveService.getPublicDepartments(),
      archiveService.getPublicYears()
    ])
      .then(([depts, yrs]) => {
        setDepartments(['جميع الأقسام', ...depts]);
        setAcademicYears(['جميع السنوات', ...yrs]);
      })
      .catch(err => console.error('Error fetching filters data:', err));
  }, []);

  // Fetch archive projects (landing table list)
  const fetchArchiveProjects = () => {
    setLoadingArchive(true);
    archiveService.getPublicArchiveProjects({
      page: 1,
      pageSize: 5,
      search: searchTerm,
      department: selectedDepartment,
      year: selectedYear
    })
      .then(data => {
        setProjects(data.items || []);
        setLoadingArchive(false);
      })
      .catch(err => {
        console.error('Error fetching archives:', err);
        setLoadingArchive(false);
      });
  };

  useEffect(() => {
    fetchArchiveProjects();
  }, [selectedDepartment, selectedYear]);

  // Scroll Reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [featuredProjects, projects, loadingStats, loadingFeatured, loadingArchive]);

  // Scroll Spy for Navigation
  useEffect(() => {
    const sectionIds = ['home', 'about', 'features', 'workflow', 'audience', 'archive'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  const handleApplyFilters = () => {
    fetchArchiveProjects();
  };

  const handleViewSummary = (id) => {
    navigate(`/archive/${id}`);
  };

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription email:', newsletterEmail);
    setNewsletterEmail('');
    alert('تم الاشتراك في النشرة البريدية بنجاح!');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <nav className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Logo variant="full" size="md" />
          </div>
          <div className="hidden md:flex items-center gap-8 font-arabic">
            {[
              { id: 'home', label: 'الرئيسية' },
              { id: 'about', label: 'عن النظام' },
              { id: 'features', label: 'المميزات' },
              { id: 'workflow', label: 'دورة حياة المشروع' },
              { id: 'audience', label: 'المستخدمون' },
              { id: 'archive', label: 'الأرشيف' }
            ].map(nav => (
              <button
                key={nav.id}
                className={`font-semibold transition-colors ${
                  activeSection === nav.id 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                }`}
                onClick={() => scrollToSection(nav.id)}
              >
                {nav.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all">تسجيل الدخول</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden pt-20 pb-28 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6 reveal-on-scroll delay-100">البوابة الأكاديمية الرقمية</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 reveal-on-scroll delay-200">
                نظام إدارة مشاريع التخرج
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400 mb-6 reveal-on-scroll delay-300">
                منصة لإدارة ومتابعة مشاريع التخرج الأكاديمية
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl mb-8 reveal-on-scroll delay-400">
                تعاون، وثّق، وتميز في رحلتك الأكاديمية. يربط النظام الطلاب والمشرفين لمتابعة الأبحاث وخطط العمل والتسليمات من البداية وحتى التقييم والأرشفة الرقمية.
              </p>
              <div className="flex flex-wrap gap-4 justify-end reveal-on-scroll delay-500">
                <Link to="/login" className="group flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  <span>ابدأ الآن</span>
                  <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1.5 text-lg">arrow_back</span>
                </Link>
                <button onClick={() => scrollToSection('about')} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-primary rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">استكشف النظام</button>
              </div>
            </div>
            <div className="relative group reveal-on-scroll delay-350">
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full"></div>
              <img
                className="relative z-10 w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl border border-slate-200/55 dark:border-slate-800/55"
                alt="طلاب يعملون على مشروع تخرج"
                src={heroImage}
                width="649"
                height="519"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute bottom-8 -right-8 z-20 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border-r-4 border-primary max-w-xs text-right reveal-on-scroll delay-600">
                <p className="font-bold text-slate-900 dark:text-white mb-1">تميز أكاديمي</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">جميع المشاريع تخضع لمراجعة دقيقة لضمان أعلى المعايير الأكاديمية.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-slate-150 dark:bg-slate-800/50 py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="reveal-on-scroll delay-100">
                <StatDisplay value={statistics.completedProjects} label="مشروع مكتمل" loading={loadingStats} isPrimary={false} />
              </div>
              <div className="reveal-on-scroll delay-200">
                <StatDisplay value={statistics.activeStudents} label="طالب نشط" loading={loadingStats} isPrimary={true} />
              </div>
              <div className="reveal-on-scroll delay-300">
                <StatDisplay value={statistics.activeSupervisors} label="مشرف خبير" loading={loadingStats} isPrimary={false} />
              </div>
            </div>
          </div>
        </section>

        {/* System Introduction Section */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="about">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 text-right space-y-6 reveal-on-scroll">
              <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/5 px-3 py-1 rounded-md border border-primary/10">مفهوم وهدف المنصة</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">إدارة مشاريع التخرج بأسلوب علمي ومنظم</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                يهدف نظام إدارة مشاريع التخرج إلى حوكمة وتيسير رحلة الطالب الأكاديمية في مرحلة التخرج بالكامل. يربط النظام بين الكليات والأقسام العلمية، والمشرفين الأكاديميين، والطلاب، ويسهل التعاون بين أعضاء الفريق الواحد ويوثق المخرجات الأكاديمية بشكل رقمي آمن.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300 font-semibold">
                <div className="flex items-center gap-2 justify-end">
                  <span>إدارة مشاريع التخرج والوثائق</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>تكوين الفرق وتعيين قادة الفرق</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>توزيع وتوجيه المشرفين الأكاديميين</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>متابعة المقترحات والموافقات العلمية</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>التقييم المستمر والتقارير المرحلية</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>أرشفة المشاريع وحماية الحقوق</span>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-right reveal-on-scroll delay-200">
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">الأرشفة والتوثيق الأكاديمي</h3>
              <p className="text-slate-550 dark:text-slate-450 leading-relaxed text-sm mb-6">
                يوفر النظام منصة موحدة لعرض مشاريع التخرج المكتملة والمؤرشفة علمياً لكل قسم وكلية، ليكون مرجعاً بحثياً موثوقاً للأجيال القادمة والحد من تكرار الأبحاث، مما يدعم روح الابتكار والتطوير.
              </p>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex gap-4 items-start justify-end">
                <div className="text-right">
                  <h4 className="font-bold text-primary mb-1">مطابقة معايير الجودة</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تسهيل مراجعة الكليات للخطط الدراسية ومخرجات التعلم الأكاديمية.</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-850/10 border-y border-slate-200 dark:border-slate-800" id="features">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <div className="mb-12 reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">مميزات المنصة</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">كل ما تحتاجه لإنجاح رحلة التخرج</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
              {[
                { title: 'إدارة مشاريع التخرج', desc: 'لوحة تحكم متكاملة لمتابعة المهام والمشروعات وسير تسليم الملفات بشكل دوري وممنهج.', icon: 'account_tree' },
                { title: 'تكوين الفرق الطلابية', desc: 'إمكانية تجميع الطلاب وإنشاء فرق تخرج وتعيين قائد الفريق لتنظيم وإرسال المقترحات والتقارير.', icon: 'group' },
                { title: 'إدارة المشرفين الأكاديميين', desc: 'ربط المشرف الأكاديمي بالفريق وتسهيل جدولة الاجتماعات ورفع التقييمات العلمية للمجموعات.', icon: 'supervisor_account' },
                { title: 'إدارة التقارير والمقترحات', desc: 'تسليم مقترحات المشاريع والتقارير الدورية لرئيس القسم الأكاديمي والمشرف لتقييمها واعتمادها.', icon: 'description' },
                { title: 'الأرشفة الأكاديمية للمشاريع', desc: 'مكتبة رقمية تحتفظ بجميع مشاريع التخرج السابقة مع تفاصيل التقييمات والأعضاء لتكون مرجعاً للقسم.', icon: 'archive' },
                { title: 'متابعة سير المشروع', desc: 'متابعة حية للمهام المكلفة للطلاب وإرسال التنبيهات والطلبات وتتبع تواريخ الاستحقاق لتفادي التأخير.', icon: 'analytics' }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-interactive reveal-on-scroll" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 mr-0 ml-auto">
                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section (Project Lifecycle) */}
        <section className="py-20 px-6 md:px-12" id="workflow">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">مسار العمل</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">دورة حياة مشروع التخرج</h2>
            </div>

            <div className="relative">
              {/* Desktop timeline line */}
              <div className="hidden lg:block absolute top-10 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 text-center">
                {[
                  { step: '01', title: 'إنشاء الفريق', desc: 'تجمع الطلاب مع قائد وتحديد أسماء الأعضاء.' },
                  { step: '02', title: 'تقديم المقترح', desc: 'كتابة مقترح الفكرة التقنية وأهداف المشروع العلمية.' },
                  { step: '03', title: 'اعتماد المشروع', desc: 'مراجعة المقترح والموافقة عليه من قبل رئيس القسم.' },
                  { step: '04', title: 'تنفيذ المشروع', desc: 'مباشرة العمل وتوزيع المهام والتطوير الفعلي.' },
                  { step: '05', title: 'التقارير المرحلية', desc: 'تسليم تقارير دورية للمشرف لمتابعة الإنجاز.' },
                  { step: '06', title: 'التقييم النهائي', desc: 'عرض مخرجات المشروع وتقييمها من قبل اللجان الأكاديمية.' },
                  { step: '07', title: 'الأرشفة الأكاديمية', desc: 'حفظ وثائق وصور المشروع في أرشيف الكلية الرقمي.' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center group reveal-on-scroll" style={{ transitionDelay: `${(index % 7) * 100}ms` }}>
                    <div className="size-16 rounded-full bg-white dark:bg-slate-950 text-primary border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-xl mb-4 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-350">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-2 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Audience Section (Who Uses the System) */}
        <section className="py-20 bg-slate-100 dark:bg-slate-800/30 border-y border-slate-200 dark:border-slate-800" id="audience">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <div className="mb-12 reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">المستفيدون</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">من يستخدم النظام؟</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-right">
              {[
                { role: 'الطلاب', desc: 'تأسيس الفرق، تقديم مقترحات الأفكار، متابعة المهام وتلقي التقييمات وجدولة لقاءات المشرفين.', icon: 'school' },
                { role: 'المشرفون', desc: 'توجيه الفرق البحثية، تقييم التقارير الدورية والمشاريع ومتابعة اجتماعات المجموعات الأكاديمية.', icon: 'supervisor_account' },
                { role: 'رؤساء الأقسام', desc: 'اعتماد مقترحات مشاريع التخرج، توزيع المشرفين الأكاديميين، ومتابعة إحصائيات ونشاطات القسم.', icon: 'account_balance' },
                { role: 'مدراء الكليات', desc: 'إدارة شؤون الأقسام العلمية، تفعيل وتعطيل الحسابات، ومتابعة التميز والأداء الأكاديمي العام للكليات.', icon: 'admin_panel_settings' },
                { role: 'إدارة النظام', desc: 'إدارة البنية الأساسية للمنصة، الكليات والجامعات، ومراقبة صحة ونشاط جميع المستخدمين الفعليين.', icon: 'shield_person' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between reveal-on-scroll" style={{ transitionDelay: `${(i % 5) * 100}ms` }}>
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 mr-0 ml-auto">
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.role}</h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10 text-right reveal-on-scroll">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">معرض المشاريع المتميزة</h2>
              <p className="text-slate-500 dark:text-slate-400">أعلى مشاريع التخرج تقييماً في الأرشيف</p>
            </div>
            <Link to="/archive" className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">عرض الكل <span className="material-symbols-outlined text-sm">arrow_back</span></Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 h-96 flex flex-col">
                  <div className="bg-slate-200 dark:bg-slate-800 h-56 w-full"></div>
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="mt-auto h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">لا توجد مشاريع متميزة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <article key={project.archivedProjectID} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-slate-200 dark:border-slate-800 flex flex-col justify-between reveal-on-scroll" style={{ transitionDelay: `${(index % 3) * 150}ms` }}>
                  <div>
                    <div className="h-56 overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={project.projectTitle}
                        src={project.projectImagePath ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${project.projectImagePath}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'}
                      />
                      <div className="absolute top-4 right-4 bg-primary text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
                        {project.evaluationScore} / 100
                      </div>
                    </div>
                    <div className="p-6 text-right">
                      <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded mb-3">{project.departmentName}</div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{project.projectTitle}</h3>
                    </div>
                  </div>
                  <div className="p-6 pt-0 text-right">
                    <div className="flex justify-between text-sm text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 mb-4">
                      <span>المشرف: {project.supervisorName}</span>
                      <span>{project.year}</span>
                    </div>
                    <Link
                      to={`/archive/${project.archivedProjectID}`}
                      className="inline-block text-center w-full py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-primary hover:text-white text-primary rounded-lg font-bold text-sm transition-all"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Archive Section */}
        <section className="bg-slate-100 dark:bg-slate-800/30 py-20 px-6 md:px-12" id="archive">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 text-right reveal-on-scroll">المشاريع الأكاديمية</h2>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center mb-8 reveal-on-scroll delay-100">
              <div className="relative w-full lg:flex-1">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full pr-12 pl-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 text-right"
                  placeholder="ابحث عن مشروع، قسم، مشرف، أو فريق..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <select
                  className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-lg border-none text-sm dark:text-slate-205 text-right"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select
                  className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-lg border-none text-sm dark:text-slate-205 text-right"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <button onClick={handleApplyFilters} className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors w-full sm:w-auto">تصفية</button>
              </div>
            </div>

            {loadingArchive ? (
              <div className="w-full animate-pulse bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-4 reveal-on-scroll delay-200">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 reveal-on-scroll delay-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-3">folder_open</span>
                <p className="text-slate-500">لم يتم العثور على أي نتائج مطابقة</p>
              </div>
            ) : (
              <div className="overflow-x-auto reveal-on-scroll delay-200">
                <table className="w-full text-right border-collapse bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-200/50 dark:bg-slate-800/50">
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">عنوان المشروع</th>
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">القسم</th>
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">المشرف</th>
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">التقييم</th>
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">السنة</th>
                      <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left border-b border-slate-200 dark:border-slate-800">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.map((project) => (
                      <tr key={project.archivedProjectID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-5">
                          <div className="font-semibold text-slate-900 dark:text-white">{project.projectTitle}</div>
                        </td>
                        <td className="p-5 text-sm text-slate-700 dark:text-slate-300">{project.departmentName}</td>
                        <td className="p-5 text-sm text-slate-700 dark:text-slate-300">{project.supervisorName}</td>
                        <td className="p-5 text-sm font-semibold text-primary">{project.evaluationScore}</td>
                        <td className="p-5 text-sm text-slate-700 dark:text-slate-300">{project.year}</td>
                        <td className="p-5 text-left">
                          <button onClick={() => handleViewSummary(project.archivedProjectID)} className="text-primary text-sm font-semibold hover:underline">عرض الملخص</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/archive"
                className="inline-block px-8 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                تصفح المشاريع
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto" id="faq">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-12 reveal-on-scroll">الاستفسارات الأكاديمية</h2>
          <div className="space-y-4">
            <details className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-r-4 border-r-transparent open:border-r-primary transition-all reveal-on-scroll delay-100">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-lg text-slate-900 dark:text-white">ما هي متطلبات تقديم المقترح؟</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-900 dark:text-white">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
                يجب أن يتضمن المقترح بيان المشكلة والأهداف التقنية والمنهجية المقترحة والجدول الزمني الأولي. يجب تنسيق جميع الطلبات وفقًا للمعيار المؤسسي وتحميلها عبر بوابة الطالب.
              </div>
            </details>
            <details className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-r-4 border-r-transparent open:border-r-primary transition-all reveal-on-scroll delay-200">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-lg text-slate-900 dark:text-white">هل هناك قيود على حجم الفريق؟</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-900 dark:text-white">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
                تتكون الفرق القياسية من 2 إلى 6 أعضاء. يجب تقديم طلب رسمي للمشاريع الفردية أو الفرق الأكبر والموافقة عليه من قبل رئيس القسم بناءً على نطاق المشروع وتعقيده.
              </div>
            </details>
            <details className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-r-4 border-r-transparent open:border-r-primary transition-all reveal-on-scroll delay-300">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-lg text-slate-900 dark:text-white">كيف يتم تعيين المشرفين؟</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-slate-900 dark:text-white">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
                يتم مطابقة المشرفين بناءً على خبراتهم في مجال المشروع. يمكن للطلاب إدراج أفضل ثلاثة تفضيلات لأعضاء هيئة التدريس، على أن يعود القرار النهائي لرئيس القسم.
              </div>
            </details>
          </div>
        </section>

        {/* Specializations Section */}
        <section className="py-20 px-6 md:px-12 bg-primary text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 reveal-on-scroll">
              <div className="text-center md:text-right">
                <h2 className="text-3xl font-extrabold mb-4">تخصصاتنا</h2>
                <p className="text-primary-100 text-lg">مسارات مخصصة لضمان الإتقان التقني العميق ونتائج بحثية مركزة.</p>
              </div>
              <button className="px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">تحميل المنهج</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all reveal-on-scroll delay-100">
                <span className="material-symbols-outlined text-3xl mb-3">terminal</span>
                <h4 className="font-bold text-xl mb-2">علوم الحاسوب</h4>
                <p className="text-sm opacity-80">الخوارزميات والذكاء الاصطناعي وأسس الحوسبة النظرية.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all reveal-on-scroll delay-200">
                <span className="material-symbols-outlined text-3xl mb-3">cloud</span>
                <h4 className="font-bold text-xl mb-2">تقنية المعلومات</h4>
                <p className="text-sm opacity-80">إدارة البنى التحتية الرقمية وأنظمة المؤسسات.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all reveal-on-scroll delay-300">
                <span className="material-symbols-outlined text-3xl mb-3">developer_board</span>
                <h4 className="font-bold text-xl mb-2">هندسة البرمجيات</h4>
                <p className="text-sm opacity-80">بناء بنيات برمجية قابلة للتطوير والصيانة.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all reveal-on-scroll delay-400">
                <span className="material-symbols-outlined text-3xl mb-3">security</span>
                <h4 className="font-bold text-xl mb-2">الأمن السيبراني</h4>
                <p className="text-sm opacity-80">حماية الأصول الرقمية في عالم مترابط.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 py-12 px-6 md:px-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo variant="full" size="md" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">نظام أكاديمي معاصر مخصص للإدارة الصارمة لمشاريع التخرج والتطوير التقني المهني.</p>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-70">language</span>
                <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-70">alternate_email</span>
                <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-70">verified</span>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">الموارد</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">التوثيق</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">إرشادات المشاريع</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">القوالب</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">التنقل</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">شروط الخدمة</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">البوابة الجامعية</a></li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h5 className="font-bold text-primary mb-3">التحديثات المؤسسية</h5>
              <p className="text-xs text-slate-500 mb-4">استلم إشعارات حول المواعيد النهائية وجداول المراجعة.</p>
              <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
                <input
                  className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  placeholder="البريد الجامعي"
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">انضمام</button>
              </form>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-400">© ٢٠٢٤ GPM. نظام أكاديمي معاصر لإدارة مشاريع التخرج.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
