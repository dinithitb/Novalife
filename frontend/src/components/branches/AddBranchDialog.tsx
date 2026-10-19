import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateBranch } from '@/hooks/api';
import { useToast } from '@/hooks/use-toast';

type Props = { onCreated: () => void };

const emptyForm = { name: '', address: '', phone: '', email: '' };

export default function AddBranchDialog({ onCreated }: Props) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(emptyForm);
  const createBranch      = useCreateBranch();
  const { toast }         = useToast();

  const set = (k: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit() {
    if (!form.name || !form.address || !form.phone || !form.email) {
      toast({ variant: 'destructive', title: 'All fields are required' });
      return;
    }
    try {
      await createBranch.mutateAsync({ ...form, isActive: true });
      toast({ title: 'Branch created', description: `${form.name} has been added.` });
      setOpen(false);
      setForm(emptyForm);
      onCreated();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to create branch', description: e.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Branch
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
          <DialogDescription>Enter the branch details below.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {(['name', 'address', 'phone', 'email'] as const).map(field => (
            <div key={field} className="grid gap-2">
              <Label htmlFor={field} className="capitalize">{field}</Label>
              <Input
                id={field}
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={set(field)}
                placeholder={
                  field === 'name'    ? 'e.g. Central Blood Bank' :
                  field === 'address' ? 'e.g. 123 Medical Drive' :
                  field === 'phone'   ? 'e.g. +1 (555) 100-1000' :
                  'e.g. branch@novalife.com'
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={createBranch.isPending}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            {createBranch.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : 'Save Branch'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
