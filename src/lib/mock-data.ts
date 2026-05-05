export type ProductCategory = 'Coffee' | 'Tea' | 'Bakery' | 'Desserts' | 'Other';
export type IceOption = 'Normal' | 'No Ice' | 'Separate Ice';

export interface Product {
  id: string;
  name: string;
  nameTh: string;
  category: ProductCategory;
  price: number;
  description: string;
  descriptionTh: string;
  imageUrl: string;
  hasIceOptions?: boolean;
  isBestSeller?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Signature Bear Latte',
    nameTh: 'ซิกเนเจอร์ แบร์ ลาเต้',
    category: 'Coffee',
    price: 95,
    description: 'Smooth, velvety latte topped with signature bear foam.',
    descriptionTh: 'ลาเต้รสนุ่มละมุน ตกแต่งด้วยฟองนมน้องหมีสุดน่ารัก',
    imageUrl: '/images/bear_latte.png',
    hasIceOptions: true,
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Fluffy Cappuccino',
    nameTh: 'คาปูชิโน่ฟองนุ่ม',
    category: 'Coffee',
    price: 85,
    description: 'Intense espresso meets airy milk foam.',
    descriptionTh: 'เอสเพรสโซ่เข้มข้น ผสมผสานกับฟองนมหนานุ่ม',
    imageUrl: '/images/cappuccino.png',
    hasIceOptions: true
  },
  {
    id: '3',
    name: 'Caramel Macchiato',
    nameTh: 'คาราเมล มัคคิอาโต้',
    category: 'Coffee',
    price: 105,
    description: 'Espresso, vanilla, and house-made caramel.',
    descriptionTh: 'เอสเพรสโซ่ วานิลลา และซอสคาราเมลเคี่ยวเอง',
    imageUrl: '/images/caramel_macchiato.png',
    hasIceOptions: true
  },
  {
    id: '4',
    name: 'Premium Uji Matcha Latte',
    nameTh: 'อูจิ มัทฉะ ลาเต้',
    category: 'Tea',
    price: 125,
    description: 'Finest Uji matcha with silky milk.',
    descriptionTh: 'มัทฉะคัดเกรดพิเศษจากเมืองอูจิผสมนมสด',
    imageUrl: '/images/matcha_latte.png',
    hasIceOptions: true,
    isBestSeller: true
  },
  {
    id: '5',
    name: 'Classic Thai Milk Tea',
    nameTh: 'ชาไทยต้นตำรับ',
    category: 'Tea',
    price: 75,
    description: 'Bold Thai tea brewed and mixed with creamy milk.',
    descriptionTh: 'ใบชาไทยคัดเกรดต้มสดใหม่ ผสมกับนมรสนุ่ม',
    imageUrl: '/images/thai_tea.png',
    hasIceOptions: true
  },
  {
    id: '6',
    name: 'Butter Croissant',
    nameTh: 'ครัวซองต์เนยสด',
    category: 'Bakery',
    price: 85,
    description: 'Golden, flaky layers of pure French butter.',
    descriptionTh: 'ชั้นแป้งบางกรอบสีทอง หอมกรุ่นกลิ่นเนยแท้',
    imageUrl: '/images/butter_croissant.png',
    isBestSeller: true
  },
  {
    id: '7',
    name: 'Almond Croissant',
    nameTh: 'ครัวซองต์อัลมอนด์',
    category: 'Bakery',
    price: 105,
    description: 'Twice-baked croissant with almond frangipane.',
    descriptionTh: 'ครัวซองต์อบซ้ำจนกรอบ สอดไส้ครีมอัลมอนด์',
    imageUrl: '/images/almond_croissant.png'
  },
  {
    id: '8',
    name: 'Garlic Butter Bread',
    nameTh: 'ขนมปังเนยกระเทียม',
    category: 'Bakery',
    price: 115,
    description: 'Soft bread infused with roasted garlic.',
    descriptionTh: 'ขนมปังเนื้อนุ่มชุ่มเนยกระเทียมหอมกรุ่น',
    imageUrl: '/images/garlic_bread.png'
  },
  {
    id: '9',
    name: 'Ham & Cheese Toast',
    nameTh: 'แฮมชีสโทสต์',
    category: 'Bakery',
    price: 125,
    description: 'Golden toast stuffed with premium ham and cheese.',
    descriptionTh: 'ขนมปังปิ้งสีทอง อัดแน่นด้วยแฮมและชีสเยิ้มๆ',
    imageUrl: '/images/ham_cheese_toast.png'
  },
  {
    id: '10',
    name: 'New York Cheesecake',
    nameTh: 'นิวยอร์กชีสเค้ก',
    category: 'Desserts',
    price: 145,
    description: 'Ultra-creamy cheesecake on a graham crust.',
    descriptionTh: 'ชีสเค้กเนื้อเนียนนุ่ม ตัดกับฐานแครกเกอร์กรอบ',
    imageUrl: '/images/ny_cheesecake.png'
  },
  {
    id: '11',
    name: 'Strawberry Shortcake',
    nameTh: 'สตรอว์เบอร์รี่ ชอร์ตเค้ก',
    category: 'Desserts',
    price: 135,
    description: 'Light sponge cake with strawberries and cream.',
    descriptionTh: 'สปันจ์เค้กเนื้อนุ่มสลับชั้นกับสตรอว์เบอร์รี่สด',
    imageUrl: '/images/strawberry_shortcake.png',
    isBestSeller: true
  },
  {
    id: '12',
    name: 'Fudge Chocolate Brownie',
    nameTh: 'ฟัดจ์บราวนี่',
    category: 'Desserts',
    price: 95,
    description: 'Rich dark chocolate brownie. Pure bliss.',
    descriptionTh: 'บราวนี่เนื้อหนึบหนับ เข้มข้นด้วยช็อกโกแลตแท้',
    imageUrl: '/images/brownie.png'
  },
  {
    id: '13',
    name: 'Warm Apple Pie',
    nameTh: 'แอปเปิ้ลพายอุ่นๆ',
    category: 'Desserts',
    price: 155,
    description: 'Classic apple pie with cinnamon-spiced filling.',
    descriptionTh: 'พายแอปเปิ้ลต้นตำรับ สอดไส้แอปเปิ้ลผัดซินนามอน',
    imageUrl: '/images/apple_pie.png'
  },
  {
    id: '14',
    name: 'Honey Lemon Soda',
    nameTh: 'ฮันนี่เลม่อนโซดา',
    category: 'Other',
    price: 85,
    description: 'Refreshing lemon juice with wild honey and soda.',
    descriptionTh: 'น้ำเลมอนคั้นสดผสมน้ำผึ้งป่าและโซดาซ่าสดชื่น',
    imageUrl: '/images/honey_lemon_soda.png',
    hasIceOptions: true
  },
  {
    id: '15',
    name: 'Premium Iced Cocoa',
    nameTh: 'โกโก้เย็นพรีเมียม',
    category: 'Other',
    price: 85,
    description: 'Rich and intense dark cocoa with fresh milk.',
    descriptionTh: 'โกโก้รสเข้มข้น ผสมผสานกับนมสดรสนุ่ม',
    imageUrl: '/images/iced_cocoa.png',
    hasIceOptions: true,
    isBestSeller: true
  },
  {
    id: '16',
    name: 'Signature Nom Yen',
    nameTh: 'นมชมพูซิกเนเจอร์',
    category: 'Other',
    price: 75,
    description: 'Iconic Thai pink milk. A nostalgic delight.',
    descriptionTh: 'นมชมพูสูตรลับเฉพาะ รสชาติหอมหวานละมุน',
    imageUrl: '/images/nom_yen.png',
    hasIceOptions: true
  },
  {
    id: '17',
    name: 'Truffle Sea Salt Fries',
    nameTh: 'เฟรนช์ฟรายส์ทรัฟเฟิล',
    category: 'Other',
    price: 125,
    description: 'Crispy fries tossed in truffle oil and sea salt.',
    descriptionTh: 'เฟรนช์ฟรายส์คลุกเคล้าด้วยน้ำมันทรัฟเฟิลพรีเมียม',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800'
  }
];
