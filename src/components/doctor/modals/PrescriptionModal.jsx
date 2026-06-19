import React, { useState } from "react";

function PrescriptionModal({
  prescriptionModalOpen,
  setPrescriptionModalOpen,
  submitNewPrescriptionForm
}) {
  const [medsList, setMedsList] = useState([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  if (!prescriptionModalOpen) return null;

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    if (!dosage.trim()) {
      return;
    }
    if (!duration.trim()) {
      return;
    }
    
    if (editingIndex !== null) {
      setMedsList(prev => prev.map((med, idx) => idx === editingIndex ? {
        name: name.trim(),
        dosage: dosage.trim(),
        duration: duration.trim()
      } : med));
      setEditingIndex(null);
    } else {
      setMedsList(prev => [...prev, { 
        name: name.trim(), 
        dosage: dosage.trim(), 
        duration: duration.trim() 
      }]);
    }
    
    setName("");
    setDosage("");
    setDuration("");
  };

  const handleStartEdit = (index) => {
    const med = medsList[index];
    setName(med.name);
    setDosage(med.dosage);
    setDuration(med.duration);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setName("");
    setDosage("");
    setDuration("");
  };

  const handleRemoveMed = (index) => {
    setMedsList(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setName("");
      setDosage("");
      setDuration("");
    } else if (editingIndex > index) {
      setEditingIndex(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalMeds = [...medsList];
    
    // Auto-add current input values if they are fully filled and we are not in the middle of editing
    if (name.trim() && dosage.trim() && duration.trim() && editingIndex === null) {
      finalMeds.push({ 
        name: name.trim(), 
        dosage: dosage.trim(), 
        duration: duration.trim() 
      });
    }

    if (finalMeds.length === 0) {
      alert("الرجاء إضافة دواء واحد على الأقل للوصفة.");
      return;
    }

    submitNewPrescriptionForm(finalMeds);
    
    // Reset modal state
    setMedsList([]);
    setName("");
    setDosage("");
    setDuration("");
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setPrescriptionModalOpen(false);
    setMedsList([]);
    setName("");
    setDosage("");
    setDuration("");
    setEditingIndex(null);
  };

  return (
    <div id="newPrescriptionModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "600px" }}>
        <span className="close-btn" onClick={handleCancel}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>💊 إصدار وصفة علاجية جديدة (متعددة الأدوية)</h2>
        
        {/* List of currently added draft medications */}
        {medsList.length > 0 && (
          <div style={{ marginBottom: "20px", background: "var(--primary-glow)", padding: "15px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)", fontWeight: "700" }}>📋 الأدوية المضافة للوصفة الحالية:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {medsList.map((med, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: editingIndex === idx ? "var(--primary-light)" : "white", 
                  padding: "8px 12px", 
                  borderRadius: "var(--radius-sm)", 
                  border: editingIndex === idx ? "1.5px dashed var(--primary)" : "1px solid var(--border-color)", 
                  fontSize: "13px" 
                }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "var(--accent-purple)" }}>{med.name}</span>
                    <span style={{ color: "var(--text-muted)", margin: "0 8px" }}>|</span>
                    <span>{med.dosage}</span>
                    <span style={{ color: "var(--text-muted)", margin: "0 8px" }}>|</span>
                    <span style={{ fontWeight: "600" }}>{med.duration}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      type="button" 
                      onClick={() => handleStartEdit(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center" }}
                      title="تعديل الدواء"
                    >
                      ✏️
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMed(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--accent-red)", cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center" }}
                      title="حذف الدواء"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>اسم الدواء (العلمي أو التجاري):</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="مثال: أوجمنتين Augmentin 1g..." 
              style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
            />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>الجرعة وطريقة الاستعمال:</label>
              <input 
                type="text" 
                value={dosage} 
                onChange={(e) => setDosage(e.target.value)} 
                placeholder="مثال: قرص كل 12 ساعة بعد الأكل..." 
                style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              />
            </div>
            
            <div>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>مدة العلاج الصالحة:</label>
              <input 
                type="text" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                placeholder="مثال: 7 أيام، أو مستمر..." 
                style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            {editingIndex !== null && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancelEdit}
                style={{ fontWeight: "bold", padding: "8px 16px", fontSize: "12.5px", background: "#f3f4f6", color: "#374151" }}
              >
                إلغاء التعديل
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleAddMed}
              style={{ fontWeight: "bold", padding: "8px 16px", fontSize: "12.5px" }}
            >
              {editingIndex !== null ? "💾 حفظ تعديل الدواء" : "➕ أضف الدواء إلى القائمة"}
            </button>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "15px", borderTop: "2px solid var(--bg-main)", paddingTop: "15px" }}>
            <button 
              type="button" 
              className="btn" 
              onClick={handleSubmit}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              💾 حفظ وإصدار الوصفة الطبية ({medsList.length + (name.trim() && dosage.trim() && duration.trim() && editingIndex === null ? 1 : 0)})
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCancel}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionModal;
