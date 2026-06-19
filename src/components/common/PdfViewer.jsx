import React from "react";

function PdfViewer({
  pdfOpen,
  pdfType,
  patientId,
  onClose,
  content,
  zoomLabel = false,
  padding = "45px 50px"
}) {
  if (!pdfOpen) return null;

  return (
    <div id="pdfViewerContainer" style={{ background: "#f8fafc", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "0", marginTop: "30px", display: "block", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
      <div style={{ background: "#1e293b", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>📄</span>
          <span style={{ fontFamily: "monospace", fontWeight: "600" }}>patient_{patientId}_{pdfType}_report.pdf</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {zoomLabel && <span style={{ background: "rgba(255,255,255,0.1)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>100% Zoom</span>}
          <button onClick={onClose} style={{ background: "var(--accent-red)", border: "none", color: "white", padding: "6px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "600", fontFamily: "inherit", fontSize: "12px", transition: "var(--transition)" }}>إغلاق X</button>
        </div>
      </div>
      <div id="pdf-content-area" style={{ background: "#fdfdfd", padding: padding, minHeight: "350px", borderTop: "none", boxShadow: "inset 0 4px 12px rgba(0,0,0,0.03)", fontFamily: "'Courier New', Courier, monospace", direction: "ltr", textAlign: "left", overflowY: "auto", color: "#000" }}>
        <pre style={{ margin: "0", lineHeight: "1.6", fontSize: "13.5px", overflowX: "auto", whiteSpace: "pre-wrap", fontWeight: "500" }}>{content}</pre>
      </div>
    </div>
  );
}

export default PdfViewer;
