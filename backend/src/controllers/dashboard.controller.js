const { BloodUnit, HospitalRequest } = require('../models');

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

async function stats(req, res, next) {
  try {
    const allUnits = await BloodUnit.findAll();
    const available = allUnits.filter(u => u.status === 'available');
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3*24*3600*1000);
    const expiringUnits = available.filter(u => new Date(u.expiry_date) <= threeDays).length;

    const requests = await HospitalRequest.findAll();
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const emergencyRequests = requests.filter(r => r.urgency === 'emergency' && r.status === 'pending').length;

    const bloodGroupStats = {};
    for (const bg of bloodGroups) bloodGroupStats[bg] = 0;
    for (const u of available) bloodGroupStats[u.blood_group] = (bloodGroupStats[u.blood_group] || 0) + 1;

    res.json({
      totalUnits: allUnits.length,
      availableUnits: available.length,
      expiringUnits,
      pendingRequests,
      emergencyRequests,
      todayDonations: 0,
      weeklyDonations: 0,
      bloodGroupStats
    });
  } catch (e) { next(e); }
}

module.exports = { stats };
