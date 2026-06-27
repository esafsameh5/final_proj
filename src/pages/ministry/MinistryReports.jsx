import React, { useEffect, useMemo, useState } from "react";
import {
  FaEye,
  FaFileArrowDown,
  FaFileExport,
  FaFileLines,
  FaMagnifyingGlass,
  FaPlus,
  FaRotate,
  FaShareNodes,
  FaShieldHalved,
  FaSpinner,
} from "react-icons/fa6";
import MinistryActionMenu from "../../components/ministry/MinistryActionMenu";
import MinistryDataState from "../../components/ministry/MinistryDataState";
import MinistryDetailsModal from "../../components/ministry/MinistryDetailsModal";
import MinistryFormModal from "../../components/ministry/MinistryFormModal";
import MinistryPageHeader from "../../components/ministry/MinistryPageHeader";
import MinistryPagination from "../../components/ministry/MinistryPagination";
import MinistryStatCard from "../../components/ministry/MinistryStatCard";
import {
  createMinistryDispute,
  downloadTextFile,
  exportRowsToCsv,
  fetchMinistryAuditLogs,
  fetchMinistryDisputes,
  fetchMinistryFacilityReports,
  fetchMinistryHospitals,
  formatApiError,
  reviewMinistryDispute,
} from "../../services/ministryService";

const initialDisputeForm = {
  targetType: "",
  targetId: "",
  reason: "",
};

const initialReviewForm = {
  status: "",
  resolution: "",
};

