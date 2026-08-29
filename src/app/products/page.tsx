
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
import { Search, Plus, Package, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading } = useCollection(productsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    reorderLevel: 5
  });

  const handleOpenDialog = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price || 0,
        stock: product.stock || 0,
        reorderLevel: product.reorderLevel || 5
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', price: 0, stock: 0, reorderLevel: 5 });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.sku) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and SKU are required.' });
      return;
    }

    const productId = editingProduct?.id || `PROD${Date.now().toString().slice(-4)}`;
    const productRef = doc(firestore, 'products', productId);

    setDocumentNonBlocking(productRef, {
      ...formData,
      id: productId,
      price: Number(formData.price),
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      status: Number(formData.stock) <= Number(formData.reorderLevel) ? 'LOW STOCK' : 'IN STOCK',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: editingProduct ? 'Product Updated' : 'Product Created', description: `${formData.name} catalog record saved.` });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product catalog entry?')) {
      deleteDoc(doc(firestore, 'products', id));
      toast({ title: 'Record Deleted', description: 'Product removed from catalog.' });
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Catalog</h1>
          <p className="text-muted-foreground text-sm font-medium">Global master data for inventory and pricing.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 px-6 shadow-md shadow-blue-200" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by SKU, name or category..." 
                className="pl-10 bg-slate-50 border-none" 
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
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">SKU / Product</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Price</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Stock</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">Syncing Inventory Catalog...</TableCell></TableRow>
                ) : filteredProducts?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">No products found in catalog.</TableCell></TableRow>
                ) : (
                  filteredProducts?.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg shadow-inner">
                            <Package className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] font-bold text-slate-500">
                        {product.category.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-black text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={product.stock <= product.reorderLevel ? 'destructive' : 'secondary'} className="text-[9px] font-black tracking-widest">
                            {product.stock} UNITS
                          </Badge>
                          {product.stock <= product.reorderLevel && (
                            <span className="text-[8px] font-black text-red-600 uppercase flex items-center gap-0.5">
                              <AlertCircle className="h-2 w-2" /> Reorder Soon
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                            <Edit2 className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
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
            <DialogTitle className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku" className="text-xs font-black uppercase text-slate-500">SKU Code</Label>
                <Input id="sku" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} placeholder="SKU-1001" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-xs font-black uppercase text-slate-500">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Hardware" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-black uppercase text-slate-500">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enterprise Hub v2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-xs font-black uppercase text-slate-500">Unit Price</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock" className="text-xs font-black uppercase text-slate-500">Initial Stock</Label>
                <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorder" className="text-xs font-black uppercase text-slate-500">Min. Alert</Label>
                <Input id="reorder" type="number" value={formData.reorderLevel} onChange={(e) => setFormData({...formData, reorderLevel: Number(e.target.value)})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>Save Catalog Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
