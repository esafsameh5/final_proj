import React, { useEffect, useMemo, useState } from "react";
import {
  FaBedPulse,
  FaBookMedical,
  FaBuildingCircleCheck,
  FaCapsules,
  FaFileExport,
  FaHospital,
  FaMagnifyingGlass,
  FaPlus,
  FaSpinner,
  FaUserDoctor,
} from "react-icons/fa6";
import MinistryDataState from "../../components/ministry/MinistryDataState";
import MinistryFormModal from "../../components/ministry/MinistryFormModal";
import MinistryPageHeader from "../../components/ministry/MinistryPageHeader";
import MinistryPagination from "../../components/ministry/MinistryPagination";
import MinistryStatCard from "../../components/ministry/MinistryStatCard";
import {
  createIcd10CatalogEntry,
  createInsuranceProvider,
  createMedicationCatalogEntry,
  exportRowsToCsv,
  fetchIcd10Catalog,
  fetchMedicationCatalog,
  fetchMinistryDepartments,
  formatApiError,
} from "../../services/ministryService";

const initialIcdForm = {
  code: "",
  nameAr: "",
  nameEn: "",
  description: "",
};

const initialMedicationForm = {
  tradeName: "",
  scientificName: "",
  code: "",
  strength: "",
  form: "",
  manufacturer: "",
  isControlled: false,
};

const initialInsuranceForm = {
  name: "",
  code: "",
  phone: "",
};

