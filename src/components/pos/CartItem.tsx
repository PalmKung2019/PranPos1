"use client"

import React from 'react';
import { Minus, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Topping, IceOption } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: Product & { 
    quantity: number; 
    selectedToppings: Topping[];
    iceOption?: IceOption;
    uniqueId: string;
  };
  language: 'en' | 'th';
  onUpdateQuantity: (uniqueId: string, delta: number) => void;
  onRemove: (uniqueId: string) => void;
  onEdit: (item: any) => void;
}

export const CartItem = ({ item, language, onUpdateQuantity, onRemove, onEdit }: CartItemProps) => {
  const toppingsPrice = item.selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const unitPrice = item.price + toppingsPrice;

  return (
    <motion.div 
      layout
      className="flex flex-col gap-4 py-6 border-b border-primary/5 last:border-0 group bg-white hover:bg-primary/5 transition-all rounded-[32px] px-6 -mx-2 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-[24px] overflow-hidden shrink-0 shadow-lg border-2 border-white">
          <img src={item.imageUrl} alt={language === 'en' ? item.name : item.nameTh} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline text-xl truncate text-primary leading-tight">{language === 'en' ? item.name : item.nameTh}</p>
          <p className="text-base text-accent font-bold mt-1">฿{unitPrice.toLocaleString()}</p>
          
          {(item.selectedToppings.length > 0 || item.iceOption) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.iceOption && (
                <div className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                  {item.iceOption === 'Normal' ? (language === 'en' ? 'Normal Ice' : 'น้ำแข็งปกติ') :
                   item.iceOption === 'No Ice' ? (language === 'en' ? 'No Ice' : 'ไม่ใส่น้ำแข็ง') :
                   (language === 'en' ? 'Separate Ice' : 'แยกน้ำแข็ง')}
                </div>
              )}
              {item.selectedToppings.map(t => (
                <div key={t.id} className="text-[10px] font-bold bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-tighter">
                  {language === 'en' ? t.name : t.nameTh}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-secondary/30 rounded-full p-1.5 border border-primary/5 shadow-inner">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white text-primary shadow-sm"
              onClick={() => onUpdateQuantity(item.uniqueId, -1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold w-6 text-center text-primary">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white text-primary shadow-sm"
              onClick={() => onUpdateQuantity(item.uniqueId, 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
              onClick={() => onEdit(item)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
              onClick={() => onRemove(item.uniqueId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};