import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from "react-router-dom";

// Common Components
import ToastContainer from "./components/common/ToastContainer";

// Doctor Components
import DoctorSidebar from "./components/doctor/DoctorSidebar";
import DoctorHome from "./components/doctor/DoctorHome";
import DoctorPatientProfile from "./components/doctor/DoctorPatientProfile";
import DoctorTestsLabs from "./components/doctor/DoctorTestsLabs";
import DoctorEmergency from "./components/doctor/DoctorEmergency";
import DoctorSettings from "./components/doctor/DoctorSettings";

// Doctor Modals
import VisitModal from "./components/doctor/modals/VisitModal";
import PrescriptionModal from "./components/doctor/modals/PrescriptionModal";
import ReferralModal from "./components/doctor/modals/ReferralModal";
import ChronicModal from "./components/doctor/modals/ChronicModal";
import UploadModal from "./components/doctor/modals/UploadModal";
import EditDoctorModal from "./components/doctor/modals/EditDoctorModal";
import EditPrescriptionModal from "./components/doctor/modals/EditPrescriptionModal";

// Patient Components
import PatientSidebar from "./components/patient/PatientSidebar";
import PatientHome from "./components/patient/PatientHome";
import PatientProfile from "./components/patient/PatientProfile";
import PatientLabs from "./components/patient/PatientLabs";
import PatientRadiology from "./components/patient/PatientRadiology";
import PatientPrescriptions from "./components/patient/PatientPrescriptions";
import PatientMedicalCard from "./components/patient/PatientMedicalCard";
import PatientEmergency from "./components/patient/PatientEmergency";
import PatientNotifications from "./components/patient/PatientNotifications";
import PatientSettings from "./components/patient/PatientSettings";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";



