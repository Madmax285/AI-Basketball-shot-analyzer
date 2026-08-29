
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Filter, MoreHorizontal, Mail, Phone } from 'lucide-react';

export default function CustomersPage() {
  const firestore = useFirestore();
  const customersQuery = useMemoFirebase(() => collection(firestore, 'customers'), [firestore]);
  const { data: customers, isLoading } = useCollection(customersQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Master</h1>
          <p className="text-muted-foreground">Manage centralized customer profiles and relationship data.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <UserPlus className="h-4 w-4" />
          Create Customer
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search customers by name, email or ID..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Contact Info</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                      Synchronizing with Master Data...
                    </TableCell>
                  </TableRow>
                ) : customers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                      No customer records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers?.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">ID: {customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs flex items-center gap-1.5 text-slate-600">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </p>
                          {customer.phone && (
                            <p className="text-xs flex items-center gap-1.5 text-slate-600">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{customer.address || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'} className={customer.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
