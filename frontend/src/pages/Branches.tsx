import { useMemo, useState } from 'react';
import { Search, MapPin, Phone, Mail, Users, Droplets, MoreHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import AddBranchDialog from '@/components/branches/AddBranchDialog';
import { useBranches, useDonors, useBloodUnits } from '@/hooks/api';

export default function Branches() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: branches = [], refetch } = useBranches();
  const { data: units = [] } = useBloodUnits();
  const { data: donors = [] } = useDonors();

  const filteredBranches = useMemo(() =>
    branches.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
    ), [branches, searchQuery]);

  const getBranchStats = (branchId: string) => ({
    availableUnits: units.filter(u => u.branchId === branchId && u.status === 'available').length,
    totalDonors:    donors.filter(d => d.branchId === branchId).length,
  });

  return (
    <div className="min-h-screen">
      <Header
        title="Branch Management"
        subtitle={`${branches.length} branch${branches.length !== 1 ? 'es' : ''}`}
        actions={<AddBranchDialog onCreated={() => refetch()} />}
      />

      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search branches…"
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map(branch => {
            const stats = getBranchStats(branch.id);
            return (
              <div key={branch.id} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{branch.name}</h3>
                    <Badge variant={branch.isActive ? 'default' : 'secondary'}
                      className={cn('mt-1', branch.isActive && 'bg-success/10 text-success border-success/30')}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Branch</DropdownMenuItem>
                      <DropdownMenuItem>View Inventory</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{branch.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{stats.availableUnits}</p>
                      <p className="text-xs text-muted-foreground">Available Units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{stats.totalDonors}</p>
                      <p className="text-xs text-muted-foreground">Donors</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBranches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No branches found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
