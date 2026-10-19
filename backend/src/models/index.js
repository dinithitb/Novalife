const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const User = sequelize.define('user', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  first_name: { type: DataTypes.STRING(60), allowNull: false },
  last_name: { type: DataTypes.STRING(60), allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin','branch-manager','staff','hospital-officer','auditor'), allowNull: false },
  branch_id: { type: DataTypes.STRING(20), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Branch = sequelize.define('branch', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false },
  manager_id: { type: DataTypes.STRING(20), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Donor = sequelize.define('donor', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  first_name: { type: DataTypes.STRING(60), allowNull: false },
  last_name: { type: DataTypes.STRING(60), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
  blood_group: { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  eligibility: { type: DataTypes.ENUM('eligible','temporarily-deferred','permanently-deferred'), defaultValue: 'eligible' },
  deferral_reason: { type: DataTypes.STRING(255), allowNull: true },
  deferral_end_date: { type: DataTypes.DATEONLY, allowNull: true },
  total_donations: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_donation_date: { type: DataTypes.DATEONLY, allowNull: true },
  registered_at: { type: DataTypes.DATE, allowNull: false },
  branch_id: { type: DataTypes.STRING(20), allowNull: false }
}, { timestamps: false });

const BloodUnit = sequelize.define('blood_unit', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  donor_id: { type: DataTypes.STRING(20), allowNull: false },
  blood_group: { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'), allowNull: false },
  component: { type: DataTypes.ENUM('Whole Blood','Red Blood Cells','Platelets','Plasma','Cryoprecipitate'), allowNull: false },
  collection_date: { type: DataTypes.DATEONLY, allowNull: false },
  expiry_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('available','reserved','issued','expired','discarded','in-transit'), defaultValue: 'available' },
  branch_id: { type: DataTypes.STRING(20), allowNull: false },
  volume: { type: DataTypes.INTEGER, allowNull: false },
  test_results: { type: DataTypes.JSON, allowNull: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const HospitalRequest = sequelize.define('hospital_request', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  hospital_name: { type: DataTypes.STRING(150), allowNull: false },
  contact_person: { type: DataTypes.STRING(120), allowNull: false },
  contact_phone: { type: DataTypes.STRING(30), allowNull: false },
  blood_group: { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'), allowNull: false },
  component: { type: DataTypes.ENUM('Whole Blood','Red Blood Cells','Platelets','Plasma','Cryoprecipitate'), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  urgency: { type: DataTypes.ENUM('routine','urgent','emergency'), defaultValue: 'routine' },
  status: { type: DataTypes.ENUM('pending','approved','fulfilled','partially-fulfilled','rejected'), defaultValue: 'pending' },
  branch_id: { type: DataTypes.STRING(20), allowNull: false },
  requested_by: { type: DataTypes.STRING(20), allowNull: false },
  allocated_units: { type: DataTypes.JSON, allowNull: true },
  fulfilled_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  rejection_reason: { type: DataTypes.STRING(255), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const BranchTransfer = sequelize.define('branch_transfer', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  from_branch_id: { type: DataTypes.STRING(20), allowNull: false },
  to_branch_id: { type: DataTypes.STRING(20), allowNull: false },
  unit_ids: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','in-transit','completed','cancelled'), defaultValue: 'pending' },
  requested_by: { type: DataTypes.STRING(20), allowNull: false },
  approved_by: { type: DataTypes.STRING(20), allowNull: true },
  reason: { type: DataTypes.STRING(255), allowNull: false },
  completed_at: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Notification = sequelize.define('notification', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  type: { type: DataTypes.ENUM('low-stock','expiry-warning','emergency-request','transfer-request','system'), allowNull: false },
  title: { type: DataTypes.STRING(150), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  branch_id: { type: DataTypes.STRING(20), allowNull: true },
  user_id: { type: DataTypes.STRING(20), allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  priority: { type: DataTypes.ENUM('low','medium','high','critical'), defaultValue: 'low' }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const AuditLog = sequelize.define('audit_log', {
  id: { type: DataTypes.STRING(20), primaryKey: true },
  action: { type: DataTypes.STRING(80), allowNull: false },
  entity_type: { type: DataTypes.STRING(40), allowNull: false },
  entity_id: { type: DataTypes.STRING(20), allowNull: false },
  user_id: { type: DataTypes.STRING(20), allowNull: false },
  details: { type: DataTypes.JSON, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });

// Associations (lightweight)
Branch.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

Donor.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
BloodUnit.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });
BloodUnit.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

HospitalRequest.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
HospitalRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });

BranchTransfer.belongsTo(Branch, { foreignKey: 'from_branch_id', as: 'fromBranch' });
BranchTransfer.belongsTo(Branch, { foreignKey: 'to_branch_id', as: 'toBranch' });

Notification.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'actor' });

module.exports = { sequelize, User, Branch, Donor, BloodUnit, HospitalRequest, BranchTransfer, Notification, AuditLog };
