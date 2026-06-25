import React from "react";
import { FaCircleExclamation, FaTrashCan } from "react-icons/fa6";

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "تأكيد الحذف",
  cancelText = "تراجع",
  type = "danger"
}) {
  if (!isOpen) return null;

  const getHeaderIcon = () => {
    switch (type) {
      case "danger":
        return <FaTrashCan style={{ color: "var(--accent-red)", fontSize: "22px" }} />;
      case "warning":
        return <FaCircleExclamation style={{ color: "var(--accent-amber)", fontSize: "22px" }} />;
      default:
        return <FaCircleExclamation style={{ color: "var(--primary)", fontSize: "22px" }} />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case "danger":
        return { background: "var(--accent-red)", color: "white" };
      case "warning":
        return { background: "var(--accent-amber)", color: "white" };
      default:
        return { background: "var(--primary)", color: "white" };
    }
  };

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", width: "450px", padding: "30px" }}>
        <span className="close-btn" onClick={onCancel}>&times;</span>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginBottom: "15px" }}>
          {getHeaderIcon()}
          <h3 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: type === "danger" ? "var(--accent-red)" : "var(--primary)" }}>
            {title}
          </h3>
        </div>

        <p style={{ color: "var(--text-dark)", fontSize: "13.5px", lineHeight: "1.6", margin: "10px 0 25px 0" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start" }}>
          <button 
            type="button" 
            className="btn" 
            onClick={onConfirm} 
            style={{ 
              fontWeight: "bold", 
              padding: "10px 20px", 
              fontSize: "13px", 
              border: "none", 
              cursor: "pointer", 
              borderRadius: "var(--radius-sm)",
              ...getConfirmButtonStyles()
            }}
          >
            {confirmText}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel} 
            style={{ 
              fontWeight: "bold", 
              padding: "10px 20px", 
              fontSize: "13px" 
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
