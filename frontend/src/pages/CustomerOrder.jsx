import React, { useState, useRef } from 'react';
import HeroSection from '../components/customer/HeroSection';
import CategoryTabs from '../components/customer/CategoryTabs';
import ProductCard from '../components/customer/ProductCard';
import FloatingCart from '../components/customer/FloatingCart';
import CheckoutModal from '../components/customer/CheckoutModal';
import OrderSuccess from '../components/customer/OrderSuccess';

const menuData = [
  { id: 1, category: 'Coffee', productName: 'Cappuccino', description: 'Rich espresso with steamed milk foam. Perfectly balanced.', price: 150, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '120 kcal' },
  { id: 2, category: 'Coffee', productName: 'Latte', description: 'Smooth espresso with plenty of steamed milk. A morning classic.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins', calories: '150 kcal' },
  { id: 3, category: 'Burgers', productName: 'Cheese Burger', description: 'Juicy patty with melted cheese and fresh veggies in a toasted bun.', price: 250, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '15 mins', calories: '450 kcal' },
  { id: 4, category: 'Pizza', productName: 'Margherita', description: 'Classic delight with 100% real mozzarella cheese on thin crust.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '20 mins', calories: '600 kcal' },
  { id: 5, category: 'Tea', productName: 'Masala Chai', description: 'Traditional Indian spiced tea brewed to perfection.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '10 mins', calories: '90 kcal' },
  { id: 6, category: 'Desserts', productName: 'Fudge Brownie', description: 'Warm fudge brownie with a crisp exterior and gooey center.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins', calories: '350 kcal' },
];

const CustomerOrder = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  
  const menuRef = useRef(null);

  const handleBrowseClick = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (product, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === product.id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (product) => {
    setCart(prev => prev.filter(item => item.id !== product.id));
  };

  const handleCheckoutConfirm = (formData) => {
    // Generate random order ID
    const newOrderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setOrderSuccessId(newOrderId);
      setCart([]);
    }, 500);
  };

  const filteredMenu = selectedCategory === 'All' 
    ? menuData 
    : menuData.filter(item => item.category === selectedCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (subtotal * 0.05);

  return (
    <div className="bg-customer-bg min-h-screen text-customer-text font-sans selection:bg-customer-accent selection:text-customer-bg">
      <HeroSection onBrowseClick={handleBrowseClick} />
      
      <div ref={menuRef} className="pb-32">
        <CategoryTabs 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        <div className="max-w-[90rem] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredMenu.map(product => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </div>

      <FloatingCart 
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleCheckoutConfirm}
        total={total}
      />

      {orderSuccessId && (
        <OrderSuccess 
          orderId={orderSuccessId} 
          onTrackOrder={() => setOrderSuccessId(null)} 
        />
      )}
    </div>
  );
};

export default CustomerOrder;
