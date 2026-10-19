// Blood Bank Management System Types

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'Whole Blood' | 'Red Blood Cells' | 'Platelets' | 'Plasma' | 'Cryoprecipitate';
export type UnitStatus = 'available' | 'reserved' | 'issued' | 'expired' | 'discarded' | 'in-transit';
export type DonorEligibility = 'eligible' | 'temporarily-deferred' | 'permanently-deferred';
export type RequestUrgency = 'routine' | 'urgent' | 'emergency';
export type RequestStatus = 'pending' | 'approved' | 'fulfilled' | 'partially-fulfilled' | 'rejected';
export type TransferStatus = 'pending' | 'approved' | 'in-transit' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'branch-manager' | 'staff' | 'hospital-officer' | 'auditor';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  branchId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  address: string;
  eligibility: DonorEligibility;
  deferralReason?: string;
  deferralEndDate?: Date;
  totalDonations: number;
  lastDonationDate?: Date;
  registeredAt: Date;
  branchId: string;
}

export interface BloodUnit {
  id: string;
  donorId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  collectionDate: Date;
  expiryDate: Date;
  status: UnitStatus;
  branchId: string;
  volume: number; // in ml
  testResults?: {
    hiv: boolean;
    hepatitisB: boolean;
    hepatitisC: boolean;
    syphilis: boolean;
    malaria: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalRequest {
  id: string;
  hospitalName: string;
  contactPerson: string;
  contactPhone: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  quantity: number;
  urgency: RequestUrgency;
  status: RequestStatus;
  branchId: string;
  requestedBy: string;
  allocatedUnits?: string[];
  fulfilledQuantity: number;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  unitIds: string[];
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  type: 'low-stock' | 'expiry-warning' | 'emergency-request' | 'transfer-request' | 'system';
  title: string;
  message: string;
  branchId?: string;
  userId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface DashboardStats {
  totalUnits: number;
  availableUnits: number;
  expiringUnits: number;
  pendingRequests: number;
  emergencyRequests: number;
  todayDonations: number;
  weeklyDonations: number;
  bloodGroupStats: Record<BloodGroup, number>;
}
