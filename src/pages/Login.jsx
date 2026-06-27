import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import api from "../utils/api";
import { storeTokens, clearSession } from "../utils/api";


const initialFormState = {
  username: "",
  password: "",
  accountType: "",
  rememberMe: false,
};

const STORAGE_KEY = "smart-health-login";

const passwordRules = [
  {
    label: "على الأقل 8 أحرف",
    test: (password) => password.length >= 8,
  },
  {
    label: "حرف كبير مثل A B C",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "حرف صغير مثل a b c",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "رقم مثل 1 2 3",
    test: (password) => /\d/.test(password),
  },
];

const isTwoPartName = (name) => name.trim().split(/\s+/).length >= 2;

const isPasswordValid = (password) =>
  passwordRules.every((rule) => rule.test(password));

const getSavedFormState = () => {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return initialFormState;
  }

  try {
    const parsedState = JSON.parse(savedState);

    return {
      ...initialFormState,
      username: parsedState.username || "",
      accountType: parsedState.accountType || "",
      rememberMe: Boolean(parsedState.rememberMe),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialFormState;
  }
};

import LoginLoadingOverlay from "../components/common/LoginLoadingOverlay";

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(getSavedFormState);
  const [errors, setErrors] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!formData.rememberMe) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username: formData.username,
        accountType: formData.accountType,
        rememberMe: formData.rememberMe,
      }),
    );
  }, [formData.rememberMe, formData.username, formData.accountType]);

  const handleChange = ({ target }) => {
    const { name, type, checked, value } = target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRememberMeChange = ({ target }) => {
    const rememberMe = target.checked;

    setFormData((current) => {
      const nextState = {
        ...current,
        rememberMe,
      };

      if (!rememberMe) {
        localStorage.removeItem(STORAGE_KEY);
        return nextState;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          username: nextState.username,
          accountType: nextState.accountType,
          rememberMe,
        }),
      );

      return nextState;
    });
  };

  /**
   * Decode a JWT and return its payload claims.
   */
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  /**
   * Determine the frontend route from the JWT active_role claim.
   * In DEV mode, the accountType select overrides the role.
   */
  const resolveTargetPath = (claims) => {
    if (import.meta.env.DEV) {
      const map = { patient: "/patient", doctor: "/doctor", hospital: "/hospital", ministry: "/ministry" };
      return map[formData.accountType] || null;
    }
    const role = (
      claims?.active_role ||
      claims?.role ||
      claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      ""
    ).toLowerCase();
    if (role === "patient") return "/patient";
    if (role === "doctor") return "/doctor";
    if (role === "hospital" || role === "hospitaladmin" || role.includes("hospital")) return "/hospital";
    if (role === "ministry" || role === "ministryadmin" || role.includes("ministry")) return "/ministry";
    return null;
  };

  /**
   * Persist all auth data returned by the final login step.
   */
  const persistAuthData = (data, displayFallback) => {
    storeTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      csrfToken: data.csrfToken,
    });
    if (data.userId) sessionStorage.setItem("userId", data.userId);
    sessionStorage.setItem("activeUser", data.displayName || displayFallback);

    // Resolve facilityId: prefer explicit field, then JWT claim
    const facilityId =
      data.activeFacilityId ||
      data.facilityId ||
      data.healthFacilityId ||
      (() => {
        const claims = decodeJwt(data.accessToken);
        return (
          claims?.facilityId ||
          claims?.FacilityId ||
          claims?.healthFacilityId ||
          claims?.HealthFacilityId ||
          claims?.hospitalId ||
          claims?.HospitalId ||
          claims?.facility_id ||
          claims?.hospital_id ||
          ""
        );
      })();

    if (facilityId) sessionStorage.setItem("facilityId", facilityId);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoggingIn) return; // Prevent duplicate login requests
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "من فضلك أدخل الاسم الثنائي.";
    } else if (!isTwoPartName(formData.username)) {
      newErrors.username = "من فضلك أدخل الاسم الأول واسم العائلة.";
    }

    if (!formData.password) {
      newErrors.password = "من فضلك أدخل كلمة المرور.";
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحقق جميع التعليمات المطلوبة.";
    }

    if (import.meta.env.DEV && !formData.accountType) {
      newErrors.accountType = "من فضلك اختر نوع الحساب.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoggingIn(true);

    try {
      // ── Step 1: Login ────────────────────────────────────────────────────
      const loginRes = await api.post("/api/v1/auth/login", {
        identifier: formData.username.trim(),
        password: formData.password,
      });

      const loginData = loginRes.data;
      if (!loginData || !loginData.success) {
        setIsLoggingIn(false);
        showToast?.(loginData?.message || "حدث خطأ أثناء تسجيل الدخول.", "danger");
        return;
      }

      let currentData = loginData.data;

      // ── Step 2 (optional): Select Facility ──────────────────────────────
      // The backend returns a loginFlowToken when facility selection is required.
      if (currentData.loginFlowToken && !currentData.accessToken) {
        // Determine facilityId to submit:
        // Use the first/only facility returned by the backend if available.
        const facilities = currentData.facilities || [];
        let facilityId = currentData.facilityId || currentData.healthFacilityId || "";
        if (!facilityId && facilities.length === 1) {
          facilityId =
            facilities[0].id ||
            facilities[0].healthFacilityId ||
            facilities[0].facilityId ||
            "";
        }

        if (!facilityId) {
          // Cannot auto-select — surface this to the user
          setIsLoggingIn(false);
          showToast?.("يرجى اختيار المنشأة الصحية للمتابعة.", "warning");
          return;
        }

        const facRes = await api.post("/api/v1/auth/select-facility", {
          loginFlowToken: currentData.loginFlowToken,
          healthFacilityId: facilityId,
        });

        if (!facRes.data || !facRes.data.success) {
          setIsLoggingIn(false);
          showToast?.(facRes.data?.message || "فشل في اختيار المنشأة الصحية.", "danger");
          return;
        }
        currentData = facRes.data.data;
      }

      // ── Step 3 (optional): Select Role ──────────────────────────────────
      // The backend returns a loginFlowToken (with no accessToken) when role selection is required.
      if (currentData.loginFlowToken && !currentData.accessToken) {
        const roles = currentData.availableRoles || currentData.roles || [];
        let selectedRole = currentData.selectedRole || "";

        if (!selectedRole && roles.length === 1) {
          selectedRole = roles[0];
        }

        if (!selectedRole) {
          // In DEV, derive from accountType dropdown
          if (import.meta.env.DEV) {
            const devRoleMap = { hospital: "HospitalAdmin", doctor: "Doctor", patient: "Patient", ministry: "MinistryAdmin" };
            selectedRole = devRoleMap[formData.accountType] || "";
          }
        }

        if (!selectedRole) {
          setIsLoggingIn(false);
          showToast?.("يرجى اختيار الدور للمتابعة.", "warning");
          return;
        }

        const roleRes = await api.post("/api/v1/auth/select-role", {
          loginFlowToken: currentData.loginFlowToken,
          selectedRole,
        });

        if (!roleRes.data || !roleRes.data.success) {
          setIsLoggingIn(false);
          showToast?.(roleRes.data?.message || "فشل في اختيار الدور.", "danger");
          return;
        }
        currentData = roleRes.data.data;
      }

      // ── Step 4: Validate final token ─────────────────────────────────────
      if (!currentData.accessToken) {
        setIsLoggingIn(false);
        showToast?.("فشل في استكمال تسجيل الدخول. يرجى المحاولة مرة أخرى.", "danger");
        return;
      }

      const claims = decodeJwt(currentData.accessToken);
      if (!claims) {
        setIsLoggingIn(false);
        showToast?.("فشل في قراءة بيانات الصلاحيات من الرمز الأمني.", "danger");
        return;
      }

      const targetPath = resolveTargetPath(claims);
      if (!targetPath) {
        setIsLoggingIn(false);
        showToast?.("نوع الحساب غير مصرح به أو غير معروف.", "danger");
        return;
      }

      persistAuthData(currentData, formData.username.trim());
      showToast?.(`تم تسجيل الدخول بنجاح للمستخدم ${currentData.displayName || formData.username.trim()}.`, "success");

      // Fade out smoothly: keep overlay visible and delay navigation briefly
      setTimeout(() => {
        setIsLoggingIn(false);
        navigate(targetPath);
      }, 400);
    } catch (error) {
      console.error("Login error:", error);
      const errMsg = error.response?.data?.message || "فشل الاتصال بالخادم. يرجى التحقق من بيانات الدخول.";
      setIsLoggingIn(false);
      showToast?.(errMsg, "danger");
    }
  };

  const handleSmartCard = async () => {
    // Smart card redeem: the NFC/QR reader delivers a token via query param or input.
    // Here we prompt for the token (in production this would come from hardware).
    const token = window.prompt("أدخل رمز كارت الصحة الرقمية (NFC / QR):");
    if (!token || !token.trim()) return;

    setIsLoggingIn(true);
    try {
      const res = await api.get("/api/v1/auth/smart-card/redeem", {
        params: { token: token.trim() },
      });

      const resData = res.data;
      if (!resData || !resData.success) {
        setIsLoggingIn(false);
        showToast?.(resData?.message || "فشل في التحقق من الكارت الصحي.", "danger");
        return;
      }

      const data = resData.data;
      if (!data?.accessToken) {
        setIsLoggingIn(false);
        showToast?.("لم يتم إرجاع بيانات صحيحة من الخادم.", "danger");
        return;
      }

      const claims = decodeJwt(data.accessToken);
      const targetPath = resolveTargetPath(claims);
      if (!targetPath) {
        setIsLoggingIn(false);
        showToast?.("نوع الحساب غير مصرح به.", "danger");
        return;
      }

      persistAuthData(data, data.displayName || "");
      showToast?.(`تم الدخول بنجاح عبر كارت الصحة الرقمية.`, "success");
      setTimeout(() => {
        setIsLoggingIn(false);
        navigate(targetPath);
      }, 400);
    } catch (err) {
      console.error("Smart card redeem error:", err);
      setIsLoggingIn(false);
      showToast?.(err.response?.data?.message || "فشل في التحقق من الكارت الصحي.", "danger");
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    navigate("/forgot-password");
  };

  return (
    <main
      className=" flex min-h-[100vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 shadow-[0_0_50px_rgba(0,0,0,0.15)] md:min-h-[680px] md:max-h-[calc(100vh-2rem)] md:flex-row xl:max-w-7xl"
      data-purpose="main-wrapper"
    >
      <section
        className="relative flex w-full flex-col items-center justify-start overflow-hidden bg-medical-dark px-6 py-10 text-white md:w-[55%] md:pr-8 md:pl-20"
        data-purpose="sidebar-marketing"
      >
        <div className="absolute inset-0 z-0">
          <img
            alt="Medical Background"
            className="h-full w-full object-cover"
            src="/photos/2.jpg"
          />
          <div className="absolute inset-0 bg-[#0d1b3e]/75"></div>
        </div>

        <div
          className="z-10 mb-4 flex w-full items-center justify-start pr-6 md:pr-10"
          data-purpose="ministry-logo "
        >
          <img
            alt="Ministry of Health Logo"
            className="h-12 md:h-20 w-auto object-contain"
            src="/img/main_logo.png"
          />
          <div className="flex flex-col text-right border-r border-white/20 pr-3 mr-3 md:pr-4 md:mr-4">
            <h2 className="text-sm md:text-xl font-bold leading-tight">وزارة الصحة والسكان</h2>
            <p className="text-[10px] md:text-[13px] opacity-80">جمهورية مصر العربية</p>
          </div>
        </div>

        <div className="z-10 mb-2 p-4 text-center" data-purpose="hero-text">
          <h1 className="mb-2 text-3xl font-bold md:text-[38px] tracking-wide">
             الصحة الرقمية 
          </h1>
          <p className="mt-5 text-sm font-light opacity-80">
            سجل صحي إلكتروني موحد وآمن لكل مواطن مصري
          </p>
          <div className="mt-3 hidden justify-center md:flex">
            <svg
              className="h-8 w-80"
              fill="none"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, white 20%, white 80%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, white 20%, white 80%, transparent 100%)",
              }}
              viewBox="0 0 500 40"
            >
              <path
                d="M0 20 L210 20 L225 20 L235 6 L245 34 L255 6 L265 34 L275 20 L290 20 L500 20"
                stroke="#60a5fa"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div
          className="relative z-10 mb-2 w-full max-w-[300px]"
          data-purpose="card-display"
        >
          <div className="smart-card-ui relative flex aspect-[1.58/1] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider">كارت الصحة الرقمية</p>
                <p className="text-[10px] opacity-70">Smart Health Card</p>
              </div>
              <div className="text-blue-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative h-10 w-12 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-inner">
                <div className="absolute inset-2 rounded-sm border border-black/10"></div>
              </div>
              <div className="flex-grow"></div>
              <div className="h-16 w-16 rounded-sm bg-white p-1">
                <img
                  alt="QR Code"
                  className="h-full w-full object-contain"
                  src="/photos/qr_code.png"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1 text-[10px] opacity-70">الرقم الصحي الموحد</p>
              <p className="text-xl font-mono tracking-widest">1234 5678 9012 3456</p>
            </div>
          </div>
          <div className="card-platform"></div>
        </div>

        <div
          className="z-10 mt-11 grid w-full grid-cols-2 md:grid-cols-4"
          data-purpose="features"
        >
          <div className="group cursor-pointer rounded-xl p-2 text-center transition-transform duration-300 hover:scale-110">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 transition-all duration-300 group-hover:border-blue-400/60 group-hover:bg-blue-500/40 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.4)]">
              <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <p className="mb-1 text-xs font-bold">أمان وخصوصية</p>
            <p className="text-[10px] opacity-60">حماية متقدمة لبياناتك</p>
          </div>

          <div className="group cursor-pointer rounded-xl p-2 text-center transition-transform duration-300 hover:scale-110">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 transition-all duration-300 group-hover:border-blue-400/60 group-hover:bg-blue-500/40 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.4)]">
              <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <p className="mb-1 text-xs font-bold">ربط شامل</p>
            <p className="text-[10px] opacity-60">جميع الجهات الصحية</p>
          </div>

          <div className="group cursor-pointer rounded-xl p-2 text-center transition-transform duration-300 hover:scale-110">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 transition-all duration-300 group-hover:border-blue-400/60 group-hover:bg-blue-500/40 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.4)]">
              <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <p className="mb-1 text-xs font-bold">متابعة ذكية</p>
            <p className="text-[10px] opacity-60">مؤشرات وتحليلات لحظية</p>
          </div>

          <div className="group cursor-pointer rounded-xl p-2 text-center transition-transform duration-300 hover:scale-110">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 transition-all duration-300 group-hover:border-blue-400/60 group-hover:bg-blue-500/40 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.4)]">
              <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <p className="mb-1 text-xs font-bold">رعاية أفضل</p>
            <p className="text-[10px] opacity-60">خدمة صحية أسرع وأدق</p>
          </div>
        </div>
      </section>

      <section
        className="relative z-20 -mt-6 flex w-full flex-col justify-center rounded-t-3xl bg-gray-50 px-4 py-10 shadow-[0_-15px_30px_rgba(0,0,0,0.1)] md:mt-0 md:-mr-[5%] md:w-[50%] md:rounded-none md:rounded-r-[40px] md:px-8 md:shadow-[15px_0_40px_rgba(0,0,0,0.2)] lg:px-12"
        data-purpose="login-container"
      >
        <div
          className="mx-auto w-full max-w-[480px] rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] md:p-6"
          data-purpose="login-card"
        >
          <div className="mb-4 text-center">
            <div className="mb-2 flex items-center justify-center space-x-3 space-x-reverse">
              <div className="inline-flex h-12 w-12  items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl px-4 font-bold text-gray-800 md:text-3xl p-2">تسجيل الدخول</h2>
            </div>
            <p className="text-sm font-medium text-gray-400">مرحباً بك في النظام الصحي الموحد</p>
            <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-blue-600"></div>
          </div>

          <form className="space-y-3" method="POST" onSubmit={handleLogin}>
            <div data-purpose="form-group">
              <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="username">
                الاسم الثنائي
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </span>
                <input
                  autoComplete="username"
                  className={`w-full rounded-xl border bg-gray-50 py-2.5 pr-12 pl-4 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? "border-red-500" : "border-gray-200 focus:border-transparent"
                  }`}
                  id="username"
                  name="username"
                  onChange={handleChange}
                  placeholder="مثال: أحمد محمد"
                  type="text"
                  value={formData.username}
                  disabled={isLoggingIn}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.username}
                </p>
              )}
            </div>

            <div data-purpose="form-group">
              <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="password">
                كلمة المرور
              </label>
              <PasswordInput
                name="password"
                onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                disabled={isLoggingIn}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {import.meta.env.DEV && (
              <div data-purpose="form-group">
                <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="accountType">
                  نوع الحساب
                </label>
                <div className="relative">
                  <select
                    className={`account-type-select w-full appearance-none rounded-xl border bg-gray-50 py-2.5 pr-4 pl-10 text-gray-600 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                      errors.accountType ? "border-red-500" : "border-gray-200 focus:border-transparent"
                    }`}
                    id="accountType"
                    name="accountType"
                    onChange={handleChange}
                    value={formData.accountType}
                    disabled={isLoggingIn}
                  >
                    <option value="" disabled hidden>اختر نوع الحساب</option>
                    <option value="patient">مواطن / مريض</option>
                    <option value="doctor">طبيب / ممارس</option>
                    <option value="hospital">مدير المستشفى / الإدارة</option>
                    <option value="ministry">مدير الوزارة / الإدارة المركزية</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </span>
                </div>
                {errors.accountType && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">
                    {errors.accountType}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  checked={formData.rememberMe}
                  className="peer sr-only"
                  id="rememberMe"
                  name="rememberMe"
                  onChange={handleRememberMeChange}
                  type="checkbox"
                  disabled={isLoggingIn}
                />
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-50 text-white transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-600">
                  {formData.rememberMe && (
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </span>
                <span className="text-gray-600 transition-colors group-hover:text-blue-600">تذكرني</span>
              </label>
              <button
                className="font-medium text-blue-600 hover:underline"
                onClick={handleForgotPassword}
                type="button"
                disabled={isLoggingIn}
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <button
              className="flex w-full items-center justify-center space-x-2 space-x-reverse rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoggingIn}
            >
              <span>تسجيل الدخول</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 font-medium italic text-gray-500">أو</span>
              </div>
            </div>

            <button
              className="group flex w-full items-center justify-center space-x-4 space-x-reverse rounded-xl border-2 border-dashed border-gray-200 p-3 transition-all hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSmartCard}
              type="button"
              disabled={isLoggingIn}
            >
              <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-105">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[15px] font-bold text-blue-900 px-4">
                  الدخول باستخدام كارت الصحة الرقمية
                </span>
                <span className="mt-0.5 text-xs text-gray-500 px-4">
                  استخدم كارت الصحة الرقمية (NFC)
                </span>
              </div>
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center justify-between border-t pt-3 text-[11px] text-gray-400 gap-2">
            <div className="w-full flex justify-between">
              <div className="flex items-center space-x-1 space-x-reverse">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                <span>
                  للدعم الفني اتصل على <span className="font-bold text-gray-600">15344</span>
                </span>
              </div>
              <div>الإصدار 1.0.0</div>
            </div>
          </div>
        </div>
      </section>
      <LoginLoadingOverlay isVisible={isLoggingIn} />
    </main>
  );
}
