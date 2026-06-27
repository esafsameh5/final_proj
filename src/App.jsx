import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from "react-router-dom";
import api, { clearSession } from "./utils/api";

// Common Components
import ToastContainer from "./components/common/ToastContainer";
import ConfirmModal from "./components/common/ConfirmModal";

// Doctor Components
import DoctorSidebar from "./components/doctor/DoctorSidebar";
import DoctorHome from "./components/doctor/DoctorHome";
import DoctorSearch from "./components/doctor/DoctorSearch";
import DoctorPatientProfile from "./components/doctor/DoctorPatientProfile";
import DoctorTestsLabs from "./components/doctor/DoctorTestsLabs";
import DoctorEmergency from "./components/doctor/DoctorEmergency";
import DoctorSettings from "./components/doctor/DoctorSettings";

// Doctor Modals
import VisitModal from "./components/doctor/modals/VisitModal";
import PrescriptionModal from "./components/doctor/modals/PrescriptionModal";
import LaboratoryRequestModal from "./components/doctor/modals/LaboratoryRequestModal";
import RadiologyRequestModal from "./components/doctor/modals/RadiologyRequestModal";
import FollowUpModal from "./components/doctor/modals/FollowUpModal";
import AdmissionModal from "./components/doctor/modals/AdmissionModal";
import ChronicModal from "./components/doctor/modals/ChronicModal";
import UploadModal from "./components/doctor/modals/UploadModal";
import EditDoctorModal from "./components/doctor/modals/EditDoctorModal";
import AllergyModal from "./components/doctor/modals/AllergyModal";
import MedicationModal from "./components/doctor/modals/MedicationModal";
import VaccinationModal from "./components/doctor/modals/VaccinationModal";
import SurgeryHistoryModal from "./components/doctor/modals/SurgeryHistoryModal";
import VitalSignsModal from "./components/doctor/modals/VitalSignsModal";
import AddDiagnosisModal from "./components/doctor/modals/AddDiagnosisModal";
import CloseEncounterModal from "./components/doctor/modals/CloseEncounterModal";
import MedicalReportModal from "./components/doctor/modals/MedicalReportModal";

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

// Hospital Components
import HospitalSidebar from "./components/hospital/HospitalSidebar";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalDepartments from "./pages/hospital/HospitalDepartments";
import HospitalDoctors from "./pages/hospital/HospitalDoctors";
import HospitalInpatients from "./pages/hospital/HospitalInpatients";
import HospitalRoomsBeds from "./pages/hospital/HospitalRoomsBeds";
import HospitalOperations from "./pages/hospital/HospitalOperations";
import HospitalReports from "./pages/hospital/HospitalReports";

// Ministry Components
import MinistrySidebar from "./components/ministry/MinistrySidebar";
import MinistryDashboard from "./pages/ministry/MinistryDashboard";
import MinistryHospitals from "./pages/ministry/MinistryHospitals";
import MinistryDoctors from "./pages/ministry/MinistryDoctors";
import MinistryDepartments from "./pages/ministry/MinistryDepartments";
import MinistryReports from "./pages/ministry/MinistryReports";
import { mapSmartCardEmergencyData } from "./utils/smartCardEmergency";



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
    visits: [],
    labs: [],
    radiology: [],
    prescriptions: [],
    referrals: []
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
    visits: [],
    labs: [],
    radiology: [],
    prescriptions: [],
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
    visits: [],
    labs: [],
    radiology: [],
    prescriptions: [],
    referrals: []
  }
};

