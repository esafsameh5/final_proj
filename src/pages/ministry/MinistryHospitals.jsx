import React, { useEffect, useMemo, useState } from "react";
import {
  FaBuildingCircleCheck,
  FaEllipsisVertical,
  FaEye,
  FaFileExport,
  FaHospital,
  FaMagnifyingGlass,
  FaMapLocationDot,
  FaPenToSquare,
  FaPlus,
  FaRotate,
  FaSitemap,
  FaSpinner,
  FaTriangleExclamation,
  FaBed,
  FaUserDoctor,
  FaChartSimple,
  FaListCheck,
  FaClipboardList
} from "react-icons/fa6";
import api from "../../utils/api";
import MinistryActionMenu from "../../components/ministry/MinistryActionMenu";
import MinistryDataState from "../../components/ministry/MinistryDataState";
import MinistryFormModal from "../../components/ministry/MinistryFormModal";
import MinistryPageHeader from "../../components/ministry/MinistryPageHeader";
import MinistryPagination from "../../components/ministry/MinistryPagination";
import MinistryStatCard from "../../components/ministry/MinistryStatCard";
import {
  approveMinistryHospital,
  buildDisplayLines,
  createMinistryHospital,
  exportRowsToCsv,
  fetchMinistryFacilitySnapshot,
  fetchMinistryHospitals,
  formatApiError,
  suspendMinistryHospital,
  updateMinistryHospital,
  fetchMinistryFacilityReports,
} from "../../services/ministryService";

const initialFormState = {
  name: "",
  type: "",
  governorate: "",
  phone: "",
  locationType: "",
  country: "Egypt",
  region: "",
  city: "",
  district: "",
  street: "",
  buildingNumber: "",
  floor: "",
  apartmentNumber: "",
  landmark: "",
  addressDescription: "",
};

const initialReviewState = {
  approved: true,
  reviewerNotes: "",
  reason: "",
};

