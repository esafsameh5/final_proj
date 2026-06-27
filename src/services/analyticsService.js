import api from "../utils/api";

/**
 * Fetches required backend datasets from documented endpoints and builds a unified analytics object.
 */
export async function getHospitalAnalytics() {
  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  // 1. Fetch analytics KPIs
  const analyticsRes = await api.get(`/api/v1/facilities/${facilityId}/analytics`);
  const analyticsData = analyticsRes.data?.data || {};

  // 2. Fetch departments to get departments count
  const deptsRes = await api.get(`/api/v1/facilities/${facilityId}/departments`, { params: { PageSize: 1 } });
  const departmentCount = deptsRes.data?.data?.totalCount ?? 0;

  // 3. Fetch doctors list to derive specialization counts
  const doctorsRes = await api.get("/api/v1/users", { params: { role: "Doctor", Page: 1, PageSize: 1000 } });
  const doctors = doctorsRes.data?.data?.items || [];
  
  const specializationCounts = {};
  doctors.forEach(d => {
    const spec = d.specialty || "طب عام";
    specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
  });

  const occupiedBeds = analyticsData.occupiedBeds ?? analyticsData.occupiedBedsCount ?? 0;
  const availableBeds = analyticsData.availableBeds ?? analyticsData.availableBedsCount ?? 0;
  const totalBeds = analyticsData.totalBeds ?? analyticsData.totalBedsCount ?? analyticsData.bedsCount ?? (occupiedBeds + availableBeds);

  const resolvedAnalytics = {
    doctorCount: analyticsData.doctorCount ?? analyticsData.doctorsCount ?? doctors.length,
    patientCount: analyticsData.patientCount ?? analyticsData.patientsCount ?? 0,
    totalBeds,
    occupiedBeds,
    availableBeds,
    todaysAdmissions: analyticsData.todaysAdmissions ?? analyticsData.todaysAdmissionsCount ?? 0,
    todaysDischarges: analyticsData.todaysDischarges ?? analyticsData.todaysDischargesCount ?? 0,
    bedOccupancyRate: analyticsData.bedOccupancyRate ?? analyticsData.occupancyRate ?? (totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0),
    departmentCount,
    inpatients: analyticsData.patientCount ?? analyticsData.patientsCount ?? 0,
    doctorsBySpecialization: specializationCounts,
  };

  return {
    analytics: resolvedAnalytics
  };
}
