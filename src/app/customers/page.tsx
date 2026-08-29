
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Filter, MoreHorizontal, Mail, Phone, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CustomersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const customersQuery = useMemoFirebase(() => collection(firestore, 'customers'), [firestore]);
  const { data: customers, isLoading } = useCollection(customersQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  });

  const handleOpenDialog = (customer: any = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        status: customer.status
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', status: 'Active' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Email are required.' });
      return;
    }

    const customerId = editingCustomer?.id || `CUST${Date.now().toString().slice(-4)}`;
    const customerRef = doc(firestore, 'customers', customerId);

    setDocumentNonBlocking(customerRef, {
      ...formData,
      id: customerId,
      updatedAt: new Date().toISOString(),
      createdAt: editingCustomer?.createdAt || new Date().toISOString()
    }, { merge: true });

    toast({ title: editingCustomer ? 'Customer Updated' : 'Customer Created', description: `${formData.name} has been saved.` });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer master record?')) {
      deleteDoc(doc(firestore, 'customers', id));
      toast({ title: 'Record Deleted', description: 'Customer removed from system.' });
    }
  };

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Master</h1>
          <p className="text-muted-foreground text-sm font-medium">Centralized management of enterprise relationship data.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 px-6 shadow-md shadow-blue-200" onClick={() => handleOpenDialog()}>
          <UserPlus className="h-4 w-4" />
          Create Customer
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search customers by name, email or ID..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-1" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Contact Info</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium">Syncing Master Data...</TableCell></TableRow>
                ) : filteredCustomers?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400 text-sm">No customer records matched your query.</TableCell></TableRow>
                ) : (
                  filteredCustomers?.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shadow-inner">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">ID: {customer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium flex items-center gap-1.5 text-slate-600"><Mail className="h-3 w-3" /> {customer.email}</p>
                          <p className="text-[11px] font-medium flex items-center gap-1.5 text-slate-600"><Phone className="h-3 w-3" /> {customer.phone || '--'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'} className={customer.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black tracking-widest' : 'text-[9px] font-black tracking-widest'}>
                          {customer.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(customer)}>
                            <Edit2 className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-black uppercase text-slate-500">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Acme Corp" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-black uppercase text-slate-500">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="billing@acme.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-xs font-black uppercase text-slate-500">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-xs font-black uppercase text-slate-500">Address</Label>
              <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Industrial Way" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
