const { Op } = require('sequelize');
const { BloodUnit, Donor, HospitalRequest, BranchTransfer, Branch } = require('../models');

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

// Shared date-range helper
function dateRange(range) {
  const now = new Date();
  const from = new Date(now);
  switch (range) {
    case 'week':  from.setDate(from.getDate() - 7);   break;
    case 'month': from.setMonth(from.getMonth() - 1); break;
    case 'year':  from.setFullYear(from.getFullYear() - 1); break;
    default:      from.setMonth(from.getMonth() - 1); // default: month
  }
  return { from, to: now };
}

async function inventory(req, res, next) {
  try {
    const units = await BloodUnit.findAll();
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 86400_000);
    const in7Days = new Date(now.getTime() + 7 * 86400_000);

    const byGroup = {};
    for (const bg of bloodGroups) byGroup[bg] = { available: 0, reserved: 0, issued: 0, expired: 0, total: 0 };

    for (const u of units) {
      const bg = u.blood_group;
      if (!byGroup[bg]) continue;
      byGroup[bg].total++;
      if (u.status === 'available') byGroup[bg].available++;
      if (u.status === 'reserved')  byGroup[bg].reserved++;
      if (u.status === 'issued')    byGroup[bg].issued++;
      if (u.status === 'expired')   byGroup[bg].expired++;
    }

    const available = units.filter(u => u.status === 'available');

    res.json({
      totalUnits: units.length,
      availableUnits: available.length,
      reservedUnits: units.filter(u => u.status === 'reserved').length,
      issuedUnits:   units.filter(u => u.status === 'issued').length,
      expiredUnits:  units.filter(u => u.status === 'expired').length,
      expiringIn3Days: available.filter(u => new Date(u.expiry_date) <= in3Days).length,
      expiringIn7Days: available.filter(u => new Date(u.expiry_date) <= in7Days).length,
      byBloodGroup: byGroup,
    });
  } catch (e) { next(e); }
}

async function donations(req, res, next) {
  try {
    const { from, to } = dateRange(req.query.range);

    const donors = await Donor.findAll();
    const recentUnits = await BloodUnit.findAll({
      where: { collection_date: { [Op.between]: [from, to] } },
    });

    const byGroup = {};
    for (const bg of bloodGroups) byGroup[bg] = 0;
    for (const u of recentUnits) {
      if (byGroup[u.blood_group] !== undefined) byGroup[u.blood_group]++;
    }

    res.json({
      totalDonors: donors.length,
      eligibleDonors: donors.filter(d => d.eligibility === 'eligible').length,
      deferredDonors: donors.filter(d => d.eligibility !== 'eligible').length,
      donationsInPeriod: recentUnits.length,
      byBloodGroup: byGroup,
    });
  } catch (e) { next(e); }
}

async function requests(req, res, next) {
  try {
    const { from, to } = dateRange(req.query.range);

    const all = await HospitalRequest.findAll();
    const inPeriod = all.filter(r => new Date(r.created_at) >= from);

    const byStatus = { pending: 0, approved: 0, fulfilled: 0, 'partially-fulfilled': 0, rejected: 0 };
    const byUrgency = { routine: 0, urgent: 0, emergency: 0 };
    for (const r of all) {
      if (byStatus[r.status] !== undefined) byStatus[r.status]++;
      if (byUrgency[r.urgency] !== undefined) byUrgency[r.urgency]++;
    }

    const fulfilledInPeriod = inPeriod.filter(r => r.status === 'fulfilled');
    const totalRequested = fulfilledInPeriod.reduce((s, r) => s + r.quantity, 0);
    const totalFulfilled = fulfilledInPeriod.reduce((s, r) => s + r.fulfilled_quantity, 0);

    res.json({
      totalRequests: all.length,
      requestsInPeriod: inPeriod.length,
      byStatus,
      byUrgency,
      fulfilmentRate: totalRequested ? Math.round((totalFulfilled / totalRequested) * 100) : 0,
    });
  } catch (e) { next(e); }
}

async function transfers(req, res, next) {
  try {
    const { from } = dateRange(req.query.range);
    const all = await BranchTransfer.findAll();
    const inPeriod = all.filter(t => new Date(t.created_at) >= from);

    const byStatus = { pending: 0, approved: 0, 'in-transit': 0, completed: 0, cancelled: 0 };
    for (const t of all) {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
    }

    const totalUnitsTransferred = inPeriod
      .filter(t => t.status === 'completed')
      .reduce((s, t) => s + (Array.isArray(t.unit_ids) ? t.unit_ids.length : 0), 0);

    res.json({
      totalTransfers: all.length,
      transfersInPeriod: inPeriod.length,
      byStatus,
      totalUnitsTransferred,
    });
  } catch (e) { next(e); }
}

async function branches(req, res, next) {
  try {
    const [branchList, units, donors] = await Promise.all([
      Branch.findAll({ order: [['id', 'ASC']] }),
      BloodUnit.findAll(),
      Donor.findAll(),
    ]);

    const stats = branchList.map(b => {
      const bUnits = units.filter(u => u.branch_id === b.id);
      const bDonors = donors.filter(d => d.branch_id === b.id);
      return {
        id: b.id,
        name: b.name,
        isActive: b.is_active,
        totalUnits: bUnits.length,
        availableUnits: bUnits.filter(u => u.status === 'available').length,
        totalDonors: bDonors.length,
        eligibleDonors: bDonors.filter(d => d.eligibility === 'eligible').length,
      };
    });

    res.json({ branches: stats });
  } catch (e) { next(e); }
}

module.exports = { inventory, donations, requests, transfers, branches };
