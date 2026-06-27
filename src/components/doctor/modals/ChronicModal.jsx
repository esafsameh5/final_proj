import React from "react";

function ChronicModal({
  chronicModalOpen,
  setChronicModalOpen,
  activePatient,
  submitChronicIllnessUpdate
}) {
  if (!chronicModalOpen || !activePatient) return null;

  return (
    <div id="chronicRequestModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={() => setChronicModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>📝 إضافة مرض مزمن أو حالة حرجة للمريض</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>يرجى اختيار الحالة المرضية وإضافة الملاحظات الإكلينيكية لتوثيقها مباشرة في الملف الطبي الموحد.</p>
        
        <form id="chronic-request-form" onSubmit={submitChronicIllnessUpdate} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>الحالة المرضية الحالية المسجلة:</label>
            <input type="text" readOnly value={activePatient.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"} style={{ background: "#f1f5f9", cursor: "not-allowed", fontWeight: "bold", color: "var(--primary)" }} />
          </div>
          
          <div>
            <label>المرض المراد توثيقه:</label>
            <select id="cr-illness-to-update" style={{ fontWeight: "bold", color: "var(--text-dark)" }}>
              <option value="سكري من النوع الثاني">سكري من النوع الثاني</option>
              <option value="ضغط دم مرتفع">ضغط دم مرتفع</option>
              <option value="ربو شعبي">ربو شعبي</option>
              <option value="أخرى">أخرى (أدخل التفاصيل بالملاحظات)</option>
            </select>
          </div>

          <div>
            <label>ملاحظات إكلينيكية:</label>
            <textarea id="cr-notes" placeholder="اكتب الملاحظات الإكلينيكية الخاصة بالحالة المرضية..." required style={{ height: "90px", resize: "vertical" }}></textarea>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}>💾 حفظ الحالة المرضية</button>
            <button type="button" className="btn btn-secondary" onClick={() => setChronicModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChronicModal;
