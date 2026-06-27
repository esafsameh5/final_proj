import React, { useState } from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";
import api from "../../utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// QRCodeDisplay: renders a QR from a token string using a public CDN API.
// We use the Google Charts QR API (no library needed).
// In production replace with a self-hosted QR library.
// ─────────────────────────────────────────────────────────────────────────────
function QRCodeDisplay({ token, size = 150 }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(token)}&choe=UTF-8`;
  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: "8px" }}
    />
  );
}

function PatientMedicalCard({ patients, showToast, hasUnread, unreadCount }) {
  const patientId = sessionStorage.getItem("userId") || "";
  const patient = patients?.[patientId] || Object.values(patients || {})[0] || {};

  // ── State ─────────────────────────────────────────────────────────────────
  const [qrToken, setQrToken] = useState(null);
  const [nfcToken, setNfcToken] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [loadingNfc, setLoadingNfc] = useState(false);

  // ── Generate handler ──────────────────────────────────────────────────────
  const generateCard = async (type) => {
    const isQr = type === "QR";
    if (isQr) setLoadingQr(true);
    else setLoadingNfc(true);

    try {
      // POST /api/v1/auth/smart-card/generate
      // Query params: patientId (uuid), type ("QR" | "NFC")
      // Header: X-CSRF-TOKEN (injected automatically by Axios interceptor)
      const res = await api.post("/api/v1/auth/smart-card/generate", null, {
        params: {
          patientId: patientId || patient.id,
          type,
        },
      });

      const resData = res.data;
      if (!resData || !resData.success) {
        showToast?.(resData?.message || `فشل في توليد كارت ${type}.`, "danger");
        return;
      }

      // The backend returns the card token in resData.data (string or object with token field)
      const token =
        typeof resData.data === "string"
          ? resData.data
          : resData.data?.token || resData.data?.cardToken || resData.data?.value || "";

      if (!token) {
        showToast?.("لم يتم استلام رمز الكارت من الخادم.", "danger");
        return;
      }

      if (isQr) {
        setQrToken(token);
        showToast?.("تم توليد رمز QR بنجاح.", "success");
      } else {
        setNfcToken(token);
        showToast?.("تم توليد رمز NFC بنجاح.", "success");
      }
    } catch (err) {
      console.error(`Smart card generate [${type}] error:`, err);
      const msg = err.response?.data?.message || `فشل الاتصال بالخادم عند توليد كارت ${type}.`;
      showToast?.(msg, "danger");
    } finally {
      if (isQr) setLoadingQr(false);
      else setLoadingNfc(false);
    }
  };

  return (
    <div id="patientMedicalCardPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>💳 كارت الصحة الرقمية الذكي</h2>
          <p>بطاقتك الصحية الذكية ورموز مسح الهوية الطبية الفورية</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
        }}
      >
        {/* ── Visual NFC Card ──────────────────────────────────────────────── */}
        <div
          className="box"
          style={{
            background: "linear-gradient(135deg, #071b40 0%, #0c357a 100%)",
            color: "white",
            padding: "30px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 10px 25px rgba(7, 27, 64, 0.25)",
            position: "relative",
            minHeight: "220px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: "0 0 5px 0", color: "var(--accent-amber)", fontSize: "18px", fontWeight: "700" }}>
                الصحة الرقمية
              </h3>
              <p style={{ margin: "0", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                جمهورية مصر العربية
              </p>
            </div>
            <img
              src="/img/main_logo.png"
              alt="logo"
              style={{ width: "50px", height: "50px", objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              fontSize: "16px",
              letterSpacing: "1px",
              fontFamily: "Outfit",
              margin: "20px 0 10px 0",
              fontWeight: "600",
              wordBreak: "break-all",
              minHeight: "28px",
            }}
          >
            {nfcToken ? (
              <span title={nfcToken}>
                NFC: {nfcToken.substring(0, 20)}…
              </span>
            ) : (
              <span style={{ opacity: 0.5 }}>NFC Card ID: ——</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "15px",
            }}
          >
            <div>
              <p style={{ margin: "0", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                اسم حامل البطاقة
              </p>
              <p style={{ margin: "3px 0 0 0", fontSize: "14px", fontWeight: "600" }}>
                {patient.name}
              </p>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: "0", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                رقم الملف الطبي
              </p>
              <p style={{ margin: "3px 0 0 0", fontSize: "14px", fontFamily: "Outfit", fontWeight: "700" }}>
                {patient.id}
              </p>
            </div>
          </div>

          {/* Generate NFC button */}
          <button
            type="button"
            onClick={() => generateCard("NFC")}
            disabled={loadingNfc}
            style={{
              marginTop: "16px",
              padding: "9px 0",
              borderRadius: "8px",
              border: "1.5px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: "700",
              fontSize: "13px",
              cursor: loadingNfc ? "not-allowed" : "pointer",
              opacity: loadingNfc ? 0.6 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loadingNfc ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                جارٍ التوليد…
              </>
            ) : (
              <>📡 توليد كارت NFC</>
            )}
          </button>
        </div>

        {/* ── QR Code Panel ────────────────────────────────────────────────── */}
        <div
          className="box"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <h3>رمز الاستجابة السريعة (QR Code) للملف</h3>

          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              border: "1.5px solid var(--border-color)",
              display: "inline-block",
              boxShadow: "var(--shadow-sm)",
              minWidth: "180px",
              minHeight: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loadingQr ? (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e5e7eb",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : qrToken ? (
              <QRCodeDisplay token={qrToken} size={150} />
            ) : (
              /* Placeholder state — no mock data, shows empty waiting state */
              <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "20px" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔲</div>
                <div>اضغط «توليد QR» لإنشاء الرمز</div>
              </div>
            )}
          </div>

          {qrToken && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "11.5px",
                margin: "0",
                maxWidth: "280px",
                wordBreak: "break-all",
                fontFamily: "Outfit",
                background: "var(--bg-main)",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              {qrToken}
            </p>
          )}

          <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "0", maxWidth: "280px" }}>
            يمكن لمزودي الرعاية الصحية مسح هذا الرمز للوصول الفوري لملفك الطبي الموحد.
          </p>

          {/* Generate QR button */}
          <button
            type="button"
            className="btn"
            onClick={() => generateCard("QR")}
            disabled={loadingQr}
            style={{
              fontWeight: "bold",
              width: "100%",
              maxWidth: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: loadingQr ? 0.6 : 1,
              cursor: loadingQr ? "not-allowed" : "pointer",
            }}
          >
            {loadingQr ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                جارٍ التوليد…
              </>
            ) : (
              <>🔲 توليد رمز QR</>
            )}
          </button>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default PatientMedicalCard;
