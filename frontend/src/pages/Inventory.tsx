import { useState } from 'react';
import { Plus, Search, Calendar, AlertTriangle, Package, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BloodUnit, BloodGroup, BloodComponent, UnitStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useBloodUnits, useBranches, useDonors } from '@/hooks/api';

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const components: BloodComponent[] = ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma', 'Cryoprecipitate'];
const statuses: UnitStatus[] = ['available', 'reserved', 'issued', 'expired', 'discarded', 'in-transit'];

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const { data: bloodUnits = [], isLoading } = useBloodUnits();
  const { data: branches = [] } = useBranches();
  const { data: donors = [] } = useDonors();

  const filteredUnits = bloodUnits.filter((unit) => {
    const matchesSearch = unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodGroup = bloodGroupFilter === 'all' || unit.bloodGroup === bloodGroupFilter;
    const matchesComponent = componentFilter === 'all' || unit.component === componentFilter;
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || unit.branchId === branchFilter;
    return matchesSearch && matchesBloodGroup && matchesComponent && matchesStatus && matchesBranch;
  });

  const getDonorName = (donorId: string) => {
    const d = donors.find(d => d.id === donorId);
    return d ? `${d.firstName} ${d.lastName}` : donorId;
  };

  const getBranchName = (branchId: string) => {
    const b = branches.find(b => b.id === branchId);
    return b?.name ?? branchId;
  };

  const isExpiringSoon = (expiryDate: Date) => {
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    return new Date(expiryDate) <= threeDays && new Date(expiryDate) > new Date();
  };

  const isExpired = (expiryDate: Date) => new Date(expiryDate) < new Date();

  const availableCount = bloodUnits.filter(u => u.status === 'available').length;
  const expiringCount = bloodUnits.filter(u => u.status === 'available' && isExpiringSoon(u.expiryDate)).length;

  const columns: Column<BloodUnit>[] = [
    {
      key: 'id',
      header: 'Unit ID',
      render: (unit) => <span className="font-mono text-sm font-medium">{unit.id}</span>,
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      render: (unit) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
          unit.bloodGroup.includes('-')
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          {unit.bloodGroup}
        </span>
      ),
    },
    {
      key: 'component',
      header: 'Component',
      render: (unit) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Package className="w-3.5 h-3.5 text-muted-foreground" />
          {unit.component}
        </span>
      ),
    },
    {
      key: 'donorId',
      header: 'Donor',
      render: (unit) => <span className="text-sm text-muted-foreground">{getDonorName(unit.donorId)}</span>,
    },
    {
      key: 'collectionDate',
      header: 'Collected',
      render: (unit) => (
        <span className="text-sm text-muted-foreground">
          {new Date(unit.collectionDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      render: (unit) => (
        <span className={cn(
          'flex items-center gap-1 text-sm',
          isExpired(unit.expiryDate) && 'text-destructive',
          isExpiringSoon(unit.expiryDate) && !isExpired(unit.expiryDate) && 'text-warning'
        )}>
          {(isExpiringSoon(unit.expiryDate) || isExpired(unit.expiryDate)) && (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          {new Date(unit.expiryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      render: (unit) => <span className="text-sm">{unit.volume} mL</span>,
    },
    {
      key: 'branchId',
      header: 'Branch',
      render: (unit) => <span className="text-sm text-muted-foreground">{getBranchName(unit.branchId)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (unit) => <StatusBadge status={unit.status} />,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Blood Inventory"
        subtitle="Manage blood units across all branches"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Blood Unit
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold text-foreground mt-1">{bloodUnits.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-success/30 bg-success/5 p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-success mt-1">{availableCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-warning/30 bg-warning/5 p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-warning mt-1">{expiringCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-destructive mt-1">
              {bloodUnits.filter(u => u.status === 'expired').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by unit ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Blood Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Component" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {components.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUnits}
              emptyMessage="No blood units found matching your filters."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
