export const initialKPIsData = [];

export const initialCaseDistributionData = [
  { name: "أمراض باطنة", count: 820, color: "#3b82f6" },
  { name: "جراحة عامة", count: 640, color: "#10b981" },
  { name: "أطفال", count: 480, color: "#8b5cf6" },
  { name: "قلب وأوعية دموية", count: 320, color: "#f59e0b" },
  { name: "عظام", count: 275, color: "#ef4444" },
  { name: "أخرى", count: 180, color: "#6b7280" }
];

export const initialPerformanceKPIs = [
  {
    title: "أفضل طبيب (حالات)",
    subtitle: "د. أحمد سمير",
    text: "124 حالة هذا الشهر",
    color: "amber"
  },
  {
    title: "أكثر قسم استقبالاً",
    subtitle: "قسم الطوارئ",
    text: "340 مريض هذا الأسبوع",
    color: "rose"
  },
  {
    title: "متوسط مدة الإقامة",
    subtitle: "4.2 أيام للمريض",
    text: "تحسن بنسبة 11%-",
    color: "blue"
  },
  {
    title: "إشغال الأسرة المستهدف",
    subtitle: "نسبة إشغال 78%",
    text: "مستهدف الربع: 80%",
    color: "emerald"
  }
];

export const initialAlertsData = [
  {
    id: 1,
    type: "danger",
    title: "ارتفاع إشغال العناية المركزة إلى 95%",
    text: "تجاوز قسم العناية المركزة الطاقة الاستيعابية الآمنة. يرجى توجيه رئيس القسم لتقييم الحالات وتنسيق النقل المحتمل.",
    time: "منذ 10 دقائق"
  },
  {
    id: 2,
    type: "warning",
    title: "نقص أطباء بقسم الأطفال",
    text: "يوجد نقص في تغطية المناوبات المسائية بقسم الأطفال للأسبوع المقبل نتيجة إجازات طارئة. يرجى مراجعة وتعديل جدول المناوبات.",
    time: "منذ ساعتين"
  },
  {
    id: 3,
    type: "info",
    title: "زيادة عدد العمليات بقسم الجراحة",
    text: "تم رصد زيادة بنسبة 20% في العمليات الجراحية المجدولة للثلاثة أيام القادمة. تم التنسيق مع التمريض والتعقيم لتأمين المستلزمات.",
    time: "منذ 4 ساعات"
  }
];
