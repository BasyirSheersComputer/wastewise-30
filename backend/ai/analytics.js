import { getTopSellingItems, getWasteStats, getStaffTraining, getSupplierRisk, getComplianceStats, getLocalHolidays, getSeasons } from '../database/db.js';

export async function getAnalyticsData() {
  const [topSellingItems, waste, staffTraining, supplierRisk, compliance, localHolidays, seasons] = await Promise.all([
    getTopSellingItems(),
    getWasteStats(),
    getStaffTraining(),
    getSupplierRisk(),
    getComplianceStats(),
    getLocalHolidays(),
    getSeasons(),
  ]);
  return {
    topSellingItems,
    waste,
    staffTraining,
    supplierRisk,
    compliance,
    localHolidays,
    seasons,
  };
}
