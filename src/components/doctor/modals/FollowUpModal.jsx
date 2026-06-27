import React, { useState } from "react";

/**
 * FollowUpModal
 * Calls: POST /api/v1/operations/follow-ups
 *
 * Backend limitation: followUpDoctorId is always null because no doctor search
 * endpoint is exposed to the Doctor portal in the current backend documentation.
 * The assigned doctor feature should be implemented once the backend exposes
 * a staff/doctor lookup endpoint.
 */
function FollowUpModal({ isOpen, onClose, onSubmit, hasActiveEncounter }) {
  const [formData, setFormData] = useState({
    followUpContactMethod: "",
    scheduledAt: "",
    notes: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({ followUpContactMethod: "", scheduledAt: "", notes: "" });
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!hasActiveEncounter) {
      setErrorMsg("لا يوجد كشف طبي نشط للمريض. يرجى فتح زيارة طبية اولا قبل انشاء متابعة.");
      return;
    }

    if (!formData.followUpContactMethod.trim()) {
      setErrorMsg("يرجى تحديد طريقة التواصل للمتابعة.");
      return;
    }

    if (!formData.scheduledAt) {
      setErrorMsg("يرجى تحديد موعد المتابعة.");
      return;
    }

    const scheduledDate = new Date(formData.scheduledAt);
    if (scheduledDate <= new Date()) {
      setErrorMsg("يجب ان يكون موعد المتابعة في المستقبل.");
      return;
    }

    setSubmitting(true);
    const res = await onSubmit({
      followUpContactMethod: formData.followUpContactMethod.trim(),
      type: 1,
      scheduledAt: scheduledDate.toISOString(),
      notes: formData.notes.trim()
    });
    setSubmitting(false);

    if (res && res.success) {
      handleClose();
    } else {
      setErrorMsg(res?.message || "حدث خطا اثناء انشاء المتابعة. يرجى المحاولة مرة اخرى.");
    }
  };

  // Minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div id="followUpModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "520px" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>
          📅 انشاء متابعة طبية
        </h2>

        {!hasActiveEncounter && (
          <div style={{ padding: "12px 15px", background: "#fef3cd", color: "#856404", border: "1px solid #ffeaa7", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
            <span>لا يوجد كشف طبي نشط لهذا المريض. يجب فتح زيارة طبية اولا قبل امكانية انشاء متابعة.</span>
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
              طريقة التواصل للمتابعة <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={formData.followUpContactMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpContactMethod: e.target.value }))}
              disabled={!hasActiveEncounter || submitting}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", boxSizing: "border-box" }}
            >
              <option value="">اختر طريقة المتابعة...</option>
              <option value="Hospital visit">زيارة المستشفى</option>
              <option value="Clinic visit">زيارة العيادة</option>
              <option value="Phone call">اتصال هاتفي</option>
              <option value="Video call">مكالمة مرئية</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              موعد المتابعة <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              min={minDate}
              disabled={!hasActiveEncounter || submitting}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ padding: "10px 14px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-dark)" }}>ℹ️ ملاحظة تقنية:</strong> تعيين طبيب متابعة محدد غير متاح حاليا لعدم توفر endpoint بحث الاطباء في توثيق الباك إند الحالي. سيتم دعم هذه الخاصية عند توفرها.
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>ملاحظات (اختياري):</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="مثال: متابعة بعد انهاء الدواء، اعادة فحص الضغط، تحليل دوري..."
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
              {submitting ? "جاري الحفظ..." : "💾 حفظ المتابعة"}
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

export default FollowUpModal;
