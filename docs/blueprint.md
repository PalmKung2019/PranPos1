# **App Name**: Pranz POS

## Core Features:

- Secure User Authentication: Allow users to log in and sign up securely using Firebase Authentication, featuring a beautifully designed entry interface.
- Interactive Product Catalog & Search: Display menu items categorized by type (e.g., Coffee, Bakery, Desserts) with a fast and responsive search function, powered by real-time data from Firestore.
- AI-Powered Menu Description Tool: A tool for managers to generate unique, warm, and inviting descriptions for new menu items, enhancing product appeal consistent with the 'Pranz House' brand aesthetic.
- Manager Mode: Product Operations: Enable authorized managers to effortlessly add, edit, or remove products from the menu, including a confirmation modal to prevent accidental deletions, with updates stored in Firestore.
- Dynamic Shopping Cart System: Automatically calculate total prices, including 7% VAT, with user-friendly controls for adjusting item quantities in the order.
- Seamless Multi-Channel Checkout: Facilitate a smooth order summary process, support diverse payment methods (PromptPay, TrueMoney, Google Pay, Credit Card, Cash with auto-calculated change), and display real-time order status and queue numbers, all linked to Firestore.
- Robust Data Resilience: Implement a fallback mechanism to automatically use local mock data for products if Cloud Firestore connectivity issues or permission restrictions are encountered, ensuring uninterrupted service.

## Style Guidelines:

- Primary Color: A deep, warm coffee brown (#A37028) that evokes a sense of comfort and luxury, perfect for brand elements and important interactions.
- Background Color: A soft, creamy off-white (#F5F2EF) providing a bright yet inviting canvas that complements the 'cozy & warm' cafe ambiance.
- Accent Color: A rich, golden-brown terracotta (#B78114) for highlights and call-to-action elements, adding an artistic touch that maintains the natural warmth.
- Headlines: 'Belleza' (humanist sans-serif) for an elegant, artistic, and modern aesthetic. Body text: 'Alegreya' (humanist serif) to provide a contemporary yet intellectual and highly readable flow for longer content.
- Use clean line icons with rounded edges, specifically incorporating a stylized 'bear' motif as the unique brand symbol for key elements, replacing generic coffee icons.
- Employ generous rounded corners (48px-56px) for UI elements, incorporate subtle backdrop blur effects for depth, and design a highly responsive layout (using Tailwind CSS) that adapts gracefully to various screen sizes, featuring clearly separated, modular components like modals, sidebars, and cards.
- Implement smooth and subtle animations throughout the user interface, including engaging skeleton loading states for content fetching and gentle transitions for status changes (e.g., order processing), enhancing the overall 'soft' and fluid user experience.