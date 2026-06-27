import React from "react";

function VisitModal({
  visitModalOpen,
  setVisitModalOpen,
  newVisit,
  setNewVisit,
  submitNewVisitForm,
  departments = []
}) {
  if (!visitModalOpen) return null;

  return (
    <div id="newVisitModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "500px" }}>
        <span className="close-btn" onClick={() => setVisitModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>➕ بدء زيارة طبية جديدة للمريض</h2>
        
        <form id="new-visit-form" onSubmit={submitNewVisitForm} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>القسم الطبي المختص <span style={{ color: "red" }}>*</span></label>
            <select 
              value={newVisit.medicalDepartmentId} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, medicalDepartmentId: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
              required
            >
              <option value="">اختر القسم الطبي للكشف...</option>
              {departments.map(dept => (
                <option key={dept.medicalDepartmentId} value={dept.medicalDepartmentId}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>نوع الزيارة / الكشف <span style={{ color: "red" }}>*</span></label>
            <select 
              value={newVisit.type} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, type: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
              required
            >
              <option value="1">🏥 كشف عام (Examination)</option>
              <option value="2">🔄 استشارة ومتابعة (Follow-up)</option>
              <option value="3">🚨 طوارئ (Emergency)</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>الشكوى الرئيسية للمريض <span style={{ color: "red" }}>*</span></label>
            <textarea 
              value={newVisit.mainComplaint || ""} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, mainComplaint: e.target.value }))} 
              placeholder="اكتب الشكوى الأساسية للمريض..." 
              required 
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>ملاحظات وتوصيات أولية:</label>
            <textarea 
              value={newVisit.notes || ""} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))} 
              placeholder="أدخل أي ملاحظات إضافية وتوصيات للمتابعة القادمة..." 
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ fontWeight: "bold", padding: "12px 24px" }}>💾 بدء الكشف الطبي</button>
            <button type="button" className="btn btn-secondary" onClick={() => setVisitModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VisitModal;
