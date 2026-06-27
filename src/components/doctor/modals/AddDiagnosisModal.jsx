import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";

function AddDiagnosisModal({
  addDiagnosisModalOpen,
  setAddDiagnosisModalOpen,
  onSubmit
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [icd10Results, setIcd10Results] = useState([]);
  const [selectedIcd10, setSelectedIcd10] = useState(null);
  const [searching, setSearching] = useState(false);
  const [severity, setSeverity] = useState("2");
  const [visibility, setVisibility] = useState("1");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const activeSearchRef = useRef(0);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setIcd10Results([]);
      setSearching(false);
      return;
    }
    
    setSearching(true);
    const searchId = ++activeSearchRef.current;
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get("/api/v1/lookups/icd10", {
          params: { search: searchQuery, Page: 1, PageSize: 15 }
        });
        if (searchId === activeSearchRef.current) {
          if (res.data && res.data.success && res.data.data && res.data.data.items) {
            setIcd10Results(res.data.data.items);
          } else {
            setIcd10Results([]);
          }
          setSearching(false);
        }
      } catch (err) {
        if (searchId === activeSearchRef.current) {
          console.error("ICD-10 search error:", err);
          setIcd10Results([]);
          setSearching(false);
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!addDiagnosisModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIcd10) {
      setErrorMsg("يرجى البحث واختيار تشخيص ICD-10.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    const payload = {
      icd10CodeId: selectedIcd10.icd10CodeId,
      specialty: 1,
      severity: Number(severity),
      visibility: Number(visibility),
      notes: notes
    };
    const res = await onSubmit(payload);
    setSubmitting(false);
    if (res && res.success) {
      setSearchQuery("");
      setSelectedIcd10(null);
      setSeverity("2");
      setVisibility("1");
      setNotes("");
      setAddDiagnosisModalOpen(false);
    } else if (res && res.message) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div id="addDiagnosisModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "550px" }}>
        <span className="close-btn" onClick={() => setAddDiagnosisModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>🔍 إضافة تشخيص طبي (ICD-10)</h2>

        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>البحث عن كود/اسم التشخيص (ICD-10) <span style={{ color: "red" }}>*</span></label>
            
            {selectedIcd10 ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", background: "var(--primary-light)", border: "1.5px solid var(--primary)", borderRadius: "var(--radius-sm)" }}>
                <div>
                  <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{selectedIcd10.icd10Code}</span>
                  <span style={{ marginRight: "10px", color: "var(--text-dark)" }}>{selectedIcd10.name || selectedIcd10.icd10CodeName}</span>
                </div>
                <button type="button" onClick={() => setSelectedIcd10(null)} style={{ background: "transparent", border: "none", color: "var(--accent-red)", cursor: "pointer", fontWeight: "bold" }}>تغيير 🔄</button>
              </div>
            ) : (
              <>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب للبحث (أدخل حرفين على الأقل)..."
                  style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
                />
                
                {searching && (
                  <div style={{ padding: "10px", color: "var(--text-muted)", fontSize: "13px", background: "#f8fafc", border: "1px solid var(--border-color)", borderTop: "none" }}>
                    🔄 جاري البحث في معجم ICD-10...
                  </div>
                )}

                {!searching && searchQuery.trim().length >= 2 && icd10Results.length === 0 && (
                  <div style={{ padding: "10px", color: "var(--accent-red)", fontSize: "13px", background: "#fff5f5", border: "1px solid #fee2e2", borderTop: "none", fontWeight: "bold" }}>
                    لا توجد نتائج مطابقة لـ "{searchQuery}"
                  </div>
                )}

                {icd10Results.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", right: 0, left: 0, background: "white", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-lg)", zIndex: 10, maxHeight: "180px", overflowY: "auto" }}>
                    {icd10Results.map(item => (
                      <div 
                        key={item.icd10CodeId}
                        onClick={() => setSelectedIcd10(item)}
                        style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "13.5px" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-light)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                      >
                        <span style={{ fontWeight: "bold", color: "var(--primary)", marginLeft: "8px" }}>[{item.icd10Code}]</span>
                        <span>{item.name || item.icd10CodeName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>الخطورة</label>
              <select 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
              >
                <option value="1">🟢 خفيف (Mild)</option>
                <option value="2">🟡 متوسط (Moderate)</option>
                <option value="3">🔴 شديد (Severe)</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>الخصوصية / الرؤية</label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
              >
                <option value="1">🌐 عام في الملف الموحد (Public)</option>
                <option value="2">🔒 خاص للمنشأة الحالية فقط (Private)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>ملاحظات التشخيص الإضافية:</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="أي تفاصيل أو ملاحظات سريرية حول التشخيص..." 
              style={{ height: "70px", resize: "vertical" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px" }}>
              {submitting ? "جاري الإضافة..." : "💾 إضافة التشخيص"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setAddDiagnosisModalOpen(false)} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px" }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDiagnosisModal;