const initialPatientsData = {
  "H-2026-001": {
    id: "H-2026-001",
    name: "أحمد محمد",
    age: 35,
    bloodType: "O+",
    allergies: "بنسلين (Penicillin)",
    chronicDiseases: "ضغط دم مرتفع، سكري من النوع الثاني",
    lastVisit: "2026/05/07",
    currentMedications: "أملوديبين 5 ملج (مرة يومياً)، ميتفورمين 500 ملج (مرتين يومياً)",
    status: "stable",
    alerts: [
      { text: "حساسية شديدة من البنسلين (Penicillin)", level: "danger" },
      { text: "آخر تحليل سكر تراكمي منذ 8 أشهر", level: "warning" },
      { text: "المريض يتناول أدوية قد تتعارض مع العلاج الجديد", level: "info" }
    ],
    timeline: [
      { year: "2026", event: "التهاب بسيط في الجهاز التنفسي وعلاج مضاد حيوي", icon: "🩺" },
      { year: "2026", event: "تشخيص بمرض السكري من النوع الثاني وضغط الدم", icon: "🩺" },
      { year: "2025", event: "عملية استئصال المرارة بنجاح", icon: "✂️" },
      { year: "2024", event: "تحليل صورة دم كاملة (CBC) ووظائف الكلى", icon: "🧪" },
      { year: "2023", event: "أشعة صدر عادية للتحقق من الرئتين والقلب", icon: "🩻" }
    ],
    visits: [
      { date: "2026/05/07", diagnosis: "التهاب بسيط في الجهاز التنفسي", symptoms: "سعال جاف، ارتفاع طفيف في درجة الحرارة", treatment: "مضاد حيوي 500 ملج + باراسيتامول عند الحاجة", notes: "الراحة التامة وتناول السوائل الدافئة" },
      { date: "2025/12/12", diagnosis: "ارتفاع مؤقت في ضغط الدم", symptoms: "صداع مستمر، دوار", treatment: "تعديل جرعة أملوديبين إلى 10 ملج مؤقتاً", notes: "الرجاء المتابعة وقياس الضغط مرتين يومياً" }
    ],
    labs: [
      { name: "تحليل صورة دم كاملة (CBC)", date: "2026/05/07", status: "تم الرفع", resultUrl: "#", summary: "جميع المؤشرات طبيعية باستثناء زيادة طفيفة في كرات الدم البيضاء نتيجة الالتهاب." },
      { name: "تحليل وظائف كبد وكلى", date: "2025/12/10", status: "تم الرفع", resultUrl: "#", summary: "نسب الكرياتينين واليوريا والإنزيمات في النطاق الطبيعي تماماً." }
    ],
    radiology: [
      { name: "أشعة صدر عادية (Chest X-Ray)", date: "2026/05/06", status: "تم الرفع", resultUrl: "#", report: "الرئتين والقلب بحالة سليمة تماماً ولا يوجد أي ارتشاح أو التهاب رئوي." }
    ],
    prescriptions: [
      { name: "أملوديبين Amlodipine 5mg", dosage: "قرص واحد صباحاً", duration: "مستمر (علاج ضغط)", date: "2026/05/07", doctorId: "DOC-2026-9912", doctorName: "د. أحمد محمد" },
      { name: "ميتفورمين Metformin 500mg", dosage: "قرص بعد الغداء والعشاء", duration: "مستمر (علاج سكري)", date: "2026/05/07", doctorId: "DOC-2026-9912", doctorName: "د. أحمد محمد" },
      { name: "أوجمنتين Augmentin 1g", dosage: "قرص كل 12 ساعة", duration: "7 أيام (مضاد حيوي)", date: "2026/05/07", doctorId: "DOC-2026-OTHER", doctorName: "د. سمير خالد" }
    ],
    referrals: [
      { date: "2026/05/02", type: "طبيب آخر", destination: "د. هاني (أخصائي الرمد)", reason: "فحص قاع العين السنوي لمرضى السكري", notes: "متابعة اعتلال الشبكية السكري" }
    ]
  },
  "H-2026-002": {
    id: "H-2026-002",
    name: "سارة محمود",
    age: 28,
    bloodType: "A+",
    allergies: "لا يوجد حساسية معروفة",
    chronicDiseases: "ربو شعبي (Asthma)",
    lastVisit: "2026/05/06",
    currentMedications: "بخاخ سينبيكورت (عند اللزوم)",
    status: "observation",
    alerts: [
      { text: "أزمة ربو خفيفة مسجلة مؤخراً وتتطلب المتابعة الدورية للوظائف الرئوية", level: "warning" },
      { text: "تنبيه: يجب فحص مجرى الهواء والابتعاد التام عن الأتربة والمهيجات", level: "info" }
    ],
    timeline: [
      { year: "2026", event: "أزمة ربو خفيفة وجلسة بخار فنتولين في الطوارئ", icon: "💨" },
      { year: "2026", event: "تحليل حساسية الصدر للكشف عن حبوب اللقاح", icon: "🧪" },
      { year: "2025", event: "تشخيص بالربو الشعبي المزمن وبدء العلاج الوقائي", icon: "🩺" }
    ],
    visits: [
      { date: "2026/05/06", diagnosis: "أزمة ربو خفيفة", symptoms: "ضيق في التنفس، كحة مستمرة", treatment: "جلسة بخار فنتولين + بخاخ كورتيزون", notes: "الابتعاد التام عن الأتربة والروائح النفاذة" }
    ],
    labs: [
      { name: "تحليل حساسية الصدر", date: "2026/04/15", status: "تم الرفع", resultUrl: "#", summary: "حساسية مفرطة ضد حبوب اللقاح وأتربة المنزل." }
    ],
    radiology: [
      { name: "أشعة مقطعية على الصدر (HRCT)", date: "2026/05/06", status: "تم الرفع", resultUrl: "#", report: "تظهر علامات التهاب شعب هوائية طفيف متناسب مع حالة الربو." }
    ],
    prescriptions: [
      { name: "بخاخ سينبيكورت Symbicort", dosage: "بختين عند اللزوم", duration: "مستمر", date: "2026/05/06", doctorId: "DOC-2026-OTHER", doctorName: "د. سمير خالد" }
    ],
    referrals: []
  },
  "H-2026-003": {
    id: "H-2026-003",
    name: "محمد علي",
    age: 42,
    bloodType: "B+",
    allergies: "حساسية من دواء السلفا",
    chronicDiseases: "ارتفاع الكوليسترول",
    lastVisit: "2026/05/05",
    currentMedications: "أطورستاتين 20 ملج (قبل النوم)",
    status: "critical",
    alerts: [
      { text: "حساسية شديدة مؤكدة من أدوية السلفا (Sulfonamides)", level: "danger" },
      { text: "كبد دهني من الدرجة الأولى - بحاجة لتنظيم الغذاء وتكرار الفحص", level: "warning" }
    ],
    timeline: [
      { year: "2026", event: "ارتفاع نسب الدهون الثلاثية والكوليسترول الكلي", icon: "🩸" },
      { year: "2026", event: "تحليل دهون كاملة (Lipid Profile) للمتابعة", icon: "🧪" },
      { year: "2025", event: "أشعة ملونة على البطن تُظهر كبداً دهنياً", icon: "🩻" }
    ],
    visits: [
      { date: "2026/05/05", diagnosis: "ارتفاع نسب الدهون الثلاثية", symptoms: "خمول خفيف، ثقل بالرأس", treatment: "أطورستاتين 20 ملج مع تنظيم الغذاء", notes: "حمية غذائية خالية من الدهون المشبعة وممارسة الرياضة" }
    ],
    labs: [
      { name: "تحليل دهون كاملة (Lipid Profile)", date: "2026/05/05", status: "تم الرفع", resultUrl: "#", summary: "الكوليسترول الكلي 260 ملج/ديسيلتر (مرتفع)، الدهون الثلاثية 210 ملج/ديسيلتر." }
    ],
    radiology: [
      { name: "سلسلة أشعة ملونة على البطن", date: "2026/03/12", status: "تم الرفع", resultUrl: "#", report: "الكبد دهني من الدرجة الأولى، باقي الأعضاء سليمة." }
    ],
    prescriptions: [
      { name: "أطورستاتين Atorvastatin 20mg", dosage: "قرص واحد مساءً", duration: "3 أشهر", date: "2026/05/05", doctorId: "DOC-2026-9912", doctorName: "د. أحمد محمد" }
    ],
    referrals: [
      { date: "2026/05/01", type: "معمل", destination: "معمل البرج", reason: "تحليل دهون كاملة صائم 12 ساعة", notes: "الرجاء إحضار النتيجة فور صدورها" }
    ]
  }
};

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState(initialPatientsData);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [quickActivePatientId, setQuickActivePatientId] = useState(null);
  const [activePage, setActivePage] = useState("homePage");
  const [activeSubTab, setActiveSubTab] = useState("visits-tab");
  const [activeTestsSubTab, setActiveTestsSubTab] = useState("labs-tab");
  const [activeDashboard, setActiveDashboard] = useState("login"); // "login", "forgot-password", "doctor", "patient", "portal"
  const [activeHeaderTab, setActiveHeaderTab] = useState("login"); // "login", "forgot-password", "doctor", "patient", "home"
  const [patientActivePage, setPatientActivePage] = useState("homePage");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [homeSearch, setHomeSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [testsSearch, setTestsSearch] = useState("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [chronicModalOpen, setChronicModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [editPrescriptionState, setEditPrescriptionState] = useState(null); // { index, prescription }
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfType, setPdfType] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfIndex, setPdfIndex] = useState(0);

  const [newVisit, setNewVisit] = useState({ diagnosis: "", symptoms: "", treatment: "", notes: "" });
  const [newReferral, setNewReferral] = useState({ type: "معمل", destination: "", reason: "", notes: "" });
  const [newUpload, setNewUpload] = useState({ type: "lab", name: "", summary: "", file: null });

  const [doctorInfo, setDoctorInfo] = useState({
    name: "د. أحمد محمد",
    employeeId: "DOC-2026-9912",
    specialization: "أخصائي أمراض باطنة وسكري",
    email: "ahmed.mohamed@smarthealth.gov.eg",
    phone: "+20 100 123 4567",
    avatar: "/default_doctor.png"
  });
  const [editDoctorModalOpen, setEditDoctorModalOpen] = useState(false);
  const [tempDoctorInfo, setTempDoctorInfo] = useState({ ...doctorInfo });
  const [notifications, setNotifications] = useState({
    allergy: true,
    labs: true,
    radiology: true,
    ehrUpdates: true,
    critical: true
  });
  const [uiLanguage, setUiLanguage] = useState("ar");
  const [fontSize, setFontSize] = useState("medium");

  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

  const activePatient = patients[currentPatientId];

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, hide: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hide: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3500);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === "/login") {
      setActiveDashboard("login");
      setActiveHeaderTab("login");
      setSidebarOpen(false);
      setCurrentPatientId(null);
    } else if (path === "/forgot-password") {
      setActiveDashboard("forgot-password");
      setActiveHeaderTab("forgot-password");
      setSidebarOpen(false);
      setCurrentPatientId(null);
    } else if (path === "/register") {
      navigate("/login", { replace: true });
    } else if (path === "/doctor") {
      setActiveDashboard("doctor");
      setActiveHeaderTab("doctor");
      setCurrentPatientId(null);
      const user = sessionStorage.getItem("activeUser");
      if (user) {
        let formattedName = user;
        if (!formattedName.startsWith("د/") && !formattedName.startsWith("د.")) {
          formattedName = "د/ " + formattedName;
        }
        setDoctorInfo(prev => ({ ...prev, name: formattedName }));
      }
    } else if (path === "/patient") {
      setActiveDashboard("patient");
      setActiveHeaderTab("patient");
      setCurrentPatientId(null);
      const user = sessionStorage.getItem("activeUser");
      if (user) {
        setPatients(prev => ({
          ...prev,
          "H-2026-001": {
            ...prev["H-2026-001"],
            name: user
          }
        }));
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    if (qrModalOpen) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          .then(stream => {
            setVideoStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.error("Camera permissions not granted:", err);
          });
      }
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
    }
  }, [qrModalOpen]);

  useEffect(() => {
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempDoctorInfo(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitEditDoctorForm = (e) => {
    e.preventDefault();
    setDoctorInfo({ ...tempDoctorInfo });
    showToast("تم تحديث البيانات الشخصية للطبيب بنجاح!", "success");
    setEditDoctorModalOpen(false);
  };

  const getTodayDateStr = () => {
    const today = new Date();
    return today.getFullYear() + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');
  };

  const todayStr = getTodayDateStr();
  let todayVisitsCount = 0;
  Object.values(patients).forEach(p => {
    if (p.visits) {
      p.visits.forEach(v => {
        if (v.date === todayStr) {
          todayVisitsCount++;
        }
      });
    }
  });

  const handleStatusChange = (newStatus) => {
    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      p.status = newStatus;
      
      const today = new Date();
      let statusTextAr = newStatus === 'stable' ? '🟢 مستقر' : newStatus === 'observation' ? '🟡 تحت الملاحظة' : '🔴 حالة حرجة';
      
      p.timeline.unshift({
        year: today.getFullYear().toString(),
        event: `تحديث حالة المريض الطبية إلى: ${statusTextAr}`,
        icon: "⚡"
      });
      return updated;
    });
    let text = newStatus === 'stable' ? '🟢 مستقر' : newStatus === 'observation' ? '🟡 تحت الملاحظة' : '🔴 حالة حرجة';
    showToast(`تم تحديث حالة المريض بنجاح إلى: ${text}`, "success");
  };

  const handleOpenPatientProfile = (id) => {
    if (patients[id]) {
      setCurrentPatientId(id);
      setActivePage("patientsPage");
      setPdfOpen(false);
    }
  };

  const handleOpenCurrentPatientFile = () => {
    if (quickActivePatientId) {
      setCurrentPatientId(quickActivePatientId);
    }
    setActivePage("patientsPage");
    setSidebarOpen(false);
    setPdfOpen(false);
  };

  const handleSearchPatient = (query) => {
    setPatientSearch(query);
    setPatientSearchOpen(query.trim().length > 0);
  };

  const handleSelectSearchPatient = (id) => {
    handleOpenPatientProfile(id);
    setPatientSearch("");
    setPatientSearchOpen(false);
  };

  const simulateQRScan = () => {
    setQrModalOpen(false);
    showToast("تم قراءة QR Code بنجاح! تم تحميل ملف المريض: سارة محمود", "success");
    handleOpenPatientProfile("H-2026-002");
  };

  const simulateNFCScan = () => {
    setNfcModalOpen(false);
    showToast("تم التقاط إشارة NFC الذكية! تم تحميل ملف المريض: محمد علي", "success");
    handleOpenPatientProfile("H-2026-003");
  };

  const submitChronicIllnessUpdate = (e) => {
    e.preventDefault();
    const illness = document.getElementById("cr-illness-to-update").value;
    showToast(`تم إرسال طلب تحديث حالة الأمراض المزمنة (${illness}) للإدارة الطبية بنجاح!`, "success");
    setChronicModalOpen(false);
  };

  const submitNewVisitForm = (e) => {
    e.preventDefault();
    const dateStr = getTodayDateStr();
    
    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      p.visits.unshift({
        date: dateStr,
        diagnosis: newVisit.diagnosis,
        symptoms: newVisit.symptoms,
        treatment: newVisit.treatment,
        notes: newVisit.notes
      });
      p.lastVisit = dateStr;
      
      p.timeline.unshift({
        year: new Date().getFullYear().toString(),
        event: `تسجيل كشف طبي جديد: ${newVisit.diagnosis}`,
        icon: "🩺"
      });
      return updated;
    });

    showToast("تم تسجيل الكشف الطبي بنجاح وحفظ التشخيص بالملف الموحد!", "success");
    setVisitModalOpen(false);
    setNewVisit({ diagnosis: "", symptoms: "", treatment: "", notes: "" });
  };

  const submitNewPrescriptionForm = (medicationsList) => {
    const dateStr = getTodayDateStr();

    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      
      // Add all medications in reverse order so they appear in correct chronological list order
      [...medicationsList].reverse().forEach(med => {
        p.prescriptions.unshift({
          name: med.name,
          dosage: med.dosage,
          duration: med.duration,
          date: dateStr,
          doctorId: doctorInfo.employeeId,
          doctorName: doctorInfo.name
        });
      });

      let meds = p.prescriptions.map(pr => `${pr.name}`).slice(0, 2).join("، ");
      if (p.prescriptions.length > 2) meds += "، ...إلخ";
      p.currentMedications = meds;

      const medsNames = medicationsList.map(med => med.name).join("، ");
      p.timeline.unshift({
        year: new Date().getFullYear().toString(),
        event: `إصدار وصفة طبية جديدة تشمل: ${medsNames}`,
        icon: "💊"
      });
      return updated;
    });

    showToast("تم إصدار الوصفة الطبية وإرفاقها بكارت الصحة الرقمية للمواطن!", "success");
    setPrescriptionModalOpen(false);
  };

  const handleDeletePrescription = (index) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الوصفة الطبية؟")) {
      setPatients(prev => {
        const updated = { ...prev };
        const p = updated[currentPatientId];
        const deletedPres = p.prescriptions[index];
        p.prescriptions = p.prescriptions.filter((_, i) => i !== index);
        
        let meds = p.prescriptions.map(pr => `${pr.name}`).slice(0, 2).join("، ");
        if (p.prescriptions.length > 2) meds += "، ...إلخ";
        p.currentMedications = meds || "لا توجد أدوية حالية مسجلة";

        p.timeline.unshift({
          year: new Date().getFullYear().toString(),
          event: `حذف وصفة طبية: ${deletedPres.name}`,
          icon: "🗑️"
        });
        return updated;
      });
      showToast("تم حذف الوصفة الطبية بنجاح", "success");
    }
  };

  const handleSaveEditPrescription = (index, updatedPres) => {
    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      const oldPres = p.prescriptions[index];
      
      p.prescriptions = p.prescriptions.map((pr, i) => i === index ? {
        ...pr,
        name: updatedPres.name,
        dosage: updatedPres.dosage,
        duration: updatedPres.duration
      } : pr);

      let meds = p.prescriptions.map(pr => `${pr.name}`).slice(0, 2).join("، ");
      if (p.prescriptions.length > 2) meds += "، ...إلخ";
      p.currentMedications = meds;

      p.timeline.unshift({
        year: new Date().getFullYear().toString(),
        event: `تعديل وصفة طبية من ${oldPres.name} إلى ${updatedPres.name}`,
        icon: "✏️"
      });
      return updated;
    });
    showToast("تم تعديل الوصفة الطبية بنجاح", "success");
    setEditPrescriptionState(null);
  };

  const submitReferralForm = (e) => {
    e.preventDefault();
    const dateStr = getTodayDateStr();

    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      p.referrals.unshift({
        date: dateStr,
        type: newReferral.type,
        destination: newReferral.destination,
        reason: newReferral.reason,
        notes: newReferral.notes
      });

      p.timeline.unshift({
        year: new Date().getFullYear().toString(),
        event: `إصدار تحويل طبي إلى: ${newReferral.type} - ${newReferral.destination} (${newReferral.reason})`,
        icon: "🏥"
      });
      return updated;
    });

    showToast("تم إنشاء التحويل الطبي الصادر بنجاح وتوثيقه!", "success");
    setReferralModalOpen(false);
    setNewReferral({ type: "معمل", destination: "", reason: "", notes: "" });
  };

  const submitGlobalUploadForm = (e) => {
    e.preventDefault();
    const dateStr = getTodayDateStr();

    setPatients(prev => {
      const updated = { ...prev };
      const p = updated[currentPatientId];
      
      if (newUpload.type === "lab") {
        p.labs.unshift({
          name: newUpload.name,
          date: dateStr,
          status: "تم الرفع",
          resultUrl: "#",
          summary: newUpload.summary
        });
      } else {
        p.radiology.unshift({
          name: newUpload.name,
          date: dateStr,
          status: "تم الرفع",
          resultUrl: "#",
          report: newUpload.summary
        });
      }

      p.timeline.unshift({
        year: new Date().getFullYear().toString(),
        event: `رفع فحص جديد للمريض: ${newUpload.name}`,
        icon: newUpload.type === "lab" ? "🧪" : "🩻"
      });
      return updated;
    });

    showToast(`تم رفع الفحص بنجاح وتوثيقه للمريض: ${activePatient.name}!`, "success");
    setNewUpload({ type: "lab", name: "", summary: "", file: null });
    setUploadModalOpen(false);
    e.target.reset();
  };

  const renderPdfContent = () => {
    if (!pdfType || !activePatient) return "";
    
    let reportText = "";
    if (pdfType === "lab") {
      const lab = activePatient.labs[pdfIndex] || { name: pdfName, date: activePatient.lastVisit, summary: "فحص طبي روتيني للمتابعة." };
      reportText = `
EGYPTIAN SMART HEALTH NETWORK - MEDICAL PATHOLOGY
PATIENT ID: ${activePatient.id} | DATE: ${lab.date}
TEST: ${lab.name}
--------------------------------------------------
CLINICAL SUMMARY: ${lab.summary}

HEMOGLOBIN           14.2         g/dL           13.5 - 17.5
PLATELETS            280          10^3/uL        150 - 450
WBC                  7.8          10^3/uL        4.5 - 11.0
RBC                  4.92         10^6/uL        4.5 - 5.9
      `;
    } else {
      const rad = activePatient.radiology[pdfIndex] || { name: pdfName, date: activePatient.lastVisit, report: "لا توجد مؤشرات غير طبيعية." };
      reportText = `
EGYPTIAN SMART HEALTH NETWORK - RADIOLOGY DEPT
PATIENT ID: ${activePatient.id} | DATE: ${rad.date}
EXAMINATION: ${rad.name}
--------------------------------------------------
FINDINGS: ${rad.report}
      `;
    }
    return reportText;
  };

  const handleOpenPdf = (type, name, index) => {
    setPdfType(type);
    setPdfName(name);
    setPdfIndex(index);
    setPdfOpen(true);
  };

  const activeTests = [];
  if (activePatient) {
    activePatient.labs.forEach((l, index) => {
      activeTests.push({ type: l.name, category: "تحليل مخبري 🧪", rawType: "lab", date: l.date, status: l.status, index });
    });
    activePatient.radiology.forEach((r, index) => {
      activeTests.push({ type: r.name, category: "تقرير أشعة 🩻", rawType: "radiology", date: r.date, status: r.status, index });
    });
    activeTests.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const authPage =
    location.pathname === "/login" ? (
      <LoginPage showToast={showToast} />
    ) : location.pathname === "/forgot-password" ? (
      <ForgotPasswordPage showToast={showToast} />
    ) : null;

  if (authPage) {
    return (
      <div className="auth-wrapper">
        {authPage}
        <ToastContainer toasts={toasts} setToasts={setToasts} />
      </div>
    );
  }

  const testsPendingCount = activeTests.filter(t => t.status === "قيد الانتظار").length;
  const testsCompletedCount = activeTests.filter(t => t.status === "تم الرفع" || t.status === "مكتمل").length;
  const testsUrgentCount = activeTests.filter(t => t.status === "مراجعة عاجلة").length;

  return (
    <div className="app-container">
      <div className="page">
        {sidebarOpen && (
          <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
        )}

        <button id="sidebarToggle" className="mobile-toggle-btn" onClick={() => setSidebarOpen(prev => !prev)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {activeDashboard === "doctor" && (
          <DoctorSidebar
            sidebarOpen={sidebarOpen}
            activePage={activePage}
            setActivePage={setActivePage}
            setSidebarOpen={setSidebarOpen}
            setPdfOpen={setPdfOpen}
            showToast={showToast}
            handleOpenCurrentPatientFile={handleOpenCurrentPatientFile}
            onLogout={() => {
              sessionStorage.removeItem("activeUser");
              setCurrentPatientId(null);
              setQuickActivePatientId(null);
              navigate("/login");
              showToast("تم تسجيل الخروج بنجاح", "success");
            }}
          />
        )}

        {activeDashboard === "patient" && (
          <PatientSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            patientActivePage={patientActivePage}
            setPatientActivePage={setPatientActivePage}
            onLogout={() => {
              sessionStorage.removeItem("activeUser");
              setCurrentPatientId(null);
              navigate("/login");
              showToast("تم تسجيل الخروج بنجاح", "success");
            }}
          />
        )}

        {activeDashboard !== "portal" && (
          <main className="main">
            {activeDashboard === "doctor" ? (
              <>
                {activePage === "homePage" && (
                  <DoctorHome
                    doctorInfo={doctorInfo}
                    homeSearch={homeSearch}
                    setHomeSearch={setHomeSearch}
                    setQrModalOpen={setQrModalOpen}
                    setNfcModalOpen={setNfcModalOpen}
                    todayVisitsCount={todayVisitsCount}
                    patients={patients}
                    activePatient={patients[quickActivePatientId]}
                    handleOpenPatientProfile={handleOpenPatientProfile}
                    setVisitModalOpen={setVisitModalOpen}
                    setPrescriptionModalOpen={setPrescriptionModalOpen}
                    setActivePage={setActivePage}
                    setNewUpload={setNewUpload}
                    setUploadModalOpen={setUploadModalOpen}
                    setQuickActivePatientId={setQuickActivePatientId}
                  />
                )}

                {activePage === "patientsPage" && (
                  activePatient ? (
                    <DoctorPatientProfile
                      activePatient={activePatient}
                      patients={patients}
                      doctorInfo={doctorInfo}
                      patientSearch={patientSearch}
                      patientSearchOpen={patientSearchOpen}
                      handleSearchPatient={handleSearchPatient}
                      handleSelectSearchPatient={handleSelectSearchPatient}
                      handleStatusChange={handleStatusChange}
                      activeSubTab={activeSubTab}
                      setActiveSubTab={setActiveSubTab}
                      setVisitModalOpen={setVisitModalOpen}
                      setPrescriptionModalOpen={setPrescriptionModalOpen}
                      setReferralModalOpen={setReferralModalOpen}
                      setChronicModalOpen={setChronicModalOpen}
                      setEditPrescriptionState={setEditPrescriptionState}
                      handleDeletePrescription={handleDeletePrescription}
                    />
                  ) : (
                    <div className="box" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "16px", margin: "20px" }}>
                      ⚠️ لم يتم اختيار مريض بعد. يرجى البحث عن مريض أو استخدام QR / NFC لفتح الملف الطبي.
                    </div>
                  )
                )}

                {activePage === "testsPage" && (
                  activePatient ? (
                    <DoctorTestsLabs
                      activePatient={activePatient}
                      testsSearch={testsSearch}
                      setTestsSearch={setTestsSearch}
                      testsUrgentCount={testsUrgentCount}
                      testsPendingCount={testsPendingCount}
                      testsCompletedCount={testsCompletedCount}
                      activeTestsSubTab={activeTestsSubTab}
                      setActiveTestsSubTab={setActiveTestsSubTab}
                      setNewUpload={setNewUpload}
                      setUploadModalOpen={setUploadModalOpen}
                      handleOpenPdf={handleOpenPdf}
                      pdfOpen={pdfOpen}
                      setPdfOpen={setPdfOpen}
                      pdfType={pdfType}
                      renderPdfContent={renderPdfContent}
                    />
                  ) : (
                    <div className="box" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "16px", margin: "20px" }}>
                      ⚠️ لم يتم اختيار مريض بعد. يرجى البحث عن مريض أو استخدام QR / NFC لفتح الملف الطبي.
                    </div>
                  )
                )}

                {activePage === "emergencyPage" && (
                  activePatient ? (
                    <DoctorEmergency
                      activePatient={activePatient}
                      setActivePage={setActivePage}
                    />
                  ) : (
                    <div className="box" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "16px", margin: "20px" }}>
                      ⚠️ لم يتم اختيار مريض بعد. يرجى البحث عن مريض أو استخدام QR / NFC لفتح الملف الطبي.
                    </div>
                  )
                )}

                {activePage === "settingsPage" && (
                  <DoctorSettings
                    doctorInfo={doctorInfo}
                    setTempDoctorInfo={setTempDoctorInfo}
                    setEditDoctorModalOpen={setEditDoctorModalOpen}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    uiLanguage={uiLanguage}
                    setUiLanguage={setUiLanguage}
                    showToast={showToast}
                  />
                )}
              </>
            ) : (
              <>
                {patientActivePage === 'homePage' && (
                  <PatientHome patients={patients} />
                )}

                {patientActivePage === 'healthProfile' && (
                  <PatientProfile patients={patients} />
                )}

                {patientActivePage === 'labs' && (
                  <PatientLabs
                    patients={patients}
                    pdfOpen={pdfOpen}
                    setPdfOpen={setPdfOpen}
                    pdfType={pdfType}
                    handleOpenPdf={handleOpenPdf}
                    renderPdfContent={renderPdfContent}
                  />
                )}

                {patientActivePage === 'radiology' && (
                  <PatientRadiology
                    patients={patients}
                    pdfOpen={pdfOpen}
                    setPdfOpen={setPdfOpen}
                    pdfType={pdfType}
                    handleOpenPdf={handleOpenPdf}
                    renderPdfContent={renderPdfContent}
                  />
                )}

                {patientActivePage === 'prescriptions' && (
                  <PatientPrescriptions patients={patients} />
                )}

                {patientActivePage === 'medicalCard' && (
                  <PatientMedicalCard showToast={showToast} />
                )}

                {patientActivePage === 'emergency' && (
                  <PatientEmergency patients={patients} />
                )}

                {patientActivePage === 'notifications' && (
                  <PatientNotifications patients={patients} />
                )}

                {patientActivePage === 'settings' && (
                  <PatientSettings showToast={showToast} />
                )}
              </>
            )}
          </main>
        )}
      </div>

      {/* QR Code Scanner Simulation Modal */}
      {qrModalOpen && (
        <div id="qrModal" className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <span className="close-btn" onClick={() => setQrModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>📷 مسح كارت الصحة الرقمية (QR Code)</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "15px" }}>قم بتوجيه رمز الاستجابة السريعة (QR) على كارت الصحة الرقمية أمام الكاميرا ليتم تحميل الملف الطبي فوراً.</p>
            
            <div className="scanner-container">
              <video ref={videoRef} id="webcam-preview" autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#111", transform: "scaleX(-1)" }}></video>
              <div className="scanner-laser"></div>
              <div className="scanner-overlay-frame"></div>
            </div>
            
            <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn" onClick={simulateQRScan} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}>⚡ محاكاة قراءة كارت ناجحة (سارة محمود)</button>
              <button className="btn btn-secondary" onClick={() => setQrModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* NFC Scan Simulation Modal */}
      {nfcModalOpen && (
        <div id="nfcModal" className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <span className="close-btn" onClick={() => setNfcModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>💳 مسح كارت الصحة الرقمية عبر NFC</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "15px" }}>يرجى تقريب كارت الصحة الرقمية للمواطن من الجزء الخلفي للهاتف أو قارئ البطاقات المتصل بالجهاز.</p>
            
            <div className="nfc-scan-area">
              <span style={{ fontSize: "55px", animation: "pulseWave 2s infinite alternate" }}>💳</span>
              <div className="nfc-waves" style={{ animationDelay: "0s" }}></div>
              <div className="nfc-waves" style={{ animationDelay: "0.6s" }}></div>
              <div className="nfc-waves" style={{ animationDelay: "1.2s" }}></div>
            </div>
            
            <p style={{ fontWeight: "bold", color: "var(--primary)", textAlign: "center", margin: "15px 0 0 0", animation: "fadeIn 0.8s infinite alternate" }}>جاري البحث عن شريحة NFC...</p>
            
            <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn" onClick={simulateNFCScan} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}>⚡ محاكاة تقريب الكارت (محمد علي)</button>
              <button className="btn btn-secondary" onClick={() => setNfcModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ChronicModal
        chronicModalOpen={chronicModalOpen}
        setChronicModalOpen={setChronicModalOpen}
        activePatient={activePatient}
        submitChronicIllnessUpdate={submitChronicIllnessUpdate}
      />

      <VisitModal
        visitModalOpen={visitModalOpen}
        setVisitModalOpen={setVisitModalOpen}
        newVisit={newVisit}
        setNewVisit={setNewVisit}
        submitNewVisitForm={submitNewVisitForm}
      />

      <PrescriptionModal
        prescriptionModalOpen={prescriptionModalOpen}
        setPrescriptionModalOpen={setPrescriptionModalOpen}
        submitNewPrescriptionForm={submitNewPrescriptionForm}
      />

      <EditPrescriptionModal
        editPrescriptionState={editPrescriptionState}
        onClose={() => setEditPrescriptionState(null)}
        onSave={handleSaveEditPrescription}
      />

      <ReferralModal
        referralModalOpen={referralModalOpen}
        setReferralModalOpen={setReferralModalOpen}
        newReferral={newReferral}
        setNewReferral={setNewReferral}
        submitReferralForm={submitReferralForm}
      />

      <UploadModal
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        activePatient={activePatient}
        newUpload={newUpload}
        setNewUpload={setNewUpload}
        submitGlobalUploadForm={submitGlobalUploadForm}
      />

      <EditDoctorModal
        editDoctorModalOpen={editDoctorModalOpen}
        setEditDoctorModalOpen={setEditDoctorModalOpen}
        tempDoctorInfo={tempDoctorInfo}
        setTempDoctorInfo={setTempDoctorInfo}
        handleAvatarChange={handleAvatarChange}
        submitEditDoctorForm={submitEditDoctorForm}
      />

      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
