import React, { useState, useRef } from 'react';
import HeroSection from '../components/customer/HeroSection';
import CategoryTabs from '../components/customer/CategoryTabs';
import ProductCard from '../components/customer/ProductCard';
import FloatingCart from '../components/customer/FloatingCart';
import CheckoutModal from '../components/customer/CheckoutModal';
import OrderSuccess from '../components/customer/OrderSuccess';

const menuData = [
  // Coffee
  { id: 1, category: 'Coffee', productName: 'Espresso Shot', description: 'Pure, intense espresso shot.', price: 100, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '3 mins', calories: '5 kcal' },
  { id: 2, category: 'Coffee', productName: 'Cappuccino', description: 'Rich espresso with steamed milk foam. Perfectly balanced.', price: 150, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '120 kcal' },
  { id: 3, category: 'Coffee', productName: 'Classic Latte', description: 'Smooth espresso with plenty of steamed milk.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins', calories: '150 kcal' },
  { id: 4, category: 'Coffee', productName: 'Iced Caramel Mocha', description: 'Chilled espresso with chocolate, caramel, and milk.', price: 220, imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '7 mins', calories: '280 kcal' },
  
  // Tea
  { id: 5, category: 'Tea', productName: 'Masala Chai', description: 'Traditional Indian spiced tea brewed to perfection.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '10 mins', calories: '90 kcal' },
  { id: 6, category: 'Tea', productName: 'Matcha Green Tea', description: 'Premium Japanese matcha with steamed almond milk.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '5 mins', calories: '60 kcal' },
  { id: 7, category: 'Tea', productName: 'Peach Iced Tea', description: 'Refreshing iced black tea infused with sweet peach.', price: 140, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins', calories: '110 kcal' },
  { id: 8, category: 'Tea', productName: 'Earl Grey Hot', description: 'Classic bergamot infused black tea.', price: 130, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop', rating: '4.4', prepTime: '5 mins', calories: '2 kcal' },

  // Burgers
  { id: 9, category: 'Burgers', productName: 'Classic Veg Burger', description: 'Crispy potato patty with fresh lettuce and mayo.', price: 150, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', rating: '4.3', prepTime: '10 mins', calories: '350 kcal' },
  { id: 10, category: 'Burgers', productName: 'Cheese Chicken Burger', description: 'Juicy chicken patty with melted cheddar.', price: 250, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '15 mins', calories: '450 kcal' },
  { id: 11, category: 'Burgers', productName: 'Spicy Paneer Burger', description: 'Spicy paneer chunk with tandoori mayo.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '12 mins', calories: '400 kcal' },
  { id: 12, category: 'Burgers', productName: 'Double Beef Smash', description: 'Two smashed patties, double cheese, caramelized onions.', price: 320, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '15 mins', calories: '800 kcal' },

  // Pizza
  { id: 13, category: 'Pizza', productName: 'Margherita (Veg)', description: 'Classic delight with 100% real mozzarella cheese.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '20 mins', calories: '600 kcal' },
  { id: 14, category: 'Pizza', productName: 'Farmhouse (Veg)', description: 'Loaded with fresh veggies and mozzarella.', price: 420, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '20 mins', calories: '750 kcal' },
  { id: 15, category: 'Pizza', productName: 'Pepperoni (Non-Veg)', description: 'Crispy pepperoni slices on a bed of cheese.', price: 480, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '900 kcal' },
  { id: 16, category: 'Pizza', productName: 'BBQ Chicken (Non-Veg)', description: 'Smoky BBQ chicken, red onions, and cilantro.', price: 460, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '20 mins', calories: '850 kcal' },

  // Desserts
  { id: 17, category: 'Desserts', productName: 'Fudge Brownie', description: 'Warm fudge brownie with a crisp exterior.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins', calories: '350 kcal' },
  { id: 18, category: 'Desserts', productName: 'New York Cheesecake', description: 'Classic creamy cheesecake with graham cracker crust.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '400 kcal' },
  { id: 19, category: 'Desserts', productName: 'Classic Tiramisu', description: 'Coffee-flavored Italian dessert.', price: 300, imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins', calories: '420 kcal' },

  // New Additions
  { id: 20, category: 'Pasta', productName: 'Truffle Mushroom Pasta', description: 'Creamy pasta with black truffle shavings.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '550 kcal' },
  { id: 21, category: 'Salads', productName: 'Mediterranean Salad', description: 'Fresh greens, feta, olives, and lemon vinaigrette.', price: 300, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '10 mins', calories: '250 kcal' },
  { id: 22, category: 'Steaks', productName: 'Ribeye Steak', description: 'Prime cut ribeye with garlic butter.', price: 950, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '25 mins', calories: '850 kcal' },
  { id: 23, category: 'Appetizers', productName: 'Crispy Calamari', description: 'Lightly fried squid with tartare sauce.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1599487405270-8e12eb23c280?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '15 mins', calories: '400 kcal' },
  { id: 24, category: 'Smoothies', productName: 'Berry Blast', description: 'Mixed wild berries and yogurt blend.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '180 kcal' }
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
      
      <div ref={menuRef} className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 pb-32">
        <CategoryTabs 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        <div className="w-full py-12 flex flex-col items-center">
          {(() => {
            const rows = [];
            let i = 0;
            let useFour = true;
            while (i < filteredMenu.length) {
              const chunkSize = useFour ? 4 : 3;
              rows.push(filteredMenu.slice(i, i + chunkSize));
              i += chunkSize;
              useFour = !useFour;
            }

            return rows.map((row, index) => (
              <div 
                key={index} 
                className="w-full flex flex-wrap justify-center items-start gap-8 mb-8 md:mb-10"
              >
                {row.map(product => (
                  <div 
                    key={product.id} 
                    className={`w-full sm:w-[calc(50%-1rem)] ${row.length === 4 ? 'lg:w-[calc(25%-1.5rem)]' : 'lg:w-[calc(33.333%-1.5rem)]'}`}
                  >
                    <ProductCard product={product} onAdd={addToCart} />
                  </div>
                ))}
              </div>
            ));
          })()}
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
