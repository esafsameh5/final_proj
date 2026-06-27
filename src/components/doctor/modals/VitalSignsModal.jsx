import React, { useState } from "react";

function VitalSignsModal({
  vitalSignsModalOpen,
  setVitalSignsModalOpen,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    temperatureCelsius: "",
    heartRate: "",
    respiratoryRate: "",
    systolicBloodPressure: "",
    diastolicBloodPressure: "",
    oxygenSaturation: "",
    weightKg: "",
    heightCm: "",
    bloodSugarMgDl: "",
    painScale: "",
    notes: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!vitalSignsModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    const res = await onSubmit(formData);
    setSubmitting(false);
    if (res && res.success) {
      setFormData({
        temperatureCelsius: "",
        heartRate: "",
        respiratoryRate: "",
        systolicBloodPressure: "",
        diastolicBloodPressure: "",
        oxygenSaturation: "",
        weightKg: "",
        heightCm: "",
        bloodSugarMgDl: "",
        painScale: "",
        notes: ""
      });
      setVitalSignsModalOpen(false);
    } else if (res && res.message) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div id="vitalSignsModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "600px" }}>
        <span className="close-btn" onClick={() => setVitalSignsModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>📊 تسجيل المؤشرات الحيوية للمريض</h2>
        
        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>درجة الحرارة (C°):</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.temperatureCelsius} 
                onChange={(e) => setFormData(prev => ({ ...prev, temperatureCelsius: e.target.value }))} 
                placeholder="مثال: 37.0" 
              />
            </div>
            
            <div>
              <label>نبض القلب (نبضة/د):</label>
              <input 
                type="number" 
                value={formData.heartRate} 
                onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))} 
                placeholder="مثال: 80" 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>معدل التنفس (نفس/د):</label>
              <input 
                type="number" 
                value={formData.respiratoryRate} 
                onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))} 
                placeholder="مثال: 16" 
              />
            </div>
            
            <div>
              <label>تشبع الأكسجين (%):</label>
              <input 
                type="number" 
                value={formData.oxygenSaturation} 
                onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))} 
                placeholder="مثال: 98" 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>الضغط الانقباضي (mmHg):</label>
              <input 
                type="number" 
                value={formData.systolicBloodPressure} 
                onChange={(e) => setFormData(prev => ({ ...prev, systolicBloodPressure: e.target.value }))} 
                placeholder="مثال: 120" 
              />
            </div>
            
            <div>
              <label>الضغط الانبساطي (mmHg):</label>
              <input 
                type="number" 
                value={formData.diastolicBloodPressure} 
                onChange={(e) => setFormData(prev => ({ ...prev, diastolicBloodPressure: e.target.value }))} 
                placeholder="مثال: 80" 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label>الوزن (كجم):</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.weightKg} 
                onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value }))} 
                placeholder="الوزن" 
              />
            </div>

            <div>
              <label>الطول (سم):</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.heightCm} 
                onChange={(e) => setFormData(prev => ({ ...prev, heightCm: e.target.value }))} 
                placeholder="الطول" 
              />
            </div>

            <div>
              <label>مستوى السكر (mg/dL):</label>
              <input 
                type="number" 
                value={formData.bloodSugarMgDl} 
                onChange={(e) => setFormData(prev => ({ ...prev, bloodSugarMgDl: e.target.value }))} 
                placeholder="السكر" 
              />
            </div>
          </div>

          <div>
            <label>مقياس الألم (0 - 10):</label>
            <select 
              value={formData.painScale} 
              onChange={(e) => setFormData(prev => ({ ...prev, painScale: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
            >
              <option value="">اختر مقياس الألم...</option>
              {[...Array(11).keys()].map(num => (
                <option key={num} value={num}>{num} - {num === 0 ? "لا يوجد ألم" : num === 10 ? "ألم لا يطاق" : `مستوى ${num}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label>ملاحظات إضافية:</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
              placeholder="اكتب أي ملاحظات سريرية حول القياسات..." 
              style={{ height: "60px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px" }}>
              {submitting ? "جاري الحفظ..." : "💾 حفظ القياسات"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setVitalSignsModalOpen(false)} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px" }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VitalSignsModal;
