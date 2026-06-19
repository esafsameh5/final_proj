import React, { useState, useEffect } from "react";

function EditPrescriptionModal({
  editPrescriptionState,
  onClose,
  onSave
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (editPrescriptionState && editPrescriptionState.prescription) {
      const { prescription } = editPrescriptionState;
      setName(prescription.name || "");
      setDosage(prescription.dosage || "");
      setDuration(prescription.duration || "");
    }
  }, [editPrescriptionState]);

  if (!editPrescriptionState) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !duration.trim()) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة.");
      return;
    }
    onSave(editPrescriptionState.index, {
      name: name.trim(),
      dosage: dosage.trim(),
      duration: duration.trim()
    });
  };

  return (
    <div id="editPrescriptionModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "550px" }}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>✏️ تعديل الوصفة الطبية المعتمدة</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>اسم الدواء (العلمي أو التجاري):</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="مثال: أملوديبين Amlodipine 5mg..." 
              style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              required
            />
          </div>
          
          <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>الجرعة وطريقة الاستعمال:</label>
            <input 
              type="text" 
              value={dosage} 
              onChange={(e) => setDosage(e.target.value)} 
              placeholder="مثال: قرص واحد صباحاً..." 
              style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              required
            />
          </div>
          
          <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>مدة العلاج الصالحة:</label>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              placeholder="مثال: مستمر، أو 7 أيام..." 
              style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              required
            />
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "15px", borderTop: "2px solid var(--bg-main)", paddingTop: "15px" }}>
            <button 
              type="submit" 
              className="btn" 
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              💾 حفظ التعديلات
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPrescriptionModal;
