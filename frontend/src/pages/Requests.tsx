import { useState } from 'react';
import { Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HospitalRequest, RequestUrgency, RequestStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useRequests, useBranches, useApproveRequest, useRejectRequest, useFulfillRequest } from '@/hooks/api';
import { useToast } from '@/hooks/use-toast';

const urgencyConfig: Record<RequestUrgency, { label: string; className: string; icon: any }> = {
  routine: { label: 'Routine', className: 'text-muted-foreground', icon: Clock },
  urgent: { label: 'Urgent', className: 'text-warning', icon: AlertTriangle },
  emergency: { label: 'Emergency', className: 'text-destructive', icon: AlertTriangle },
};

const Requests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: requests = [], isLoading } = useRequests();
  const { data: branches = [] } = useBranches();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();
  const fulfillRequest = useFulfillRequest();
  const { toast } = useToast();

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name ?? id;

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await approveRequest.mutateAsync({ id });
      toast({ title: 'Request approved' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };
  const handleReject = async (id: string) => {
    try {
      await rejectRequest.mutateAsync({ id, rejectionReason: 'Rejected by staff' });
      toast({ title: 'Request rejected' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };
  const handleFulfill = async (id: string, quantity: number) => {
    try {
      await fulfillRequest.mutateAsync({ id, fulfilledQuantity: quantity });
      toast({ title: 'Request fulfilled' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const columns: Column<HospitalRequest>[] = [
    {
      key: 'id',
      header: 'Request ID',
      render: (r) => <span className="font-mono text-sm font-medium">{r.id}</span>,
    },
    {
      key: 'hospitalName',
      header: 'Hospital',
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.hospitalName}</p>
          <p className="text-xs text-muted-foreground">{r.contactPerson}</p>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood',
      render: (r) => (
        <div className="text-sm">
          <span className="font-bold">{r.bloodGroup}</span>
          <span className="text-muted-foreground ml-1">· {r.component}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (r) => (
        <span className="text-sm">
          {r.fulfilledQuantity}/{r.quantity} units
        </span>
      ),
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (r) => {
        const cfg = urgencyConfig[r.urgency];
        const Icon = cfg.icon;
        return (
          <span className={cn('flex items-center gap-1.5 text-sm font-medium', cfg.className)}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'branchId',
      header: 'Branch',
      render: (r) => <span className="text-sm text-muted-foreground">{getBranchName(r.branchId)}</span>,
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (r) => (
        <span className="text-sm text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions' as any,
      header: '',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {r.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => handleApprove(r.id)}>
                  <CheckCircle className="w-4 h-4 mr-2 text-success" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReject(r.id)}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" /> Reject
                </DropdownMenuItem>
              </>
            )}
            {r.status === 'approved' && (
              <DropdownMenuItem onClick={() => handleFulfill(r.id, r.quantity)}>
                <CheckCircle className="w-4 h-4 mr-2 text-success" /> Mark Fulfilled
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const emergencyCount = requests.filter(r => r.urgency === 'emergency' && r.status === 'pending').length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <Header
        title="Hospital Requests"
        subtitle="Manage blood requests from hospitals and clinics"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">Emergency</p>
            <p className="text-2xl font-bold text-destructive">{emergencyCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Fulfilled</p>
            <p className="text-2xl font-bold text-success">
              {requests.filter(r => r.status === 'fulfilled').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search hospital or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredRequests} emptyMessage="No requests found." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
