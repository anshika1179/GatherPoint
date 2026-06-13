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
  { id: 5, category: 'Tea', productName: 'Masala Chai', description: 'Traditional Indian spiced tea brewed to perfection.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '10 mins', calories: '90 kcal' },
  { id: 6, category: 'Tea', productName: 'Matcha Green Tea', description: 'Premium Japanese matcha with steamed almond milk.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '5 mins', calories: '60 kcal' },
  { id: 7, category: 'Tea', productName: 'Peach Iced Tea', description: 'Refreshing iced black tea infused with sweet peach.', price: 140, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins', calories: '110 kcal' },
  { id: 8, category: 'Tea', productName: 'Earl Grey Hot', description: 'Classic bergamot infused black tea.', price: 130, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop', rating: '4.4', prepTime: '5 mins', calories: '2 kcal' },
  { id: 101, category: 'Tea', productName: 'Lemon Ginger Tea', description: 'Soothing blend of lemon and ginger.', price: 130, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '5 mins', calories: '5 kcal' },
  { id: 102, category: 'Tea', productName: 'Jasmine Green Tea', description: 'Light green tea with floral jasmine notes.', price: 150, imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '2 kcal' },
  { id: 103, category: 'Tea', productName: 'Peppermint Tea', description: 'Caffeine-free refreshing mint tea.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins', calories: '0 kcal' },
  { id: 104, category: 'Tea', productName: 'Chamomile Relaxer', description: 'Calming chamomile flowers steeped gently.', price: 140, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '7 mins', calories: '2 kcal' },
  { id: 105, category: 'Tea', productName: 'Hibiscus Iced Tea', description: 'Tart and vibrant chilled hibiscus.', price: 160, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '40 kcal' },
  { id: 106, category: 'Tea', productName: 'Oolong Classic', description: 'Partially oxidized traditional Chinese tea.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '8 mins', calories: '5 kcal' },

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
  { id: 107, category: 'Pizza', productName: 'Four Cheese (Veg)', description: 'Mozzarella, Cheddar, Parmesan, and Gouda.', price: 500, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '850 kcal' },
  { id: 108, category: 'Pizza', productName: 'Mushroom Truffle (Veg)', description: 'Earthy mushrooms and truffle oil.', price: 480, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '20 mins', calories: '700 kcal' },
  { id: 109, category: 'Pizza', productName: 'Hawaiian (Non-Veg)', description: 'Classic ham and pineapple with mozzarella.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '20 mins', calories: '780 kcal' },
  { id: 110, category: 'Pizza', productName: 'Meat Lovers (Non-Veg)', description: 'Loaded with pepperoni, sausage, and bacon.', price: 550, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '25 mins', calories: '1100 kcal' },
  { id: 111, category: 'Pizza', productName: 'Paneer Tikka (Veg)', description: 'Spicy paneer chunks with bell peppers.', price: 430, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '20 mins', calories: '800 kcal' },
  { id: 112, category: 'Pizza', productName: 'Spicy Chicken Sausage (Non-Veg)', description: 'Sliced chicken sausage with jalapenos.', price: 470, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '20 mins', calories: '820 kcal' },

  // Desserts
  { id: 17, category: 'Desserts', productName: 'Fudge Brownie', description: 'Warm fudge brownie with a crisp exterior.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins', calories: '350 kcal' },
  { id: 18, category: 'Desserts', productName: 'New York Cheesecake', description: 'Classic creamy cheesecake with graham cracker crust.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '400 kcal' },
  { id: 19, category: 'Desserts', productName: 'Classic Tiramisu', description: 'Coffee-flavored Italian dessert.', price: 300, imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins', calories: '420 kcal' },

  // New Additions
  { id: 20, category: 'Pasta', productName: 'Truffle Mushroom Pasta', description: 'Creamy pasta with black truffle shavings.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '550 kcal' },
  { id: 21, category: 'Salads', productName: 'Mediterranean Salad', description: 'Fresh greens, feta, olives, and lemon vinaigrette.', price: 300, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '10 mins', calories: '250 kcal' },
  { id: 22, category: 'Steaks', productName: 'Ribeye Steak', description: 'Prime cut ribeye with garlic butter.', price: 950, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '25 mins', calories: '850 kcal' },
  { id: 23, category: 'Appetizers', productName: 'Crispy Calamari', description: 'Lightly fried squid with tartare sauce.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '15 mins', calories: '400 kcal' },
  { id: 24, category: 'Smoothies', productName: 'Berry Blast', description: 'Mixed wild berries and yogurt blend.', price: 200, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins', calories: '180 kcal' }
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
      
      <div ref={menuRef} className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 pb-32">
        <CategoryTabs 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        <div className="w-full py-12 flex flex-col items-center justify-center">
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
                className={`w-full xl:w-max mx-auto grid gap-6 md:gap-10 mb-8 md:mb-12 justify-items-center ${
                  row.length === 4 ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' : 
                  row.length === 3 ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 
                  row.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {row.map(product => (
                  <div 
                    key={product.id} 
                    className="w-full sm:w-[320px] lg:w-[350px]"
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
