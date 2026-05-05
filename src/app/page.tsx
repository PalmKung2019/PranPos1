'use client';

import { useState } from 'react';
import CartItem from '@/components/pos/CartItem';
// หากมี Component สินค้าแยกไว้ สามารถ import เข้ามาได้เลยครับ
// import ProductCard from '@/components/pos/ProductCard';

export default function POSPage() {
  // ตัวอย่าง Mock Data สำหรับสินค้า (สามารถเปลี่ยนเป็นการดึงจาก Firebase ได้ในภายหลัง)
  const [products] = useState([
    { id: 1, name: 'Savor Signature Cocoa', price: 85, image: '/placeholder-image.jpg' },
    { id: 2, name: 'Strawberry Milk', price: 75, image: '/placeholder-image.jpg' },
    { id: 3, name: 'Matcha Latte', price: 90, image: '/placeholder-image.jpg' },
  ]);

  const [cart, setCart] = useState([]);

  // ฟังก์ชันตัวอย่างสำหรับการเพิ่มสินค้าลงตะกร้า
  const addToCart = (product) => {
    // ใส่ Logic การเพิ่มสินค้าของคุณได้ที่นี่
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      
      {/* ส่วนซ้าย: รายการสินค้า (ใช้พื้นที่ 70%) */}
      <main className="flex-1 flex flex-col h-full">
        {/* Header ของฝั่งสินค้า */}
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold text-slate-800">เมนูสินค้า</h1>
          {/* สามารถใส่ Input ค้นหาสินค้าตรงนี้ได้ */}
        </header>

        {/* ตาราง/Grid แสดงสินค้า */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center active:scale-95"
              >
                <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden">
                  {/* เปลี่ยนเป็น <img /> หรือ <Image /> ของ Next.js ได้ครับ */}
                  <div className="w-full h-full flex items-center justify-center text-slate-400">รูปสินค้า</div>
                </div>
                <h3 className="font-semibold text-slate-700">{product.name}</h3>
                <p className="text-blue-600 font-medium mt-1">฿{product.price}</p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ส่วนขวา: ตะกร้าสินค้าและระบบชำระเงิน (ใช้พื้นที่ 30%) */}
      <aside className="w-96 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-20">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">ออเดอร์ปัจจุบัน</h2>
          <p className="text-sm text-slate-500 mt-1">รายการสินค้าที่เลือก</p>
        </div>

        {/* รายการสินค้าในตะกร้า */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* เดี๋ยวเราจะไปทำไฟล์ CartItem.tsx มาใส่ตรงนี้นะครับ */}
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              ยังไม่มีสินค้าในตะกร้า
            </div>
          ) : (
            cart.map((item, index) => (
              <CartItem key={index} item={item} />
            ))
          )}
        </div>

        {/* ส่วนสรุปยอดและชำระเงิน */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500">ยอดรวม</span>
            <span className="font-semibold text-lg">฿0.00</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-blue-600">
            <span className="font-semibold">ยอดสุทธิ</span>
            <span className="text-2xl font-bold">฿0.00</span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm">
            ชำระเงิน
          </button>
        </div>
      </aside>

    </div>
  );
}