function MinistryReports({ showToast }) {
  const [reports, setReports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportsError, setReportsError] = useState("");
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [detailsState, setDetailsState] = useState(null);

  const [disputeRows, setDisputeRows] = useState([]);
  const [disputeSearch, setDisputeSearch] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeError, setDisputeError] = useState("");
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState(initialDisputeForm);
  const [disputeContextMode, setDisputeContextMode] = useState(false);
  const [disputePopulateSource, setDisputePopulateSource] = useState("");
  const [reviewState, setReviewState] = useState({ record: null, values: initialReviewForm });

  const [auditRows, setAuditRows] = useState([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadMeta = async () => {
    const hasFacilities = facilities.length > 0;
    setLoading(true);
    setErrorMessage("");

    const [facilitiesResult, disputesResult, auditResult] = await Promise.allSettled([
      fetchMinistryHospitals({ page: 1, pageSize: 200 }),
      fetchMinistryDisputes({ page: 1, pageSize: 6, search: disputeSearch, status: disputeStatus }),
      fetchMinistryAuditLogs({ page: 1, pageSize: 8, search: auditSearch }),
    ]);

    if (facilitiesResult.status === "fulfilled") {
      setFacilities(facilitiesResult.value.items);
      setSelectedFacilityId((current) => current || facilitiesResult.value.items[0]?.id || "");
    } else {
      const message = formatApiError(facilitiesResult.reason, "تعذر تحميل قائمة المنشآت.");
      console.error("Failed to load facilities for ministry reports:", facilitiesResult.reason);
      setErrorMessage(message);
      if (hasFacilities) {
        showToast?.(message, "danger");
      }
    }

    if (disputesResult.status === "fulfilled") {
      setDisputeRows(disputesResult.value.items);
      setDisputeError("");
    } else {
      console.error("Failed to load disputes:", disputesResult.reason);
      setDisputeError(formatApiError(disputesResult.reason, "تعذر تحميل النزاعات."));
    }

    if (auditResult.status === "fulfilled") {
      setAuditRows(auditResult.value.items);
      setAuditError("");
    } else {
      console.error("Failed to load audit logs:", auditResult.reason);
      setAuditError(formatApiError(auditResult.reason, "تعذر تحميل سجلات التدقيق."));
    }

    setLoading(false);
  };

  const loadReports = async () => {
    if (!selectedFacilityId) {
      setReports([]);
      setReportsError("");
      return;
    }

    setReportsLoading(true);
    setReportsError("");

    try {
      const response = await fetchMinistryFacilityReports(selectedFacilityId, {
        from: fromDate,
        to: toDate,
      });

      const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId);
      setReports(response.reports.map((report) => ({
        ...report,
        hospital: selectedFacility?.name || "المنشأة المحددة",
      })));
      setReportsError(
        response.errors?.length ? Array.from(new Set(response.errors.map((entry) => entry.message))).join(" ") : ""
      );
    } catch (fetchError) {
      console.error("Failed to load facility reports:", fetchError);
      setReports([]);
      setReportsError(formatApiError(fetchError, "تعذر تحميل تقارير المنشأة."));
    } finally {
      setReportsLoading(false);
    }
  };

  const loadDisputes = async () => {
    setDisputeLoading(true);
    setDisputeError("");

    try {
      const response = await fetchMinistryDisputes({
        page: 1,
        pageSize: 6,
        search: disputeSearch,
        status: disputeStatus,
      });
      setDisputeRows(response.items);
    } catch (fetchError) {
      console.error("Failed to load disputes:", fetchError);
      setDisputeError(formatApiError(fetchError, "تعذر تحميل النزاعات."));
    } finally {
      setDisputeLoading(false);
    }
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    setAuditError("");

    try {
      const response = await fetchMinistryAuditLogs({
        page: 1,
        pageSize: 8,
        search: auditSearch,
      });
      setAuditRows(response.items);
    } catch (fetchError) {
      console.error("Failed to load audit logs:", fetchError);
      setAuditError(formatApiError(fetchError, "تعذر تحميل سجلات التدقيق."));
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      loadReports();
    }
  }, [selectedFacilityId, fromDate, toDate]);

  useEffect(() => {
    loadDisputes();
  }, [disputeSearch, disputeStatus]);

  useEffect(() => {
    loadAudit();
  }, [auditSearch]);

  const totalPages = Math.max(1, Math.ceil(reports.length / 8));
  const paginatedReports = reports.slice((page - 1) * 8, page * 8);

  const statCards = useMemo(() => ([
    { id: "reports", label: "تقارير المنشأة", value: reports.length, icon: <FaFileLines /> },
    { id: "disputes", label: "النزاعات المعروضة", value: disputeRows.length, icon: <FaShieldHalved />, accent: "var(--accent-red)" },
    { id: "audit", label: "سجلات التدقيق", value: auditRows.length, icon: <FaFileArrowDown />, accent: "var(--primary)" },
    { id: "facility", label: "المنشآت الجاهزة", value: facilities.length, icon: <FaRotate />, accent: "var(--accent-purple)" },
  ]), [reports.length, disputeRows.length, auditRows.length, facilities.length]);

  const exportCurrentRows = () => {
    exportRowsToCsv(
      "ministry-facility-reports.csv",
      [
        { key: "title", label: "عنوان التقرير" },
        { key: "hospital", label: "المنشأة" },
        { key: "period", label: "الفترة" },
        { key: "createdAtLabel", label: "تاريخ الإنشاء" },
        { key: "status", label: "الحالة" },
      ],
      reports
    );
    showToast?.("تم تصدير قائمة التقارير الحالية.", "success");
  };

  const handleDownload = (report) => {
    downloadTextFile(`${report.typeKey}.txt`, report.content.join("\n"));
    showToast?.(`تم تجهيز ${report.title} للتحميل.`, "success");
  };

  const handleShare = async (report) => {
    try {
      await navigator.clipboard.writeText(`${report.title}\n${report.content.join("\n")}`);
      showToast?.("تم نسخ ملخص التقرير إلى الحافظة.", "success");
    } catch (copyError) {
      console.error("Failed to copy report details:", copyError);
      showToast?.("تعذر نسخ التقرير إلى الحافظة.", "danger");
    }
  };

  const submitDispute = async (event) => {
    event.preventDefault();

    if (!disputeForm.targetType.trim() || !disputeForm.targetId.trim() || !disputeForm.reason.trim()) {
      showToast?.("يرجى استكمال بيانات النزاع أولاً.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await createMinistryDispute(disputeForm);
      setIsDisputeModalOpen(false);
      setDisputeForm(initialDisputeForm);
      await loadDisputes();
      showToast?.("تم فتح النزاع وإرساله للمراجعة.", "success");
    } catch (submitError) {
      console.error("Failed to create dispute:", submitError);
      showToast?.(formatApiError(submitError, "تعذر فتح النزاع."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!reviewState.record) {
      return;
    }

    if (!reviewState.values.status.trim() || !reviewState.values.resolution.trim()) {
      showToast?.("يرجى إدخال رقم الحالة وقرار المراجعة.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await reviewMinistryDispute(reviewState.record.id, reviewState.values);
      setReviewState({ record: null, values: initialReviewForm });
      await loadDisputes();
      showToast?.("تم حفظ مراجعة النزاع بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to review dispute:", submitError);
      showToast?.(formatApiError(submitError, "تعذر حفظ مراجعة النزاع."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="ministryReportsPage" className="page-content active">
      <MinistryPageHeader
        title="التقارير والرقابة"
        description="تقارير المنشآت عند الطلب مع إدارة النزاعات وسجلات التدقيق من بوابة الوزارة"
      />

      {loading && facilities.length === 0 ? (
        <MinistryDataState loading loadingText="جارٍ تحميل بيانات التقارير والرقابة..." />
      ) : errorMessage ? (
        <MinistryDataState error errorText={errorMessage} onRetry={loadMeta} />
      ) : (
        <>
          <div className="cards">
            {statCards.map((card) => (
              <MinistryStatCard
                key={card.id}
                label={card.label}
                value={card.value}
                icon={card.icon}
                accent={card.accent}
              />
            ))}
          </div>

          <div className="box" style={{ overflow: "visible" }}>
            <div className="filters-toolbar ministry-toolbar" style={{ marginBottom: "20px" }}>
              <div className="ministry-filter-control">
                <select value={selectedFacilityId} onChange={(event) => setSelectedFacilityId(event.target.value)}>
                  <option value="">اختر المنشأة</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
              <button type="button" className="btn" onClick={loadReports}>
                {reportsLoading ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaRotate />}
                تحميل التقارير
              </button>
              <button type="button" className="btn btn-secondary" onClick={exportCurrentRows}>
                <FaFileExport />
                تصدير
              </button>
            </div>

            <h2>تقارير المنشأة المحددة</h2>
            {reportsError ? (
              <div style={{ marginBottom: "12px", color: "var(--accent-red)", fontSize: "12px" }}>
                {reportsError}
              </div>
            ) : null}
            {reportsLoading && reports.length === 0 ? (
              <MinistryDataState loading loadingText="جارٍ تحميل تقارير المنشأة..." />
            ) : reportsError && reports.length === 0 ? (
              <MinistryDataState error errorText={reportsError} onRetry={loadReports} />
            ) : reports.length === 0 ? (
              <MinistryDataState isEmpty emptyText="اختر منشأة وفترة زمنية لعرض التقارير الموثقة." />
            ) : (
              <>
                <div className="table-container">
                  <table style={{ overflow: "visible" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center", width: "70px" }}>#</th>
                        <th>عنوان التقرير</th>
                        <th>المنشأة</th>
                        <th>الفترة</th>
                        <th style={{ textAlign: "center" }}>تاريخ الإنشاء</th>
                        <th style={{ textAlign: "center" }}>الحالة</th>
                        <th style={{ textAlign: "center", width: "90px" }}>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((report, index) => (
                        <tr key={report.id}>
                          <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * 8 + index + 1}</td>
                          <td style={{ color: "var(--primary)", fontWeight: "700" }}>{report.title}</td>
                          <td>{report.hospital}</td>
                          <td>{report.period}</td>
                          <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{report.createdAtLabel}</td>
                          <td style={{ textAlign: "center" }}><span className="status">{report.status}</span></td>
                          <td style={{ textAlign: "center", position: "relative" }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: "6px 12px", minWidth: "auto" }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveMenuId((current) => current === report.id ? null : report.id);
                              }}
                            >
                              <FaEye />
                            </button>
                            <MinistryActionMenu
                              isOpen={activeMenuId === report.id}
                              onClose={() => setActiveMenuId(null)}
                              items={[
                                {
                                  label: "عرض التفاصيل",
                                  icon: <FaEye />,
                                  onClick: () => setDetailsState({
                                    title: report.title,
                                    lines: report.content,
                                  }),
                                },
                                {
                                  label: "تحميل التقرير",
                                  icon: <FaFileArrowDown />,
                                  onClick: () => handleDownload(report),
                                },
                                {
                                  label: "مشاركة التقرير",
                                  icon: <FaShareNodes />,
                                  onClick: () => handleShare(report),
                                },
                                {
                                  label: "فتح نزاع وصول",
                                  icon: <FaShieldHalved style={{ color: "var(--accent-red)" }} />,
                                  onClick: () => {
                                    setDisputeForm({
                                      targetType: "Report",
                                      targetId: report.id,
                                      reason: "",
                                    });
                                    setDisputeContextMode(true);
                                    setIsDisputeModalOpen(true);
                                  },
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <MinistryPagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={reports.length}
                  currentCount={paginatedReports.length}
                  label="تقرير"
                  onChange={setPage}
                />
              </>
            )}
          </div>

          <div className="content" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "25px" }}>
            <div className="box">
              <div className="box-header">
                <h2 style={{ marginBottom: 0 }}>نزاعات الوصول</h2>
                <button type="button" className="btn" onClick={() => {
                  setDisputeContextMode(false);
                  setDisputePopulateSource("");
                  setDisputeForm(initialDisputeForm);
                  setIsDisputeModalOpen(true);
                }}>
                  <FaPlus />
                  فتح نزاع
                </button>
              </div>
              <div className="filters-toolbar" style={{ marginBottom: "18px", display: "flex", gap: "12px", width: "100%", alignItems: "center" }}>
                <div className="ministry-filter-control" style={{ width: "160px" }}>
                  <input
                    placeholder="رقم الحالة"
                    value={disputeStatus}
                    onChange={(event) => setDisputeStatus(event.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="ministry-search-control" style={{ flex: 1, minWidth: "280px" }}>
                  <FaMagnifyingGlass className="ministry-search-icon" />
                  <input
                    placeholder="بحث في النزاعات..."
                    value={disputeSearch}
                    onChange={(event) => setDisputeSearch(event.target.value)}
                  />
                </div>
              </div>
              {disputeError ? (
                <div style={{ marginBottom: "12px", color: "var(--accent-red)", fontSize: "12px" }}>
                  {disputeError}
                </div>
              ) : null}
              {disputeLoading && disputeRows.length === 0 ? (
                <MinistryDataState loading loadingText="جارٍ تحميل النزاعات..." />
              ) : disputeError && disputeRows.length === 0 ? (
                <MinistryDataState error errorText={disputeError} onRetry={loadDisputes} />
              ) : disputeRows.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لا توجد نزاعات مطابقة للفلاتر الحالية." />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>نوع الهدف</th>
                        <th>السبب</th>
                        <th>الحالة</th>
                        <th style={{ textAlign: "center" }}>المراجعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputeRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.targetType}</td>
                          <td>{row.reason}</td>
                          <td>{row.status}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ minWidth: "auto", padding: "8px 12px" }}
                              onClick={() => setReviewState({ record: row, values: initialReviewForm })}
                            >
                              مراجعة
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="box">
              <div className="box-header">
                <h2 style={{ marginBottom: 0 }}>سجلات التدقيق</h2>
                <button type="button" className="btn btn-secondary" onClick={loadAudit}>
                  <FaRotate />
                  تحديث
                </button>
              </div>
              <div className="ministry-search-control" style={{ marginBottom: "18px" }}>
                <FaMagnifyingGlass className="ministry-search-icon" />
                <input
                  placeholder="بحث في السجلات..."
                  value={auditSearch}
                  onChange={(event) => setAuditSearch(event.target.value)}
                />
              </div>
              {auditError ? (
                <div style={{ marginBottom: "12px", color: "var(--accent-red)", fontSize: "12px" }}>
                  {auditError}
                </div>
              ) : null}
              {auditLoading && auditRows.length === 0 ? (
                <MinistryDataState loading loadingText="جارٍ تحميل سجلات التدقيق..." />
              ) : auditError && auditRows.length === 0 ? (
                <MinistryDataState error errorText={auditError} onRetry={loadAudit} />
              ) : auditRows.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لا توجد سجلات مطابقة لبحث التدقيق الحالي." />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>الفاعل</th>
                        <th>الإجراء</th>
                        <th>الكيان</th>
                        <th style={{ textAlign: "center" }}>الوقت</th>
                        <th style={{ textAlign: "center", width: "95px" }}>خيارات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditRows.map((row) => (
                        <tr key={row.id || `${row.actor}-${row.createdAt}`}>
                          <td>{row.actor}</td>
                          <td>{row.action}</td>
                          <td>{row.entity}</td>
                          <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{row.createdAt}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: "5px 10px", fontSize: "12px", minWidth: "auto", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => {
                                setDisputeForm({
                                  targetType: row.entity || "AuditLog",
                                  targetId: row.id,
                                  reason: ""
                                });
                                setDisputeContextMode(true);
                                setIsDisputeModalOpen(true);
                              }}
                              title="فتح نزاع وصول لهذا السجل"
                            >
                              <FaShieldHalved style={{ color: "var(--accent-red)" }} />
                              نزاع
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {detailsState ? (
        <MinistryDetailsModal title={detailsState.title} lines={detailsState.lines} onClose={() => setDetailsState(null)} />
      ) : null}

      {isDisputeModalOpen ? (
        <MinistryFormModal
          title="إنشاء وفتح نزاع وصول"
          subtitle="تتيح هذه الشاشة تسجيل اعتراض رسمي أو نزاع إداري بشأن صلاحيات الوصول الخاصة بجهة معينة"
          onClose={() => {
            setIsDisputeModalOpen(false);
            setDisputeContextMode(false);
            setDisputePopulateSource("");
            setDisputeForm(initialDisputeForm);
          }}
          width="600px"
        >
          {disputeContextMode ? (
            <div style={{ padding: "12px 15px", background: "#f0fdf4", color: "#166534", border: "1.5px solid #bbf7d0", borderRadius: "var(--radius-sm)", marginBottom: "18px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>🔒</span>
              <span><strong>وضع التعبئة التلقائية المباشرة:</strong> تم استنباط نوع الكيان والرمز التعريفي من السجل النشط بنجاح لمنع أخطاء الإدخال.</span>
            </div>
          ) : (
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "18px" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "6px", fontSize: "13.5px" }}>تعبئة البيانات تلقائياً من سجل معروض:</label>
              <select
                value={disputePopulateSource}
                onChange={(e) => {
                  const val = e.target.value;
                  setDisputePopulateSource(val);
                  setDisputeForm(initialDisputeForm);
                }}
                style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", marginBottom: "10px" }}
              >
                <option value="">-- إدخال يدوي مخصص (لا توجد تعبئة تلقائية) --</option>
                <option value="reports">من تقارير المنشآت المحملة حالياً</option>
                <option value="audit">من سجلات التدقيق والعمليات الأخيرة</option>
              </select>

              {disputePopulateSource === "reports" && (
                <div>
                  <label style={{ display: "block", fontWeight: "700", marginBottom: "6px", fontSize: "12.5px" }}>اختر التقرير المستهدف:</label>
                  <select
                    onChange={(e) => {
                      const repId = e.target.value;
                      const rep = reports.find(r => r.id === repId);
                      if (rep) {
                        setDisputeForm(curr => ({
                          ...curr,
                          targetType: "Report",
                          targetId: rep.id
                        }));
                      } else {
                        setDisputeForm(initialDisputeForm);
                      }
                    }}
                    style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
                  >
                    <option value="">-- اختر تقريراً من القائمة --</option>
                    {reports.map((r, i) => (
                      <option key={r.id || i} value={r.id}>{r.title} ({r.hospital})</option>
                    ))}
                  </select>
                </div>
              )}

              {disputePopulateSource === "audit" && (
                <div>
                  <label style={{ display: "block", fontWeight: "700", marginBottom: "6px", fontSize: "12.5px" }}>اختر سجل التدقيق المستهدف:</label>
                  <select
                    onChange={(e) => {
                      const logId = e.target.value;
                      const log = auditRows.find(a => a.id === logId);
                      if (log) {
                        setDisputeForm(curr => ({
                          ...curr,
                          targetType: log.entity || "AuditLog",
                          targetId: log.id
                        }));
                      } else {
                        setDisputeForm(initialDisputeForm);
                      }
                    }}
                    style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
                  >
                    <option value="">-- اختر سجلاً من القائمة --</option>
                    {auditRows.map((a, i) => (
                      <option key={a.id || i} value={a.id}>{a.action} - {a.actor} ({a.entity})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={submitDispute}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-dark)" }}>
                  تصنيف الكيان المستهدف {disputeContextMode ? "🔒" : ""}
                </label>
                <input
                  placeholder="مثال: Report, Hospital, Doctor"
                  value={disputeForm.targetType}
                  onChange={(event) => setDisputeForm((current) => ({ ...current, targetType: event.target.value }))}
                  disabled={disputeContextMode}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: disputeContextMode ? "#f1f5f9" : "white",
                    cursor: disputeContextMode ? "not-allowed" : "text",
                    border: disputeContextMode ? "1.5px solid #cbd5e1" : "1.5px solid var(--border-color)"
                  }}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>اسم النموذج البرمجي المتنازع عليه.</small>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-dark)" }}>
                  الرمز التعريفي للكيان {disputeContextMode ? "🔒" : ""}
                </label>
                <input
                  placeholder="أدخل رمز الـ ID الفريد للكيان..."
                  value={disputeForm.targetId}
                  onChange={(event) => setDisputeForm((current) => ({ ...current, targetId: event.target.value }))}
                  disabled={disputeContextMode}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: disputeContextMode ? "#f1f5f9" : "white",
                    cursor: disputeContextMode ? "not-allowed" : "text",
                    border: disputeContextMode ? "1.5px solid #cbd5e1" : "1.5px solid var(--border-color)"
                  }}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>المعرف الفريد (GUID) في خوادم قاعدة البيانات.</small>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-dark)" }}>
                أسباب فتح النزاع بالتفصيل <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                rows="4"
                placeholder="يرجى كتابة أسباب الاعتراض، والملاحظات الإدارية بدقة للجنة الفنية..."
                value={disputeForm.reason}
                onChange={(event) => setDisputeForm((current) => ({ ...current, reason: event.target.value }))}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              <small style={{ color: "var(--text-muted)", fontSize: "11.5px" }}>ملاحظة: هذا الحقل إلزامي لإيضاح أبعاد النزاع لمسؤولي الوزارة.</small>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPlus />}
                إرسال وتوثيق النزاع
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsDisputeModalOpen(false);
                  setDisputeContextMode(false);
                  setDisputePopulateSource("");
                  setDisputeForm(initialDisputeForm);
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {reviewState.record ? (
        <MinistryFormModal
          title={`مراجعة النزاع ${reviewState.record.id}`}
          subtitle="أدخل رقم الحالة كما هو معتمد في Swagger ثم احفظ قرار المراجعة"
          onClose={() => setReviewState({ record: null, values: initialReviewForm })}
          width="560px"
        >
          <form onSubmit={submitReview} style={{ display: "grid", gap: "14px" }}>
            <input
              placeholder="رقم الحالة"
              value={reviewState.values.status}
              onChange={(event) =>
                setReviewState((current) => ({
                  ...current,
                  values: { ...current.values, status: event.target.value },
                }))
              }
            />
            <textarea
              rows="4"
              placeholder="قرار المراجعة"
              value={reviewState.values.resolution}
              onChange={(event) =>
                setReviewState((current) => ({
                  ...current,
                  values: { ...current.values, resolution: event.target.value },
                }))
              }
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaShieldHalved />}
                حفظ المراجعة
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewState({ record: null, values: initialReviewForm })}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}
    </div>
  );
}

export default MinistryReports;
