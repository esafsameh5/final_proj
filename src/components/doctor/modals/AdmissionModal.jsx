import React, { useState } from "react";

/**
 * AdmissionModal
 * Calls: POST /api/v1/operations/admissions
 *
 * Backend note: bedId requires a GUID from the beds endpoint
 * (GET /api/v1/facilities/{facilityId}/beds). Bed selection is disabled
 * in this version because the backend does not expose a way to search
 * beds by name and retrieve their GUIDs within the Doctor portal workflow.
 * This field should be enabled once a bed picker API is available.
 */
function AdmissionModal({ isOpen, onClose, onSubmit, departments, hasActiveEncounter }) {
  const [formData, setFormData] = useState({
    medicalDepartmentId: "",
    admittedAt: "",
    notes: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({ medicalDepartmentId: "", admittedAt: "", notes: "" });
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!hasActiveEncounter) {
      setErrorMsg("لا يوجد كشف طبي نشط للمريض. يرجى فتح زيارة طبية اولا قبل تحويل دخول.");
      return;
    }

    if (!formData.medicalDepartmentId) {
      setErrorMsg("يرجى اختيار القسم الطبي للتحويل اليه.");
      return;
    }

    if (!formData.admittedAt) {
      setErrorMsg("يرجى تحديد تاريخ ووقت الدخول.");
      return;
    }

    setSubmitting(true);
    const res = await onSubmit({
      medicalDepartmentId: formData.medicalDepartmentId,
      admittedAt: new Date(formData.admittedAt).toISOString(),
      notes: formData.notes.trim()
    });
    setSubmitting(false);

    if (res && res.success) {
      handleClose();
    } else {
      setErrorMsg(res?.message || "حدث خطا اثناء تسجيل الدخول. يرجى المحاولة مرة اخرى.");
    }
  };

  const nowStr = new Date().toISOString().slice(0, 16);

  return (
    <div id="admissionModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "540px" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>
          🏥 تحويل دخول المستشفى
        </h2>

        {!hasActiveEncounter && (
          <div style={{ padding: "12px 15px", background: "#fef3cd", color: "#856404", border: "1px solid #ffeaa7", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
            <span>لا يوجد كشف طبي نشط لهذا المريض. يجب فتح زيارة طبية اولا قبل تسجيل دخول المستشفى.</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span>⚠️</span> <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              القسم الطبي للتحويل اليه <span style={{ color: "red" }}>*</span>
            </label>
            {departments && departments.length > 0 ? (
              <select
                value={formData.medicalDepartmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalDepartmentId: e.target.value }))}
                disabled={!hasActiveEncounter || submitting}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", boxSizing: "border-box" }}
              >
                <option value="">اختر القسم...</option>
                {departments.map((dep) => (
                  <option key={dep.medicalDepartmentId || dep.id} value={dep.medicalDepartmentId || dep.id}>
                    {dep.name || dep.departmentName}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ padding: "10px 14px", background: "#f1f5f9", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-muted)" }}>
                جاري تحميل الاقسام... لو لم تظهر الاقسام، يرجى التحقق من صلاحيات الاتصال بالمنشاة.
              </div>
            )}
          </div>

          <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
            <div style={{ fontWeight: "bold", color: "var(--text-dark)", marginBottom: "4px" }}>🛏️ السرير — غير متاح</div>
            <div style={{ color: "var(--text-muted)" }}>
              تحديد السرير غير متاح حاليا لان الباك إند لا يوفر endpoint بحث الاسرة ضمن صلاحيات بوابة الدكتور الموثقة.
              سيتم تفعيل هذا الحقل عند توفير الـ API المناسب. ستقوم المنشاة بتحديد السرير عند استقبال المريض.
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              تاريخ ووقت الدخول <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.admittedAt}
              onChange={(e) => setFormData(prev => ({ ...prev, admittedAt: e.target.value }))}
              max={nowStr}
              disabled={!hasActiveEncounter || submitting}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>سبب الدخول / ملاحظات:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="مثال: دخول من قسم الطوارئ، حالة حرجة تستدعي المراقبة المستمرة..."
              disabled={!hasActiveEncounter || submitting}
              style={{ height: "80px", resize: "vertical", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "6px" }}>
            <button
              type="submit"
              className="btn"
              disabled={submitting || !hasActiveEncounter}
              style={{ fontWeight: "bold", padding: "12px 24px", opacity: !hasActiveEncounter ? 0.6 : 1 }}
            >
              {submitting ? "جاري التسجيل..." : "🏥 تسجيل دخول المستشفى"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              الغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdmissionModal;
