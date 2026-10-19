import { useState } from 'react';
import { Download, BarChart3, PieChart, FileText, Building2, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useReportInventory, useReportDonations, useReportRequests, useReportBranches,
} from '@/hooks/api';

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function Reports() {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');

  const { data: inv,  isLoading: l1 } = useReportInventory();
  const { data: don,  isLoading: l2 } = useReportDonations(range);
  const { data: req,  isLoading: l3 } = useReportRequests(range);
  const { data: br,   isLoading: l4 } = useReportBranches();

  const isLoading = l1 || l2 || l3 || l4;

  const cards = [
    {
      title: 'Inventory Report',
      description: 'Stock levels, expiry alerts, and usage by blood group',
      icon: BarChart3,
      stats: inv ? [
        { label: 'Total Units',     value: inv.totalUnits },
        { label: 'Available',       value: inv.availableUnits },
        { label: 'Expiring ≤3 days', value: inv.expiringIn3Days },
      ] : [],
    },
    {
      title: 'Donation Report',
      description: 'Donor activity and donations in the selected period',
      icon: PieChart,
      stats: don ? [
        { label: 'Total Donors',    value: don.totalDonors },
        { label: 'Eligible',        value: don.eligibleDonors },
        { label: 'Donations / Period', value: don.donationsInPeriod },
      ] : [],
    },
    {
      title: 'Request Report',
      description: 'Hospital requests, urgency breakdown, and fulfilment rate',
      icon: FileText,
      stats: req ? [
        { label: 'Total Requests',  value: req.totalRequests },
        { label: 'Fulfilled',       value: req.byStatus?.fulfilled ?? 0 },
        { label: 'Fulfilment Rate', value: `${req.fulfilmentRate ?? 0}%` },
      ] : [],
    },
    {
      title: 'Branch Report',
      description: 'Per-branch inventory and donor counts',
      icon: Building2,
      stats: br ? [
        { label: 'Total Branches',  value: br.branches?.length ?? 0 },
        { label: 'Active',          value: br.branches?.filter((b: any) => b.isActive).length ?? 0 },
        { label: 'Avg Units/Branch', value: br.branches?.length
            ? Math.round(br.branches.reduce((s: number, b: any) => s + b.availableUnits, 0) / br.branches.length)
            : 0 },
      ] : [],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Reports & Analytics"
        subtitle="Insights across your blood bank operations"
        actions={
          <div className="flex items-center gap-3">
            <Select value={range} onValueChange={v => setRange(v as any)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map(({ title, description, icon: Icon, stats }) => (
                <Card key={title} className="shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {stats.map(s => (
                        <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-xl font-bold text-foreground">{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Blood group bar chart */}
            {inv?.byBloodGroup && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Available Units by Blood Group</CardTitle>
                  <CardDescription>Current stock — colour indicates level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {bloodGroups.map(bg => {
                      const count = inv.byBloodGroup[bg]?.available ?? 0;
                      const max = Math.max(...bloodGroups.map(g => inv.byBloodGroup[g]?.available ?? 0), 1);
                      const pct = Math.round((count / max) * 100);
                      const color = count === 0 ? 'bg-destructive' : count < 3 ? 'bg-warning' : 'bg-success';
                      return (
                        <div key={bg} className="flex flex-col items-center gap-2">
                          <div className="w-full bg-muted rounded-lg overflow-hidden" style={{ height: 80 }}>
                            <div
                              className={`w-full ${color} rounded-lg transition-all duration-500`}
                              style={{ height: `${Math.max(pct, 5)}%`, marginTop: `${100 - Math.max(pct, 5)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{bg}</span>
                          <span className="text-xs text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Branch breakdown table */}
            {br?.branches?.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Branch Breakdown</CardTitle>
                  <CardDescription>Inventory and donors per branch</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          {['Branch','Available Units','Total Donors','Eligible Donors'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {br.branches.map((b: any) => (
                          <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{b.name}</td>
                            <td className="px-4 py-3 text-success font-semibold">{b.availableUnits}</td>
                            <td className="px-4 py-3">{b.totalDonors}</td>
                            <td className="px-4 py-3 text-muted-foreground">{b.eligibleDonors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
