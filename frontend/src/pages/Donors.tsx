import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDonors, useCreateDonor, useBranches } from '@/hooks/api';
import { BloodGroup, Donor } from '@/types';

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Donors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');

  const { data: donors = [], isLoading: loading } = useDonors();
  const { data: branches = [] } = useBranches();
  const createDonorMutation = useCreateDonor();
  const { toast } = useToast();

  // Auto-select first branch when branches load
  useEffect(() => {
    if (branches.length > 0 && !form.branchId) {
      setForm(p => ({ ...p, branchId: branches[0].id }));
    }
  }, [branches]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '', // YYYY-MM-DD
    bloodGroup: 'O+' as BloodGroup,
    address: '',
    branchId: '',
  });

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name ?? branchId;
  };

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const matchesSearch =
        donor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBloodGroup = bloodGroupFilter === 'all' || donor.bloodGroup === bloodGroupFilter;
      const matchesEligibility = eligibilityFilter === 'all' || donor.eligibility === eligibilityFilter;

      return matchesSearch && matchesBloodGroup && matchesEligibility;
    });
  }, [donors, searchQuery, bloodGroupFilter, eligibilityFilter]);

  const columns: Column<Donor>[] = [
    {
      key: 'id',
      header: 'Donor ID',
      render: (donor) => (
        <span className="font-mono text-sm text-muted-foreground">{donor.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (donor) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {donor.firstName?.[0]}
            {donor.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {donor.firstName} {donor.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{donor.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      render: (donor) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {donor.bloodGroup}
        </span>
      ),
    },
    {
      key: 'eligibility',
      header: 'Status',
      render: (donor) => (
        <StatusBadge
          status={donor.eligibility === 'eligible' ? 'eligible' : 'deferred'}
          label={donor.eligibility === 'eligible' ? 'Eligible' : 'Deferred'}
        />
      ),
    },
    {
      key: 'donations',
      header: 'Donations',
      render: (donor) => (
        <div className="text-center">
          <p className="font-semibold text-foreground">{donor.totalDonations}</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      ),
    },
    {
      key: 'lastDonation',
      header: 'Last Donation',
      render: (donor) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (donor) => <span className="text-sm text-muted-foreground">{getBranchName(donor.branchId)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>View Details</DropdownMenuItem>
            <DropdownMenuItem disabled>Edit Donor</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  const submitRegister = async () => {
    try {
      setSaving(true);
      await createDonorMutation.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth as any,
        bloodGroup: form.bloodGroup,
        address: form.address,
        branchId: form.branchId,
      });
      toast({ title: 'Donor registered', description: 'New donor has been added successfully.' });
      setRegisterOpen(false);
      setForm(prev => ({ ...prev, firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', address: '' }));
    } catch (e: any) {
      toast({ title: 'Registration failed', description: e?.message || 'Please check inputs', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Donor Management"
        subtitle={loading ? 'Loading donors…' : `${donors.length} registered donors`}
        actions={
          <Button
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            onClick={() => setRegisterOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Donor
          </Button>
        }
      />

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Register Donor</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm((p) => ({ ...p, bloodGroup: v as BloodGroup }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm((p) => ({ ...p, branchId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button onClick={submitRegister} disabled={saving}>
              {saving ? 'Saving…' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="temporarily-deferred">Temp. Deferred</SelectItem>
              <SelectItem value="permanently-deferred">Perm. Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Donors</p>
            <p className="text-2xl font-bold text-foreground">{donors.length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Eligible</p>
            <p className="text-2xl font-bold text-success">{donors.filter((d) => d.eligibility === 'eligible').length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Deferred</p>
            <p className="text-2xl font-bold text-warning">{donors.filter((d) => d.eligibility !== 'eligible').length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-info">—</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredDonors}
          keyExtractor={(donor) => donor.id}
          emptyMessage={loading ? 'Loading…' : 'No donors found matching your criteria'}
        />
      </div>
    </div>
  );
}
