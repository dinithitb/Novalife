require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDb } = require('../config/sequelize');
const { User, Branch, Donor, BloodUnit, HospitalRequest, BranchTransfer, Notification } = require('../models');

async function upsert(model, values, keys=['id']) {
  const where = {};
  for (const k of keys) where[k] = values[k];
  const found = await model.findOne({ where });
  if (found) {
    await found.update(values);
    return found;
  }
  return model.create(values);
}

async function seed() {
  await initDb();
  const { sequelize } = require('../models');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

  // Branches
  await upsert(Branch, {
    id: 'BR001',
    name: 'Central Blood Bank',
    address: '123 Medical Center Drive, Downtown',
    phone: '+1 (555) 100-1000',
    email: 'central@novalife.local',
    manager_id: 'USR002',
    is_active: true
  });

  await upsert(Branch, {
    id: 'BR002',
    name: 'Northside Branch',
    address: '456 North Avenue, Northside',
    phone: '+1 (555) 200-2000',
    email: 'northside@novalife.local',
    manager_id: 'USR003',
    is_active: true
  });

  await upsert(Branch, {
    id: 'BR003',
    name: 'Eastside Collection Center',
    address: '789 East Road, Eastside',
    phone: '+1 (555) 300-3000',
    email: 'eastside@novalife.local',
    manager_id: null,
    is_active: true
  });

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const staffHash = await bcrypt.hash('Staff@123', 10);

  // Users
  await upsert(User, {
    id: 'USR001',
    email: 'admin@novalife.local',
    first_name: 'System',
    last_name: 'Admin',
    password_hash: adminHash,
    role: 'admin',
    branch_id: 'BR001',
    phone: '+1 (555) 900-0001',
    is_active: true
  });

  await upsert(User, {
    id: 'USR002',
    email: 'manager.central@novalife.local',
    first_name: 'Central',
    last_name: 'Manager',
    password_hash: staffHash,
    role: 'branch-manager',
    branch_id: 'BR001',
    phone: '+1 (555) 900-0002',
    is_active: true
  });

  await upsert(User, {
    id: 'USR003',
    email: 'manager.north@novalife.local',
    first_name: 'North',
    last_name: 'Manager',
    password_hash: staffHash,
    role: 'branch-manager',
    branch_id: 'BR002',
    phone: '+1 (555) 900-0003',
    is_active: true
  });

  // Donors
  await upsert(Donor, {
    id: 'DON001',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 111-1111',
    date_of_birth: '1990-05-15',
    blood_group: 'O+',
    address: '123 Maple Street, Downtown',
    eligibility: 'eligible',
    total_donations: 5,
    last_donation_date: '2025-11-10',
    registered_at: new Date('2023-03-20'),
    branch_id: 'BR001'
  });

  await upsert(Donor, {
    id: 'DON002',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 222-2222',
    date_of_birth: '1985-08-22',
    blood_group: 'A-',
    address: '456 Oak Avenue, Northside',
    eligibility: 'temporarily-deferred',
    deferral_reason: 'Low hemoglobin',
    deferral_end_date: '2026-01-15',
    total_donations: 12,
    last_donation_date: '2025-10-05',
    registered_at: new Date('2022-01-12'),
    branch_id: 'BR002'
  });

  // Units
  const now = new Date();
  const addDays = (d) => new Date(now.getTime() + d*24*3600*1000).toISOString().slice(0,10);

  await upsert(BloodUnit, {
    id: 'UNT001',
    donor_id: 'DON001',
    blood_group: 'O+',
    component: 'Red Blood Cells',
    collection_date: addDays(-10),
    expiry_date: addDays(32),
    status: 'available',
    branch_id: 'BR001',
    volume: 450,
    test_results: { hiv: false, hepatitisB: false, hepatitisC: false, syphilis: false, malaria: false }
  });

  await upsert(BloodUnit, {
    id: 'UNT002',
    donor_id: 'DON002',
    blood_group: 'A-',
    component: 'Plasma',
    collection_date: addDays(-5),
    expiry_date: addDays(85),
    status: 'available',
    branch_id: 'BR002',
    volume: 250,
    test_results: { hiv: false, hepatitisB: false, hepatitisC: false, syphilis: false, malaria: false }
  });

  // Requests
  await upsert(HospitalRequest, {
    id: 'REQ001',
    hospital_name: 'City General Hospital',
    contact_person: 'Dr. Emily Watson',
    contact_phone: '+1 (555) 444-4444',
    blood_group: 'O-',
    component: 'Red Blood Cells',
    quantity: 4,
    urgency: 'emergency',
    status: 'pending',
    branch_id: 'BR001',
    requested_by: 'USR002',
    allocated_units: null,
    fulfilled_quantity: 0,
    notes: 'Trauma case - urgent'
  });

  // Transfer
  await upsert(BranchTransfer, {
    id: 'TRF001',
    from_branch_id: 'BR001',
    to_branch_id: 'BR002',
    unit_ids: ['UNT001'],
    status: 'pending',
    requested_by: 'USR002',
    approved_by: null,
    reason: 'Balancing stock'
  });

  // Notifications
  await upsert(Notification, {
    id: 'NOT001',
    type: 'emergency-request',
    title: 'Emergency Blood Request',
    message: 'City General Hospital needs 4 units of O- RBC urgently for trauma patient.',
    branch_id: 'BR001',
    user_id: null,
    is_read: false,
    priority: 'critical'
  });

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('✅ Seed completed');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
