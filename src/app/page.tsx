
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, ChevronRight, Sparkles, X,
  Globe, User, MapPin, CheckCircle2, MessageCircle, Heart, Settings, Command
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useCollection,
  useMemoFirebase, 
  addDocumentNonBlocking 
} from '@/firebase';
import { doc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { IceOption, MOCK_PRODUCTS } from '@/lib/mock-data';
import { translations } from '@/lib/translations';
import { playClickSound } from '@/lib/audio-utils';
import { cn } from "@/lib/utils";
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Logo } from '@/components/brand/Logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  uniqueId: string;
  name: string;
  nameTh: string;
  price: number;
  imageUrl: string;
  quantity: number;
  iceOption?: IceOption;
  category: string;
}

const DELIVERY_FEE = 20;

export default function Page() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [language, setLanguage] = useState<'en' | 'th'>('th');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [tempIce, setTempIce] = useState<IceOption>('Normal');
  const [tempQuantity, setTempQuantity] = useState(1);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'PromptPay'>('Cash');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [newAddress, setNewAddress] = useState('');

  const t = translations[language];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('category', 'asc'));
  }, [db]);
  const { data: dbProducts, isLoading: isProductsLoading } = useCollection(productsQuery);

  const products = (dbProducts && dbProducts.length > 0) ? dbProducts : MOCK_PRODUCTS;

  const staffRef = useMemoFirebase(() => (db && user) ? doc(db, 'roles_staff', user.uid) : null, [db, user]);
  const managerRef = useMemoFirebase(() => (db && user) ? doc(db, 'roles_manager', user.uid) : null, [db, user]);
  const { data: staffData } = useDoc(staffRef);
  const { data: managerData } = useDoc(managerRef);
  const isAuthorized = !!staffData || !!managerData;

  const profileRef = useMemoFirebase(() => (db && user) ? doc(db, 'user_profiles', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile?.deliveryAddress) {
      setNewAddress(profile.deliveryAddress);
    }
  }, [profile]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.nameTh || '').includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const suggestions = searchQuery.trim().length > 0 
    ? products
        .filter(p => 
          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
          (p.nameTh || '').includes(searchQuery)
        )
        .slice(0, 5)
    : [];

  const handleAddToCart = (product: any) => {
    playClickSound();
    setSelectedProduct(product);
    setTempIce('Normal');
    setTempQuantity(1);
    setIsCustomizeOpen(true);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    playClickSound();
    
    const newItem: CartItem = {
      id: selectedProduct.id,
      uniqueId: Math.random().toString(36).substr(2, 9),
      name: selectedProduct.name,
      nameTh: selectedProduct.nameTh,
      price: selectedProduct.price,
      imageUrl: selectedProduct.imageUrl,
      category: selectedProduct.category,
      quantity: tempQuantity,
      iceOption: selectedProduct.hasIceOptions ? tempIce : undefined,
    };

    setCart(prev => [...prev, newItem]);
    setIsCustomizeOpen(false);
    toast({
      title: language === 'th' ? "เพิ่มลงตะกร้าแล้ว" : "Added to basket",
      description: language === 'th' ? `${newItem.nameTh} x${newItem.quantity}` : `${newItem.name} x${newItem.quantity}`,
    });
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return sub > 0 ? sub + DELIVERY_FEE : 0;
  };

  const handleCheckout = () => {
    const currentAddress = profile?.deliveryAddress || newAddress;
    if (!currentAddress || currentAddress.trim().length < 5) {
      playClickSound();
      toast({
        variant: "destructive",
        title: language === 'th' ? "กรุณาระบุที่อยู่จัดส่ง" : "Please provide delivery address",
      });
      setIsCartOpen(true);
      setIsAddressEditing(true);
      return;
    }

    playClickSound();
    
    const orderData = {
      customerId: user?.uid || 'guest',
      items: cart.map(i => ({ name: i.nameTh, quantity: i.quantity, price: i.price })),
      totalAmount: calculateTotal(),
      status: 'Pending',
      paymentMethod,
      deliveryAddress: currentAddress,
      createdAt: serverTimestamp(),
    };

    if (db) {
      addDocumentNonBlocking(collection(db, 'orders'), orderData);
    }
    
    setIsOrderSuccess(true);
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { playClickSound(); router.push('/'); }}>
            <Logo className="h-10 sm:h-12 w-auto" />
            <div className="hidden sm:flex flex-col">
              <span className="font-headline text-lg sm:text-xl font-bold tracking-tight text-primary uppercase">Savor Happiness</span>
              <span className="text-[10px] text-accent font-bold tracking-[0.2em] mt-1 italic uppercase">Happiness in every cup</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-12 w-12" onClick={() => { playClickSound(); setLanguage(l => l === 'th' ? 'en' : 'th'); }}>
              <Globe className="w-5 h-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 relative h-12 w-12" onClick={() => { playClickSound(); setIsCartOpen(true); }}>
              <ShoppingCart className="w-5 h-5 text-primary" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce shadow-lg border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </Button>
            {isAuthorized && (
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-12 w-12" onClick={() => { playClickSound(); router.push('/admin/products'); }}>
                <Settings className="w-5 h-5 text-primary" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 h-12 w-12" onClick={() => { playClickSound(); router.push('/auth/login'); }}>
              <User className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-32">
        <section className="py-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[3rem] bg-white/40 backdrop-blur-md p-8 sm:p-20 border border-primary/5 shadow-2xl flex flex-col items-start text-left gap-8"
          >
            <div className="relative z-30 space-y-6 max-w-2xl w-full">
              <Badge className="bg-primary/10 text-primary border-none px-5 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5 mr-2 inline" /> Grand Opening 2026
              </Badge>

              <div className="space-y-4">
                 <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-primary/5 inline-flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent fill-accent" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Boutique Savor Happiness</p>
                 </div>
                 <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline leading-tight text-slate-800 font-bold">
                  {language === 'th' ? 'ความสุข' : 'Happiness'} <br />
                  <span className="font-bold text-accent italic font-serif">
                    {language === 'th' ? 'ส่งตรงถึงบ้านคุณ' : 'delivered to you'}
                  </span>
                </h1>
              </div>
              
              <div ref={searchRef} className="relative group w-full max-w-xl mt-8 transition-all duration-300 z-40">
                <div className="relative z-50">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      playClickSound();
                      setShowSuggestions(true);
                    }}
                    className="pl-14 pr-14 h-16 rounded-full border-none bg-white shadow-xl text-lg placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all group-focus-within:scale-[1.02] pranz-shadow" 
                    placeholder={t.search}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { playClickSound(); setSearchQuery(''); setShowSuggestions(false); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary/5 text-primary/40 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden z-[60]"
                    >
                      <div className="py-4">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => {
                              playClickSound();
                              setSearchQuery(language === 'en' ? suggestion.name : suggestion.nameTh);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-8 py-3.5 flex items-center gap-4 hover:bg-primary/5 transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm">
                              <img src={suggestion.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                                {language === 'en' ? suggestion.name : suggestion.nameTh}
                              </p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{suggestion.category}</p>
                            </div>
                            <Command className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="mb-12 flex gap-3 overflow-x-auto no-scrollbar pb-4 relative z-0">
          {(['All', 'Coffee', 'Tea', 'Bakery', 'Desserts', 'Other'] as const).map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              className={cn(
                "rounded-full px-8 py-6 h-12 text-sm font-bold transition-all shrink-0",
                activeCategory === cat 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-white text-slate-500 border border-primary/5 hover:border-primary/20 hover:bg-primary/5"
              )}
              onClick={() => { playClickSound(); setActiveCategory(cat); }}
            >
              {cat === 'All' ? t.categories.All : t.categories[cat as keyof typeof t.categories]}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isProductsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[250px] w-full rounded-[40px] bg-slate-200 animate-pulse" />
                <Skeleton className="h-6 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-200" />
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 text-center space-y-6"
            >
               <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-primary/20" />
               </div>
               <p className="text-xl text-slate-400 italic font-medium">{t.noResults}</p>
               <Button 
                variant="outline" 
                onClick={() => { playClickSound(); setSearchQuery(''); setActiveCategory('All'); }} 
                className="rounded-full h-12 px-8 border-primary text-primary hover:bg-primary/5"
               >
                 {t.viewAllMenu}
               </Button>
            </motion.div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card 
                  className="group relative overflow-hidden rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white transition-all duration-500 cursor-pointer h-full flex flex-col shadow-sm"
                  onClick={() => handleAddToCart(product)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img 
                      src={product.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt={product.name}
                    />
                    {product.isBestSeller && (
                      <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                        {t.bestSeller}
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-lg font-bold text-primary shadow-xl border border-primary/5">
                      ฿{product.price}
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col justify-between items-start">
                    <div className="space-y-2 w-full">
                      <div className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.2em]">
                        {product.category}
                      </div>
                      <h3 className="text-xl font-headline font-bold text-slate-800 line-clamp-1">
                        {language === 'en' ? product.name : product.nameTh}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic opacity-70">
                        {language === 'en' ? product.description : product.descriptionTh}
                      </p>
                    </div>
                    
                    <div className="w-full pt-8">
                      <div className="flex items-center justify-between text-primary font-bold text-[10px] tracking-[0.2em] uppercase">
                        <span>{t.addToCart}</span>
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
        <DialogContent className="rounded-[40px] border-none p-0 overflow-hidden max-w-[90vw] sm:max-w-md bg-white shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{language === 'en' ? selectedProduct?.name : selectedProduct?.nameTh}</DialogTitle>
          </DialogHeader>
          <div className="relative h-56">
            <img src={selectedProduct?.imageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-headline font-bold">{language === 'en' ? selectedProduct?.name : selectedProduct?.nameTh}</h2>
              <p className="text-lg opacity-80">฿{selectedProduct?.price}</p>
            </div>
          </div>
          <div className="p-8 space-y-8 max-h-[50vh] overflow-y-auto no-scrollbar">
            {selectedProduct?.hasIceOptions && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> {t.iceOptions}
                </h4>
                <RadioGroup value={tempIce} onValueChange={(v: IceOption) => { playClickSound(); setTempIce(v); }} className="grid grid-cols-3 gap-2">
                  {['Normal', 'No Ice', 'Separate Ice'].map((opt) => (
                    <Label key={opt} className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all cursor-pointer text-center",
                      tempIce === opt ? "border-primary bg-primary/5 text-primary" : "border-slate-50 hover:border-primary/10"
                    )}>
                      <RadioGroupItem value={opt} className="sr-only" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{opt === 'Normal' ? t.normalIce : opt === 'No Ice' ? t.noIce : t.separateIce}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
            <div className="flex items-center justify-between bg-[#F8F7F4] p-5 rounded-[2rem] border border-primary/5">
              <span className="font-bold text-sm text-slate-600">{language === 'en' ? 'Quantity' : 'จำนวน'}</span>
              <div className="flex items-center gap-6">
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => { playClickSound(); setTempQuantity(q => Math.max(1, q - 1)); }}>-</Button>
                <span className="text-xl font-bold w-4 text-center">{tempQuantity}</span>
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => { playClickSound(); setTempQuantity(q => q + 1); }}>+</Button>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0">
            <Button onClick={confirmAddToCart} className="w-full h-16 rounded-[2rem] text-lg font-bold shadow-2xl bg-primary">
              {t.addToCart}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { playClickSound(); setIsCartOpen(false); }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col sm:rounded-l-[3rem] overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3"><ShoppingCart className="w-6 h-6" /> {t.orderDetails}</h2>
                <Button variant="ghost" className="rounded-full" onClick={() => { playClickSound(); setIsCartOpen(false); }}>✕</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary flex items-center gap-2 text-sm uppercase tracking-widest"><MapPin className="w-4 h-4" /> {t.deliveryAddress}</h3>
                    <Button variant="ghost" size="sm" className="rounded-full text-primary font-bold" onClick={() => { playClickSound(); setIsAddressEditing(!isAddressEditing); }}>{isAddressEditing ? t.cancel : 'Edit'}</Button>
                  </div>
                  {isAddressEditing ? (
                    <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder={t.enterAddress} className="rounded-2xl bg-white border-primary/20" />
                  ) : (
                    <p className="text-sm text-slate-600 italic leading-relaxed">{profile?.deliveryAddress || newAddress || t.enterAddress}</p>
                  )}
                </div>
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4 opacity-30"><ShoppingCart className="w-16 h-16 mx-auto" /><p className="font-bold uppercase tracking-widest">{t.cartEmpty}</p></div>
                ) : (
                  cart.map((item) => (
                    <div key={item.uniqueId} className="flex gap-4 p-2 hover:bg-primary/5 rounded-[2rem] transition-all group">
                      <img src={item.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-sm" alt="" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{language === 'en' ? item.name : item.nameTh}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] px-2 py-0 border-none">x{item.quantity}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-accent">฿{(item.price * item.quantity).toLocaleString()}</span>
                          <Button variant="ghost" size="icon" onClick={() => { playClickSound(); setCart(c => c.filter(i => i.uniqueId !== item.uniqueId)); }} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">✕</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-8 border-t bg-[#FDFCF9] space-y-4">
                  <div className="flex justify-between text-sm text-slate-400 font-bold uppercase tracking-widest"><span>{t.subtotal}</span><span>฿{calculateSubtotal().toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-slate-400 font-bold uppercase tracking-widest"><span>{t.deliveryFee}</span><span>฿{DELIVERY_FEE}</span></div>
                  <div className="flex justify-between text-2xl font-headline font-bold text-primary pt-2"><span>{t.total}</span><span>฿{calculateTotal().toLocaleString()}</span></div>
                  <Button className="w-full h-16 rounded-[2rem] bg-primary text-lg font-bold shadow-xl shadow-primary/20" onClick={() => { playClickSound(); setIsCheckoutOpen(true); }}>{t.confirmOrder}</Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="rounded-[40px] border-none p-8 bg-white max-w-sm">
          <DialogHeader><DialogTitle className="text-2xl font-headline font-bold text-primary text-center">{t.paymentMethod}</DialogTitle></DialogHeader>
          <div className="grid gap-4 mt-8">
            <Button onClick={() => { playClickSound(); setPaymentMethod('Cash'); }} className={cn("h-20 rounded-2xl flex flex-col items-start px-6 gap-1 border-2 transition-all", paymentMethod === 'Cash' ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-800")}>
              <span className="font-bold uppercase tracking-widest text-xs opacity-80">{t.cash}</span><span className="text-[10px]">{t.payAtCounter}</span>
            </Button>
            <Button onClick={() => { playClickSound(); setPaymentMethod('PromptPay'); }} className={cn("h-20 rounded-2xl flex flex-col items-start px-6 gap-1 border-2 transition-all", paymentMethod === 'PromptPay' ? "bg-accent border-accent text-white" : "bg-white border-slate-100 text-slate-800")}>
              <span className="font-bold uppercase tracking-widest text-xs opacity-80">{t.promptPay}</span><span className="text-[10px]">{t.scanToPay}</span>
            </Button>
          </div>
          <Button onClick={handleCheckout} className="w-full h-16 rounded-[2rem] mt-8 bg-primary text-lg font-bold shadow-lg">{t.completePayment}</Button>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-[200] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="bg-white p-10 rounded-[4rem] shadow-2xl mb-12 border border-primary/5"
            >
              <CheckCircle2 className="w-32 h-32 text-primary" />
            </motion.div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-5xl font-headline font-bold text-primary">{t.orderSuccess}</h2>
              <p className="text-lg text-slate-500 italic leading-relaxed">{t.orderSuccessDesc}</p>
            </div>
            <Button 
              onClick={() => { playClickSound(); setIsOrderSuccess(false); }} 
              className="mt-16 w-full max-w-sm h-20 rounded-[2.5rem] bg-primary text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              {t.done}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-8 right-8 z-40 flex justify-between items-center pointer-events-none">
        <Button 
          className="pointer-events-auto h-12 px-6 rounded-full bg-accent text-white font-bold shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95" 
          onClick={() => { playClickSound(); setIsChatOpen(true); }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline font-headline text-sm uppercase tracking-wider">{t.contactSupport}</span>
        </Button>
      </div>

      {isChatOpen && <ChatWindow targetCustomerId={user?.uid || 'guest'} language={language} onClose={() => { playClickSound(); setIsChatOpen(false); }} />}
    </div>
  );
}
