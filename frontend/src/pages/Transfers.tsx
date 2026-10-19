import { useState } from 'react';
import { Plus, Search, ArrowRight, Truck, CheckCircle, Clock, XCircle, MoreHorizontal, Loader2 } from 'lucide-react';
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
import { BranchTransfer, TransferStatus } from '@/types';
import { useTransfers, useBranches, useUpdateTransferStatus } from '@/hooks/api';
import { useToast } from '@/hooks/use-toast';

const Transfers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: transfers = [], isLoading } = useTransfers();
  const { data: branches = [] } = useBranches();
  const updateStatus = useUpdateTransferStatus();
  const { toast } = useToast();

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name ?? id;

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: TransferStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: 'Transfer updated', description: `Status changed to ${status}.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const columns: Column<BranchTransfer>[] = [
    {
      key: 'id',
      header: 'Transfer ID',
      render: (t) => <span className="font-mono text-sm font-medium">{t.id}</span>,
    },
    {
      key: 'fromBranchId',
      header: 'From → To',
      render: (t) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{getBranchName(t.fromBranchId)}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">{getBranchName(t.toBranchId)}</span>
        </div>
      ),
    },
    {
      key: 'unitIds',
      header: 'Units',
      render: (t) => (
        <span className="text-sm">
          {t.unitIds.length} unit{t.unitIds.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (t) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-48">{t.reason}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (t) => (
        <span className="text-sm text-muted-foreground">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions' as any,
      header: '',
      render: (t) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {t.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => handleStatusChange(t.id, 'approved')}>
                  <CheckCircle className="w-4 h-4 mr-2 text-success" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(t.id, 'cancelled')}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" /> Cancel
                </DropdownMenuItem>
              </>
            )}
            {t.status === 'approved' && (
              <DropdownMenuItem onClick={() => handleStatusChange(t.id, 'in-transit')}>
                <Truck className="w-4 h-4 mr-2 text-info" /> Mark In-Transit
              </DropdownMenuItem>
            )}
            {t.status === 'in-transit' && (
              <DropdownMenuItem onClick={() => handleStatusChange(t.id, 'completed')}>
                <CheckCircle className="w-4 h-4 mr-2 text-success" /> Mark Completed
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Branch Transfers"
        subtitle="Track blood unit transfers between branches"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> New Transfer
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['pending','approved','in-transit','completed'] as TransferStatus[]).map(s => (
            <div key={s} className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground capitalize">{s.replace('-', ' ')}</p>
              <p className="text-2xl font-bold mt-1">
                {transfers.filter(t => t.status === s).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <DataTable columns={columns} data={filteredTransfers} emptyMessage="No transfers found." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfers;
