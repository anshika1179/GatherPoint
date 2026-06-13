import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/customer/ProductCard';
import FloatingCart from '../components/customer/FloatingCart';
import CheckoutModal from '../components/customer/CheckoutModal';
import ProductDetailModal from '../components/customer/ProductDetailModal';
import OrderSuccess from '../components/customer/OrderSuccess';
import Logo from '../components/customer/Logo';
import { ShoppingBag, ChevronDown, BookOpen, CreditCard, Trash2, Plus, Minus, Smartphone, Banknote, ArrowRight } from 'lucide-react';

// Deduplicated menu — each item has a unique image
const menuData = [
  // Coffee
  { id: 1,  category: 'Coffee',     productName: 'Espresso Shot',         description: 'Pure, intense espresso with rich crema.',             price: 100, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '3 mins',  calories: '5 kcal'   },
  { id: 2,  category: 'Coffee',     productName: 'Cappuccino',             description: 'Rich espresso with velvety steamed milk foam.',        price: 150, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins',  calories: '120 kcal' },
  { id: 3,  category: 'Coffee',     productName: 'Classic Latte',          description: 'Smooth espresso layered with steamed milk.',           price: 180, imageUrl: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins',  calories: '150 kcal' },
  { id: 4,  category: 'Coffee',     productName: 'Iced Caramel Mocha',     description: 'Chilled espresso with chocolate, caramel & milk.',    price: 220, imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '7 mins',  calories: '280 kcal' },

  // Tea
  { id: 5,  category: 'Tea',        productName: 'Masala Chai',            description: 'Traditional Indian spiced tea brewed perfectly.',     price: 120, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '10 mins', calories: '90 kcal'  },
  { id: 6,  category: 'Tea',        productName: 'Matcha Green Tea',       description: 'Premium Japanese matcha with almond milk.',           price: 200, imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '5 mins',  calories: '60 kcal'  },
  { id: 7,  category: 'Tea',        productName: 'Peach Iced Tea',         description: 'Refreshing black tea with sweet peach infusion.',     price: 140, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '5 mins',  calories: '110 kcal' },
  { id: 8,  category: 'Tea',        productName: 'Earl Grey',              description: 'Classic bergamot-infused black tea, served hot.',     price: 130, imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca3d7b1d2?q=80&w=600&auto=format&fit=crop', rating: '4.4', prepTime: '5 mins',  calories: '2 kcal'   },
  { id: 9,  category: 'Tea',        productName: 'Hibiscus Iced Tea',      description: 'Tart and vibrant chilled hibiscus blend.',            price: 160, imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins',  calories: '40 kcal'  },

  // Burgers
  { id: 10, category: 'Burgers',    productName: 'Classic Veg Burger',     description: 'Crispy potato patty with lettuce and mayo.',          price: 150, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', rating: '4.3', prepTime: '10 mins', calories: '350 kcal' },
  { id: 11, category: 'Burgers',    productName: 'Cheese Chicken Burger',  description: 'Juicy chicken patty with melted cheddar cheese.',     price: 250, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '15 mins', calories: '450 kcal' },
  { id: 12, category: 'Burgers',    productName: 'Spicy Paneer Burger',    description: 'Paneer chunk with tandoori mayo and crispy onions.',  price: 200, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '12 mins', calories: '400 kcal' },
  { id: 13, category: 'Burgers',    productName: 'Double Beef Smash',      description: 'Two smashed patties, double cheese, caramelised onions.', price: 320, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '15 mins', calories: '800 kcal' },

  // Pizza
  { id: 14, category: 'Pizza',      productName: 'Margherita',             description: 'Classic mozzarella and fresh basil on tomato.',       price: 350, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '20 mins', calories: '600 kcal' },
  { id: 15, category: 'Pizza',      productName: 'Farmhouse Veg',          description: 'Loaded with fresh seasonal vegetables and cheese.',   price: 420, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '20 mins', calories: '750 kcal' },
  { id: 16, category: 'Pizza',      productName: 'Pepperoni',              description: 'Crispy pepperoni slices on a rich cheese bed.',       price: 480, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '900 kcal' },
  { id: 17, category: 'Pizza',      productName: 'BBQ Chicken',            description: 'Smoky BBQ chicken with red onions and cilantro.',     price: 460, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '20 mins', calories: '850 kcal' },
  { id: 18, category: 'Pizza',      productName: 'Four Cheese',            description: 'Mozzarella, Cheddar, Parmesan and Gouda blend.',      price: 500, imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '850 kcal' },

  // Desserts
  { id: 19, category: 'Desserts',   productName: 'Fudge Brownie',          description: 'Warm, dense brownie with crisp exterior.',            price: 200, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins',  calories: '350 kcal' },
  { id: 20, category: 'Desserts',   productName: 'NY Cheesecake',          description: 'Creamy cheesecake with graham cracker crust.',        price: 280, imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins',  calories: '400 kcal' },
  { id: 21, category: 'Desserts',   productName: 'Classic Tiramisu',       description: 'Authentic Italian coffee-flavoured layered dessert.',  price: 300, imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins',  calories: '420 kcal' },

  // Pasta
  { id: 22, category: 'Pasta',      productName: 'Truffle Mushroom Pasta', description: 'Creamy pasta with earthy black truffle shavings.',    price: 450, imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '20 mins', calories: '550 kcal' },
  { id: 23, category: 'Pasta',      productName: 'Arrabbiata',             description: 'Spicy tomato sauce with penne and fresh basil.',      price: 320, imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '15 mins', calories: '480 kcal' },
  { id: 24, category: 'Pasta',      productName: 'Carbonara',              description: 'Classic Roman pasta with egg, pecorino and guanciale.', price: 380, imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '18 mins', calories: '620 kcal' },

  // Salads
  { id: 25, category: 'Salads',     productName: 'Mediterranean Salad',    description: 'Fresh greens, feta, olives and lemon vinaigrette.',   price: 300, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop', rating: '4.7', prepTime: '10 mins', calories: '250 kcal' },
  { id: 26, category: 'Salads',     productName: 'Caesar Salad',           description: 'Romaine, parmesan, croutons and house Caesar dressing.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '10 mins', calories: '320 kcal' },

  // Steaks
  { id: 27, category: 'Steaks',     productName: 'Ribeye Steak',           description: 'Prime-cut ribeye with garlic herb butter.',           price: 950, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '25 mins', calories: '850 kcal' },
  { id: 28, category: 'Steaks',     productName: 'Tenderloin Steak',       description: 'Butter-soft tenderloin with peppercorn sauce.',       price: 1100, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '25 mins', calories: '720 kcal' },

  // Appetizers
  { id: 29, category: 'Appetizers', productName: 'Crispy Calamari',        description: 'Lightly fried squid rings with tartare sauce.',       price: 350, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=600&auto=format&fit=crop', rating: '4.6', prepTime: '15 mins', calories: '400 kcal' },
  { id: 30, category: 'Appetizers', productName: 'Bruschetta',             description: 'Toasted bread with fresh tomato and basil.',          price: 220, imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=600&auto=format&fit=crop', rating: '4.5', prepTime: '10 mins', calories: '220 kcal' },

  // Smoothies
  { id: 31, category: 'Smoothies',  productName: 'Berry Blast',            description: 'Mixed wild berries and yogurt blend.',               price: 200, imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=600&auto=format&fit=crop', rating: '4.8', prepTime: '5 mins',  calories: '180 kcal' },
  { id: 32, category: 'Smoothies',  productName: 'Mango Tango',            description: 'Alphonso mango, banana and coconut milk blend.',      price: 220, imageUrl: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?q=80&w=600&auto=format&fit=crop', rating: '4.9', prepTime: '5 mins',  calories: '210 kcal' },
];

const CustomerOrder = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [detailProduct, setDetailProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('product');
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    instructions: '',
    payment: 'UPI'
  });
  const menuRef = useRef(null);

  const openProductDetail = (product) => {
    setDetailProduct(product);
    setIsDetailOpen(true);
  };

  const closeProductDetail = () => {
    setIsDetailOpen(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal * 1.05;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (product, delta) => {
    setCart(prev => prev.map(item => item.id === product.id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item));
  };

  const removeItem = (product) => setCart(prev => prev.filter(item => item.id !== product.id));

  const handleCheckoutConfirm = (formData) => {
    console.debug('Checkout:', formData);
    const newOrderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
    setIsCheckoutOpen(false);
    setActiveTab('product');
    setTimeout(() => { 
      setOrderSuccessId(newOrderId); 
      setCart([]); 
      setCheckoutForm({ name: '', phone: '', instructions: '', payment: 'UPI' });
    }, 400);
  };

  const filteredMenu = selectedCategory === 'All'
    ? menuData
    : menuData.filter(item => item.category === selectedCategory);

  const renderMobileCart = () => {
    return (
      <div className="md:hidden w-full px-6 py-8 pb-32">
        <h2 className="text-3xl font-cinzel font-bold text-customer-accent mb-6 flex items-center gap-3">
          <ShoppingBag size={28} />
          Your Order
        </h2>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-customer-text/50">
            <ShoppingBag size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-sans">Your cart is empty.</p>
            <button 
              onClick={() => setActiveTab('product')} 
              className="mt-4 text-customer-accent hover:underline font-bold"
            >
              Start browsing
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.map(item => (
                <div 
                  key={item.id} 
                  className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 relative group hover:border-customer-accent/30 transition-colors animate-fadeIn"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                    {item.imageUrl && item.imageUrl.length > 5 && item.imageUrl.startsWith('http') ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-customer-text font-sans text-left">{item.productName}</h4>
                      <p className="text-sm text-customer-text/60 text-left">₹{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-black/40 rounded-full px-2.5 py-1">
                        <button 
                          onClick={() => updateQuantity(item, -1)} 
                          className="p-1 text-customer-text hover:text-customer-accent transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center text-customer-text">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item, 1)} 
                          className="p-1 text-customer-text hover:text-customer-accent transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-customer-accent font-sans">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex justify-between text-customer-text/70">
                <span>Subtotal</span>
                <span className="font-sans">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-customer-text/70">
                <span>Taxes (5%)</span>
                <span className="font-sans">₹{(subtotal * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-4 text-customer-text">
                <span>Total</span>
                <span className="text-customer-accent font-sans">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setActiveTab('payment')}
                className="w-full py-4 bg-customer-primary text-customer-text font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-customer-accent hover:text-customer-bg transition-colors shadow-[0_4px_15px_rgba(45,106,79,0.5)] mt-4"
              >
                Proceed to Payment <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMobilePayment = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      handleCheckoutConfirm(checkoutForm);
    };

    return (
      <div className="md:hidden w-full px-6 py-8 pb-32 text-left">
        <h2 className="text-3xl font-cinzel font-bold text-customer-accent mb-6 flex items-center gap-3">
          <CreditCard size={28} />
          Payment
        </h2>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-customer-text/50">
            <ShoppingBag size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-sans">Your cart is empty.</p>
            <button 
              onClick={() => setActiveTab('product')} 
              className="mt-4 text-customer-accent hover:underline font-bold"
            >
              Start browsing
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={checkoutForm.name}
                  onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={checkoutForm.phone}
                  onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Special Instructions</label>
                <textarea 
                  value={checkoutForm.instructions}
                  onChange={e => setCheckoutForm({...checkoutForm, instructions: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors resize-none h-24"
                  placeholder="Any allergies or special requests?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', icon: Smartphone, label: 'UPI' },
                  { id: 'CARD', icon: CreditCard, label: 'Card' },
                  { id: 'CASH', icon: Banknote, label: 'Cash' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setCheckoutForm({...checkoutForm, payment: method.id})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                      checkoutForm.payment === method.id 
                        ? 'border-customer-accent bg-customer-accent/10 text-customer-accent shadow-[0_0_15px_rgba(212,163,115,0.2)]' 
                        : 'border-white/10 bg-white/5 text-customer-text/70 hover:border-white/30'
                    }`}
                  >
                    <method.icon size={24} />
                    <span className="text-sm font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm text-customer-text/70">Total to pay</div>
                <div className="text-2xl font-bold text-customer-accent font-sans">₹{total.toFixed(2)}</div>
              </div>
              <button 
                type="submit"
                className="px-8 py-4 bg-customer-primary text-customer-text font-bold rounded-xl hover:bg-customer-accent hover:text-customer-bg transition-colors shadow-lg shadow-customer-primary/20"
              >
                Place Order
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="bg-customer-bg min-h-screen text-customer-text font-sans selection:bg-customer-accent selection:text-customer-bg">

      {/* ── Full-Width Navbar ── */}
      <nav className="relative w-full sticky top-0 z-50 bg-customer-bg/95 backdrop-blur-xl border-b border-white/10 shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
        <div className="w-full px-6 lg:px-12 h-[80px] flex items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo className="w-14 h-14" />
            <span
              className="text-[1.6rem] font-bold tracking-wide text-customer-accent"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >GatherPoint</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* Browse menu shortcut */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveTab('product');
                setTimeout(() => {
                  menuRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hidden sm:flex items-center gap-2.5 px-9 py-4 rounded-full border border-customer-accent/50 text-customer-accent text-lg font-bold hover:bg-customer-accent hover:text-customer-bg transition-all duration-200"
            >
              Browse Menu <ChevronDown size={22} />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setActiveTab('cart');
                } else {
                  document.getElementById('cart-trigger-btn')?.click();
                }
              }}
              className="relative flex items-center gap-2.5 px-9 py-4 rounded-full bg-customer-primary text-customer-text font-black text-lg hover:bg-customer-accent hover:text-customer-bg transition-colors duration-200 shadow-[0_0_22px_rgba(45,106,79,0.4)]"
            >
              <ShoppingBag size={22} />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-customer-bg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <AnimatePresence>
        {heroVisible && activeTab === 'product' && (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] flex flex-col"
            style={{ background: '#071B14' }}
          >
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-customer-primary/8 blur-[160px]" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-customer-accent/5 blur-[120px]" />
            </div>

            <div className="relative flex-1 w-full max-w-7xl mx-auto pl-32 pr-10 lg:pl-56 lg:pr-16 flex flex-col lg:flex-row items-center justify-center gap-16">

              {/* ── LEFT: Text ── */}
              <motion.div
                className="flex-1 text-left z-10"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                {/* Big brand title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.65 }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-5"
                  style={{ fontFamily: "'Cinzel', serif", color: '#c9a96e' }}
                >
                  Gather Point
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'steps(1)' }}
                    className="inline-block w-[4px] h-[0.85em] ml-1 align-middle"
                    style={{ background: '#c9a96e', verticalAlign: 'middle' }}
                  />
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42 }}
                  className="text-xl lg:text-2xl leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '460px' }}
                >
                  Connecting tables, people and experiences.
                </motion.p>
              </motion.div>

              {/* ── RIGHT: Circular image + floating icon badges ── */}
              <motion.div
                className="flex-none flex items-center justify-center relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              >
                <div className="relative w-80 h-80 lg:w-[480px] lg:h-[480px]">

                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-full blur-2xl scale-110" style={{ background: 'rgba(45,106,79,0.18)' }} />

                  {/* Circular photo */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-full h-full rounded-full overflow-hidden"
                    style={{ border: '2px solid rgba(201,169,110,0.2)' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
                      alt="Gather Point Coffee"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,27,20,0.35), transparent)' }} />
                  </motion.div>

                  {/* Floating badge — leaf / bottom-left */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85, type: 'spring', stiffness: 180 }}
                    className="absolute flex items-center justify-center rounded-full shadow-lg"
                    style={{
                      width: 44, height: 44,
                      bottom: '8%', left: '-8%',
                      background: 'rgba(13,35,24,0.9)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      fontSize: 20,
                    }}
                  >
                    🌿
                  </motion.div>

                  {/* Floating badge — coffee cup / top-right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, type: 'spring', stiffness: 180 }}
                    className="absolute flex items-center justify-center rounded-full shadow-lg"
                    style={{
                      width: 44, height: 44,
                      top: '5%', right: '-6%',
                      background: 'rgba(13,35,24,0.9)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      fontSize: 20,
                    }}
                  >
                    ☕
                  </motion.div>

                  {/* Floating badge — star / mid-right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.15, type: 'spring', stiffness: 180 }}
                    className="absolute flex items-center justify-center rounded-full shadow-lg"
                    style={{
                      width: 40, height: 40,
                      top: '38%', right: '-14%',
                      background: 'rgba(13,35,24,0.9)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      fontSize: 18,
                    }}
                  >
                    ✨
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Menu Section ── */}
      {activeTab === 'product' && (
        <div ref={menuRef} className="w-full">
        {/* Sticky category tabs */}
        <div className="sticky top-[80px] z-40 w-full bg-customer-bg/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="w-full pl-32 pr-6 lg:pl-56 lg:pr-12 h-[70px] flex items-center justify-between gap-2">
            {[
              { label: 'All',         icon: '🍴' },
              { label: 'Coffee',      icon: '☕' },
              { label: 'Tea',         icon: '🍵' },
              { label: 'Burgers',     icon: '🍔' },
              { label: 'Pizza',       icon: '🍕' },
              { label: 'Desserts',    icon: '🍰' },
              { label: 'Pasta',       icon: '🍝' },
              { label: 'Salads',      icon: '🥗' },
              { label: 'Steaks',      icon: '🥩' },
              { label: 'Appetizers',  icon: '🥟' },
              { label: 'Smoothies',   icon: '🥤' },
            ].map(({ label, icon }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(label)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-full text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === label
                    ? 'bg-customer-accent text-customer-bg shadow-[0_0_18px_rgba(212,163,115,0.5)]'
                    : 'bg-white/5 text-customer-text/55 border border-white/10 hover:border-customer-accent/40 hover:text-customer-accent hover:bg-customer-accent/5'
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section title */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full pl-32 pr-10 lg:pl-56 lg:pr-16 pt-10 pb-4"
        >
          <h2 className="text-2xl font-bold text-customer-text">
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            <span className="text-customer-text/40 text-base font-normal ml-3">({filteredMenu.length} items)</span>
          </h2>
        </motion.div>

        {/* Product Grid */}
        <div className="w-full pl-32 pr-10 lg:pl-56 lg:pr-16 pb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredMenu.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                  onClick={openProductDetail}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredMenu.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-customer-text/40"
            >
              <span className="text-6xl mb-4">🍽️</span>
              <p className="text-xl font-semibold">No items in this category</p>
            </motion.div>
          )}
        </div>
      </div>
      )}

      {/* Mobile Cart View */}
      {activeTab === 'cart' && renderMobileCart()}

      {/* Mobile Payment View */}
      {activeTab === 'payment' && renderMobilePayment()}

      {/* FloatingCart — hidden trigger button for navbar cart button */}
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

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={closeProductDetail}
        product={detailProduct}
        onAdd={addToCart}
      />

      {orderSuccessId && (
        <OrderSuccess
          orderId={orderSuccessId}
          onTrackOrder={() => setOrderSuccessId(null)}
        />
      )}

      {/* ── Bottom Navigation Tab Bar (Mobile Only) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-customer-bg/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around h-[70px] max-w-md mx-auto">
          {/* Product Tab */}
          <button 
            onClick={() => setActiveTab('product')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              activeTab === 'product' ? 'text-customer-accent' : 'text-customer-text/40 hover:text-customer-accent/80'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'product' ? 'scale-110' : ''} />
            <span className="text-xs font-bold mt-1">Product</span>
          </button>

          {/* Cart Tab */}
          <button 
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 ${
              activeTab === 'cart' ? 'text-customer-accent' : 'text-customer-text/40 hover:text-customer-accent/80'
            }`}
          >
            <ShoppingBag size={20} className={activeTab === 'cart' ? 'scale-110' : ''} />
            <span className="text-xs font-bold mt-1">Cart</span>
            {totalItems > 0 && (
              <span className="absolute top-2 right-6 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-customer-bg">
                {totalItems}
              </span>
            )}
          </button>

          {/* Payment Tab */}
          <button 
            onClick={() => setActiveTab('payment')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              activeTab === 'payment' ? 'text-customer-accent' : 'text-customer-text/40 hover:text-customer-accent/80'
            }`}
          >
            <CreditCard size={20} className={activeTab === 'payment' ? 'scale-110' : ''} />
            <span className="text-xs font-bold mt-1">Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;