function MinistryHospitals({ setActivePage, showToast }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ activeCount: 0, inactiveCount: 0, governorates: [], types: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [governorateFilter, setGovernorateFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [reviewState, setReviewState] = useState({ mode: "", record: null, values: initialReviewState });
  const [snapshotState, setSnapshotState] = useState({
    isOpen: false,
    record: null,
    loading: false,
    error: false,
    data: null,
  });

  // Oversight Tabbed Dashboard State (Lazy Loading & Caching)
  const [activeTab, setActiveTab] = useState("overview");
  const [reportsDateRange, setReportsDateRange] = useState({ from: "", to: "" });
  const [cachedData, setCachedData] = useState({
    overview: null,
    infrastructure: null,
    operations: null,
    reports: null,
  });
  const [tabLoading, setTabLoading] = useState({
    overview: false,
    infrastructure: false,
    operations: false,
    reports: false,
  });
  const [tabError, setTabError] = useState({
    overview: false,
    infrastructure: false,
    operations: false,
    reports: false,
  });


  const loadHospitals = async () => {
    const hasRecords = records.length > 0;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetchMinistryHospitals({
        page,
        pageSize: 8,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        governorate: governorateFilter,
      });

      setRecords(response.items);
      setSummary(response.summary);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (fetchError) {
      console.error("Failed to load ministry hospitals:", fetchError);
      const message = formatApiError(fetchError, "تعذر تحميل سجل المنشآت من الخادم.");
      setErrorMessage(message);
      if (hasRecords) {
        showToast?.(message, "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, [page, searchTerm, statusFilter, typeFilter, governorateFilter]);

  const statCards = useMemo(() => ([
    { id: "total", label: "إجمالي المنشآت", value: totalCount, icon: <FaHospital /> },
    { id: "active", label: "المنشآت النشطة", value: summary.activeCount || 0, icon: <FaBuildingCircleCheck />, accent: "var(--accent-emerald)" },
    { id: "inactive", label: "المنشآت المتوقفة", value: summary.inactiveCount || 0, icon: <FaTriangleExclamation />, accent: "var(--accent-red)" },
    { id: "governorates", label: "المحافظات المغطاة", value: summary.governorates?.length || 0, icon: <FaMapLocationDot />, accent: "var(--accent-purple)" },
  ]), [summary, totalCount]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    const location = record.location || {};

    setEditingRecord(record);
    setFormState({
      name: record.name,
      type: record.rawType === null || record.rawType === undefined ? "" : String(record.rawType),
      governorate: record.rawGovernorate === null || record.rawGovernorate === undefined ? "" : String(record.rawGovernorate),
      phone: record.phone === "-" ? "" : record.phone,
      locationType: location.locationType ?? "",
      country: location.country || "Egypt",
      region: location.region ?? "",
      city: location.city || "",
      district: location.district || "",
      street: location.street || "",
      buildingNumber: location.buildingNumber || "",
      floor: location.floor || "",
      apartmentNumber: location.apartmentNumber || "",
      landmark: location.landmark || "",
      addressDescription: location.addressDescription || "",
    });
    setIsModalOpen(true);
  };

  const loadTabData = async (tabName, facilityId, forceRefresh = false) => {
    if (!facilityId) return;
    if (!forceRefresh && cachedData[tabName]) return; // Use cache

    setTabLoading(prev => ({ ...prev, [tabName]: true }));
    setTabError(prev => ({ ...prev, [tabName]: false }));

    try {
      let data = null;
      if (tabName === "overview") {
        const [analyticsRes, deptsRes] = await Promise.all([
          api.get(`/api/v1/facilities/${facilityId}/analytics`),
          api.get(`/api/v1/facilities/${facilityId}/departments`, { params: { PageSize: 5 } }),
        ]);
        data = {
          analytics: analyticsRes.data?.data || {},
          departments: deptsRes.data?.data?.items || [],
        };
      } else if (tabName === "infrastructure") {
        const [deptsRes, roomsRes, bedsRes] = await Promise.all([
          api.get(`/api/v1/facilities/${facilityId}/departments`, { params: { PageSize: 100 } }),
          api.get(`/api/v1/facilities/${facilityId}/rooms`),
          api.get(`/api/v1/facilities/${facilityId}/beds`, { params: { PageSize: 100 } }),
        ]);
        data = {
          departments: deptsRes.data?.data?.items || [],
          rooms: roomsRes.data?.data || [],
          beds: bedsRes.data?.data?.items || [],
        };
      } else if (tabName === "operations") {
        const [admissionsRes, operationsRes] = await Promise.all([
          api.get(`/api/v1/facilities/${facilityId}/admissions`, { params: { PageSize: 100 } }),
          api.get(`/api/v1/facilities/${facilityId}/operations`, { params: { PageSize: 100 } }),
        ]);
        data = {
          admissions: admissionsRes.data?.data?.items || [],
          operations: operationsRes.data?.data?.items || [],
        };
      } else if (tabName === "reports") {
        const reportsRes = await fetchMinistryFacilityReports(facilityId, {
          from: reportsDateRange.from,
          to: reportsDateRange.to,
        });
        data = reportsRes;
      }

      setCachedData(prev => ({ ...prev, [tabName]: data }));
    } catch (err) {
      console.error(`Failed to load data for tab ${tabName}:`, err);
      setTabError(prev => ({ ...prev, [tabName]: true }));
    } finally {
      setTabLoading(prev => ({ ...prev, [tabName]: false }));
    }
  };

  const openSnapshotModal = async (record) => {
    // Reset cache and tab states for the new modal session
    setCachedData({ overview: null, infrastructure: null, operations: null, reports: null });
    setTabLoading({ overview: false, infrastructure: false, operations: false, reports: false });
    setTabError({ overview: false, infrastructure: false, operations: false, reports: false });
    setReportsDateRange({ from: "", to: "" });
    setActiveTab("overview");

    setSnapshotState({
      isOpen: true,
      record,
      loading: false,
      error: false,
      data: null,
    });

    // Load Overview data immediately
    loadTabData("overview", record.id);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.name.trim() || !formState.type.trim() || !formState.governorate.trim()) {
      showToast?.("يرجى إدخال اسم المنشأة ورقم النوع ورقم المحافظة.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      if (editingRecord) {
        await updateMinistryHospital(editingRecord.id, {
          ...formState,
          isActive: editingRecord.isActive,
        });
        showToast?.(`تم تحديث بيانات ${formState.name} بنجاح.`, "success");
      } else {
        await createMinistryHospital(formState);
        showToast?.(`تمت إضافة ${formState.name} إلى سجل المنشآت.`, "success");
      }

      setIsModalOpen(false);
      setFormState(initialFormState);
      await loadHospitals();
    } catch (submitError) {
      console.error("Failed to submit facility:", submitError);
      showToast?.(formatApiError(submitError, "تعذر حفظ بيانات المنشأة."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewState.record) {
      return;
    }

    setSubmitting(true);

    try {
      if (reviewState.mode === "approve") {
        await approveMinistryHospital(reviewState.record.id, reviewState.values);
        showToast?.(`تم إرسال قرار الاعتماد للمنشأة ${reviewState.record.name}.`, "success");
      } else {
        if (!reviewState.values.reason.trim()) {
          showToast?.("يرجى إدخال سبب الإيقاف أولاً.", "warning");
          setSubmitting(false);
          return;
        }

        await suspendMinistryHospital(reviewState.record.id, reviewState.values.reason);
        showToast?.(`تم إرسال قرار الإيقاف للمنشأة ${reviewState.record.name}.`, "success");
      }

      setReviewState({ mode: "", record: null, values: initialReviewState });
      await loadHospitals();
    } catch (submitError) {
      console.error("Failed to submit facility review action:", submitError);
      showToast?.(formatApiError(submitError, "تعذر تنفيذ الإجراء على المنشأة."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCurrentRows = () => {
    exportRowsToCsv(
      "ministry-facilities.csv",
      [
        { key: "name", label: "اسم المنشأة" },
        { key: "type", label: "النوع" },
        { key: "governorate", label: "المحافظة" },
        { key: "phone", label: "الهاتف" },
        { key: "statusLabel", label: "الحالة" },
        { key: "createdAt", label: "تاريخ الإضافة" },
      ],
      records
    );
    showToast?.("تم تصدير سجل المنشآت الحالي.", "success");
  };

  const renderPreviewLines = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <MinistryDataState isEmpty emptyText="لا توجد بيانات متاحة لهذا القسم." />;
    }

    return (
      <div style={{ display: "grid", gap: "10px" }}>
        {items.slice(0, 4).map((item, index) => {
          const lines = buildDisplayLines(item).slice(0, 4);

          return (
            <div
              key={`${index}-${lines.join("-")}`}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                background: "#f8fafc",
                display: "grid",
                gap: "6px",
              }}
            >
              {lines.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>لا توجد تفاصيل قابلة للعرض.</span>
              ) : (
                lines.map((line) => (
                  <span key={line} style={{ fontSize: "12px", color: "var(--text-dark)" }}>
                    {line}
                  </span>
                ))
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="ministryHospitalsPage" className="page-content active">
      <MinistryPageHeader
        title="المنشآت الصحية"
        description="إدارة قائمة المنشآت واعتمادها ومتابعة بيانات التشغيل والرقابة الميدانية من لوحة الوزارة"
      />

      <div className="filters-toolbar ministry-toolbar">
        <button type="button" className="btn" onClick={openCreateModal}>
          <FaPlus />
          إضافة منشأة
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportCurrentRows}>
          <FaFileExport />
          تصدير
        </button>
        <div className="ministry-filter-control">
          <select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
            <option value="all">كل الحالة</option>
            <option value="active">نشط</option>
            <option value="inactive">متوقف</option>
          </select>
        </div>
        <div className="ministry-filter-control">
          <select value={typeFilter} onChange={(event) => { setPage(1); setTypeFilter(event.target.value); }}>
            <option value="all">كل الأنواع</option>
            {summary.types?.map((type) => (
              <option key={String(type.value)} value={String(type.value)}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="ministry-filter-control">
          <select value={governorateFilter} onChange={(event) => { setPage(1); setGovernorateFilter(event.target.value); }}>
            <option value="all">كل المحافظات</option>
            {summary.governorates?.map((governorate) => (
              <option key={String(governorate.value)} value={String(governorate.value)}>{governorate.label}</option>
            ))}
          </select>
        </div>
        <div className="ministry-search-control">
          <FaMagnifyingGlass className="ministry-search-icon" />
          <input
            type="text"
            placeholder="بحث باسم المنشأة أو الهاتف..."
            value={searchTerm}
            onChange={(event) => {
              setPage(1);
              setSearchTerm(event.target.value);
            }}
          />
        </div>
      </div>

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
        <div className="box-header">
          <h2 style={{ marginBottom: 0 }}>قائمة المنشآت</h2>
          <button type="button" className="btn btn-secondary" onClick={loadHospitals}>
            <FaRotate />
            تحديث
          </button>
        </div>

        {loading ? (
          <MinistryDataState loading loadingText="جارٍ تحميل سجل المنشآت..." />
        ) : errorMessage ? (
          <MinistryDataState error errorText={errorMessage} onRetry={loadHospitals} />
        ) : records.length === 0 ? (
          <MinistryDataState isEmpty emptyText="لا توجد منشآت مطابقة للفلاتر الحالية." />
        ) : (
          <>
            <div className="table-container">
              <table style={{ overflow: "visible" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", width: "70px" }}>#</th>
                    <th>اسم المنشأة</th>
                    <th>النوع</th>
                    <th>المحافظة</th>
                    <th style={{ textAlign: "center" }}>الهاتف</th>
                    <th style={{ textAlign: "center" }}>الحالة</th>
                    <th style={{ textAlign: "center" }}>تاريخ الإضافة</th>
                    <th style={{ textAlign: "center", width: "90px" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * 8 + index + 1}</td>
                      <td style={{ color: "var(--primary)", fontWeight: "700" }}>{record.name}</td>
                      <td>{record.type}</td>
                      <td>{record.governorate}</td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{record.phone}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={record.isActive ? "status" : "danger"}>{record.statusLabel}</span>
                      </td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{record.createdAt}</td>
                      <td style={{ textAlign: "center", position: "relative" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", minWidth: "auto" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveMenuId((current) => current === record.id ? null : record.id);
                          }}
                        >
                          <FaEllipsisVertical />
                        </button>
                        <MinistryActionMenu
                          isOpen={activeMenuId === record.id}
                          onClose={() => setActiveMenuId(null)}
                          items={[
                            {
                              label: "عرض المتابعة",
                              icon: <FaEye />,
                              onClick: () => openSnapshotModal(record),
                            },
                            {
                              label: "تعديل البيانات",
                              icon: <FaPenToSquare />,
                              onClick: () => openEditModal(record),
                            },
                            {
                              label: "اعتماد أو رفض",
                              icon: <FaBuildingCircleCheck />,
                              onClick: () => setReviewState({
                                mode: "approve",
                                record,
                                values: { ...initialReviewState, approved: true },
                              }),
                            },
                            {
                              label: "إيقاف المنشأة",
                              icon: <FaTriangleExclamation />,
                              onClick: () => setReviewState({
                                mode: "suspend",
                                record,
                                values: initialReviewState,
                              }),
                            },
                            {
                              label: "عرض الأقسام",
                              icon: <FaSitemap />,
                              onClick: () => {
                                setActivePage("departments");
                                showToast?.(`تم فتح صفحة الأقسام لمتابعة ${record.name}.`, "info");
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
              totalCount={totalCount}
              currentCount={records.length}
              label="منشأة"
              onChange={setPage}
            />
          </>
        )}
      </div>

      {isModalOpen ? (
        <MinistryFormModal
          title={editingRecord ? "تعديل بيانات المنشأة" : "إضافة منشأة جديدة"}
          subtitle="حقول الكتابة تعتمد على عقد الـ API الموثق: الاسم ورقم النوع ورقم المحافظة وبيانات الموقع"
          onClose={() => setIsModalOpen(false)}
          width="760px"
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label>اسم المنشأة</label>
              <input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label>رقم نوع المنشأة</label>
                <input dir="ltr" value={formState.type} onChange={(event) => setFormState((current) => ({ ...current, type: event.target.value }))} />
              </div>
              <div>
                <label>رقم المحافظة</label>
                <input dir="ltr" value={formState.governorate} onChange={(event) => setFormState((current) => ({ ...current, governorate: event.target.value }))} />
              </div>
              <div>
                <label>الهاتف</label>
                <input dir="ltr" value={formState.phone} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label>رقم نوع الموقع</label>
                <input dir="ltr" value={formState.locationType} onChange={(event) => setFormState((current) => ({ ...current, locationType: event.target.value }))} />
              </div>
              <div>
                <label>الدولة</label>
                <input value={formState.country} onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))} />
              </div>
              <div>
                <label>رقم المنطقة</label>
                <input dir="ltr" value={formState.region} onChange={(event) => setFormState((current) => ({ ...current, region: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label>المدينة</label>
                <input value={formState.city} onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))} />
              </div>
              <div>
                <label>الحي</label>
                <input value={formState.district} onChange={(event) => setFormState((current) => ({ ...current, district: event.target.value }))} />
              </div>
              <div>
                <label>الشارع</label>
                <input value={formState.street} onChange={(event) => setFormState((current) => ({ ...current, street: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label>رقم المبنى</label>
                <input value={formState.buildingNumber} onChange={(event) => setFormState((current) => ({ ...current, buildingNumber: event.target.value }))} />
              </div>
              <div>
                <label>الدور</label>
                <input value={formState.floor} onChange={(event) => setFormState((current) => ({ ...current, floor: event.target.value }))} />
              </div>
              <div>
                <label>رقم الوحدة</label>
                <input value={formState.apartmentNumber} onChange={(event) => setFormState((current) => ({ ...current, apartmentNumber: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label>علامة مميزة</label>
                <input value={formState.landmark} onChange={(event) => setFormState((current) => ({ ...current, landmark: event.target.value }))} />
              </div>
              <div>
                <label>وصف العنوان</label>
                <input value={formState.addressDescription} onChange={(event) => setFormState((current) => ({ ...current, addressDescription: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "6px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : null}
                {editingRecord ? "حفظ التعديلات" : "إضافة المنشأة"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {reviewState.record ? (
        <MinistryFormModal
          title={reviewState.mode === "approve" ? `اعتماد أو رفض ${reviewState.record.name}` : `إيقاف ${reviewState.record.name}`}
          subtitle={reviewState.mode === "approve" ? "هذا الإجراء يستخدم endpoint الاعتماد الرسمي للوزارة." : "هذا الإجراء يستخدم endpoint الإيقاف الرسمي مع سبب واضح."}
          onClose={() => setReviewState({ mode: "", record: null, values: initialReviewState })}
          width="560px"
        >
          <form onSubmit={handleReviewSubmit} style={{ display: "grid", gap: "16px" }}>
            {reviewState.mode === "approve" ? (
              <>
                <div>
                  <label>قرار المراجعة</label>
                  <select
                    value={String(reviewState.values.approved)}
                    onChange={(event) =>
                      setReviewState((current) => ({
                        ...current,
                        values: { ...current.values, approved: event.target.value === "true" },
                      }))
                    }
                  >
                    <option value="true">اعتماد المنشأة</option>
                    <option value="false">رفض الاعتماد</option>
                  </select>
                </div>
                <div>
                  <label>ملاحظات المراجع</label>
                  <textarea
                    rows="4"
                    value={reviewState.values.reviewerNotes}
                    onChange={(event) =>
                      setReviewState((current) => ({
                        ...current,
                        values: { ...current.values, reviewerNotes: event.target.value },
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <div>
                <label>سبب الإيقاف</label>
                <textarea
                  rows="4"
                  value={reviewState.values.reason}
                  onChange={(event) =>
                    setReviewState((current) => ({
                      ...current,
                      values: { ...current.values, reason: event.target.value },
                    }))
                  }
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : null}
                تنفيذ الإجراء
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewState({ mode: "", record: null, values: initialReviewState })}>
                إلغاء
              </button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {snapshotState.isOpen ? (
        <MinistryFormModal
          title={`متابعة ${snapshotState.record?.name || "المنشأة"}`}
          subtitle="لوحة متابعة مركزية لمؤشرات الأداء التشغيلي والرقابي المباشر للمنشأة الصحية"
          onClose={() => setSnapshotState({ isOpen: false, record: null, loading: false, error: false, data: null })}
          width="92%"
        >
          {/* Tab Navigation Row */}
          <div className="ministry-tab-nav" style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            borderBottom: "2px solid var(--border-color)",
            paddingBottom: "10px"
          }}>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: activeTab === "overview" ? "var(--primary)" : "#f1f5f9",
                color: activeTab === "overview" ? "#ffffff" : "var(--text-dark)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px"
              }}
              onClick={() => {
                setActiveTab("overview");
                loadTabData("overview", snapshotState.record.id);
              }}
            >
              <FaChartSimple />
              نظرة عامة والتحليلات
            </button>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: activeTab === "infrastructure" ? "var(--primary)" : "#f1f5f9",
                color: activeTab === "infrastructure" ? "#ffffff" : "var(--text-dark)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px"
              }}
              onClick={() => {
                setActiveTab("infrastructure");
                loadTabData("infrastructure", snapshotState.record.id);
              }}
            >
              <FaSitemap />
              البنية التحتية والأقسام
            </button>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: activeTab === "operations" ? "var(--primary)" : "#f1f5f9",
                color: activeTab === "operations" ? "#ffffff" : "var(--text-dark)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px"
              }}
              onClick={() => {
                setActiveTab("operations");
                loadTabData("operations", snapshotState.record.id);
              }}
            >
              <FaListCheck />
              العمليات وحالات الدخول
            </button>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: activeTab === "reports" ? "var(--primary)" : "#f1f5f9",
                color: activeTab === "reports" ? "#ffffff" : "var(--text-dark)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px"
              }}
              onClick={() => {
                setActiveTab("reports");
                loadTabData("reports", snapshotState.record.id);
              }}
            >
              <FaClipboardList />
              التقارير الرقابية
            </button>
          </div>

          {/* Tab Content Areas */}
          {activeTab === "overview" && (
            <div>
              {tabLoading.overview ? (
                <MinistryDataState loading loadingText="جارٍ تحميل التحليلات ونظرة عامة..." />
              ) : tabError.overview ? (
                <MinistryDataState error errorText="فشل تحميل التحليلات لهذه المنشأة." onRetry={() => loadTabData("overview", snapshotState.record.id, true)} />
              ) : !cachedData.overview ? (
                <MinistryDataState isEmpty emptyText="لا توجد بيانات متاحة." />
              ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                  {/* Summary Cards */}
                  <div className="cards" style={{ marginBottom: 0 }}>
                    <MinistryStatCard
                      label="الأقسام المفعلة"
                      value={cachedData.overview.analytics?.departmentCount ?? cachedData.overview.departments?.length ?? 0}
                      icon={<FaSitemap />}
                    />
                    <MinistryStatCard
                      label="الطاقة الاستيعابية للأطباء"
                      value={cachedData.overview.analytics?.doctorCount ?? 0}
                      icon={<FaUserDoctor />}
                      accent="var(--accent-purple)"
                    />
                    <MinistryStatCard
                      label="المرضى المسجلين بالمنشأة"
                      value={cachedData.overview.analytics?.patientCount ?? 0}
                      icon={<FaHospital />}
                      accent="var(--accent-emerald)"
                    />
                    <MinistryStatCard
                      label="معدل إشغال الأسرة"
                      value={`${cachedData.overview.analytics?.bedOccupancyRate ?? 0}%`}
                      icon={<FaBed />}
                      accent="var(--accent-red)"
                    />
                  </div>

                  {/* Analytics Details Dashboard View */}
                  <div className="box" style={{ margin: 0 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)" }}>
                      <FaChartSimple />
                      مؤشرات الأداء والتحليلات التفصيلية
                    </h2>
                    
                    {/* Bed Occupancy Rate Progress Indicator */}
                    <div style={{
                      background: "#f8fafc",
                      padding: "20px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      marginBottom: "16px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>
                        <span>نسبة إشغال الأسرة الحالية</span>
                        <span style={{ color: "var(--accent-red)" }}>{cachedData.overview.analytics?.bedOccupancyRate ?? 0}%</span>
                      </div>
                      <div style={{ background: "#e2e8f0", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{
                          background: "linear-gradient(90deg, var(--secondary) 0%, var(--accent-red) 100%)",
                          height: "100%",
                          width: `${Math.min(100, cachedData.overview.analytics?.bedOccupancyRate ?? 0)}%`
                        }}></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                        <span>الأسرة المتاحة: {cachedData.overview.analytics?.availableBeds ?? 0}</span>
                        <span>الأسرة الشاغرة: {cachedData.overview.analytics?.occupiedBeds ?? 0}</span>
                        <span>إجمالي الأسرة: {cachedData.overview.analytics?.totalBeds ?? 0}</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--text-dark)" }}>معدل النشاط اليومي</h3>
                        <div style={{ display: "grid", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>دخل اليوم:</span>
                            <strong>{cachedData.overview.analytics?.todaysAdmissions ?? 0} حالة</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>خرج اليوم:</span>
                            <strong>{cachedData.overview.analytics?.todaysDischarges ?? 0} حالة</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--text-dark)" }}>بيانات عامة عن المنشأة</h3>
                        <div style={{ display: "grid", gap: "8px" }}>
                          {buildDisplayLines(cachedData.overview.analytics).slice(0, 4).map((line) => (
                            <div key={line} style={{ fontSize: "12px", color: "var(--text-dark)" }}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "infrastructure" && (
            <div>
              {tabLoading.infrastructure ? (
                <MinistryDataState loading loadingText="جارٍ تحميل الأقسام والغرف والأسرة..." />
              ) : tabError.infrastructure ? (
                <MinistryDataState error errorText="فشل تحميل البنية التحتية للمنشأة." onRetry={() => loadTabData("infrastructure", snapshotState.record.id, true)} />
              ) : !cachedData.infrastructure ? (
                <MinistryDataState isEmpty emptyText="لا توجد بيانات متاحة." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                  {/* Departments List */}
                  <div className="box" style={{ margin: 0 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaSitemap />
                      الأقسام الطبية بالمنشأة
                    </h2>
                    {cachedData.infrastructure.departments?.length === 0 ? (
                      <MinistryDataState isEmpty emptyText="لا توجد أقسام مسجلة بالمنشأة." />
                    ) : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>القسم</th>
                              <th>التخصص</th>
                              <th style={{ textAlign: "center" }}>الأطباء</th>
                              <th style={{ textAlign: "center" }}>الأسرة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cachedData.infrastructure.departments.map((dept) => (
                              <tr key={dept.medicalDepartmentId || dept.id}>
                                <td style={{ fontWeight: "bold", color: "var(--primary)" }}>{dept.name}</td>
                                <td>{dept.specialtyName || dept.specialty || "-"}</td>
                                <td style={{ textAlign: "center" }}>{dept.doctorsCount ?? 0}</td>
                                <td style={{ textAlign: "center" }}>{dept.bedsCount ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Rooms & Beds */}
                  <div className="box" style={{ margin: 0 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaBed />
                      توزيع الغرف والأسرة
                    </h2>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {/* Room summaries */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ padding: "4px 8px", background: "var(--accent-emerald-light)", color: "var(--accent-emerald)", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: "bold" }}>
                          الغرف الكلية: {cachedData.infrastructure.rooms?.length ?? 0}
                        </span>
                        <span style={{ padding: "4px 8px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: "bold" }}>
                          الأسرة الكلية: {cachedData.infrastructure.beds?.length ?? 0}
                        </span>
                      </div>

                      {cachedData.infrastructure.beds?.length === 0 ? (
                        <MinistryDataState isEmpty emptyText="لا توجد أسرة مسجلة." />
                      ) : (
                        <div style={{ display: "grid", gap: "10px", maxHeight: "320px", overflowY: "auto" }}>
                          {cachedData.infrastructure.beds.map((bed) => (
                            <div
                              key={bed.id}
                              style={{
                                padding: "10px 14px",
                                background: "#f8fafc",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-sm)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <div>
                                <strong style={{ color: "var(--text-dark)", fontSize: "13px" }}>سرير رقم {bed.code || bed.number || bed.id.slice(0, 8)}</strong>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                  قسم: {bed.medicalDepartmentName || "عام"}
                                </div>
                              </div>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                backgroundColor: bed.isOccupied ? "var(--accent-red-light)" : "var(--accent-emerald-light)",
                                color: bed.isOccupied ? "var(--accent-red)" : "var(--accent-emerald)"
                              }}>
                                {bed.isOccupied ? "مشغول" : "متاح"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "operations" && (
            <div>
              {tabLoading.operations ? (
                <MinistryDataState loading loadingText="جارٍ تحميل الدخول والعمليات الجارية..." />
              ) : tabError.operations ? (
                <MinistryDataState error errorText="فشل تحميل بيانات العمليات للمنشأة." onRetry={() => loadTabData("operations", snapshotState.record.id, true)} />
              ) : !cachedData.operations ? (
                <MinistryDataState isEmpty emptyText="لا توجد بيانات متاحة." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>
                  {/* Active Admissions */}
                  <div className="box" style={{ margin: 0 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaHospital />
                      حالات الدخول النشطة
                    </h2>
                    {cachedData.operations.admissions?.length === 0 ? (
                      <MinistryDataState isEmpty emptyText="لا توجد حالات دخول حالية." />
                    ) : (
                      <div style={{ display: "grid", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                        {cachedData.operations.admissions.map((admission) => (
                          <div
                            key={admission.id}
                            style={{
                              padding: "12px",
                              background: "#f8fafc",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-sm)",
                              display: "grid",
                              gap: "4px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "13px", color: "var(--primary)" }}>{admission.patientName || "مريض"}</strong>
                              <span style={{
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: "bold",
                                backgroundColor: admission.status === 1 || admission.status === "Active" ? "var(--accent-emerald-light)" : "var(--text-muted)",
                                color: admission.status === 1 || admission.status === "Active" ? "var(--accent-emerald)" : "#ffffff"
                              }}>
                                {admission.status === 1 || admission.status === "Active" ? "نشط" : "منتهي"}
                              </span>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              تاريخ الدخول: {formatDate(admission.admissionDate || admission.createdAt)}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-dark)" }}>
                              السبب الرئيسي: {admission.reason || "غير محدد"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operations */}
                  <div className="box" style={{ margin: 0 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaRotate />
                      العمليات والمتابعات الجراحية
                    </h2>
                    {cachedData.operations.operations?.length === 0 ? (
                      <MinistryDataState isEmpty emptyText="لا توجد عمليات مسجلة حالياً." />
                    ) : (
                      <div className="table-container" style={{ maxHeight: "380px", overflowY: "auto" }}>
                        <table>
                          <thead>
                            <tr>
                              <th>العملية</th>
                              <th>الطبيب</th>
                              <th style={{ textAlign: "center" }}>الحالة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cachedData.operations.operations.map((op) => (
                              <tr key={op.id}>
                                <td style={{ fontSize: "12px" }}>
                                  <div style={{ fontWeight: "bold" }}>{op.name || op.type || "عملية جراحية"}</div>
                                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>موعد: {formatDate(op.scheduledDate || op.createdAt)}</span>
                                </td>
                                <td>{op.doctorName || "طبيب ممارس"}</td>
                                <td style={{ textAlign: "center" }}>
                                  <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "10px",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    backgroundColor: op.status === 2 || op.status === "Completed" ? "var(--accent-emerald-light)" : "var(--accent-amber-light)",
                                    color: op.status === 2 || op.status === "Completed" ? "var(--accent-emerald)" : "var(--accent-amber)"
                                  }}>
                                    {op.status === 2 || op.status === "Completed" ? "مكتمل" : "تحت التنفيذ"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              {/* Filter Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadTabData("reports", snapshotState.record.id, true);
                }}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  alignItems: "flex-end"
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>تاريخ البداية (من)</label>
                  <input
                    type="date"
                    value={reportsDateRange.from}
                    onChange={(e) => setReportsDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>تاريخ النهاية (إلى)</label>
                  <input
                    type="date"
                    value={reportsDateRange.to}
                    onChange={(e) => setReportsDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn" style={{ padding: "10px 20px" }}>تصفية التقارير</button>
              </form>

              {tabLoading.reports ? (
                <MinistryDataState loading loadingText="جارٍ إنشاء وتحميل التقارير الرقابية..." />
              ) : tabError.reports ? (
                <MinistryDataState error errorText="فشل تحميل أو إنشاء تقارير الأداء لهذه الفترة." onRetry={() => loadTabData("reports", snapshotState.record.id, true)} />
              ) : !cachedData.reports || cachedData.reports.reports?.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لا توجد تقارير رقابية متاحة لهذه الفترة." />
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {cachedData.reports.reports.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        padding: "16px",
                        background: "#f8fafc",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        display: "grid",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", color: "var(--primary)" }}>{report.title}</h3>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>الفترة: {report.period}</span>
                      </div>
                      <div style={{ display: "grid", gap: "6px" }}>
                        {report.content.map((line) => (
                          <div key={line} style={{ fontSize: "12px", color: "var(--text-dark)" }}>
                            {line}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: "12px", padding: "6px 12px", minWidth: "auto" }}
                          onClick={() => {
                            exportRowsToCsv(
                              `${report.title}.csv`,
                              Object.keys(report.raw || {}).map(key => ({ key, label: key })),
                              [report.raw || {}]
                            );
                            showToast?.("تم تصدير التقرير بنجاح.", "success");
                          }}
                        >
                          <FaFileExport />
                          تصدير بصيغة CSV
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </MinistryFormModal>
      ) : null}

    </div>
  );
}

export default MinistryHospitals;
