import React from "react";

function DoctorSettings({
  doctorInfo,
  setTempDoctorInfo,
  setEditDoctorModalOpen,
  notifications,
  setNotifications,
  fontSize,
  setFontSize,
  uiLanguage,
  setUiLanguage,
  showToast
}) {
  return (
    <div id="settingsPage" className="page-content active" style={{ direction: "rtl", textAlign: "right" }}>
      <div className="topbar">
        <div>
          <h2>⚙️ إعدادات النظام الطبية</h2>
          <p>إدارة ملفك الشخصي، تفاصيل جهة العمل، إعدادات الأمان والإشعارات</p>
        </div>
      </div>

      <div className="content" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        
        {/* Card 1: معلومات الحساب */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>👤 معلومات الحساب الشخصية</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "20px" }}>
            <div style={{ position: "relative" }}>
              <img src={doctorInfo.avatar} alt="Doctor Avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid var(--primary)", objectFit: "cover", background: "#f1f5f9" }} />
              <span style={{ position: "absolute", bottom: "0", right: "0", background: "var(--accent-emerald)", width: "16px", height: "16px", borderRadius: "50%", border: "3.5px solid white" }} title="نشط"></span>
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", color: "var(--primary)", fontSize: "18px", fontWeight: "700" }}>{doctorInfo.name}</h3>
              <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "13.5px", fontWeight: "600" }}>{doctorInfo.specialization}</p>
              <span style={{ display: "inline-block", background: "var(--primary-light)", color: "var(--primary)", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", marginTop: "5px", fontFamily: "Outfit" }}>{doctorInfo.employeeId}</span>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div><b>📧 البريد الإلكتروني المهني:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600" }}>{doctorInfo.email}</span></div>
            <div><b>📞 رقم الهاتف المحمول:</b> <span dir="ltr" style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600", display: "inline-block" }}>{doctorInfo.phone}</span></div>
          </div>

          <button className="btn" onClick={() => { setTempDoctorInfo({ ...doctorInfo }); setEditDoctorModalOpen(true); }} style={{ alignSelf: "flex-start", marginTop: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>✏️ تعديل البيانات الشخصية</button>
        </div>

        {/* Card 2: الأمان والحساب */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🔒 الأمان والتحقق من الهوية</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><b>حالة الحساب الطبية:</b></span>
            <span style={{ background: "var(--accent-emerald-light)", color: "#065f46", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px" }}>🟢 الحساب نشط ومعتمد</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px", fontSize: "14px" }}>
            <div><b>آخر تسجيل دخول:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)" }}>اليوم الساعة 08:30 صباحاً</span></div>
            <div><b>الأجهزة النشطة:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>كمبيوتر العيادة الرئيسي (جلسة نشطة)</span></div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={() => showToast("تم إرسال رابط إعادة تعيين كلمة المرور لبريدك الإلكتروني المعتمد", "info")} style={{ fontSize: "12px", fontWeight: "bold" }}>🔑 تغيير كلمة المرور</button>
            <button className="btn btn-danger" onClick={() => showToast("تم تسجيل الخروج بنجاح من كافة الأجهزة الأخرى", "success")} style={{ fontSize: "12px", fontWeight: "bold", background: "rgba(239, 68, 68, 0.1)", color: "var(--accent-red)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>🚪 خروج من جميع الأجهزة</button>
          </div>
        </div>

        {/* Card 3: جهة العمل */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🏥 تفاصيل جهة العمل الحالية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>المستشفى / المؤسسة:</span>
              <span style={{ fontWeight: "700", color: "var(--primary)" }}>مستشفى أسيوط الجامعي</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>القسم الطبي الحالي:</span>
              <span style={{ fontWeight: "700", color: "var(--text-dark)" }}>قسم الباطنة والسكري</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>التخصص الرئيسي:</span>
              <span style={{ fontWeight: "700", color: "var(--text-dark)" }}>الأمراض المزمنة والغدد الصماء</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>الدور الوظيفي المعتمد:</span>
              <span style={{ fontWeight: "700", color: "var(--accent-purple)" }}>طبيب معالج (أخصائي)</span>
            </div>
          </div>
        </div>

        {/* Card 4: إعدادات الإشعارات */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🔔 إشعارات وتنبيهات النظام الطبية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>تنبيهات الحساسية الدوائية الصارمة</span>
                <small style={{ color: "var(--text-muted)" }}>تنبيه فوري عند رصد حساسية لأدوية المريض</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications.allergy} onChange={(e) => setNotifications(prev => ({ ...prev, allergy: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>تنبيهات التحاليل والمختبرات الجديدة</span>
                <small style={{ color: "var(--text-muted)" }}>إشعار عند رفع نتائج تحاليل جديدة للمريض</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications.labs} onChange={(e) => setNotifications(prev => ({ ...prev, labs: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>تنبيهات الأشعة والتقارير المصورة</span>
                <small style={{ color: "var(--text-muted)" }}>إشعار فور رفع تقرير أشعة مقطعية أو سينية</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications.radiology} onChange={(e) => setNotifications(prev => ({ ...prev, radiology: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>تحديثات الملف الطبي الموحد</span>
                <small style={{ color: "var(--text-muted)" }}>إشعار بالتحديثات التي تجريها الأقسام الأخرى</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications.ehrUpdates} onChange={(e) => setNotifications(prev => ({ ...prev, ehrUpdates: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block", color: "var(--accent-red)" }}>التنبيهات الحرجة والطوارئ 🚨</span>
                <small style={{ color: "var(--text-muted)" }}>تنبيهات التدخل السريع وحالات الخطر الوشيك</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications.critical} onChange={(e) => setNotifications(prev => ({ ...prev, critical: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 5: إعدادات الواجهة */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🖥️ خيارات عرض وواجهة النظام</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>حجم الخط (Font Size)</span>
                <small style={{ color: "var(--text-muted)" }}>تكبير وتصغير حجم النصوص لتسهيل القراءة</small>
              </div>
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", fontSize: "13px", fontWeight: "600", background: "white", color: "var(--text-dark)" }}>
                <option value="small">صغير (Small)</option>
                <option value="medium">متوسط (Medium - الافتراضي)</option>
                <option value="large">كبير (Large)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "600", display: "block" }}>لغة النظام المعروضة (Language)</span>
                <small style={{ color: "var(--text-muted)" }}>اختر لغة واجهة النظام الرئيسية</small>
              </div>
              <select value={uiLanguage} onChange={(e) => { setUiLanguage(e.target.value); if (e.target.value === 'en') { showToast('Language changes will apply in the next system update', 'info'); } }} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", fontSize: "13px", fontWeight: "600", background: "white", color: "var(--text-dark)" }}>
                <option value="ar">العربية (Default)</option>
                <option value="en">English (الإنجليزية)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 6: حول النظام */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px", background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(11, 61, 145, 0.03) 100%)" }}>
          <h2>ℹ️ حول نظام الصحة الرقمية</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img src="/img/main_logo.png" alt="Smart Health Logo" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
            <div>
              <h3 style={{ margin: "0", color: "var(--primary)", fontSize: "17px", fontWeight: "700" }}>الصحة الرقمية (Digital Health)</h3>
              <p style={{ margin: "3px 0 0 0", color: "var(--text-muted)", fontSize: "12.5px", fontWeight: "600" }}>منصة السجل الطبي الموحد للمواطنين</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px", fontSize: "13px" }}>
            <div><b>رقم الإصدار:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)" }}>Version 1.0.0</span></div>
            <div><b>الجهة الراعية:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>وزارة الصحة والسكان - جمهورية مصر العربية</span></div>
            <div><b>الأمان والامتثال:</b> <span style={{ color: "var(--accent-emerald)", fontWeight: "bold" }}>مشفر بالكامل ومتوافق مع معايير HIPAA وHL7</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DoctorSettings;