function MinistryDepartments({ showToast }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ activeCount: 0, inactiveCount: 0, facilityOptions: [], specialties: [], totalDoctors: 0, totalBeds: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");

  const [catalogLoading, setCatalogLoading] = useState(false);
  const [icdSearch, setIcdSearch] = useState("");
  const [icdRows, setIcdRows] = useState([]);
  const [icdError, setIcdError] = useState("");
  const [medicationSearch, setMedicationSearch] = useState("");
  const [medicationRows, setMedicationRows] = useState([]);
  const [medicationError, setMedicationError] = useState("");
  const [isIcdModalOpen, setIsIcdModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [icdForm, setIcdForm] = useState(initialIcdForm);
  const [medicationForm, setMedicationForm] = useState(initialMedicationForm);
  const [medicationValidationErrors, setMedicationValidationErrors] = useState("");
  const [insuranceForm, setInsuranceForm] = useState(initialInsuranceForm);
  const [submitting, setSubmitting] = useState(false);

  const loadDepartments = async () => {
    const hasRecords = records.length > 0;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetchMinistryDepartments({
        page,
        pageSize: 8,
        search: searchTerm,
        status: statusFilter,
        specialty: specialtyFilter,
        facilityId: facilityFilter,
      });

      setRecords(response.items);
      setSummary(response.summary);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (fetchError) {
      console.error("Failed to load ministry departments:", fetchError);
      const message = formatApiError(fetchError, "تعذر تحميل بيانات الأقسام من الخادم.");
      setErrorMessage(message);
      if (hasRecords) {
        showToast?.(message, "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogs = async () => {
    setCatalogLoading(true);
    setIcdError("");
    setMedicationError("");

    const [icdResult, medicationResult] = await Promise.allSettled([
      fetchIcd10Catalog({ page: 1, pageSize: 6, search: icdSearch }),
      fetchMedicationCatalog({ page: 1, pageSize: 6, search: medicationSearch }),
    ]);

    if (icdResult.status === "fulfilled") {
      setIcdRows(icdResult.value.items);
    } else {
      console.error("Failed to load ICD10 catalog:", icdResult.reason);
      setIcdError(formatApiError(icdResult.reason, "تعذر تحميل كتالوج ICD-10."));
    }

    if (medicationResult.status === "fulfilled") {
      setMedicationRows(medicationResult.value.items);
    } else {
      console.error("Failed to load medication catalog:", medicationResult.reason);
      setMedicationError(formatApiError(medicationResult.reason, "تعذر تحميل كتالوج الأدوية."));
    }

    setCatalogLoading(false);
  };

  useEffect(() => {
    loadDepartments();
  }, [page, searchTerm, statusFilter, specialtyFilter, facilityFilter]);

  useEffect(() => {
    loadCatalogs();
  }, [icdSearch, medicationSearch]);

  const statCards = useMemo(() => ([
    { id: "total", label: "إجمالي الأقسام", value: totalCount, icon: <FaHospital /> },
    { id: "active", label: "الأقسام النشطة", value: summary.activeCount || 0, icon: <FaBuildingCircleCheck />, accent: "var(--accent-emerald)" },
    { id: "doctors", label: "إجمالي الأطباء المرتبطين", value: summary.totalDoctors || 0, icon: <FaUserDoctor />, accent: "var(--primary)" },
    { id: "beds", label: "إجمالي الأسرة", value: summary.totalBeds || 0, icon: <FaBedPulse />, accent: "var(--accent-purple)" },
  ]), [summary, totalCount]);

  const submitIcd10 = async (event) => {
    event.preventDefault();

    if (!icdForm.code.trim() || !icdForm.nameAr.trim() || !icdForm.nameEn.trim()) {
      showToast?.("يرجى استكمال بيانات كود ICD-10 أولاً.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await createIcd10CatalogEntry(icdForm);
      setIsIcdModalOpen(false);
      setIcdForm(initialIcdForm);
      await loadCatalogs();
      showToast?.("تمت إضافة كود ICD-10 بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to create ICD10 entry:", submitError);
      showToast?.(formatApiError(submitError, "تعذر إضافة كود ICD-10."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const submitMedication = async (event) => {
    event.preventDefault();
    setMedicationValidationErrors("");

    if (!medicationForm.tradeName.trim()) {
      setMedicationValidationErrors("الاسم التجاري للمستحضر مطلوب.");
      return;
    }
    if (!medicationForm.scientificName.trim()) {
      setMedicationValidationErrors("الاسم العلمي للمستحضر مطلوب.");
      return;
    }
    if (!medicationForm.code.trim()) {
      setMedicationValidationErrors("كود الدواء الموحد مطلوب.");
      return;
    }

    setSubmitting(true);

    try {
      await createMedicationCatalogEntry(medicationForm);
      setIsMedicationModalOpen(false);
      setMedicationForm(initialMedicationForm);
      setMedicationValidationErrors("");
      await loadCatalogs();
      showToast?.("تمت إضافة الدواء إلى الكتالوج بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to create medication entry:", submitError);
      setMedicationValidationErrors(formatApiError(submitError, "تعذر إضافة الدواء إلى الكتالوج. يرجى التحقق من المدخلات والمحاولة لاحقاً."));
    } finally {
      setSubmitting(false);
    }
  };

  const submitInsuranceProvider = async (event) => {
    event.preventDefault();

    if (!insuranceForm.name.trim() || !insuranceForm.code.trim()) {
      showToast?.("يرجى إدخال اسم مزود التأمين وكوده.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await createInsuranceProvider(insuranceForm);
      setInsuranceForm(initialInsuranceForm);
      showToast?.("تمت إضافة مزود التأمين بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to create insurance provider:", submitError);
      showToast?.(formatApiError(submitError, "تعذر إضافة مزود التأمين."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCurrentRows = () => {
    exportRowsToCsv(
      "ministry-departments.csv",
      [
        { key: "name", label: "اسم القسم" },
        { key: "specialty", label: "التخصص" },
        { key: "hospital", label: "المنشأة" },
        { key: "headDoctor", label: "رئيس القسم" },
        { key: "doctorsCount", label: "عدد الأطباء" },
        { key: "statusLabel", label: "الحالة" },
      ],
      records
    );
    showToast?.("تم تصدير سجل الأقسام الحالي.", "success");
  };

  return (
    <div id="ministryDepartmentsPage" className="page-content active">
      <MinistryPageHeader
        title="الأقسام والكتالوجات"
        description="متابعة أقسام المنشآت الصحيّة مع إدارة مرجع ICD-10 وكتالوج الأدوية وبيانات مزودي التأمين"
      />

      <div className="filters-toolbar ministry-toolbar">
        <button type="button" className="btn btn-secondary" onClick={exportCurrentRows}>
          <FaFileExport />
          تصدير الأقسام
        </button>
        <button type="button" className="btn" onClick={() => setIsIcdModalOpen(true)}>
          <FaBookMedical />
          إضافة ICD-10
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setMedicationValidationErrors("");
            setIsMedicationModalOpen(true);
          }}
          style={{ background: "var(--accent-purple)", color: "white", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FaCapsules />
          إضافة دواء
        </button>
        <div className="ministry-filter-control">
          <select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
            <option value="all">كل الحالة</option>
            <option value="active">نشط</option>
            <option value="inactive">متوقف</option>
          </select>
        </div>
        <div className="ministry-filter-control">
          <select value={facilityFilter} onChange={(event) => { setPage(1); setFacilityFilter(event.target.value); }}>
            <option value="all">كل المنشآت</option>
            {summary.facilityOptions?.map((facility) => (
              <option key={facility.value} value={facility.value}>{facility.label}</option>
            ))}
          </select>
        </div>
        <div className="ministry-filter-control">
          <select value={specialtyFilter} onChange={(event) => { setPage(1); setSpecialtyFilter(event.target.value); }}>
            <option value="all">كل التخصصات</option>
            {summary.specialties?.map((specialty) => (
              <option key={String(specialty.value)} value={String(specialty.value)}>{specialty.label}</option>
            ))}
          </select>
        </div>
        <div className="ministry-search-control">
          <FaMagnifyingGlass className="ministry-search-icon" />
          <input
            type="text"
            placeholder="بحث باسم القسم أو المنشأة..."
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

      <div className="box">
        <h2>سجل الأقسام الطبية</h2>

        {loading ? (
          <MinistryDataState loading loadingText="جارٍ تحميل سجل الأقسام..." />
        ) : errorMessage ? (
          <MinistryDataState error errorText={errorMessage} onRetry={loadDepartments} />
        ) : records.length === 0 ? (
          <MinistryDataState isEmpty emptyText="لا توجد أقسام مطابقة للفلاتر الحالية." />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", width: "70px" }}>#</th>
                    <th>اسم القسم</th>
                    <th>التخصص</th>
                    <th>المنشأة</th>
                    <th>رئيس القسم</th>
                    <th style={{ textAlign: "center" }}>عدد الأطباء</th>
                    <th style={{ textAlign: "center" }}>عدد الأسرة</th>
                    <th style={{ textAlign: "center" }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * 8 + index + 1}</td>
                      <td style={{ color: "var(--primary)", fontWeight: "700" }}>{record.name}</td>
                      <td>{record.specialty}</td>
                      <td>{record.hospital}</td>
                      <td>{record.headDoctor}</td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{record.doctorsCount}</td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{record.bedsCount}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={record.isActive ? "status" : "danger"}>{record.statusLabel}</span>
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
              label="قسم"
              onChange={setPage}
            />
          </>
        )}
      </div>

      <div className="content" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "25px" }}>
        <div className="box">
          <div className="box-header">
            <h2 style={{ marginBottom: 0 }}>كتالوج ICD-10</h2>
            <div className="ministry-search-control" style={{ minWidth: "220px" }}>
              <FaMagnifyingGlass className="ministry-search-icon" />
              <input value={icdSearch} onChange={(event) => setIcdSearch(event.target.value)} placeholder="بحث في الأكواد..." />
            </div>
          </div>
          {icdError ? (
            <div style={{ marginBottom: "12px", color: "var(--accent-red)", fontSize: "12px" }}>
              {icdError}
            </div>
          ) : null}
          {catalogLoading && icdRows.length === 0 ? (
            <MinistryDataState loading loadingText="جارٍ تحميل أكواد ICD-10..." />
          ) : icdError && icdRows.length === 0 ? (
            <MinistryDataState error errorText={icdError} onRetry={loadCatalogs} />
          ) : icdRows.length === 0 ? (
            <MinistryDataState isEmpty emptyText="لا توجد نتائج مطابقة في كتالوج ICD-10." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>الاسم بالعربية</th>
                    <th>الاسم بالإنجليزية</th>
                  </tr>
                </thead>
                <tbody>
                  {icdRows.map((row) => (
                    <tr key={row.id || `${row.code}-${row.nameEn}`}>
                      <td style={{ fontFamily: "Outfit", color: "var(--primary)", fontWeight: "700" }}>{row.code}</td>
                      <td>{row.nameAr}</td>
                      <td>{row.nameEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="box">
          <div className="box-header">
            <h2 style={{ marginBottom: 0 }}>كتالوج الأدوية</h2>
            <div className="ministry-search-control" style={{ minWidth: "220px" }}>
              <FaMagnifyingGlass className="ministry-search-icon" />
              <input value={medicationSearch} onChange={(event) => setMedicationSearch(event.target.value)} placeholder="بحث في الأدوية..." />
            </div>
          </div>
          {medicationError ? (
            <div style={{ marginBottom: "12px", color: "var(--accent-red)", fontSize: "12px" }}>
              {medicationError}
            </div>
          ) : null}
          {catalogLoading && medicationRows.length === 0 ? (
            <MinistryDataState loading loadingText="جارٍ تحميل كتالوج الأدوية..." />
          ) : medicationError && medicationRows.length === 0 ? (
            <MinistryDataState error errorText={medicationError} onRetry={loadCatalogs} />
          ) : medicationRows.length === 0 ? (
            <MinistryDataState isEmpty emptyText="لا توجد نتائج مطابقة في كتالوج الأدوية." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>الاسم التجاري</th>
                    <th>الاسم العلمي</th>
                  </tr>
                </thead>
                <tbody>
                  {medicationRows.map((row) => (
                    <tr key={row.id || `${row.code}-${row.nameEn}`}>
                      <td style={{ fontFamily: "Outfit", color: "var(--primary)", fontWeight: "700" }}>{row.code}</td>
                      <td>{row.nameAr}</td>
                      <td>{row.nameEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="box" style={{ marginTop: "25px" }}>
        <h2>إضافة مزود تأمين</h2>
        <form onSubmit={submitInsuranceProvider} style={{ display: "grid", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <input placeholder="اسم الشركة" value={insuranceForm.name} onChange={(event) => setInsuranceForm((current) => ({ ...current, name: event.target.value }))} />
            <input placeholder="الكود" value={insuranceForm.code} onChange={(event) => setInsuranceForm((current) => ({ ...current, code: event.target.value }))} />
            <input placeholder="الهاتف" value={insuranceForm.phone} onChange={(event) => setInsuranceForm((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPlus />}
              إضافة مزود تأمين
            </button>
          </div>
        </form>
      </div>

      {isIcdModalOpen ? (
        <MinistryFormModal
          title="إضافة كود ICD-10"
          subtitle="الحقول هنا تطابق عقد API الموثق للأكواد الطبية"
          onClose={() => setIsIcdModalOpen(false)}
          width="560px"
        >
          <form onSubmit={submitIcd10} style={{ display: "grid", gap: "14px" }}>
            <input placeholder="الكود" value={icdForm.code} onChange={(event) => setIcdForm((current) => ({ ...current, code: event.target.value }))} />
            <input placeholder="الاسم بالعربية" value={icdForm.nameAr} onChange={(event) => setIcdForm((current) => ({ ...current, nameAr: event.target.value }))} />
            <input placeholder="الاسم بالإنجليزية" value={icdForm.nameEn} onChange={(event) => setIcdForm((current) => ({ ...current, nameEn: event.target.value }))} />
            <textarea rows="4" placeholder="الوصف" value={icdForm.description} onChange={(event) => setIcdForm((current) => ({ ...current, description: event.target.value }))} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPlus />}
                حفظ الكود
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsIcdModalOpen(false)}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {isMedicationModalOpen ? (
        <MinistryFormModal
          title="إضافة مستحضر طبي جديد للكتالوج"
          subtitle="تسجيل الأدوية في كتالوج الأدوية الوطني الموحد لتمكين العيادات والمستشفيات من وصفها للمواطنين"
          onClose={() => setIsMedicationModalOpen(false)}
          width="680px"
        >
          {medicationValidationErrors && (
            <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontWeight: "bold", fontSize: "13.5px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>⚠️</span>
              <span>{medicationValidationErrors}</span>
            </div>
          )}

          <form onSubmit={submitMedication} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "10px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14.5px", color: "var(--primary)", fontWeight: "700" }}>📋 المعلومات الأساسية للمستحضر</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>الاسم التجاري <span style={{ color: "red" }}>*</span></label>
                  <input 
                    placeholder="مثال: Panadol Joint 665mg" 
                    value={medicationForm.tradeName} 
                    onChange={(event) => setMedicationForm((current) => ({ ...current, tradeName: event.target.value }))} 
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>الاسم التجاري المتداول في الصيدليات.</small>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>الاسم العلمي <span style={{ color: "red" }}>*</span></label>
                  <input 
                    placeholder="مثال: Paracetamol" 
                    value={medicationForm.scientificName} 
                    onChange={(event) => setMedicationForm((current) => ({ ...current, scientificName: event.target.value }))} 
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>المادة الفعالة الرئيسية للدواء.</small>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontWeight: "700", fontSize: "13px" }}>كود الدواء الموحد <span style={{ color: "red" }}>*</span></label>
                <input 
                  placeholder="مثال: MED-9921" 
                  value={medicationForm.code} 
                  onChange={(event) => setMedicationForm((current) => ({ ...current, code: event.target.value }))} 
                />
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>الرمز التعريفي الفريد المعتمد لتسجيل الدواء.</small>
              </div>
            </div>

            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14.5px", color: "var(--primary)", fontWeight: "700" }}>🧪 الخصائص الفنية والتصنيع</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>التركيز</label>
                  <input 
                    placeholder="مثال: 500 mg أو 10 mg/ml" 
                    value={medicationForm.strength} 
                    onChange={(event) => setMedicationForm((current) => ({ ...current, strength: event.target.value }))} 
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>كمية المادة الفعالة لكل وحدة جرعة.</small>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>الشكل الصيدلاني</label>
                  <input 
                    placeholder="مثال: Tablet, Syrup, Injection" 
                    value={medicationForm.form} 
                    onChange={(event) => setMedicationForm((current) => ({ ...current, form: event.target.value }))} 
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>الهيئة الفيزيائية للمستحضر الطبي.</small>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>الشركة المصنعة</label>
                  <input 
                    placeholder="مثال: GlaxoSmithKline" 
                    value={medicationForm.manufacturer} 
                    onChange={(event) => setMedicationForm((current) => ({ ...current, manufacturer: event.target.value }))} 
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>الجهة أو مصنع الأدوية المسؤول عن الإنتاج.</small>
                </div>

                <div style={{ paddingTop: "25px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13.5px", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={medicationForm.isControlled}
                      onChange={(event) => setMedicationForm((current) => ({ ...current, isControlled: event.target.checked }))}
                      style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    />
                    ⚠️ دواء خاضع للرقابة (مجدول)
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", borderTop: "1.5px solid var(--border-color)", paddingTop: "15px", marginTop: "5px" }}>
              <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-purple)", color: "white" }}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPlus />}
                حفظ وإضافة الدواء للكتالوج
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsMedicationModalOpen(false)}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}
    </div>
  );
}

export default MinistryDepartments;