const getTodayDateStr = () => {
  const today = new Date();
  return today.getFullYear() + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');
};

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : initialPatientsData;
  });
  const [currentPatientId, setCurrentPatientId] = useState(() => localStorage.getItem("currentPatientId") || null);
  const [quickActivePatientId, setQuickActivePatientId] = useState(() => localStorage.getItem("quickActivePatientId") || null);
  const [activePage, setActivePage] = useState(() => localStorage.getItem("activePage") || "homePage");
  const [activeSubTab, setActiveSubTab] = useState("visits-tab");
  const [activeTestsSubTab, setActiveTestsSubTab] = useState("labs-tab");
  const [activeDashboard, setActiveDashboard] = useState("login"); // "login", "forgot-password", "doctor", "patient", "hospital", "ministry"
  const [patientActivePage, setPatientActivePage] = useState(() => localStorage.getItem("patientActivePage") || "homePage");
  const [hospitalActivePage, setHospitalActivePage] = useState(() => localStorage.getItem("hospitalActivePage") || "dashboard");
  const [ministryActivePage, setMinistryActivePage] = useState(() => localStorage.getItem("ministryActivePage") || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [topNotifications, setTopNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(null);

  const [homeSearch, setHomeSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [testsSearch, setTestsSearch] = useState("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [chronicModalOpen, setChronicModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labRequestModalOpen, setLabRequestModalOpen] = useState(false);
  const [radiologyRequestModalOpen, setRadiologyRequestModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [vaccinationModalOpen, setVaccinationModalOpen] = useState(false);
  const [surgeryModalOpen, setSurgeryModalOpen] = useState(false);
  const [medicalReportModalOpen, setMedicalReportModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "تأكيد الحذف",
    type: "danger"
  });

  const [departments, setDepartments] = useState([]);
  const [vitalSignsModalOpen, setVitalSignsModalOpen] = useState(false);
  const [addDiagnosisModalOpen, setAddDiagnosisModalOpen] = useState(false);
  const [closeEncounterModalOpen, setCloseEncounterModalOpen] = useState(false);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfType, setPdfType] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfIndex, setPdfIndex] = useState(0);

  const [newVisit, setNewVisit] = useState({ medicalDepartmentId: "", type: "1", mainComplaint: "", notes: "" });

  const [newUpload, setNewUpload] = useState({ type: "lab", name: "", summary: "", file: null });

  const [doctorInfo, setDoctorInfo] = useState(() => {
    const saved = localStorage.getItem("doctorInfo");
    return saved ? JSON.parse(saved) : {
      name: "د. أحمد محمد",
      employeeId: "DOC-2026-9912",
      specialization: "أخصائي أمراض باطنة وسكري",
      email: "ahmed.mohamed@smarthealth.gov.eg",
      phone: "+20 100 123 4567",
      avatar: "/default_doctor.png"
    };
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
  const [fontSize, setFontSize] = useState("medium");

  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const isRefreshingNotificationsRef = useRef(false);

  const [doctorTodayPatients, setDoctorTodayPatients] = useState(() => {
    const saved = sessionStorage.getItem("doctorTodayPatients");
    const savedDate = sessionStorage.getItem("doctorTodayPatientsDate");
    const today = new Date().getFullYear() + '/' + String(new Date().getMonth() + 1).padStart(2, '0') + '/' + String(new Date().getDate()).padStart(2, '0');
    if (saved && savedDate === today) {
      return JSON.parse(saved);
    }
    return {};
  });

  const [searchQuery, setSearchQuery] = useState({ name: "", id: "" });
  const [searchResults, setSearchResults] = useState({});
  const [searchState, setSearchState] = useState("idle"); // "idle", "searching", "not_found", "success", "mismatch", "multiple_matches"

  const [liveSearchPatientIds, setLiveSearchPatientIds] = useState([]);

  // Calculate age from Date string
  const calculateAge = (dobString) => {
    if (!dobString) return 30;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Map backend user to UI format
  const mapBackendUserToPatient = (user) => {
    return {
      id: user.userId,
      name: user.displayName,
      age: calculateAge(user.dateOfBirth),
      bloodType: "O+",
      allergies: "لا يوجد حساسية معروفة",
      chronicDiseases: "",
      lastVisit: "2026/06/25",
      currentMedications: "",
      status: "stable",
      alerts: [],
      visits: [],
      labs: [],
      radiology: [],
      prescriptions: [],
      referrals: []
    };
  };

  // Load the patient's latest encounter without creating undocumented fallback data.
  const getActiveEncounterId = async (patientId) => {
    try {
      const encRes = await api.get("/api/v1/medical-encounters", {
        params: { patientId, Page: 1, PageSize: 5 }
      });
      if (encRes.data && encRes.data.success && encRes.data.data.items && encRes.data.data.items.length > 0) {
        return encRes.data.data.items[0].medicalEncounterId;
      }
    } catch (err) {
      console.error("Error loading encounter ID:", err);
    }
    return null;
  };

  const getOrCreateActiveEncounterId = getActiveEncounterId;

  // Lookup medication catalog IDs using the documented lookup endpoint only.
  const getMedicationCatalogId = async (medName) => {
    try {
      const searchRes = await api.get("/api/v1/lookups/medications", {
        params: { Search: medName, Page: 1, PageSize: 5 }
      });
      if (searchRes.data && searchRes.data.success && searchRes.data.data.items && searchRes.data.data.items.length > 0) {
        const items = searchRes.data.data.items;
        const exact = items.find(i => i.tradeName.toLowerCase() === medName.toLowerCase());
        return exact ? exact.medicationCatalogId : items[0].medicationCatalogId;
      }
    } catch (err) {
      console.error("Error medication catalog lookup:", err);
    }
    return null;
  };

  // Lookup ICD-10 IDs using the documented lookup endpoint only.
  const getIcd10CodeId = async (diseaseName) => {
    try {
      const searchRes = await api.get("/api/v1/lookups/icd10", {
        params: { Search: diseaseName, Page: 1, PageSize: 5 }
      });
      if (searchRes.data && searchRes.data.success && searchRes.data.data.items && searchRes.data.data.items.length > 0) {
        const items = searchRes.data.data.items;
        const exact = items.find(i => i.nameEn.toLowerCase() === diseaseName.toLowerCase() || (i.nameAr && i.nameAr.toLowerCase() === diseaseName.toLowerCase()));
        return exact ? exact.icd10CodeId : items[0].icd10CodeId;
      }
    } catch (err) {
      console.error("Error ICD10 lookup:", err);
    }
    return null;
  };

  // Dynamically load active patient details (EHR metadata, encounters, prescriptions, and reports)
  const loadActivePatientDetails = async (patientId) => {
    if (!patientId) return;
    setPatients(prev => {
      const existing = prev[patientId] || {};
      return {
        ...prev,
        [patientId]: {
          ...existing,
          id: patientId,
          name: existing.name || "مريض",
          medicalRecordState: 'loading',
          medicalRecordError: false
        }
      };
    });
    setDoctorTodayPatients(prev => {
      if (!prev[patientId]) return prev;
      const existing = prev[patientId] || {};
      const updated = {
        ...prev,
        [patientId]: {
          ...existing,
          id: patientId,
          name: existing.name || "مريض",
          medicalRecordState: 'loading',
          medicalRecordError: false
        }
      };
      sessionStorage.setItem("doctorTodayPatients", JSON.stringify(updated));
      return updated;
    });

    try {
      let bloodType = "O+";
      let emergencySummary = "";
      let healthId = "";
      let governorate = null;
      let isLocked = false;
      let lastUpdatedAt = null;
      let medicalRecordId = "";
      let apiAllergies = null;       // null = API did not return, use fallback
      let apiChronicDiseases = null; // null = API did not return, use fallback
      let apiMedications = null;     // null = API did not return, use fallback
      let apiAllergiesList = [];
      let apiMedicationsList = [];
      let apiVaccinationsList = [];
      let apiSurgeriesList = [];
      let bloodTypeError = false;
      let mrState = 'success';
      let mrErrorMessage = "";
      try {
        const mrRes = await api.get(`/api/v1/medical-records/${patientId}`);
        if (mrRes.data && mrRes.data.success && mrRes.data.data) {
          const mr = mrRes.data.data;
          bloodType = mr.bloodType || "O+";
          emergencySummary = mr.emergencySummary || "";
          healthId = mr.healthId || "";
          governorate = mr.governorate !== undefined ? mr.governorate : null;
          isLocked = mr.isLocked || false;
          lastUpdatedAt = mr.lastUpdatedAt || null;
          medicalRecordId = mr.medicalRecordId || "";

          // ── Allergies ──────────────────────────────────────────────────────
          // Backend may return allergies as an array of AllergyDto-like objects
          if (Array.isArray(mr.allergies) && mr.allergies.length > 0) {
            apiAllergiesList = mr.allergies.map(a => ({
              name: a.name || a.allergyName || "",
              reaction: a.reaction || "",
              severity: a.severity || "",
              isActive: a.isActive !== false
            }));
            apiAllergies = mr.allergies
              .map(a => a.name || a.allergyName || "")
              .filter(Boolean)
              .join("، ");
          } else if (typeof mr.allergies === "string" && mr.allergies.trim()) {
            apiAllergies = mr.allergies.trim();
          }

          // ── Chronic diseases ───────────────────────────────────────────────
          // Backend may return diseases as an array of DiseaseDto-like objects
          if (Array.isArray(mr.diseases) && mr.diseases.length > 0) {
            apiChronicDiseases = mr.diseases
              .filter(d => d.isChronic)
              .map(d => d.icd10CodeName || d.name || d.icd10CodeId || "")
              .filter(Boolean)
              .join("، ");
          } else if (typeof mr.chronicDiseases === "string" && mr.chronicDiseases.trim()) {
            apiChronicDiseases = mr.chronicDiseases.trim();
          }

          // ── Current medications (medical record level) ─────────────────────
          // Backend may return medications as an array of CurrentMedicationDto-like objects
          if (Array.isArray(mr.medications) && mr.medications.length > 0) {
            apiMedicationsList = mr.medications.map(m => ({
              name: m.medicationName || m.medicationCatalogId || "",
              dose: m.dose || "",
              frequency: m.frequency || "",
              startedAt: m.startedAt || "",
              stoppedAt: m.stoppedAt || "",
              isActive: m.isActive !== false,
              notes: m.notes || ""
            }));
            apiMedications = mr.medications
              .filter(m => m.isActive !== false)
              .map(m => m.medicationName || m.medicationCatalogId || "")
              .filter(Boolean)
              .join("، ");
          }

          // ── Vaccinations ───────────────────────────────────────────────────
          if (Array.isArray(mr.vaccinations) && mr.vaccinations.length > 0) {
            apiVaccinationsList = mr.vaccinations.map(v => ({
              vaccineName: v.vaccineName || v.name || "",
              dose: v.dose || "",
              takenAt: v.takenAt || "",
              facilityName: v.facilityName || ""
            }));
          }

          // ── Surgery history ────────────────────────────────────────────────
          const rawSurgeries = mr.surgeryHistory || mr.surgeries || mr.surgicalHistory;
          if (Array.isArray(rawSurgeries) && rawSurgeries.length > 0) {
            apiSurgeriesList = rawSurgeries.map(s => ({
              surgeryName: s.surgeryName || s.name || "",
              performedAt: s.performedAt || "",
              hospitalName: s.hospitalName || "",
              notes: s.notes || ""
            }));
          }
        } else {
          mrState = 'empty';
          mrErrorMessage = "لا يوجد ملف طبي لهذا المريض.";
        }
      } catch (err) {
        console.error("Failed to load medical record:", err);
        bloodTypeError = true;
        if (err.response) {
          const status = err.response.status;
          if (status === 404) {
            mrState = 'empty';
            mrErrorMessage = "لا يوجد ملف طبي لهذا المريض.";
          } else if (status === 401) {
            mrState = 'unauthorized';
            mrErrorMessage = "غير مصرح لك بالوصول. يرجى التحقق من تسجيل الدخول.";
          } else if (status === 403) {
            mrState = 'forbidden';
            mrErrorMessage = "ليس لديك الصلاحية الكافية لعرض هذا الملف الطبي.";
          } else if (status === 500) {
            mrState = 'serverError';
            mrErrorMessage = "حدث خطأ داخلي في الخادم أثناء تحميل الملف الطبي (500).";
          } else if (status === 400 || status === 422) {
            mrState = 'validationError';
            mrErrorMessage = "خطأ في التحقق من البيانات المدخلة.";
          } else {
            mrState = 'error';
            mrErrorMessage = "حدث خطأ غير متوقع أثناء تحميل الملف الطبي.";
          }
        } else {
          mrState = 'error';
          mrErrorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.";
        }
      }

      let visitsList = [];
      let visitsError = false;
      try {
        const encRes = await api.get("/api/v1/medical-encounters", {
          params: { patientId, Page: 1, PageSize: 50 }
        });
        if (encRes.data && encRes.data.success && encRes.data.data) {
          const encItems = encRes.data.data.items || [];
          visitsList = encItems.map(item => ({
            id: item.medicalEncounterId,
            date: item.createdAt ? item.createdAt.substring(0, 10).replace(/-/g, '/') : "2026/06/25",
            diagnosis: item.diagnosisSummary || "كشف طبي عام",
            symptoms: item.mainComplaint || "",
            treatment: item.treatmentSummary || "",
            notes: item.notes || "",
            isClosed: item.isClosed || false
          }));
        }
      } catch (err) {
        console.error("Failed to load encounters:", err);
        visitsError = true;
      }

      let prescriptionsList = [];
      let prescriptionsError = false;
      try {
        const presRes = await api.get(`/api/v1/prescriptions/patient/${patientId}`, {
          params: { Page: 1, PageSize: 50 }
        });
        if (presRes.data && presRes.data.success && presRes.data.data) {
          const presItems = presRes.data.data.items || [];
          presItems.forEach(item => {
            const dateStr = item.createdAt ? item.createdAt.substring(0, 10).replace(/-/g, '/') : "2026/06/25";
            const doctorName = item.doctorName || "د. أحمد محمد";
            const doctorId = item.doctorId || "";
            if (item.medications && item.medications.length > 0) {
              item.medications.forEach(med => {
                prescriptionsList.push({
                  id: item.prescriptionId,
                  name: med.medicationName || med.medicationCatalogId || "دواء موثق",
                  dosage: med.dose || med.frequency || "",
                  duration: med.duration || "مستمر",
                  date: dateStr,
                  doctorId: doctorId,
                  doctorName: doctorName
                });
              });
            }
          });
        }
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
        prescriptionsError = true;
      }

      let labsList = [];
      let radiologyList = [];
      let reportsError = false;
      try {
        const repRes = await api.get(`/api/v1/reports/medical/patient/${patientId}`, {
          params: { Page: 1, PageSize: 50 }
        });
        if (repRes.data && repRes.data.success && repRes.data.data) {
          const repItems = repRes.data.data.items || [];
          repItems.forEach(item => {
            const reportDate = item.createdAt ? item.createdAt.substring(0, 10).replace(/-/g, '/') : "2026/06/25";
            if (item.reportType === "LabResult" || (item.title && (item.title.toLowerCase().includes("lab") || item.title.includes("تحليل") || item.title.includes("CBC")))) {
              labsList.push({
                name: item.title || "تحليل طبي",
                date: reportDate,
                status: "تم الرفع",
                resultUrl: "#",
                summary: item.content || ""
              });
            } else {
              radiologyList.push({
                name: item.title || "أشعة طبية",
                date: reportDate,
                status: "تم الرفع",
                resultUrl: "#",
                report: item.content || ""
              });
            }
          });
        }
      } catch (err) {
        console.error("Failed to load medical reports:", err);
        reportsError = true;
      }

      setPatients(prev => {
        const existing = prev[patientId] || {};
        return {
          ...prev,
          [patientId]: {
            ...existing,
            id: patientId,
            name: existing.name || "مريض",
            age: existing.age || 30,
            bloodType: bloodTypeError ? (existing.bloodType || "O+") : bloodType,
            allergies: apiAllergies ?? existing.allergies ?? "لا يوجد حساسية معروفة",
            chronicDiseases: apiChronicDiseases ?? existing.chronicDiseases ?? "",
            lastVisit: visitsError ? (existing.lastVisit || "فشل التحميل") : (visitsList.length > 0 ? visitsList[0].date : "لا توجد زيارات"),
            currentMedications: apiMedications ?? (
              prescriptionsError
                ? (existing.currentMedications || "فشل التحميل")
                : (prescriptionsList.map(p => p.name).slice(0, 3).join("، ") || "لا توجد أدوية حالية")
            ),
            status: existing.status || "stable",
            alerts: existing.alerts || [],
            visits: visitsError ? (existing.visits || []) : visitsList,
            labs: reportsError ? (existing.labs || []) : labsList,
            radiology: reportsError ? (existing.radiology || []) : radiologyList,
            prescriptions: prescriptionsError ? (existing.prescriptions || []) : prescriptionsList,
            referrals: existing.referrals || [],
            allergiesList: bloodTypeError ? (existing.allergiesList || []) : apiAllergiesList,
            medicationsList: bloodTypeError ? (existing.medicationsList || []) : apiMedicationsList,
            vaccinationsList: bloodTypeError ? (existing.vaccinationsList || []) : apiVaccinationsList,
            surgeriesList: bloodTypeError ? (existing.surgeriesList || []) : apiSurgeriesList,
            healthId: bloodTypeError ? (existing.healthId || "") : healthId,
            governorate: bloodTypeError ? (existing.governorate ?? null) : governorate,
            isLocked: bloodTypeError ? (existing.isLocked || false) : isLocked,
            lastUpdatedAt: bloodTypeError ? (existing.lastUpdatedAt || null) : lastUpdatedAt,
            emergencySummary: bloodTypeError ? (existing.emergencySummary || "") : emergencySummary,
            medicalRecordId: bloodTypeError ? (existing.medicalRecordId || "") : medicalRecordId,
            medicalRecordError: bloodTypeError,
            medicalRecordState: mrState,
            medicalRecordErrorMessage: mrErrorMessage,
            visitsError,
            prescriptionsError,
            reportsError,
            bloodTypeError
          }
        };
      });

      setDoctorTodayPatients(prev => {
        if (!prev[patientId]) return prev;
        const existing = prev[patientId] || {};
        const updated = {
          ...prev,
          [patientId]: {
            ...existing,
            id: patientId,
            name: existing.name || "مريض",
            age: existing.age || 30,
            bloodType: bloodTypeError ? (existing.bloodType || "O+") : bloodType,
            allergies: apiAllergies ?? existing.allergies ?? "لا يوجد حساسية معروفة",
            chronicDiseases: apiChronicDiseases ?? existing.chronicDiseases ?? "",
            lastVisit: visitsError ? (existing.lastVisit || "فشل التحميل") : (visitsList.length > 0 ? visitsList[0].date : "لا توجد زيارات"),
            currentMedications: apiMedications ?? (
              prescriptionsError
                ? (existing.currentMedications || "فشل التحميل")
                : (prescriptionsList.map(p => p.name).slice(0, 3).join("، ") || "لا توجد أدوية حالية")
            ),
            status: existing.status || "stable",
            alerts: existing.alerts || [],
            visits: visitsError ? (existing.visits || []) : visitsList,
            labs: reportsError ? (existing.labs || []) : labsList,
            radiology: reportsError ? (existing.radiology || []) : radiologyList,
            prescriptions: prescriptionsError ? (existing.prescriptions || []) : prescriptionsList,
            referrals: existing.referrals || [],
            allergiesList: bloodTypeError ? (existing.allergiesList || []) : apiAllergiesList,
            medicationsList: bloodTypeError ? (existing.medicationsList || []) : apiMedicationsList,
            vaccinationsList: bloodTypeError ? (existing.vaccinationsList || []) : apiVaccinationsList,
            surgeriesList: bloodTypeError ? (existing.surgeriesList || []) : apiSurgeriesList,
            healthId: bloodTypeError ? (existing.healthId || "") : healthId,
            governorate: bloodTypeError ? (existing.governorate ?? null) : governorate,
            isLocked: bloodTypeError ? (existing.isLocked || false) : isLocked,
            lastUpdatedAt: bloodTypeError ? (existing.lastUpdatedAt || null) : lastUpdatedAt,
            emergencySummary: bloodTypeError ? (existing.emergencySummary || "") : emergencySummary,
            medicalRecordId: bloodTypeError ? (existing.medicalRecordId || "") : medicalRecordId,
            medicalRecordError: bloodTypeError,
            medicalRecordState: mrState,
            medicalRecordErrorMessage: mrErrorMessage,
            visitsError,
            prescriptionsError,
            reportsError,
            bloodTypeError
          }
        };
        sessionStorage.setItem("doctorTodayPatients", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Error loading active patient details:", error);
    }
  };

  // Effect to load active patient clinical folders when ID updates
  useEffect(() => {
    if (currentPatientId) {
      loadActivePatientDetails(currentPatientId);
    }
  }, [currentPatientId]);

  const refreshNotifications = async () => {
    if (isRefreshingNotificationsRef.current) return;
    const loggedInUserId = sessionStorage.getItem("userId");
    if (!loggedInUserId || activeDashboard !== "patient") return;
    
    isRefreshingNotificationsRef.current = true;
    try {
      const res = await api.get("/api/v1/notifications/my", {
        params: { Page: 1, PageSize: 20 }
      });
      if (res.data && res.data.success && res.data.data) {
        const rawItems = res.data.data.items || res.data.data || [];
        
        // 1. Compute hasUnread flag based on any unread in the response
        const unreadExists = rawItems.some(n => !n.isRead);
        setHasUnread(unreadExists);

        // 2. Sort items: Critical -> High -> Normal/Medium -> Low, then newest date first
        const priorityOrder = { critical: 4, high: 3, normal: 2, medium: 2, low: 1 };
        const sorted = [...rawItems].sort((a, b) => {
          const pA = priorityOrder[String(a.priority || "").toLowerCase()] || 0;
          const pB = priorityOrder[String(b.priority || "").toLowerCase()] || 0;
          if (pA !== pB) return pB - pA;
          
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // 3. Set top 3 sorted notifications
        setTopNotifications(sorted.slice(0, 3));

        // Future-compatibility for unreadCount
        if (res.data.data && typeof res.data.data.unreadCount === "number") {
          setUnreadCount(res.data.data.unreadCount);
        } else {
          setUnreadCount(null);
        }
      }
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      isRefreshingNotificationsRef.current = false;
    }
  };

  // Effect to refresh notifications when entering/changing patient portal dashboard, with visibility and periodic refresh listeners
  useEffect(() => {
    if (activeDashboard !== "patient" || !currentPatientId) {
      return;
    }

    // Initial fetch
    refreshNotifications();

    // 1. Periodic refresh every 60 seconds
    const intervalId = setInterval(() => {
      refreshNotifications();
    }, 60000);

    // 2. Refresh on window focus and visibilitychange
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    // Automatically clean up all event listeners and timers when leaving Patient Portal
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  }, [activeDashboard, currentPatientId]);

  // 1. Backend patient search manual trigger for centered search card
  const triggerSearch = async (formQuery) => {
    const { name, id } = formQuery;
    if (!name.trim() && !id.trim()) {
      setSearchResults({});
      setSearchState("idle");
      return;
    }
    setSearchState("searching");
    setSearchResults({});
    try {
      const queryVal = id.trim() || name.trim();
      const response = await api.get("/api/v1/users", {
        params: {
          role: "Patient",
          Search: queryVal,
          Page: 1,
          PageSize: 100
        }
      });

      if (response.data && response.data.success) {
        const items = response.data.data.items || [];
        
        // Cache found items globally
        setPatients(prev => {
          const updated = { ...prev };
          items.forEach(item => {
            updated[item.userId] = {
              ...mapBackendUserToPatient(item),
              ...updated[item.userId]
            };
          });
          return updated;
        });

        if (items.length === 0) {
          setSearchState("not_found");
        } else {
          if (name.trim() && id.trim()) {
            const match = items.find(item => item.userId.trim() === id.trim() && item.displayName.trim().toLowerCase() === name.trim().toLowerCase());
            if (match) {
              const resMap = {};
              resMap[match.userId] = mapBackendUserToPatient(match);
              setSearchResults(resMap);
              setQuickActivePatientId(match.userId);
              setSearchState("success");
            } else {
              setSearchState("mismatch");
            }
          } else if (id.trim()) {
            const match = items.find(item => item.userId.trim() === id.trim());
            if (match) {
              const resMap = {};
              resMap[match.userId] = mapBackendUserToPatient(match);
              setSearchResults(resMap);
              setQuickActivePatientId(match.userId);
              setSearchState("success");
            } else {
              setSearchState("not_found");
            }
          } else {
            const exactMatches = items.filter(item => item.displayName.trim().toLowerCase() === name.trim().toLowerCase());
            if (exactMatches.length > 1) {
              setSearchState("multiple_matches");
            } else if (exactMatches.length === 1) {
              const match = exactMatches[0];
              const resMap = {};
              resMap[match.userId] = mapBackendUserToPatient(match);
              setSearchResults(resMap);
              setQuickActivePatientId(match.userId);
              setSearchState("success");
            } else {
              const subMatches = items.filter(item => item.displayName.toLowerCase().includes(name.toLowerCase()));
              if (subMatches.length > 1) {
                setSearchState("multiple_matches");
              } else if (subMatches.length === 1) {
                const match = subMatches[0];
                const resMap = {};
                resMap[match.userId] = mapBackendUserToPatient(match);
                setSearchResults(resMap);
                setQuickActivePatientId(match.userId);
                setSearchState("success");
              } else {
                setSearchState("not_found");
              }
            }
          }
        }
      } else {
        setSearchState("not_found");
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      setSearchState("not_found");
    }
  };

  // Clean expired Today's Patients entries on date change
  useEffect(() => {
    const savedDate = sessionStorage.getItem("doctorTodayPatientsDate");
    const today = getTodayDateStr();
    if (savedDate && savedDate !== today) {
      sessionStorage.removeItem("doctorTodayPatients");
      sessionStorage.removeItem("doctorTodayPatientsDate");
      setDoctorTodayPatients({});
    }
  }, []);

  // 2. Live Dropdown Patients search
  useEffect(() => {
    const fetchSearchPatients = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        const response = await api.get("/api/v1/users", {
          params: {
            role: "Patient",
            Search: patientSearch || undefined,
            Page: 1,
            PageSize: 10
          }
        });

        if (response.data && response.data.success) {
          const items = response.data.data.items || [];
          setPatients(prev => {
            const updated = { ...prev };
            items.forEach(item => {
              updated[item.userId] = {
                ...mapBackendUserToPatient(item),
                ...updated[item.userId]
              };
            });
            return updated;
          });
          setLiveSearchPatientIds(items.map(item => item.userId));
        }
      } catch (error) {
        console.error("Error fetching search dropdown patients:", error);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSearchPatients();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [patientSearch, activeDashboard]);

  // Auto-select first patient if none is quick-selected
  useEffect(() => {
    if (!quickActivePatientId) {
      const todayIds = Object.keys(doctorTodayPatients);
      if (todayIds.length > 0) {
        setQuickActivePatientId(todayIds[0]);
      } else {
        const searchIds = Object.keys(searchResults);
        if (searchIds.length > 0) {
          setQuickActivePatientId(searchIds[0]);
        }
      }
    }
  }, [doctorTodayPatients, searchResults, quickActivePatientId]);

  const hasActiveEncounterToday = (patient) => {
    if (!patient || !patient.visits || patient.visits.length === 0) return false;
    const latestVisit = patient.visits[0];
    return latestVisit.date === getTodayDateStr() && !latestVisit.isClosed;
  };

  const isPatientInTodayList = (id) => {
    return !!doctorTodayPatients[id];
  };

  const addPatientToTodayList = (id) => {
    if (!id) return;
    setDoctorTodayPatients(prev => {
      if (prev[id]) return prev;
      const p = patients[id] || searchResults[id] || { id, name: "مريض", age: 30, status: "stable", visits: [] };
      const updated = {
        ...prev,
        [id]: p
      };
      sessionStorage.setItem("doctorTodayPatients", JSON.stringify(updated));
      sessionStorage.setItem("doctorTodayPatientsDate", getTodayDateStr());
      return updated;
    });
  };

  const startVisit = async (patientId) => {
    if (!patientId) return;
    setCurrentPatientId(patientId);
    setActivePage("patientsPage");
    setVisitModalOpen(true);
  };

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
      setSidebarOpen(false);
      setCurrentPatientId(null);
      setQuickActivePatientId(null);
      setActivePage("homePage");
      setPatientActivePage("homePage");
    } else if (path === "/forgot-password") {
      setActiveDashboard("forgot-password");
      setSidebarOpen(false);
      setCurrentPatientId(null);
      setQuickActivePatientId(null);
      setActivePage("homePage");
      setPatientActivePage("homePage");
    } else if (path === "/register") {
      navigate("/login", { replace: true });
    } else if (path === "/doctor") {
      setActiveDashboard("doctor");
      setActivePage("searchPage");
      // Keep existing currentPatientId from localStorage
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
      const loggedInUserId = sessionStorage.getItem("userId");
      if (loggedInUserId) {
        setCurrentPatientId(loggedInUserId);
      }
      const user = sessionStorage.getItem("activeUser");
      if (user) {
        const targetId = loggedInUserId || "H-2026-001";
        setPatients(prev => {
          const existing = prev[targetId] || {};
          return {
            ...prev,
            [targetId]: {
              ...existing,
              id: targetId,
              name: user,
              age: existing.age || 35,
              bloodType: existing.bloodType || "O+",
              allergies: existing.allergies || "لا يوجد حساسية معروفة",
              chronicDiseases: existing.chronicDiseases || "",
              lastVisit: existing.lastVisit || "2026/06/25",
              currentMedications: existing.currentMedications || "",
              status: existing.status || "stable",
              alerts: existing.alerts || [],
              visits: existing.visits || [],
              labs: existing.labs || [],
              radiology: existing.radiology || [],
              prescriptions: existing.prescriptions || [],
              referrals: existing.referrals || []
            }
          };
        });
      }
    } else if (path === "/hospital") {
      setActiveDashboard("hospital");
    } else if (path === "/ministry") {
      setActiveDashboard("ministry");
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.pathname]);

  // Persist routing and selection states to localStorage
  useEffect(() => {
    if (currentPatientId) {
      localStorage.setItem("currentPatientId", currentPatientId);
    } else {
      localStorage.removeItem("currentPatientId");
    }
  }, [currentPatientId]);

  useEffect(() => {
    if (quickActivePatientId) {
      localStorage.setItem("quickActivePatientId", quickActivePatientId);
    } else {
      localStorage.removeItem("quickActivePatientId");
    }
  }, [quickActivePatientId]);

  useEffect(() => {
    if (activePage) {
      localStorage.setItem("activePage", activePage);
    }
  }, [activePage]);

  useEffect(() => {
    if (patientActivePage) {
      localStorage.setItem("patientActivePage", patientActivePage);
    }
  }, [patientActivePage]);

  useEffect(() => {
    if (hospitalActivePage) {
      localStorage.setItem("hospitalActivePage", hospitalActivePage);
    }
  }, [hospitalActivePage]);

  useEffect(() => {
    if (ministryActivePage) {
      localStorage.setItem("ministryActivePage", ministryActivePage);
    }
  }, [ministryActivePage]);

  useEffect(() => {
    localStorage.removeItem("uiLanguage");
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }, []);

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("doctorInfo", JSON.stringify(doctorInfo));
  }, [doctorInfo]);

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

  const submitChronicIllnessUpdate = async (e) => {
    e.preventDefault();
    const illness = document.getElementById("cr-illness-to-update").value;
    if (!currentPatientId || !illness.trim()) return;
    try {
      const icdCodeId = await getIcd10CodeId(illness);
      if (!icdCodeId) {
        showToast("لم يتم العثور على كود ICD-10 موثق لهذه الحالة. يرجى اختيار حالة موجودة في الكتالوج المعتمد.", "danger");
        return;
      }
      const response = await api.post(`/api/v1/medical-records/${currentPatientId}/diseases`, {
        icd10CodeId: icdCodeId,
        severity: 2,
        isChronic: true,
        isCritical: false,
        status: 1,
        visibility: 1,
        diagnosedAt: new Date().toISOString(),
        notes: "تم إضافتها من طلب تحديث الطبيب"
      });
      
      if (response.data && response.data.success) {
        showToast(`تم إرسال وتوثيق الأمراض المزمنة (${illness}) بنجاح!`, "success");
        setPatients(prev => {
          const updated = { ...prev };
          const p = updated[currentPatientId];
          if (p) {
            const existing = p.chronicDiseases ? p.chronicDiseases + "، " + illness : illness;
            p.chronicDiseases = existing;
          }
          return updated;
        });
      } else {
        showToast(response.data.message || "فشل تحديث الأمراض المزمنة.", "danger");
      }
    } catch (error) {
      console.error("Error adding chronic disease:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتحديث المرض المزمن.", "danger");
    }
    setChronicModalOpen(false);
  };

  const submitNewAllergyForm = async (payload) => {
    if (!currentPatientId) return false;
    try {
      const response = await api.post(`/api/v1/medical-records/${currentPatientId}/allergies`, payload);
      if (response.data && response.data.success) {
        showToast(`تم توثيق الحساسية (${payload.name}) بنجاح في الملف الموحد!`, "success");
        setAllergyModalOpen(false);
        await loadActivePatientDetails(currentPatientId);
        return true;
      }
      showToast(response.data?.message || "فشل توثيق الحساسية.", "danger");
      return false;
    } catch (error) {
      console.error("Error adding allergy:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتوثيق الحساسية.", "danger");
      return false;
    }
  };

  const submitNewMedicationForm = async (payload) => {
    if (!currentPatientId) return false;
    try {
      const catalogId = await getMedicationCatalogId(payload.medicationName);
      if (!catalogId) {
        showToast("لم يتم العثور على الدواء في كتالوج الأدوية المعتمد. يرجى اختيار اسم دواء موثق.", "danger");
        return false;
      }
      const body = {
        medicationCatalogId: catalogId,
        dose: payload.dose,
        frequency: payload.frequency,
        startedAt: payload.startedAt,
        stoppedAt: payload.stoppedAt,
        isActive: payload.isActive,
        visibility: 1,
        notes: payload.notes
      };
      const response = await api.post(`/api/v1/medical-records/${currentPatientId}/medications`, body);
      if (response.data && response.data.success) {
        showToast(`تم توثيق الدواء (${payload.medicationName}) بنجاح في الملف الموحد!`, "success");
        setMedicationModalOpen(false);
        await loadActivePatientDetails(currentPatientId);
        return true;
      }
      showToast(response.data?.message || "فشل توثيق الدواء الحالي.", "danger");
      return false;
    } catch (error) {
      console.error("Error adding medication:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتوثيق الدواء.", "danger");
      return false;
    }
  };

  const submitNewVaccinationForm = async (payload) => {
    if (!currentPatientId) return false;
    try {
      const response = await api.post(`/api/v1/medical-records/${currentPatientId}/vaccinations`, payload);
      if (response.data && response.data.success) {
        showToast(`تم توثيق التطعيم (${payload.vaccineName}) بنجاح في الملف الموحد!`, "success");
        setVaccinationModalOpen(false);
        await loadActivePatientDetails(currentPatientId);
        return true;
      }
      showToast(response.data?.message || "فشل توثيق التطعيم.", "danger");
      return false;
    } catch (error) {
      console.error("Error adding vaccination:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتوثيق التطعيم.", "danger");
      return false;
    }
  };

  const submitNewSurgeryForm = async (payload) => {
    if (!currentPatientId) return false;
    try {
      const response = await api.post(`/api/v1/medical-records/${currentPatientId}/surgery-history`, payload);
      if (response.data && response.data.success) {
        showToast(`تم توثيق العملية الجراحية (${payload.surgeryName}) بنجاح في الملف الموحد!`, "success");
        setSurgeryModalOpen(false);
        await loadActivePatientDetails(currentPatientId);
        return true;
      }
      showToast(response.data?.message || "فشل توثيق العملية الجراحية.", "danger");
      return false;
    } catch (error) {
      console.error("Error adding surgery:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتوثيق العملية الجراحية.", "danger");
      return false;
    }
  };

  const loadDepartments = async () => {
    const facilityId = sessionStorage.getItem("facilityId");
    if (!facilityId) return;
    try {
      const res = await api.get(`/api/v1/facilities/${facilityId}/departments`);
      if (res.data && res.data.success && res.data.data) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    if (activeDashboard === "doctor") {
      loadDepartments();
    }
  }, [activeDashboard]);

  const submitNewVisitForm = async (e) => {
    e.preventDefault();
    if (!currentPatientId) return;
    if (!newVisit.medicalDepartmentId) {
      showToast("يرجى اختيار القسم الطبي أولاً.", "danger");
      return;
    }
    try {
      const payload = {
        appointmentId: null,
        patientId: currentPatientId,
        doctorId: sessionStorage.getItem("userId"),
        healthFacilityId: null,
        medicalDepartmentId: newVisit.medicalDepartmentId,
        type: Number(newVisit.type || 1),
        mainComplaint: newVisit.mainComplaint || "",
        diagnosisSummary: "",
        treatmentSummary: "",
        notes: newVisit.notes || "",
        followUpDoctorId: null,
        followUpContactInfo: ""
      };

      const response = await api.post("/api/v1/medical-encounters", payload);
      if (response.data && response.data.success) {
        showToast("✅ تم بدء الزيارة الطبية للمريض بنجاح!", "success");
        addPatientToTodayList(currentPatientId);
        setActivePage("patientsPage");
        
        // Immediately fetch details to reload patient state
        await loadActivePatientDetails(currentPatientId);
      } else {
        showToast(response.data.message || "فشل تسجيل الكشف الطبي.", "danger");
      }
    } catch (error) {
      console.error("Error creating encounter:", error);
      showToast("خطأ أثناء الاتصال بالخادم لتسجيل الكشف.", "danger");
    }
    setVisitModalOpen(false);
    setNewVisit({ medicalDepartmentId: "", type: "1", mainComplaint: "", notes: "" });
  };

  const handleSubmitVitalSigns = async (vitalsData) => {
    try {
      const activeEncounterId = await getActiveEncounterId(currentPatientId);
      if (!activeEncounterId) {
        const message = "لا توجد زيارة طبية موثقة لهذا المريض. ابدأ زيارة أولاً قبل تسجيل المؤشرات الحيوية.";
        showToast(message, "danger");
        return { success: false, message };
      }
      const payload = {
        medicalEncounterId: activeEncounterId,
        patientId: currentPatientId,
        temperatureCelsius: vitalsData.temperatureCelsius ? Number(vitalsData.temperatureCelsius) : null,
        heartRate: vitalsData.heartRate ? Number(vitalsData.heartRate) : null,
        respiratoryRate: vitalsData.respiratoryRate ? Number(vitalsData.respiratoryRate) : null,
        systolicBloodPressure: vitalsData.systolicBloodPressure ? Number(vitalsData.systolicBloodPressure) : null,
        diastolicBloodPressure: vitalsData.diastolicBloodPressure ? Number(vitalsData.diastolicBloodPressure) : null,
        oxygenSaturation: vitalsData.oxygenSaturation ? Number(vitalsData.oxygenSaturation) : null,
        weightKg: vitalsData.weightKg ? Number(vitalsData.weightKg) : null,
        heightCm: vitalsData.heightCm ? Number(vitalsData.heightCm) : null,
        bloodSugarMgDl: vitalsData.bloodSugarMgDl ? Number(vitalsData.bloodSugarMgDl) : null,
        painScale: vitalsData.painScale ? Number(vitalsData.painScale) : null,
        notes: vitalsData.notes || ""
      };

      const response = await api.post(`/api/v1/medical-encounters/${activeEncounterId}/vital-signs`, payload);
      if (response.data && response.data.success) {
        showToast("تم تسجيل المؤشرات الحيوية بنجاح!", "success");
        await loadActivePatientDetails(currentPatientId);
        return { success: true };
      } else {
        showToast(response.data.message || "فشل تسجيل المؤشرات الحيوية.", "danger");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error saving vital signs:", error);
      let errorMsg = "خطأ أثناء الاتصال بالخادم لحفظ المؤشرات الحيوية.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      showToast(errorMsg, "danger");
      return { success: false, message: errorMsg };
    }
  };

  const handleSubmitDiagnosis = async (diagnosisData) => {
    try {
      const activeEncounterId = await getActiveEncounterId(currentPatientId);
      if (!activeEncounterId) {
        const message = "لا توجد زيارة طبية موثقة لهذا المريض. ابدأ زيارة أولاً قبل إضافة التشخيص.";
        showToast(message, "danger");
        return { success: false, message };
      }
      const doctorId = sessionStorage.getItem("userId");
      const payload = {
        medicalEncounterId: activeEncounterId,
        patientId: currentPatientId,
        authorDoctorId: doctorId,
        icd10CodeId: diagnosisData.icd10CodeId,
        specialty: Number(diagnosisData.specialty || 1),
        severity: Number(diagnosisData.severity || 2),
        visibility: Number(diagnosisData.visibility || 1),
        notes: diagnosisData.notes || ""
      };

      const response = await api.post(`/api/v1/medical-encounters/${activeEncounterId}/diagnoses`, payload);
      if (response.data && response.data.success) {
        showToast("تم إضافة التشخيص بنجاح!", "success");
        await loadActivePatientDetails(currentPatientId);
        return { success: true };
      } else {
        showToast(response.data.message || "فشل إضافة التشخيص.", "danger");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      let errorMsg = "خطأ أثناء الاتصال بالخادم لحفظ التشخيص.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      showToast(errorMsg, "danger");
      return { success: false, message: errorMsg };
    }
  };

  const handleSubmitCloseEncounter = async (closeData) => {
    try {
      const activeEncounterId = await getActiveEncounterId(currentPatientId);
      if (!activeEncounterId) {
        const message = "لا توجد زيارة طبية موثقة لهذا المريض ليتم إغلاقها.";
        showToast(message, "danger");
        return { success: false, message };
      }
      const response = await api.patch(`/api/v1/medical-encounters/${activeEncounterId}/close`, null, {
        params: {
          diagnosisSummary: closeData.diagnosisSummary,
          treatmentSummary: closeData.treatmentSummary
        }
      });
      if (response.data && response.data.success) {
        showToast("تم إنهاء الزيارة وقفل الكشف بنجاح!", "success");
        await loadActivePatientDetails(currentPatientId);
        return { success: true };
      } else {
        showToast(response.data.message || "فشل قفل الكشف.", "danger");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error closing encounter:", error);
      let errorMsg = "خطأ أثناء الاتصال بالخادم لقفل الكشف.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      showToast(errorMsg, "danger");
      return { success: false, message: errorMsg };
    }
  };

  const submitNewPrescriptionForm = async (medicationsList) => {
    if (!currentPatientId) return;
    const doctorId = sessionStorage.getItem("userId");
    if (!doctorId) {
      showToast("خطأ: انتهت الجلسة. يرجى تسجيل الدخول مجدداً قبل إصدار الوصفة.", "danger");
      setPrescriptionModalOpen(false);
      return;
    }
    try {
      const medicalEncounterId = await getActiveEncounterId(currentPatientId);
      if (!medicalEncounterId) {
        showToast("لا توجد زيارة طبية موثقة لهذا المريض. ابدأ زيارة أولاً قبل إصدار الوصفة.", "danger");
        setPrescriptionModalOpen(false);
        return;
      }
      const medications = [];
      for (const med of medicationsList) {
        const catalogId = await getMedicationCatalogId(med.name);
        if (!catalogId) {
          showToast(`لم يتم العثور على الدواء (${med.name}) في كتالوج الأدوية المعتمد.`, "danger");
          setPrescriptionModalOpen(false);
          return;
        }
        medications.push({
          medicationCatalogId: catalogId,
          dose: med.dosage,
          frequency: "مرة يومياً",
          duration: med.duration,
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          needsReminder: false,
          instructions: med.dosage
        });
      }

      const payload = {
        medicalEncounterId,
        patientId: currentPatientId,
        doctorId,
        visibility: 1,
        notes: "تم إضافتها من لوحة الطبيب",
        medications
      };

      const response = await api.post("/api/v1/prescriptions", payload);
      if (response.data && response.data.success) {
        showToast("تم إصدار الوصفة الطبية وإرفاقها بكارت الصحة الرقمية للمواطن!", "success");
        await loadActivePatientDetails(currentPatientId);
      } else {
        showToast(response.data.message || "فشل إصدار الوصفة الطبية.", "danger");
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      showToast("خطأ أثناء الاتصال بالخادم لإصدار الوصفة.", "danger");
    }
    setPrescriptionModalOpen(false);
  };

  const handleDeletePrescription = (index) => {
    const p = patients[currentPatientId];
    const deletedPres = p?.prescriptions?.[index];
    if (!deletedPres) return;
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف الوصفة الطبية",
      message: `هل أنت متأكد من حذف الوصفة الطبية لـ (${deletedPres.name || ''}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "تأكيد الحذف",
      type: "danger",
      onConfirm: async () => {
        try {
          if (deletedPres.id) {
            await api.patch(`/api/v1/prescriptions/${deletedPres.id}/status`, null, {
              params: { status: "Cancelled" }
            });
            showToast("تم إلغاء الوصفة الطبية بنجاح", "success");
            await loadActivePatientDetails(currentPatientId);
          }
        } catch (error) {
          console.error("Error deleting prescription:", error);
          showToast("حدث خطأ أثناء الاتصال بالخادم لحذف الوصفة.", "danger");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCreateMedicalRecord = async (formData) => {
    try {
      const payload = {
        patientId: currentPatientId,
        governorate: Number(formData.governorate),
        bloodType: formData.bloodType,
        emergencySummary: formData.emergencySummary || ""
      };

      const response = await api.post("/api/v1/medical-records", payload);
      if (response.data && response.data.success) {
        showToast("✅ تم إنشاء الملف الطبي بنجاح.", "success");
        await loadActivePatientDetails(currentPatientId);
        return { success: true };
      } else {
        showToast(response.data.message || "فشل إنشاء الملف الطبي.", "danger");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error creating medical record:", error);
      let errorMsg = "خطأ أثناء الاتصال بالخادم لإنشاء الملف الطبي.";
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMsg = "غير مصرح. يرجى تسجيل الدخول مرة أخرى.";
        } else if (status === 403) {
          errorMsg = "لا تملك الصلاحية لإنشاء ملف طبي.";
        } else if (status === 404) {
          errorMsg = "لم يتم العثور على المريض أو المسار المطلوب.";
        } else if (status === 500) {
          errorMsg = "حدث خطأ داخلي في الخادم (500).";
        } else if (status === 400 || status === 422) {
          errorMsg = "بيانات غير صالحة. يرجى التحقق من المدخلات.";
        }
      }
      showToast(errorMsg, "danger");
      return { success: false, message: errorMsg };
    }
  };



  // ─── Lab Request ───────────────────────────────────────────────────────────
  const handleSubmitMedicalReport = async (reportData) => {
    if (!currentPatientId) {
      return { success: false, message: "لم يتم تحديد مريض لإنشاء التقرير الطبي." };
    }

    const doctorId = sessionStorage.getItem("userId");
    if (!doctorId) {
      return { success: false, message: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً قبل إنشاء التقرير الطبي." };
    }

    const activeEncounterId = await getActiveEncounterId(currentPatientId);
    if (!activeEncounterId) {
      const message = "لا يمكن إنشاء تقرير طبي قبل فتح كشف أو زيارة طبية نشطة لهذا المريض.";
      showToast(message, "danger");
      return { success: false, message };
    }

    try {
      const response = await api.post("/api/v1/reports/medical", {
        medicalEncounterId: activeEncounterId,
        patientId: currentPatientId,
        createdByUserId: doctorId,
        reportType: 1,
        visibility: 1,
        title: reportData.title,
        content: reportData.content
      });

      if (response.data && response.data.success) {
        showToast("تم إنشاء التقرير الطبي بنجاح.", "success");
        return { success: true };
      }

      return {
        success: false,
        message: response.data?.message || "فشل إنشاء التقرير الطبي."
      };
    } catch (error) {
      console.error("Medical report creation error:", error);
      const status = error?.response?.status;
      if (status === 401) {
        return { success: false, message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً." };
      }
      if (status === 403) {
        return { success: false, message: "ليست لديك الصلاحية لإنشاء تقرير طبي لهذا المريض." };
      }
      if (status === 400 || status === 422) {
        return { success: false, message: error.response?.data?.message || "بيانات التقرير الطبي غير صحيحة." };
      }
      if (status >= 500) {
        return { success: false, message: "حدث خطأ في الخادم أثناء إنشاء التقرير الطبي. يرجى المحاولة لاحقاً." };
      }
      return { success: false, message: "تعذر الاتصال بالخادم. يرجى التحقق من الشبكة والمحاولة مرة أخرى." };
    }
  };

  const handleSubmitLabRequest = async (data) => {
    if (!currentPatientId) return { success: false, message: "لم يتم تحديد مريض." };
    const doctorId = sessionStorage.getItem("userId");
    if (!doctorId) return { success: false, message: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً." };
    try {
      const encRes = await api.get("/api/v1/medical-encounters", {
        params: { patientId: currentPatientId, Page: 1, PageSize: 5 }
      });
      if (!encRes.data?.success || !encRes.data?.data?.items?.length) {
        return { success: false, message: "لا يوجد كشف طبي نشط للمريض. افتح زيارة طبية اولاً." };
      }
      const encounterId = encRes.data.data.items[0].medicalEncounterId;
      const res = await api.post("/api/v1/reports/lab/request", {
        medicalEncounterId: encounterId,
        patientId: currentPatientId,
        requestedByUserId: doctorId,
        testName: data.testName,
        notes: data.notes || ""
      });
      if (res.data && res.data.success) {
        showToast("تم ارسال طلب التحليل المعملي بنجاح.", "success");
        return { success: true };
      }
      return { success: false, message: res.data?.message || "فشل ارسال طلب التحليل." };
    } catch (err) {
      console.error("Lab request error:", err);
      const status = err?.response?.status;
      if (status === 401) return { success: false, message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً." };
      if (status === 403) return { success: false, message: "ليس لديك صلاحية لطلب تحاليل لهذا المريض." };
      if (status === 400) return { success: false, message: err.response?.data?.message || "بيانات الطلب غير صحيحة." };
      if (status >= 500) return { success: false, message: "خطأ في الخادم. يرجى المحاولة لاحقاً." };
      return { success: false, message: "تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً." };
    }
  };

  // ─── Radiology Request ─────────────────────────────────────────────────────
  const handleSubmitRadiologyRequest = async (data) => {
    if (!currentPatientId) return { success: false, message: "لم يتم تحديد مريض." };
    const doctorId = sessionStorage.getItem("userId");
    if (!doctorId) return { success: false, message: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً." };
    try {
      const encRes = await api.get("/api/v1/medical-encounters", {
        params: { patientId: currentPatientId, Page: 1, PageSize: 5 }
      });
      if (!encRes.data?.success || !encRes.data?.data?.items?.length) {
        return { success: false, message: "لا يوجد كشف طبي نشط للمريض. افتح زيارة طبية اولاً." };
      }
      const encounterId = encRes.data.data.items[0].medicalEncounterId;
      const res = await api.post("/api/v1/reports/radiology/request", {
        medicalEncounterId: encounterId,
        patientId: currentPatientId,
        requestedByUserId: doctorId,
        studyName: data.studyName,
        bodyPart: data.bodyPart || "General",
        notes: data.notes || ""
      });
      if (res.data && res.data.success) {
        showToast("تم ارسال طلب الاشعة بنجاح.", "success");
        return { success: true };
      }
      return { success: false, message: res.data?.message || "فشل ارسال طلب الاشعة." };
    } catch (err) {
      console.error("Radiology request error:", err);
      const status = err?.response?.status;
      if (status === 401) return { success: false, message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً." };
      if (status === 403) return { success: false, message: "ليس لديك صلاحية لطلب اشعة لهذا المريض." };
      if (status === 400) return { success: false, message: err.response?.data?.message || "بيانات الطلب غير صحيحة." };
      if (status >= 500) return { success: false, message: "خطأ في الخادم. يرجى المحاولة لاحقاً." };
      return { success: false, message: "تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً." };
    }
  };

  // ─── Follow-up ─────────────────────────────────────────────────────────────
  const handleSubmitFollowUp = async (data) => {
    if (!currentPatientId) return { success: false, message: "لم يتم تحديد مريض." };
    const doctorId = sessionStorage.getItem("userId");
    if (!doctorId) return { success: false, message: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً." };
    try {
      const encRes = await api.get("/api/v1/medical-encounters", {
        params: { patientId: currentPatientId, Page: 1, PageSize: 5 }
      });
      if (!encRes.data?.success || !encRes.data?.data?.items?.length) {
        return { success: false, message: "لا يوجد كشف طبي نشط للمريض. افتح زيارة طبية اولاً." };
      }
      const encounterId = encRes.data.data.items[0].medicalEncounterId;
      const res = await api.post("/api/v1/operations/follow-ups", {
        patientId: currentPatientId,
        medicalEncounterId: encounterId,
        assignedToUserId: doctorId,
        followUpDoctorId: null, // Backend limitation: no doctor search endpoint available in Doctor portal
        followUpFacilityId: null, // Taken from JWT by backend
        followUpContactMethod: data.followUpContactMethod,
        type: data.type || 1,
        scheduledAt: data.scheduledAt,
        notes: data.notes || ""
      });
      if (res.data && res.data.success) {
        showToast("تم انشاء المتابعة الطبية بنجاح.", "success");
        return { success: true };
      }
      return { success: false, message: res.data?.message || "فشل انشاء المتابعة." };
    } catch (err) {
      console.error("Follow-up error:", err);
      const status = err?.response?.status;
      if (status === 401) return { success: false, message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً." };
      if (status === 403) return { success: false, message: "ليس لديك صلاحية لانشاء متابعة لهذا المريض." };
      if (status === 400) return { success: false, message: err.response?.data?.message || "بيانات المتابعة غير صحيحة." };
      if (status >= 500) return { success: false, message: "خطأ في الخادم. يرجى المحاولة لاحقاً." };
      return { success: false, message: "تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً." };
    }
  };

  // ─── Hospital Admission ────────────────────────────────────────────────────
  const handleSubmitAdmission = async (data) => {
    if (!currentPatientId) return { success: false, message: "لم يتم تحديد مريض." };
    try {
      const res = await api.post("/api/v1/operations/admissions", {
        patientId: currentPatientId,
        healthFacilityId: null, // Taken from JWT by backend
        medicalDepartmentId: data.medicalDepartmentId,
        bedId: null, // Backend limitation: no bed search endpoint in Doctor portal documentation
        admittedAt: data.admittedAt,
        notes: data.notes || ""
      });
      if (res.data && res.data.success) {
        showToast("تم تسجيل دخول المريض للمستشفى بنجاح.", "success");
        return { success: true };
      }
      return { success: false, message: res.data?.message || "فشل تسجيل الدخول." };
    } catch (err) {
      console.error("Admission error:", err);
      const status = err?.response?.status;
      if (status === 401) return { success: false, message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً." };
      if (status === 403) return { success: false, message: "ليس لديك صلاحية لتسجيل دخول هذا المريض." };
      if (status === 400) return { success: false, message: err.response?.data?.message || "بيانات الدخول غير صحيحة." };
      if (status >= 500) return { success: false, message: "خطأ في الخادم. يرجى المحاولة لاحقاً." };
      return { success: false, message: "تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً." };
    }
  };

  const submitGlobalUploadForm = async (e) => {
    e.preventDefault();
    if (!currentPatientId) return;
    try {
      const activeEncounterId = await getOrCreateActiveEncounterId(currentPatientId);
      const reportType = newUpload.type === "lab" ? "LabResult" : "Radiology";
      
      const uploaderId = sessionStorage.getItem("userId");
      if (!uploaderId) {
        showToast("خطأ: انتهت الجلسة. يرجى تسجيل الدخول مجدداً قبل رفع الفحص.", "danger");
        setUploadModalOpen(false);
        return;
      }
      const payload = {
        medicalEncounterId: activeEncounterId,
        patientId: currentPatientId,
        createdByUserId: uploaderId,
        reportType,
        visibility: "Public",
        title: newUpload.name,
        content: newUpload.summary
      };

      const response = await api.post("/api/v1/reports/medical", payload);
      if (response.data && response.data.success) {
        showToast(`تم رفع الفحص بنجاح وتوثيقه للمريض!`, "success");
        await loadActivePatientDetails(currentPatientId);
      } else {
        showToast(response.data.message || "فشل رفع الفحص.", "danger");
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      showToast("خطأ أثناء الاتصال بالخادم لرفع الفحص.", "danger");
    }
    setNewUpload({ type: "lab", name: "", summary: "", file: null });
    setUploadModalOpen(false);
    e.target.reset();
  };

  const renderPdfContent = () => {
    if (!pdfType || !activePatient) return "";
    
    if (pdfType === "lab") {
      const lab = activePatient.labs[pdfIndex] || { name: pdfName, date: activePatient.lastVisit, summary: "فحص طبي روتيني للمتابعة." };
      return `
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
      return `
EGYPTIAN SMART HEALTH NETWORK - RADIOLOGY DEPT
PATIENT ID: ${activePatient.id} | DATE: ${rad.date}
EXAMINATION: ${rad.name}
--------------------------------------------------
FINDINGS: ${rad.report}
      `;
    }
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



  const filteredSearchPatients = {};
  liveSearchPatientIds.forEach(id => {
    if (patients[id]) {
      filteredSearchPatients[id] = patients[id];
    }
  });

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
            onLogout={async () => {
              try { await api.post("/api/v1/auth/logout"); } catch { /* best-effort */ }
              clearSession();
              setCurrentPatientId(null);
              setQuickActivePatientId(null);
              setActivePage("searchPage");
              localStorage.removeItem("currentPatientId");
              localStorage.removeItem("quickActivePatientId");
              localStorage.removeItem("activePage");
              localStorage.removeItem("patientActivePage");
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
            hasUnread={hasUnread}
            onLogout={async () => {
              try { await api.post("/api/v1/auth/logout"); } catch { /* best-effort */ }
              clearSession();
              setCurrentPatientId(null);
              setPatientActivePage("homePage");
              localStorage.removeItem("currentPatientId");
              localStorage.removeItem("quickActivePatientId");
              localStorage.removeItem("activePage");
              localStorage.removeItem("patientActivePage");
              navigate("/login");
              showToast("تم تسجيل الخروج بنجاح", "success");
            }}
          />
        )}

        {activeDashboard === "hospital" && (
          <HospitalSidebar
            sidebarOpen={sidebarOpen}
            activePage={hospitalActivePage}
            setActivePage={setHospitalActivePage}
            setSidebarOpen={setSidebarOpen}
            onLogout={async () => {
              try { await api.post("/api/v1/auth/logout"); } catch { /* best-effort */ }
              clearSession();
              setCurrentPatientId(null);
              setQuickActivePatientId(null);
              setActivePage("searchPage");
              localStorage.removeItem("currentPatientId");
              localStorage.removeItem("quickActivePatientId");
              localStorage.removeItem("activePage");
              localStorage.removeItem("patientActivePage");
              localStorage.removeItem("hospitalActivePage");
              navigate("/login");
              showToast("تم تسجيل الخروج بنجاح", "success");
            }}
          />
        )}

        {activeDashboard === "ministry" && (
          <MinistrySidebar
            sidebarOpen={sidebarOpen}
            activePage={ministryActivePage}
            setActivePage={setMinistryActivePage}
            setSidebarOpen={setSidebarOpen}
            onLogout={async () => {
              try { await api.post("/api/v1/auth/logout"); } catch { /* best-effort */ }
              clearSession();
              localStorage.removeItem("ministryActivePage");
              navigate("/login");
              showToast("ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­", "success");
            }}
          />
        )}

        {activeDashboard !== "portal" && (
          <main className="main">
            {activeDashboard === "doctor" ? (
              <>
                {activePage === "searchPage" && (
                  <DoctorSearch
                    doctorInfo={doctorInfo}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    triggerSearch={triggerSearch}
                    searchState={searchState}
                    setQrModalOpen={setQrModalOpen}
                    setNfcModalOpen={setNfcModalOpen}
                    searchResults={searchResults}
                    activePatient={patients[quickActivePatientId]}
                    handleOpenPatientProfile={handleOpenPatientProfile}
                    setQuickActivePatientId={setQuickActivePatientId}
                    startVisit={startVisit}
                    hasActiveEncounterToday={hasActiveEncounterToday}
                    setVisitModalOpen={setVisitModalOpen}
                    setPrescriptionModalOpen={setPrescriptionModalOpen}
                    setNewUpload={setNewUpload}
                    setUploadModalOpen={setUploadModalOpen}
                    setActivePage={setActivePage}
                  />
                )}

                {activePage === "homePage" && (
                  <DoctorHome
                    doctorInfo={doctorInfo}
                    homeSearch={homeSearch}
                    setHomeSearch={setHomeSearch}
                    setQrModalOpen={setQrModalOpen}
                    setNfcModalOpen={setNfcModalOpen}
                    todayVisitsCount={todayVisitsCount}
                    patients={doctorTodayPatients}
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
                      patients={filteredSearchPatients}
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
                      setLabRequestModalOpen={setLabRequestModalOpen}
                      setRadiologyRequestModalOpen={setRadiologyRequestModalOpen}
                      setFollowUpModalOpen={setFollowUpModalOpen}
                      setAdmissionModalOpen={setAdmissionModalOpen}
                      setMedicalReportModalOpen={setMedicalReportModalOpen}
                      setChronicModalOpen={setChronicModalOpen}
                      setAllergyModalOpen={setAllergyModalOpen}
                      setMedicationModalOpen={setMedicationModalOpen}
                      setVaccinationModalOpen={setVaccinationModalOpen}
                      setSurgeryModalOpen={setSurgeryModalOpen}
                       handleDeletePrescription={handleDeletePrescription}
                      isReadOnly={!hasActiveEncounterToday(activePatient)}
                      startVisit={startVisit}
                      refreshPatientData={() => loadActivePatientDetails(currentPatientId)}
                      showToast={showToast}
                      onCreateMedicalRecord={handleCreateMedicalRecord}
                      setVitalSignsModalOpen={setVitalSignsModalOpen}
                      setAddDiagnosisModalOpen={setAddDiagnosisModalOpen}
                      setCloseEncounterModalOpen={setCloseEncounterModalOpen}
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
                      doctorInfo={doctorInfo}
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
                      isReadOnly={!hasActiveEncounterToday(activePatient)}
                      refreshPatientData={() => loadActivePatientDetails(currentPatientId)}
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
                      doctorInfo={doctorInfo}
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
                    showToast={showToast}
                    onLogout={() => {
                      setCurrentPatientId(null);
                      setQuickActivePatientId(null);
                      setActivePage("searchPage");
                      localStorage.removeItem("currentPatientId");
                      localStorage.removeItem("quickActivePatientId");
                      localStorage.removeItem("activePage");
                      localStorage.removeItem("patientActivePage");
                      navigate("/login");
                    }}
                  />
                )}
              </>
            ) : activeDashboard === "patient" ? (
              <>
                {patientActivePage === 'homePage' && (
                  <PatientHome patients={patients} topNotifications={topNotifications} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'healthProfile' && (
                  <PatientProfile patients={patients} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'labs' && (
                  <PatientLabs
                    patients={patients}
                    hasUnread={hasUnread}
                    unreadCount={unreadCount}
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
                    hasUnread={hasUnread}
                    unreadCount={unreadCount}
                    pdfOpen={pdfOpen}
                    setPdfOpen={setPdfOpen}
                    pdfType={pdfType}
                    handleOpenPdf={handleOpenPdf}
                    renderPdfContent={renderPdfContent}
                  />
                )}

                {patientActivePage === 'prescriptions' && (
                  <PatientPrescriptions patients={patients} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'medicalCard' && (
                  <PatientMedicalCard patients={patients} showToast={showToast} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'emergency' && (
                  <PatientEmergency patients={patients} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'notifications' && (
                  <PatientNotifications patients={patients} showToast={showToast} refreshNotifications={refreshNotifications} hasUnread={hasUnread} unreadCount={unreadCount} />
                )}

                {patientActivePage === 'settings' && (
                  <PatientSettings
                    patients={patients}
                    hasUnread={hasUnread}
                    unreadCount={unreadCount}
                    showToast={showToast}
                    onLogout={() => {
                      setCurrentPatientId(null);
                      setPatientActivePage("homePage");
                      localStorage.removeItem("currentPatientId");
                      localStorage.removeItem("quickActivePatientId");
                      localStorage.removeItem("activePage");
                      localStorage.removeItem("patientActivePage");
                      navigate("/login");
                    }}
                  />
                )}
              </>
            ) : activeDashboard === "hospital" ? (
              <>
                {hospitalActivePage === 'dashboard' && (
                  <HospitalDashboard setActivePage={setHospitalActivePage} showToast={showToast} />
                )}

                {hospitalActivePage === 'departments' && (
                  <HospitalDepartments showToast={showToast} />
                )}

                {hospitalActivePage === 'doctors' && (
                  <HospitalDoctors showToast={showToast} />
                )}

                {hospitalActivePage === 'inpatients' && (
                  <HospitalInpatients showToast={showToast} />
                )}

                {hospitalActivePage === 'rooms' && (
                  <HospitalRoomsBeds showToast={showToast} />
                )}

                {hospitalActivePage === 'operations' && (
                  <HospitalOperations showToast={showToast} />
                )}

                {hospitalActivePage === 'reports' && (
                  <HospitalReports showToast={showToast} />
                )}
              </>
            ) : activeDashboard === "ministry" ? (
              <>
                {ministryActivePage === "dashboard" && (
                  <MinistryDashboard setActivePage={setMinistryActivePage} showToast={showToast} />
                )}

                {ministryActivePage === "hospitals" && (
                  <MinistryHospitals setActivePage={setMinistryActivePage} showToast={showToast} />
                )}

                {ministryActivePage === "doctors" && (
                  <MinistryDoctors setActivePage={setMinistryActivePage} showToast={showToast} />
                )}

                {ministryActivePage === "departments" && (
                  <MinistryDepartments setActivePage={setMinistryActivePage} showToast={showToast} />
                )}

                {ministryActivePage === "reports" && (
                  <MinistryReports showToast={showToast} />
                )}
              </>
            ) : null}
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
        departments={departments}
      />

      <VitalSignsModal
        vitalSignsModalOpen={vitalSignsModalOpen}
        setVitalSignsModalOpen={setVitalSignsModalOpen}
        onSubmit={handleSubmitVitalSigns}
      />

      <AddDiagnosisModal
        addDiagnosisModalOpen={addDiagnosisModalOpen}
        setAddDiagnosisModalOpen={setAddDiagnosisModalOpen}
        onSubmit={handleSubmitDiagnosis}
      />

      <CloseEncounterModal
        closeEncounterModalOpen={closeEncounterModalOpen}
        setCloseEncounterModalOpen={setCloseEncounterModalOpen}
        onSubmit={handleSubmitCloseEncounter}
      />

      <PrescriptionModal
        prescriptionModalOpen={prescriptionModalOpen}
        setPrescriptionModalOpen={setPrescriptionModalOpen}
        submitNewPrescriptionForm={submitNewPrescriptionForm}
      />

      <MedicalReportModal
        isOpen={medicalReportModalOpen}
        onClose={() => setMedicalReportModalOpen(false)}
        onSubmit={handleSubmitMedicalReport}
        hasActiveEncounter={!!(activePatient && hasActiveEncounterToday(activePatient))}
      />


      <LaboratoryRequestModal
        isOpen={labRequestModalOpen}
        onClose={() => setLabRequestModalOpen(false)}
        onSubmit={handleSubmitLabRequest}
        hasActiveEncounter={!!(activePatient && hasActiveEncounterToday(activePatient))}
      />

      <RadiologyRequestModal
        isOpen={radiologyRequestModalOpen}
        onClose={() => setRadiologyRequestModalOpen(false)}
        onSubmit={handleSubmitRadiologyRequest}
        hasActiveEncounter={!!(activePatient && hasActiveEncounterToday(activePatient))}
      />

      <FollowUpModal
        isOpen={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        onSubmit={handleSubmitFollowUp}
        hasActiveEncounter={!!(activePatient && hasActiveEncounterToday(activePatient))}
      />

      <AdmissionModal
        isOpen={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onSubmit={handleSubmitAdmission}
        departments={departments}
        hasActiveEncounter={!!(activePatient && hasActiveEncounterToday(activePatient))}
      />

      <UploadModal
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        activePatient={activePatient}
        newUpload={newUpload}
        setNewUpload={setNewUpload}
        submitGlobalUploadForm={submitGlobalUploadForm}
      />

      <AllergyModal
        allergyModalOpen={allergyModalOpen}
        setAllergyModalOpen={setAllergyModalOpen}
        submitNewAllergyForm={submitNewAllergyForm}
      />

      <MedicationModal
        medicationModalOpen={medicationModalOpen}
        setMedicationModalOpen={setMedicationModalOpen}
        submitNewMedicationForm={submitNewMedicationForm}
      />

      <VaccinationModal
        vaccinationModalOpen={vaccinationModalOpen}
        setVaccinationModalOpen={setVaccinationModalOpen}
        submitNewVaccinationForm={submitNewVaccinationForm}
      />

      <SurgeryHistoryModal
        surgeryModalOpen={surgeryModalOpen}
        setSurgeryModalOpen={setSurgeryModalOpen}
        submitNewSurgeryForm={submitNewSurgeryForm}
      />

      <EditDoctorModal
        editDoctorModalOpen={editDoctorModalOpen}
        setEditDoctorModalOpen={setEditDoctorModalOpen}
        tempDoctorInfo={tempDoctorInfo}
        setTempDoctorInfo={setTempDoctorInfo}
        handleAvatarChange={handleAvatarChange}
        submitEditDoctorForm={submitEditDoctorForm}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
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
