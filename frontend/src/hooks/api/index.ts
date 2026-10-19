import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Branch, Donor, BloodUnit, HospitalRequest,
  BranchTransfer, Notification, DashboardStats, User,
} from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const keys = {
  dashboard:     ['dashboard'] as const,
  branches:      ['branches'] as const,
  donors:        (p?: object) => ['donors', p] as const,
  units:         (p?: object) => ['units', p] as const,
  requests:      (p?: object) => ['requests', p] as const,
  transfers:     (p?: object) => ['transfers', p] as const,
  notifications: (p?: object) => ['notifications', p] as const,
  users:         (p?: object) => ['users', p] as const,
};

function toQs(params?: Record<string, string | boolean | undefined>) {
  if (!params) return '';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => [k, String(v)]) as [string, string][];
  return entries.length ? '?' + new URLSearchParams(entries).toString() : '';
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: keys.dashboard,
    queryFn: () => api.get('/api/dashboard/stats'),
    staleTime: 30_000,
  });
}

// ─── Branches ─────────────────────────────────────────────────────────────────
export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: keys.branches,
    queryFn: () => api.get('/api/branches'),
    staleTime: 60_000,
  });
}
export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Branch>) => api.post<Branch>('/api/branches', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.branches }),
  });
}
export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Branch> & { id: string }) =>
      api.put<Branch>(`/api/branches/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.branches }),
  });
}

// ─── Donors ──────────────────────────────────────────────────────────────────
export function useDonors(params?: { branchId?: string; bloodGroup?: string }) {
  return useQuery<Donor[]>({
    queryKey: keys.donors(params),
    queryFn: () => api.get(`/api/donors${toQs(params)}`),
    staleTime: 30_000,
  });
}
export function useCreateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donor>) => api.post<Donor>('/api/donors', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donors'] }),
  });
}
export function useUpdateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Donor> & { id: string }) =>
      api.put<Donor>(`/api/donors/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donors'] }),
  });
}

// ─── Blood Units ──────────────────────────────────────────────────────────────
export function useBloodUnits(params?: { branchId?: string; status?: string; bloodGroup?: string }) {
  return useQuery<BloodUnit[]>({
    queryKey: keys.units(params),
    queryFn: () => api.get(`/api/units${toQs(params)}`),
    staleTime: 20_000,
  });
}
export function useCreateBloodUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BloodUnit>) => api.post<BloodUnit>('/api/units', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
export function useUpdateUnitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post<BloodUnit>(`/api/units/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

// ─── Hospital Requests ────────────────────────────────────────────────────────
export function useRequests(params?: { status?: string; urgency?: string; branchId?: string }) {
  return useQuery<HospitalRequest[]>({
    queryKey: keys.requests(params),
    queryFn: () => api.get(`/api/requests${toQs(params)}`),
    staleTime: 20_000,
  });
}
export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HospitalRequest>) => api.post<HospitalRequest>('/api/requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<HospitalRequest> & { id: string }) =>
      api.put<HospitalRequest>(`/api/requests/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
// Dedicated action hooks that match the backend's POST action endpoints
export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, allocatedUnits }: { id: string; allocatedUnits?: string[] }) =>
      api.post<HospitalRequest>(`/api/requests/${id}/approve`, { allocatedUnits }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      api.post<HospitalRequest>(`/api/requests/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
export function useFulfillRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fulfilledQuantity, unitIds }: { id: string; fulfilledQuantity: number; unitIds?: string[] }) =>
      api.post<HospitalRequest>(`/api/requests/${id}/fulfill`, { fulfilledQuantity, unitIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

// ─── Transfers ────────────────────────────────────────────────────────────────
export function useTransfers(params?: { status?: string }) {
  return useQuery<BranchTransfer[]>({
    queryKey: keys.transfers(params),
    queryFn: () => api.get(`/api/transfers${toQs(params)}`),
    staleTime: 20_000,
  });
}
export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BranchTransfer>) => api.post<BranchTransfer>('/api/transfers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfers'] }),
  });
}
// Maps status string to the correct backend action endpoint
export function useUpdateTransferStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      const actionMap: Record<string, string> = {
        approved:    'approve',
        'in-transit':'ship',
        completed:   'complete',
        cancelled:   'cancel',
      };
      const action = actionMap[status];
      if (!action) throw new Error(`Unknown transfer status: ${status}`);
      return api.post<BranchTransfer>(`/api/transfers/${id}/${action}`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfers'] }),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function useNotifications(params?: { branchId?: string; isRead?: boolean }) {
  return useQuery<Notification[]>({
    queryKey: keys.notifications(params),
    queryFn: () => api.get(`/api/notifications${toQs(params)}`),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    // Backend uses POST /:id/read (not PUT)
    mutationFn: (id: string) => api.post<Notification>(`/api/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function useUsers(params?: { role?: string; branchId?: string; isActive?: boolean }) {
  return useQuery<User[]>({
    queryKey: keys.users(params),
    queryFn: () => api.get(`/api/users${toQs(params)}`),
    staleTime: 30_000,
  });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User> & { password: string }) => api.post<User>('/api/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string; password?: string }) =>
      api.put<User>(`/api/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    // Backend uses PATCH /:id/activate and PATCH /:id/deactivate
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch<User>(`/api/users/${id}/${active ? 'activate' : 'deactivate'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function useReportInventory() {
  return useQuery({
    queryKey: ['report', 'inventory'],
    queryFn: () => api.get<any>('/api/reports/inventory'),
    staleTime: 60_000,
  });
}
export function useReportDonations(range = 'month') {
  return useQuery({
    queryKey: ['report', 'donations', range],
    queryFn: () => api.get<any>(`/api/reports/donations?range=${range}`),
    staleTime: 60_000,
  });
}
export function useReportRequests(range = 'month') {
  return useQuery({
    queryKey: ['report', 'requests', range],
    queryFn: () => api.get<any>(`/api/reports/requests?range=${range}`),
    staleTime: 60_000,
  });
}
export function useReportBranches() {
  return useQuery({
    queryKey: ['report', 'branches'],
    queryFn: () => api.get<any>('/api/reports/branches'),
    staleTime: 60_000,
  });
}
