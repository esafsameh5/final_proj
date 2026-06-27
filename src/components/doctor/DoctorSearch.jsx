import React, { useState } from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";
import { QrCode } from "lucide-react";import { FaWifi } from "react-icons/fa6";

function DoctorSearch({
  doctorInfo,
  searchQuery,
  setSearchQuery,
  triggerSearch,
  searchState,
  setQrModalOpen,
  setNfcModalOpen,
  searchResults,
  activePatient,
  handleOpenPatientProfile,
  setQuickActivePatientId,
  startVisit,
  hasActiveEncounterToday,
  setVisitModalOpen,
  setPrescriptionModalOpen,
  setNewUpload,
  setUploadModalOpen,
  setActivePage
}) {
  const [localQuery, setLocalQuery] = useState({ name: "", id: "" });

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    triggerSearch(localQuery);
  };

  return (
    <div id="searchPage" className="page-content active" style={{ direction: "rtl", textAlign: "right" }}>
      
      {/* Page Styles */}
      <style>{`
        /* Layout Grid */
        .his-layout-grid {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
          margin-top: 10px;
        }
        .his-search-card-col {
          width: 100%;
          max-width: 450px;
          flex-shrink: 0;
        }
        .his-results-col {
          flex: 1;
          max-width: 520px;
          width: 100%;
        }
        @media (max-width: 968px) {
          .his-layout-grid {
            flex-direction: column;
            align-items: center;
          }
          .his-search-card-col, .his-results-col {
            max-width: 100%;
          }
        }

        /* Search Card */
        .his-search-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(8, 29, 69, 0.02), 0 12px 30px -4px rgba(8, 29, 69, 0.03);
          padding: 36px 32px;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-search-card:hover {
          box-shadow: 0 6px 24px -2px rgba(8, 29, 69, 0.03), 0 16px 40px -4px rgba(8, 29, 69, 0.05);
          border-color: rgba(226, 232, 240, 1);
        }

        /* Labels and Inputs */
        .his-label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          text-align: right;
        }
        .his-label-primary {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          text-align: right;
        }
        .his-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 500;
          color: #1e293b;
          background: #f8fafc;
          box-sizing: border-box;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-input:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }
        .his-input:focus {
          outline: none;
          background: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(11, 61, 145, 0.08);
        }
        .his-input-primary {
          border: 2px solid rgba(11, 61, 145, 0.16);
          background: #ffffff;
        }
        .his-input-primary:hover {
          border-color: rgba(11, 61, 145, 0.3);
        }
        .his-input-primary:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(11, 61, 145, 0.12);
        }

        /* Primary Button */
        .his-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: var(--primary);
          color: #ffffff;
          font-weight: 700;
          font-size: 14.5px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(11, 61, 145, 0.15);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-btn-primary:hover {
          background: #082d6c;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(11, 61, 145, 0.25);
        }
        .his-btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(11, 61, 145, 0.15);
        }

        /* Secondary Button (Scan buttons) */
        .his-btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 46px;
          border-radius: 12px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: var(--primary);
          transform: translateY(-1px);
        }
        .his-btn-secondary:active {
          transform: translateY(0);
        }

        /* Divider */
        .his-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
        }
        .his-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .his-divider-text {
          padding: 0 16px;
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Placeholder Card */
        .his-placeholder-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(8, 29, 69, 0.02), 0 12px 30px -4px rgba(8, 29, 69, 0.03);
          min-height: 400px;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        .his-placeholder-icon-bg {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #f0f5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid rgba(11, 61, 145, 0.05);
          color: var(--primary);
        }
        .his-placeholder-title {
          color: #1e293b;
          margin: 0 0 8px 0;
          font-weight: 700;
          font-size: 17px;
        }
        .his-placeholder-desc {
          color: #64748b;
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          max-width: 280px;
        }

        /* Empty State Card */
        .his-empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          background: #ffffff;
          border: 1.5px dashed #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(8, 29, 69, 0.02), 0 12px 30px -4px rgba(8, 29, 69, 0.03);
          min-height: 400px;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        .his-empty-icon-bg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fef2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid #fee2e2;
          color: var(--accent-red);
        }
        .his-empty-title {
          color: #1e293b;
          margin: 0 0 8px 0;
          font-weight: 700;
          font-size: 17px;
        }
        .his-empty-desc {
          color: #64748b;
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          max-width: 320px;
        }

        /* Loader Container */
        .his-loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(8, 29, 69, 0.02), 0 12px 30px -4px rgba(8, 29, 69, 0.03);
          min-height: 400px;
          box-sizing: border-box;
        }
        .his-loader-spinner {
          border: 3.5px solid #f3f3f3;
          border-top: 3.5px solid var(--primary);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        /* Medical ID Card */
        .his-medical-id-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(8, 29, 69, 0.02), 0 12px 30px -4px rgba(8, 29, 69, 0.03);
          padding: 32px;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-medical-id-card:hover {
          box-shadow: 0 6px 24px -2px rgba(8, 29, 69, 0.03), 0 16px 40px -4px rgba(8, 29, 69, 0.05);
        }
        .his-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .his-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
        }
        .his-card-badge {
          font-size: 9px;
          color: var(--primary);
          font-weight: 800;
          background: var(--primary-light);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        /* Profile Vitals */
        .his-profile-section {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 28px;
        }
        .his-avatar-container {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .his-patient-name {
          margin: 0 0 6px 0;
          font-size: 20px;
          color: #0f172a;
          font-weight: 700;
        }
        .his-patient-id-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Outfit', sans-serif;
          color: var(--primary);
          font-weight: 700;
          font-size: 13.5px;
        }

        /* Vitals/Details Grid */
        .his-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        .his-detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .his-detail-label {
          color: #94a3b8;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .his-detail-value {
          font-weight: 700;
          color: #334155;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Badges */
        .his-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 12px;
          width: fit-content;
        }
        .badge-blood {
          background: #fee2e2;
          color: var(--accent-red);
        }
        .badge-status-stable {
          background: #ecfdf5;
          color: #047857;
        }
        .badge-status-observation {
          background: #fffbeb;
          color: #b45309;
        }
        .badge-status-critical {
          background: #fef2f2;
          color: var(--accent-red);
        }

        /* Actions */
        .his-actions-container {
          display: flex;
          gap: 16px;
          border-top: 1.5px solid #f1f5f9;
          padding-top: 24px;
        }
        .his-action-btn-primary {
          flex: 1;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }
        .his-action-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
        }
        .his-action-btn-primary:active {
          transform: translateY(0);
        }
        .his-action-btn-secondary {
          flex: 1;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .his-action-btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: var(--primary);
          transform: translateY(-2px);
        }
        .his-action-btn-secondary:active {
          transform: translateY(0);
        }

        /* Alerts */
        .his-alert-success {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          color: #065f46;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .his-alert-warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
          padding: 16px 20px;
          border-radius: 14px;
          margin-bottom: 20px;
        }
        .his-alert-danger {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 16px 20px;
          border-radius: 14px;
          margin-bottom: 20px;
        }

        /* Utility */
        .his-icon {
          width: 18px;
          height: 18px;
          stroke-width: 2.2px;
          flex-shrink: 0;
        }
        .his-icon-large {
          width: 40px;
          height: 40px;
          stroke-width: 1.8px;
        }
        .his-icon-small {
          width: 14px;
          height: 14px;
          stroke-width: 2px;
        }
        .his-helper-text {
          color: var(--text-muted);
          font-size: 13.5px;
          margin-top: -15px;
          margin-bottom: 25px;
          padding-right: 12px;
          border-right: 3px solid rgba(11, 61, 145, 0.3);
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header Panel */}
      <div className="topbar">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-dark)", fontWeight: "bold" }}>
            <svg className="his-icon" style={{ width: "24px", height: "24px", color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            البحث عن مريض
          </h2>
          <p>الاستعلام في السجل الصحي الموحد بجمهورية مصر العربية</p>
        </div>
        <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
      </div>

      <p className="his-helper-text">
        ابحث باستخدام الرقم الصحي الموحد أو اسم المريض، أو امسح بطاقة NFC أو رمز QR.
      </p>

      {/* Responsive Two-Column Layout */}
      <div className="his-layout-grid">
        
        {/* Left Column: Premium Search Panel Card */}
        <div className="his-search-card-col">
          <div className="his-search-card">
            <form className="space-y-4" onSubmit={handleLocalSubmit}>
              <div data-purpose="form-group" style={{ marginBottom: "18px" }}>
                <label className="his-label-primary">
                  الرقم الصحي الموحد (Health ID)
                </label>
                <input
                  type="text"
                  placeholder="مثال: H-2026-001"
                  className="his-input his-input-primary"
                  value={localQuery.id}
                  onChange={(e) => {
                    const val = e.target.value;
                    const clean = val.replace(/[^a-zA-Z0-9]/g, "");
                    let masked = "";
                    if (clean.length > 0) {
                      const firstChar = clean[0];
                      if (/[a-zA-Z]/.test(firstChar)) {
                        masked += firstChar.toUpperCase();
                      } else {
                        setLocalQuery(prev => ({ ...prev, id: "" }));
                        return;
                      }
                    }
                    const digitPart = clean.slice(1).replace(/[^0-9]/g, "");
                    if (digitPart.length > 0) {
                      masked += "-" + digitPart.slice(0, 4);
                    }
                    if (digitPart.length > 4) {
                      masked += "-" + digitPart.slice(4, 7);
                    }
                    setLocalQuery(prev => ({ ...prev, id: masked }));
                  }}
                />
              </div>

              <div data-purpose="form-group" style={{ marginBottom: "24px" }}>
                <label className="his-label">
                  اسم المريض (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: أحمد محمد"
                  className="his-input"
                  value={localQuery.name}
                  onChange={(e) => setLocalQuery(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <button type="submit" className="his-btn-primary">
                <svg className="his-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                البحث عن مريض
              </button>
            </form>

            {/* Divider */}
            <div className="his-divider">
              <span className="his-divider-line"></span>
              <span className="his-divider-text">أو</span>
              <span className="his-divider-line"></span>
            </div>

            {/* Scan Actions */}
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <button className="his-btn-secondary" onClick={() => setQrModalOpen(true)}>
                    <QrCode className="his-icon" size={20} strokeWidth={2.2} />
                    مسح رمز QR
                  </button>
                <button className="his-btn-secondary" onClick={() => setNfcModalOpen(true)}>
                <FaWifi className="his-icon" size={18} style={{ transform: "rotate(90deg)" }}/>
                مسح كارت NFC
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Search Results / States Column */}
        <div className="his-results-col">
          
          {/* IDLE PLACEHOLDER */}
          {searchState === "idle" && (
            <div className="his-placeholder-card">
              <div className="his-placeholder-icon-bg">
                <svg className="his-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="his-placeholder-title">البحث عن مريض</h3>
              <p className="his-placeholder-desc">ستظهر بيانات المريض هنا بعد نجاح عملية البحث.</p>
            </div>
          )}

          {/* SEARCHING LOADER */}
          {searchState === "searching" && (
            <div className="his-loader-card">
              <div className="his-loader-spinner"></div>
              <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>جاري الاستعلام من قاعدة البيانات الموحدة...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {searchState === "not_found" && (
            <div className="his-empty-card">
              <div className="his-empty-icon-bg">
                <svg className="his-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="his-empty-title">لم يتم العثور على مريض</h3>
              <p className="his-empty-desc">تأكد من الرقم الصحي الموحد أو الاسم ثم حاول مرة أخرى.</p>
            </div>
          )}

          {/* WARNING: MULTIPLE MATCHES */}
          {searchState === "multiple_matches" && (
            <div className="his-alert-warning">
              <svg className="his-icon" style={{ color: "var(--accent-amber)", marginTop: "2px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <b style={{ fontSize: "14.5px", color: "#92400e", display: "block" }}>تكرار تطابق الاسم في الخادم</b>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#b45309", lineHeight: "1.5" }}>تم العثور على أكثر من مريض بنفس الاسم، يرجى إدخال الرقم الصحي الموحد (Health ID) لتحديد المريض بشكل فريد.</p>
              </div>
            </div>
          )}

          {/* ERROR: NAME/ID MISMATCH */}
          {searchState === "mismatch" && (
            <div className="his-alert-danger">
              <svg className="his-icon" style={{ color: "var(--accent-red)", marginTop: "2px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <b style={{ fontSize: "14.5px", color: "#991b1b", display: "block" }}>خطأ في مطابقة البيانات</b>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#c53030", lineHeight: "1.5" }}>الاسم المدخل لا يتطابق مع الرقم الصحي الموحد المسجل. يرجى التحقق وإعادة البحث.</p>
              </div>
            </div>
          )}

          {/* SUCCESS PATIENT MEDICAL ID CARD */}
          {searchState === "success" && activePatient && (
            <div>
              <div className="his-alert-success">
                <svg className="his-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                تم العثور على سجل صحي مطابق.
              </div>

              {/* Premium Medical ID Card */}
              <div className="his-medical-id-card">
                <div className="his-card-header">
                  <div className="his-card-title">
                    <svg className="his-icon" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>بطاقة الهوية الطبية</span>
                  </div>
                  <span className="his-card-badge">MEDICAL ID</span>
                </div>

                {/* Profile Section */}
                <div className="his-profile-section">
                  <div className="his-avatar-container">
                    <svg className="his-icon" style={{ width: "30px", height: "30px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="his-patient-name">{activePatient.name}</h3>
                    <div className="his-patient-id-badge">
                      <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                      </svg>
                      <span>{activePatient.id}</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="his-details-grid">
                  <div className="his-detail-item">
                    <span className="his-detail-label">العمر والسن</span>
                    <span className="his-detail-value">
                      <svg className="his-icon-small" style={{ color: "#94a3b8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      {activePatient.age} سنة
                    </span>
                  </div>

                  <div className="his-detail-item">
                    <span className="his-detail-label">فصيلة الدم</span>
                    <span className="his-badge badge-blood">
                      <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.485 12c.504.505.748 1.157.733 1.808a4.43 4.43 0 01-1.3 3.013c-1.636 1.637-4.29 1.637-5.926 0l-5.926-5.926 5.926-5.926c1.636-1.637 4.29-1.637 5.926 0a4.43 4.43 0 011.3 3.013c.015.65-.229 1.303-.733 1.808z"></path>
                      </svg>
                      {activePatient.bloodType || "O+"}
                    </span>
                  </div>

                  <div className="his-detail-item">
                    <span className="his-detail-label">آخر زيارة مسجلة</span>
                    <span className="his-detail-value">
                      <svg className="his-icon-small" style={{ color: "#94a3b8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {activePatient.lastVisit || "2026/06/25"}
                    </span>
                  </div>

                  <div className="his-detail-item">
                    <span className="his-detail-label">الحالة الطبية</span>
                    <span>
                      {activePatient.status === "stable" && (
                        <span className="his-badge badge-status-stable">
                          <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                          مستقر
                        </span>
                      )}
                      {activePatient.status === "observation" && (
                        <span className="his-badge badge-status-observation">
                          <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                          تحت الملاحظة
                        </span>
                      )}
                      {activePatient.status === "critical" && (
                        <span className="his-badge badge-status-critical">
                          <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                          حالة حرجة
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="his-actions-container">
                  <button 
                    className="his-action-btn-secondary" 
                    onClick={() => handleOpenPatientProfile(activePatient.id)}
                  >
                    <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                    فتح الملف الطبي
                  </button>
                  
                  {!hasActiveEncounterToday(activePatient) ? (
                    <button 
                      className="his-action-btn-primary" 
                      onClick={() => startVisit(activePatient.id)}
                      style={{ background: "var(--accent-emerald)" }}
                    >
                      <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                      بدء زيارة جديدة
                    </button>
                  ) : (
                    <button 
                      className="his-action-btn-primary"
                      disabled 
                      style={{ background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed", boxShadow: "none" }}
                    >
                      <svg className="his-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                      الزيارة نشطة
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorSearch;

