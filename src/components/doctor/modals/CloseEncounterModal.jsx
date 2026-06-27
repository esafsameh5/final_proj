import React, { useState } from "react";

function CloseEncounterModal({
  closeEncounterModalOpen,
  setCloseEncounterModalOpen,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    diagnosisSummary: "",
    treatmentSummary: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!closeEncounterModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosisSummary.trim()) {
      setErrorMsg("يرجى إدخال ملخص التشخيص النهائي.");
      return;
    }
    if (!formData.treatmentSummary.trim()) {
      setErrorMsg("يرجى إدخال ملخص العلاج والخطة الطبية.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    const res = await onSubmit(formData);
    setSubmitting(false);
    if (res && res.success) {
      setFormData({
        diagnosisSummary: "",
        treatmentSummary: ""
      });
      setCloseEncounterModalOpen(false);
    } else if (res && res.message) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div id="closeEncounterModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "500px" }}>
        <span className="close-btn" onClick={() => setCloseEncounterModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--accent-red)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>🔴 قفل الكشف وإنهاء الزيارة الطبية</h2>

        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "15px" }}>
          سيتم إغلاق ملف الزيارة النشط اليوم ونقل الكشوفات والوصفات إلى السجل التاريخي للمريض بشكل نهائي. لا يمكنك تعديل الزيارة بعد قفلها.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>الملخص النهائي للتشخيص <span style={{ color: "red" }}>*</span></label>
            <textarea 
              rows="3"
              value={formData.diagnosisSummary}
              onChange={(e) => setFormData({...formData, diagnosisSummary: e.target.value})}
              placeholder="اكتب خلاصة الحالة والتشخيص النهائي للمريض..."
              required
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>ملخص الخطة العلاجية والتوصيات <span style={{ color: "red" }}>*</span></label>
            <textarea 
              rows="3"
              value={formData.treatmentSummary}
              onChange={(e) => setFormData({...formData, treatmentSummary: e.target.value})}
              placeholder="اكتب خلاصة الأدوية الموصوفة وتوصيات المتابعة..."
              required
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-red)", color: "white", fontWeight: "bold", padding: "12px 24px" }}>
              {submitting ? "جاري إنهاء الكشف..." : "🔒 تأكيد إنهاء الزيارة وقفل الكشف"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setCloseEncounterModalOpen(false)} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px" }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CloseEncounterModal;
