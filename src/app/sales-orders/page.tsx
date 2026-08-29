
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Filter, MoreHorizontal, Calendar, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SalesOrdersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'salesOrders'), [firestore]);
  const customersQuery = useMemoFirebase(() => collection(firestore, 'customers'), [firestore]);
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  
  const { data: orders, isLoading } = useCollection(ordersQuery);
  const { data: customers } = useCollection(customersQuery);
  const { data: products } = useCollection(productsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    if (field === 'productId') {
      const product = products?.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product?.price || 0, productName: product?.name };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderItems(newItems);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Customer and at least one item are required.' });
      return;
    }

    const orderId = `SO${Date.now().toString().slice(-4)}`;
    const customer = customers?.find(c => c.id === selectedCustomer);
    const totalAmount = orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const batch = writeBatch(firestore);
    
    // Create Order
    const orderRef = doc(firestore, 'salesOrders', orderId);
    batch.set(orderRef, {
      id: orderId,
      customerId: selectedCustomer,
      customerName: customer?.name || 'Unknown',
      orderDate: new Date().toISOString(),
      totalAmount,
      status: 'NEW',
      createdAt: new Date().toISOString()
    });

    // Create Order Items
    orderItems.forEach((item, idx) => {
      const itemRef = doc(firestore, 'orderItems', `${orderId}-ITEM-${idx}`);
      batch.set(itemRef, {
        ...item,
        id: `${orderId}-ITEM-${idx}`,
        salesOrderId: orderId,
        totalPrice: item.quantity * item.unitPrice
      });
    });

    await batch.commit();
    toast({ title: 'Order Confirmed', description: `Sales Order ${orderId} has been created.` });
    setIsDialogOpen(false);
    setOrderItems([]);
    setSelectedCustomer('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Orders</h1>
          <p className="text-muted-foreground text-sm font-medium">Capture and fulfill customer demand.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 shadow-md shadow-blue-200" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Sales Order
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search orders..." className="pl-10 bg-slate-50 border-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Amount</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">Fetching sales records...</TableCell></TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">No sales orders found.</TableCell></TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-blue-600 text-xs">#{order.id}</TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">UID: {order.customerId}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-black text-slate-900">
                        ${Number(order.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-blue-200 text-blue-700 bg-blue-50">
                          {order.status}
                        </Badge>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Sales Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase text-slate-500">Customer Selection</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Search and Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase text-slate-500">Order Items</Label>
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold text-[10px] uppercase" onClick={handleAddItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="border rounded-xl p-4 bg-slate-50 space-y-4 max-h-[300px] overflow-y-auto">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-end bg-white p-3 rounded-lg border shadow-sm">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Product</Label>
                      <Select value={item.productId} onValueChange={(val) => updateItem(idx, 'productId', val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} (${p.price})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Quantity</Label>
                      <Input type="number" min="1" className="h-9" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Price</Label>
                      <div className="h-9 flex items-center px-3 bg-slate-50 rounded-md text-xs font-bold text-slate-600 border">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {orderItems.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium">No items added to this order yet.</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</p>
                <p className="text-3xl font-black text-slate-900">
                  ${orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-8 shadow-lg shadow-blue-200" onClick={handleSaveOrder}>
              Post Sales Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
