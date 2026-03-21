
'use client';

import React, { useState, useEffect } from 'react';
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  useUser,
  useDoc,
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Logo } from '@/components/brand/Logo';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit2, Trash2, RefreshCw, ShieldAlert, Globe } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import { playClickSound } from '@/lib/audio-utils';

export default function AdminProductsPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [language, setLanguage] = useState<'en' | 'th'>('th');
  const t = translations[language];
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Coffee');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // RBAC Protection Logic: Strict check for Staff or Manager roles
  const staffRef = useMemoFirebase(() => (db && user) ? doc(db, 'roles_staff', user.uid) : null, [db, user]);
  const managerRef = useMemoFirebase(() => (db && user) ? doc(db, 'roles_manager', user.uid) : null, [db, user]);
  const { data: staffData, isLoading: isStaffLoading } = useDoc(staffRef);
  const { data: managerData, isLoading: isManagerLoading } = useDoc(managerRef);

  const isAuthorized = !!staffData || !!managerData;

  useEffect(() => {
    if (!isUserLoading && !isStaffLoading && !isManagerLoading) {
      if (!user || !isAuthorized) {
        toast({ 
          variant: "destructive", 
          title: "Access Denied", 
          description: "Only authorized personnel can access the Admin Dashboard." 
        });
        router.push('/');
      }
    }
  }, [user, isUserLoading, isStaffLoading, isManagerLoading, isAuthorized, router, toast]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('category', 'asc'));
  }, [db]);
  const { data: products, isLoading } = useCollection(productsQuery);

  const handleOpenAdd = () => {
    playClickSound();
    setEditingProduct(null);
    setName('');
    setNameTh('');
    setPrice('');
    setCategory('Coffee');
    setImageUrl('');
    setDescription('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    playClickSound();
    setEditingProduct(p);
    setName(p.name);
    setNameTh(p.nameTh);
    setPrice(p.price.toString());
    setCategory(p.category);
    setImageUrl(p.imageUrl);
    setDescription(p.description || '');
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!db) return;
    playClickSound();
    const data = {
      name,
      nameTh,
      price: Number(price),
      category,
      imageUrl,
      description,
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      updateDocumentNonBlocking(doc(db, 'products', editingProduct.id), data);
      toast({ title: t.processing });
    } else {
      addDocumentNonBlocking(collection(db, 'products'), { ...data, createdAt: new Date().toISOString() });
      toast({ title: t.processing });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    if (!db || !confirm('Are you sure you want to delete this product?')) return;
    deleteDocumentNonBlocking(doc(db, 'products', id));
    toast({ title: "Deleted", variant: "destructive" });
  };

  const seedData = () => {
    playClickSound();
    if (!db) return;
    MOCK_PRODUCTS.forEach(p => {
      addDocumentNonBlocking(collection(db, 'products'), p);
    });
    toast({ title: t.seedData });
  };

  if (isUserLoading || isStaffLoading || isManagerLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (!user || !isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => { playClickSound(); router.push('/'); }} className="rounded-full h-12 w-12 p-0">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Logo className="h-10 w-auto" />
            <h1 className="text-3xl font-headline font-bold text-primary ml-2 uppercase">{t.staffManagement}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { playClickSound(); setLanguage(l => l === 'th' ? 'en' : 'th'); }}>
               <Globe className="w-5 h-5" />
            </Button>
            <Button onClick={seedData} variant="outline" className="rounded-full gap-2 border-primary text-primary hover:bg-primary/5">
              <RefreshCw className="w-4 h-4" /> {t.seedData}
            </Button>
            <Button onClick={handleOpenAdd} className="rounded-full gap-2 bg-primary">
              <Plus className="w-4 h-4" /> {t.addProduct}
            </Button>
          </div>
        </div>

        <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl text-primary">{t.allMenuItems}</CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary font-bold"><ShieldAlert className="w-3 h-3 mr-1" /> {t.authorizedAccess}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="pl-8 font-bold uppercase text-[10px]">{t.product}</TableHead>
                  <TableHead className="font-bold uppercase text-[10px]">{t.category}</TableHead>
                  <TableHead className="font-bold uppercase text-[10px]">{t.price}</TableHead>
                  <TableHead className="pr-8 text-right font-bold uppercase text-[10px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400">{t.loadingProducts}</TableCell></TableRow>
                ) : products?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400">{t.noProductsFound}</TableCell></TableRow>
                ) : (
                  products?.map((p) => (
                    <TableRow key={p.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.imageUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                          <div>
                            <p className="font-bold text-slate-800">{p.nameTh}</p>
                            <p className="text-xs text-slate-400 italic">{p.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-4">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-accent">฿{p.price}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleOpenEdit(p)}>
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[3rem] p-8 bg-white max-w-lg border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary">
              {editingProduct ? t.editProduct : t.addNewProduct}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-50">{t.nameEn}</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="rounded-2xl bg-[#F8F7F4] border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-50">{t.nameTh}</Label>
                <Input value={nameTh} onChange={e => setNameTh(e.target.value)} className="rounded-2xl bg-[#F8F7F4] border-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-50">{t.price} (฿)</Label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="rounded-2xl bg-[#F8F7F4] border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-50">{t.category}</Label>
                <Select value={category} onValueChange={(v) => { playClickSound(); setCategory(v); }}>
                  <SelectTrigger className="rounded-2xl bg-[#F8F7F4] border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {['Coffee', 'Tea', 'Bakery', 'Desserts', 'Other'].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-50">{t.imageUrl}</Label>
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="rounded-2xl bg-[#F8F7F4] border-none" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full h-14 rounded-full bg-primary text-lg font-bold">
              {t.saveProduct}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
