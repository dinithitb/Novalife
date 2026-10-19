import { useState } from 'react';
import { Plus, Search, Shield, MoreHorizontal, UserCheck, UserX, Pencil, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, Column } from '@/components/ui/data-table';
import { useUsers, useCreateUser, useUpdateUser, useToggleUserActive, useBranches } from '@/hooks/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import { cn } from '@/lib/utils';

const roles: UserRole[] = ['admin', 'branch-manager', 'staff', 'hospital-officer', 'auditor'];

const roleColors: Record<UserRole, string> = {
  admin:            'bg-destructive/10 text-destructive border-destructive/30',
  'branch-manager': 'bg-primary/10 text-primary border-primary/30',
  staff:            'bg-success/10 text-success border-success/30',
  'hospital-officer':'bg-info/10 text-info border-info/30',
  auditor:          'bg-muted text-muted-foreground border-border',
};

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  role: 'staff' as UserRole, branchId: '', password: '', confirmPassword: '',
};

export default function Users() {
  const { user: me } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: users = [], isLoading } = useUsers();
  const { data: branches = [] } = useBranches();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();

  const getBranchName = (id?: string) => id ? (branches.find(b => b.id === id)?.name ?? id) : '—';

  const filtered = users.filter(u => {
    const matchSearch =
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditTarget(u);
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      phone: u.phone ?? '', role: u.role, branchId: u.branchId ?? '',
      password: '', confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast({ variant: 'destructive', title: 'Required fields missing' }); return;
    }
    if (!editTarget && form.password.length < 6) {
      toast({ variant: 'destructive', title: 'Password must be at least 6 characters' }); return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' }); return;
    }
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        phone: form.phone || undefined, role: form.role,
        branchId: form.branchId || undefined,
      };
      if (form.password) payload.password = form.password;

      if (editTarget) {
        await updateUser.mutateAsync({ id: editTarget.id, ...payload });
        toast({ title: 'User updated successfully' });
      } else {
        await createUser.mutateAsync(payload);
        toast({ title: 'User created successfully' });
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await toggleActive.mutateAsync({ id: u.id, active: !u.isActive });
      toast({ title: u.isActive ? 'User deactivated' : 'User activated' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
            {u.firstName[0]}{u.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-foreground">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge variant="outline" className={cn('capitalize text-xs', roleColors[u.role])}>
          {u.role.replace(/-/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'branchId',
      header: 'Branch',
      render: (u) => <span className="text-sm text-muted-foreground">{getBranchName(u.branchId)}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => <span className="text-sm text-muted-foreground">{u.phone ?? '—'}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u) => (
        <Badge variant="outline" className={cn(
          'text-xs',
          u.isActive ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'
        )}>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u) => (
        <span className="text-sm text-muted-foreground">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions' as any,
      header: '',
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(u)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.id !== me?.id && (
              <DropdownMenuItem
                onClick={() => handleToggleActive(u)}
                className={u.isActive ? 'text-destructive focus:text-destructive' : 'text-success focus:text-success'}
              >
                {u.isActive
                  ? <><UserX className="w-4 h-4 mr-2" />Deactivate</>
                  : <><UserCheck className="w-4 h-4 mr-2" />Activate</>
                }
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
        title="User Management"
        subtitle="Manage staff accounts and access roles"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border p-4 md:col-span-1">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          {roles.map(r => (
            <div key={r} className="bg-card rounded-xl border p-4">
              <p className="text-xs text-muted-foreground capitalize">{r.replace(/-/g, ' ')}</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === r).length}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace(/-/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} emptyMessage="No users found." />
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {editTarget ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace(/-/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={v => setForm(p => ({ ...p, branchId: v }))}>
                <SelectTrigger><SelectValue placeholder="No branch assigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No branch</SelectItem>
                  {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{editTarget ? 'New Password' : 'Password *'}</Label>
              <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={editTarget ? 'Leave blank to keep current' : ''} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary text-primary-foreground">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : (editTarget ? 'Save Changes' : 'Create User')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
