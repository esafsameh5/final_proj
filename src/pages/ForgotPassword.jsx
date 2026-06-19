import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";

const getSavedState = () => {
  try {
    const saved = localStorage.getItem("forgot-password-state");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function ForgotPassword({ showToast }) {
  const navigate = useNavigate();
  const savedState = getSavedState() || {};
  const [step, setStep] = useState(savedState.step || 1);
  const [resetMethod, setResetMethod] = useState(savedState.resetMethod || "email");
  const [email, setEmail] = useState(savedState.email || "");
  const [phone, setPhone] = useState(savedState.phone || "");
  const [accountType, setAccountType] = useState(savedState.accountType || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    localStorage.setItem("forgot-password-state", JSON.stringify({
      step, resetMethod, email, phone, accountType
    }));
  }, [step, resetMethod, email, phone, accountType]);

  const handleSend = (event) => {
    event.preventDefault();
    setError("");

    if (resetMethod === "email" && email.trim() === "") {
      setError("من فضلك أدخل البريد الإلكتروني");
      return;
    }

    if (resetMethod === "phone" && phone.trim() === "") {
      setError("من فضلك أدخل رقم الهاتف");
      return;
    }

    if (accountType === "") {
      setError("من فضلك اختر نوع الحساب");
      return;
    }

    // Switch to step 2
    setStep(2);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (error) setError("");
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("من فضلك أدخل رمز التحقق بالكامل (6 أرقام)");
      return;
    }
    // Switch to step 3 (Set New Password)
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.trim() === "") {
      setPasswordError("من فضلك أدخل كلمة المرور الجديدة");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("كلمة المرور غير متطابقة");
      return;
    }

    showToast?.("تم تعيين كلمة المرور بنجاح! سيتم تحويلك لتسجيل الدخول.", "success");
    handleSwitchToLogin();
  };

  const handleSwitchToLogin = () => {
    localStorage.removeItem("forgot-password-state");
    navigate("/login");
  };

  return (
    <main
      className="flex min-h-[100vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 shadow-[0_0_50px_rgba(0,0,0,0.15)] md:min-h-[680px] md:max-h-[calc(100vh-2rem)] md:flex-row xl:max-w-7xl"
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

        <div className="z-10 mb-4 flex w-full items-center justify-start pr-6 md:pr-10">
          <img
            alt="شعار مصر"
            className="h-12 md:h-20 w-auto object-contain drop-shadow-md"
            src="/img/main_logo.png"
          />
          <div className="flex flex-col text-right border-r border-white/20 pr-3 mr-3 md:pr-4 md:mr-4">
            <h2 className="text-sm md:text-xl font-bold leading-tight">الصحة الرقمية</h2>
            <p className="text-[10px] md:text-[13px] opacity-80">صحة المواطن.. مسئوليتنا جميعاً</p>
          </div>
        </div>

        <div className="z-10 mb-2 p-4 text-center" data-purpose="hero-text">
          <h1 className="mb-4 text-3xl font-bold md:text-[32px]">إعادة تعيين كلمة المرور</h1>
          <p className="mx-auto max-w-[280px] text-sm font-light leading-relaxed opacity-80">
            لا تقلق، سنساعدك في استعادة الوصول إلى حسابك بخطوات بسيطة وآمنة
          </p>
        </div>

        <div className="z-10 mt-4  flex w-full max-w-[340px] flex-col space-y-4">
          <div className=" flex items-start space-x-4 space-x-reverse rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg">
            <div className=" flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 shadow-inner">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div className="text-right pr-2">
              <strong className="mb-1.5 block text-base font-bold ">أمن وسري</strong>
              <p className="text-xs leading-relaxed opacity-70">
                نضمن حماية بياناتك ومعلوماتك الشخصية بأعلى معايير الأمان.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg">
            <div className=" flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 shadow-inner">
              <svg className="h-6 w-6 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-right pr-2">
              <strong className="mb-1.5 block text-base font-bold">خطوات سهلة</strong>
              <p className="text-xs leading-relaxed opacity-70">
                عملية إعادة تعيين كلمة المرور سريعة وبسيطة.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 shadow-inner">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-right pr-2">
              <strong className="mb-1.5 block text-base font-bold">حسابك محمي</strong>
              <p className="text-xs leading-relaxed opacity-70">
                نستخدم تقنيات متقدمة لحماية حسابك من الوصول غير المصرح.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative z-20 -mt-6 flex w-full flex-col justify-center rounded-t-3xl bg-gray-50 px-4 py-10 shadow-[0_-15px_30px_rgba(0,0,0,0.1)] md:mt-0 md:-mr-[5%] md:w-[50%] md:rounded-none md:rounded-r-[40px] md:px-8 md:shadow-[15px_0_40px_rgba(0,0,0,0.2)] lg:px-12"
        data-purpose="forgot-password-container"
      >
        <div
          className="mx-auto w-full max-w-[480px] rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] md:p-6"
          data-purpose="forgot-password-card"
        >
          {step === 1 && (
            <>
              <div className="mb-4 text-center">
                <div className="mb-2 flex items-center justify-center space-x-3 space-x-reverse">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl px-4 font-bold text-gray-800 md:text-3xl p-2">نسيت كلمة المرور؟</h2>
                </div>
                <p className="text-sm font-medium text-gray-400 mt-2 leading-relaxed">
                  أدخل البريد الإلكتروني أو رقم الهاتف المرتبط بحسابك وسنرسل لك رمز التحقق لإعادة التعيين
                </p>
                <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-blue-600"></div>
              </div>

              <form className="space-y-4" method="POST" onSubmit={handleSend}>

                <div className="mb-4 flex w-full rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${resetMethod === "email" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setResetMethod("email")}
                  >
                    البريد الإلكتروني
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${resetMethod === "phone" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setResetMethod("phone")}
                  >
                    رقم الهاتف
                  </button>
                </div>

                {resetMethod === "email" ? (
                  <div data-purpose="form-group">
                    <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="email">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        className={`w-full rounded-xl border bg-gray-50 py-2.5 pr-12 pl-4 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 ${error && resetMethod === "email" ? "border-red-500" : "border-gray-200 focus:border-transparent"
                          }`}
                        id="email"
                        name="email"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="مثال: name@example.com"
                        type="email"
                        value={email}
                      />
                    </div>
                    {error && resetMethod === "email" && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
                    )}
                  </div>
                ) : (
                  <div data-purpose="form-group">
                    <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="phone">
                      رقم الهاتف
                    </label>
                    <div className="flex" dir="ltr">
                      <div className="flex items-center rounded-l-xl border border-gray-200 bg-gray-100 px-3 py-2.5 font-semibold text-gray-600">
                        <span className="mr-2">🇪🇬</span>
                        <span>+20</span>
                      </div>
                      <input
                        className={`w-full rounded-r-xl border border-l-0 bg-gray-50 py-2.5 pl-4 pr-4 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 ${error && resetMethod === "phone" ? "border-red-500" : "border-gray-200 focus:border-transparent"
                          }`}
                        id="phone"
                        name="phone"
                        onChange={(e) => {
                          let val = e.target.value;
                          // إزالة كود مصر إذا قام المستخدم بنسخه أو كتابته
                          if (val.startsWith("+20")) {
                            val = val.substring(3);
                          } else if (val.startsWith("0020")) {
                            val = val.substring(4);
                          }
                          setPhone(val);
                          if (error) setError("");
                        }}
                        placeholder="1012345678"
                        type="tel"
                        value={phone}
                      />
                    </div>
                    {error && resetMethod === "phone" && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
                    )}
                  </div>
                )}

                <div data-purpose="form-group">
                  <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="accountType">
                    نوع الحساب
                  </label>
                  <div className="relative">
                    <select
                      className={`account-type-select w-full appearance-none rounded-xl border bg-gray-50 py-2.5 pr-4 pl-10 text-gray-600 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${error && accountType === "" ? "border-red-500" : "border-gray-200 focus:border-transparent"
                        }`}
                      id="accountType"
                      name="accountType"
                      onChange={(e) => {
                        setAccountType(e.target.value);
                        if (error) setError("");
                      }}
                      value={accountType}
                    >
                      <option value="" disabled hidden>اختر نوع الحساب</option>
                      <option value="citizen">مواطن / مريض</option>
                      <option value="doctor">طبيب / ممارس</option>
                      <option value="hospital">مستشفى</option>                    </select>
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  {error && accountType === "" && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
                  )}
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                  <svg className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>ستصلك رسالة تحتوي على رمز التحقق لإعادة تعيين كلمة المرور. قد تستغرق الرسالة بضع دقائق.</p>
                </div>

                <button
                  className="mt-4 flex w-full items-center justify-center space-x-2 space-x-reverse rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:bg-blue-700"
                  type="submit"
                >
                  <span>إرسال رمز التحقق</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  تذكرت كلمة المرور؟{" "}
                  <button
                    type="button"
                    onClick={handleSwitchToLogin}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    العودة إلى تسجيل الدخول
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-4 text-center">
                <div className="mb-2 flex items-center justify-center space-x-3 space-x-reverse">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl px-4 font-bold text-gray-800 md:text-3xl p-2">رمز التحقق</h2>
                </div>
                <p className="text-sm font-medium text-gray-400 mt-2 leading-relaxed">
                  أدخل الرمز المكون من 6 أرقام المرسل إلى <br />
                  <strong className="text-gray-700 block mt-1" dir="ltr">
                    {resetMethod === "email" ? email : `+20 ${phone.replace(/^(?:\+20|0020)/, '')}`}
                  </strong>
                </p>
                <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-blue-600"></div>
              </div>

              <form className="space-y-6" method="POST" onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className={`w-11 h-14 sm:w-12 text-center text-xl font-bold rounded-xl border bg-gray-50 outline-none transition-all focus:ring-2 ${error && step === 2
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-600"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      id={`otp-${index}`}
                    />
                  ))}
                </div>

                {error && step === 2 && (
                  <p className="mt-2 text-center text-xs font-semibold text-red-500">{error}</p>
                )}

                <button
                  className="mt-6 flex w-full items-center justify-center space-x-2 space-x-reverse rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:bg-blue-700"
                  type="submit"
                >
                  <span>تحقق من الرمز</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  لم يصلك الرمز؟{" "}
                  <button
                    type="button"
                    className="font-bold text-blue-600 hover:underline"
                    onClick={() => showToast?.("تم إعادة إرسال رمز التحقق بنجاح.", "success")}
                  >
                    إعادة إرسال
                  </button>
                </div>

                <div className="mt-2 text-center text-sm text-gray-600">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 hover:underline transition-colors"
                    onClick={() => setStep(1)}
                  >
                    تغيير طريقة الاستعادة
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-4 text-center">
                <div className="mb-2 flex items-center justify-center space-x-3 space-x-reverse">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl px-4 font-bold text-gray-800 md:text-3xl p-2">تعيين كلمة مرور جديدة</h2>
                </div>
                <p className="text-sm font-medium text-gray-400 mt-2 leading-relaxed">
                  أدخل كلمة المرور الجديدة الخاصة بك وتأكد من حفظها في مكان آمن.
                </p>
                <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-blue-600"></div>
              </div>

              <form className="space-y-4" method="POST" onSubmit={handleResetPassword}>
                <div data-purpose="form-group">
                  <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="newPassword">
                    كلمة المرور الجديدة
                  </label>
                  <PasswordInput
                    name="newPassword"
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={newPassword}
                  />
                  {passwordError && newPassword === "" && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordError}</p>
                  )}
                </div>

                <div data-purpose="form-group">
                  <label className="mb-1.5 block pr-1 text-sm font-semibold text-gray-700" htmlFor="confirmPassword">
                    تأكيد كلمة المرور
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                  />
                  {passwordError && newPassword !== confirmPassword && newPassword !== "" && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordError}</p>
                  )}
                </div>

                <button
                  className="mt-6 flex w-full items-center justify-center space-x-2 space-x-reverse rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:bg-blue-700"
                  type="submit"
                >
                  <span>حفظ كلمة المرور والدخول</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <div className="mt-2 text-center text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={handleSwitchToLogin}
                    className="text-gray-400 hover:text-gray-700 hover:underline transition-colors"
                  >
                    إلغاء والعودة لتسجيل الدخول
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-gray-400">
            <div className="flex items-center space-x-1 space-x-reverse">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>
                للدعم الفني اتصل على <span className="font-bold text-gray-600">15344</span>
              </span>
            </div>
            <div>الإصدار 1.0.0</div>
          </div>
        </div>
      </section>
    </main>
  );
}
