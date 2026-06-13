import { useState, useEffect } from 'react';
import { useAuth, useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import { 
  LogIn, UserPlus, LogOut, Plus, Minus, Trash, Tag, User, 
  DollarSign, Layers, Shield, Settings, ShoppingBag, Coffee, 
  CheckCircle, Clock, BarChart3, Users, Gift, X, Search, 
  MapPin, RefreshCw, Send, Check, Printer, FileText, ChevronRight 
} from 'lucide-react';
import LandingPage from './components/LandingPage';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const { getToken, userId, isSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // Global States
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [screen, setScreen] = useState('landing'); // landing, login, signup, main
  const [activeTab, setActiveTab] = useState('pos'); // pos, admin, kitchen, reports, sessions
  const [adminTab, setAdminTab] = useState('products'); // products, categories, employees, coupons, promotions
  const [toast, setToast] = useState(null);

  // Data States (loaded from backend or fallbacks)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([
    { id: 1, name: 'Ground Floor' },
    { id: 2, name: 'First Floor' },
    { id: 3, name: 'Terrace' }
  ]);
  const [tables, setTables] = useState([
    { id: 1, tableNumber: 1, seats: 4, active: true, floor: { id: 1 } },
    { id: 2, tableNumber: 2, seats: 2, active: true, floor: { id: 1 } },
    { id: 3, tableNumber: 3, seats: 6, active: true, floor: { id: 1 } },
    { id: 4, tableNumber: 4, seats: 4, active: true, floor: { id: 1 } },
    { id: 5, tableNumber: 5, seats: 4, active: true, floor: { id: 2 } },
    { id: 6, tableNumber: 6, seats: 4, active: true, floor: { id: 2 } },
    { id: 7, tableNumber: 7, seats: 8, active: true, floor: { id: 2 } },
    { id: 8, tableNumber: 8, seats: 4, active: true, floor: { id: 3 } },
    { id: 9, tableNumber: 9, seats: 2, active: true, floor: { id: 3 } }
  ]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [kitchenTickets, setKitchenTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // POS State
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [linkCustomer, setLinkCustomer] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, UPI
  const [cashReceived, setCashReceived] = useState('');
  const [cardTxRef, setCardTxRef] = useState('');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);

  // KDS State
  const [kdsSearch, setKdsSearch] = useState('');
  const [kdsCategoryFilter, setKdsCategoryFilter] = useState('ALL');

  // Session State
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionActionType, setSessionActionType] = useState('open'); // open, close
  const [sessionOpeningAmount, setSessionOpeningAmount] = useState('');
  const [sessionClosingAmount, setSessionClosingAmount] = useState('');

  // Admin Forms
  const [productForm, setProductForm] = useState({ id: null, productName: '', price: '', uom: 'pcs', tax: '5', description: '', imageUrl: '', available: true, category: { id: '' } });
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', color: '#6366f1' });
  const [employeeForm, setEmployeeForm] = useState({ id: null, name: '', email: '', password: '', role: 'EMPLOYEE', active: true });
  const [couponForm, setCouponForm] = useState({ id: null, code: '', discountType: 'PERCENTAGE', discountValue: '', active: true });

  // Sync Clerk User and Token with Local State & Backend
  useEffect(() => {
    const syncUser = async () => {
      // Check localStorage for existing email/password auth session
      const localUser = localStorage.getItem('user');
      const localToken = localStorage.getItem('token');

      if (isSignedIn && clerkUser) {
        try {
          const clerkToken = await getToken();
          setToken(clerkToken);
          setAuthLoading(false);

          // Fetch the local database User profile matching this authenticated session
          const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${clerkToken}`
            }
          });
          if (res.ok) {
            const profile = await res.json();
            setUser(profile);
            setScreen('main');
            if (profile.role === 'ADMIN') {
              setActiveTab('admin');
            } else {
              setActiveTab('pos');
            }
          } else {
            console.error("Failed to sync profile with backend.");
          }
        } catch (e) {
          console.error("Error fetching synced user profile", e);
        }
      } else if (localUser && localToken) {
        // Restore from localStorage (email/password auth)
        setUser(JSON.parse(localUser));
        setToken(localToken);
        setAuthLoading(false);
        setScreen('main');
      } else if (isClerkLoaded && !isSignedIn) {
        // Clerk is fully loaded and user is not signed in
        setUser(null);
        setToken(null);
        setScreen(prev => prev === 'landing' ? 'landing' : 'login');
      }
    };
    syncUser();
  }, [isSignedIn, clerkUser, isClerkLoaded]);

  // Fetch initial data when screen becomes 'main'
  useEffect(() => {
    if (screen === 'main') {
      fetchCategories();
      fetchProducts();
      fetchCustomers();
      fetchCoupons();
      fetchPromotions();
      fetchOrders();
      fetchKitchenTickets();
      fetchEmployees();
      fetchActiveSession();
    }
  }, [screen]);

  // Set Default Floor
  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0]);
    }
  }, [floors]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Render Table Graphics
  const renderTableChairs = (table) => {
    const chairs = [];
    const isRound = table.tableNumber % 2 === 0;
    
    if (isRound) {
      for (let i = 0; i < table.seats; i++) {
        const angle = (i * 360) / table.seats;
        chairs.push(
          <rect key={i} x="42" y="0" width="16" height="12" rx="6" fill="#2a5038" transform={`rotate(${angle}, 50, 35)`} />
        );
      }
      return (
        <svg width="100" height="70" viewBox="0 0 100 70">
          {chairs}
          <circle cx="50" cy="35" r="26" fill="#cfad56" stroke="#8a6623" strokeWidth="2"/>
          <circle cx="50" cy="35" r="3" fill="#8a6623"/>
        </svg>
      );
    } else {
      const topCount = Math.ceil(table.seats / 2);
      const bottomCount = Math.floor(table.seats / 2);
      
      for (let i = 0; i < topCount; i++) {
        const spacing = 70 / topCount;
        const xPos = 15 + (spacing * i) + (spacing / 2) - 8;
        chairs.push(<rect key={`t${i}`} x={xPos} y="0" width="16" height="12" rx="6" fill="#2a5038" />);
      }
      for (let i = 0; i < bottomCount; i++) {
        const spacing = 70 / bottomCount;
        const xPos = 15 + (spacing * i) + (spacing / 2) - 8;
        chairs.push(<rect key={`b${i}`} x={xPos} y="58" width="16" height="12" rx="6" fill="#2a5038" />);
      }
      
      return (
        <svg width="100" height="70" viewBox="0 0 100 70">
          {chairs}
          <rect x="15" y="10" width="70" height="50" rx="8" fill="#cfad56" stroke="#8a6623" strokeWidth="2"/>
          <circle cx="50" cy="35" r="3" fill="#8a6623"/>
        </svg>
      );
    }
  };

  // Add Table Handler
  const handleAddTable = (e) => {
    if (e) e.stopPropagation();
    if (!selectedFloor) {
      showToast('Please select a floor first.', 'error');
      setIsAddingTable(false);
      return;
    }
    
    const seats = parseInt(newTableSeats, 10);
    if (isNaN(seats) || seats <= 0) {
      showToast('Invalid number of seats entered.', 'error');
      return;
    }

    const maxTableId = tables.reduce((max, t) => Math.max(max, t.id), 0);
    const maxTableNum = tables.reduce((max, t) => Math.max(max, t.tableNumber), 0);
    
    const newTable = {
      id: maxTableId + 1,
      tableNumber: maxTableNum + 1,
      seats: seats,
      active: true,
      floor: { id: selectedFloor.id }
    };
    
    setTables([...tables, newTable]);
    showToast(`Table ${newTable.tableNumber} added with ${seats} seats`, 'success');
    setIsAddingTable(false);
    setNewTableSeats(4);
  };

  // Generic Request Helper
  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const clerkToken = await getToken().catch(() => null);
    const localToken = localStorage.getItem('token');
    const curToken = clerkToken || token || localToken;
    if (curToken) {
      headers['Authorization'] = `Bearer ${curToken}`;
    }

    const config = {
      method,
      headers
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (res.status === 401 || res.status === 403) {
        // Handle unauthorized
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Request failed");
      }
      // If no content returned, return success indicator
      if (res.status === 204) return true;
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`API Error in ${endpoint}:`, err);
      // Fallback: we return null, prompting simulated action if offline
      return null;
    }
  };

  // --- API / DATA FETCH METHODS ---
  const fetchCategories = async () => {
    const data = await apiRequest('/categories');
    if (data) {
      setCategories(data);
    } else {
      // Mock Categories Fallback
      setCategories([
        { id: 1, name: 'Starters', color: '#3b82f6' },
        { id: 2, name: 'Main Course', color: '#10b981' },
        { id: 3, name: 'Desserts', color: '#ec4899' },
        { id: 4, name: 'Drinks', color: '#f59e0b' }
      ]);
    }
  };

  const fetchProducts = async () => {
    const data = await apiRequest('/products');
    if (data) {
      setProducts(data);
    } else {
      // Mock Products Fallback
      setProducts([
        { id: 1, productName: 'Spring Rolls', price: 8.99, uom: 'plate', tax: 5, description: 'Crispy rolls filled with veggies.', imageUrl: '🫔', available: true, category: { id: 1 } },
        { id: 2, productName: 'Garlic Bread', price: 6.99, uom: 'plate', tax: 5, description: 'Toasted baguette with garlic butter.', imageUrl: '🥖', available: true, category: { id: 1 } },
        { id: 3, productName: 'Margherita Pizza', price: 14.99, uom: 'pcs', tax: 8, description: 'Classic mozzarella and tomato pizza.', imageUrl: '🍕', available: true, category: { id: 2 } },
        { id: 4, productName: 'Grilled Chicken Breast', price: 18.99, uom: 'plate', tax: 8, description: 'Served with mushroom sauce and asparagus.', imageUrl: '🍗', available: true, category: { id: 2 } },
        { id: 5, productName: 'Chocolate Brownie', price: 7.99, uom: 'pcs', tax: 5, description: 'Warm brownie with vanilla ice cream.', imageUrl: '🍰', available: true, category: { id: 3 } },
        { id: 6, productName: 'Apple Pie', price: 6.99, uom: 'pcs', tax: 5, description: 'Classic apple pie slice.', imageUrl: '🥧', available: true, category: { id: 3 } },
        { id: 7, productName: 'Mango Smoothie', price: 5.49, uom: 'glass', tax: 5, description: 'Fresh mango smoothie.', imageUrl: '🍹', available: true, category: { id: 4 } },
        { id: 8, productName: 'Iced Latte', price: 4.99, uom: 'glass', tax: 5, description: 'Double shot espresso over ice with milk.', imageUrl: '☕', available: true, category: { id: 4 } }
      ]);
    }
  };

  const fetchCustomers = async () => {
    const data = await apiRequest('/customers');
    if (data) setCustomers(data);
    else setCustomers([
      { id: 1, name: 'Alice Smith', email: 'alice@gmail.com', phone: '1234567890' },
      { id: 2, name: 'Bob Johnson', email: 'bob@gmail.com', phone: '9876543210' }
    ]);
  };

  const fetchCoupons = async () => {
    const data = await apiRequest('/coupons');
    if (data) setCoupons(data);
    else setCoupons([
      { id: 1, code: 'GATHER20', discountType: 'PERCENTAGE', discountValue: 20, active: true },
      { id: 2, code: 'FLAT10', discountType: 'FLAT', discountValue: 10, active: true }
    ]);
  };

  const fetchPromotions = async () => {
    const data = await apiRequest('/promotions');
    if (data) setPromotions(data);
  };

  const fetchOrders = async () => {
    const data = await apiRequest('/orders');
    if (data) setOrders(data);
    else setOrders([]);
  };

  const fetchKitchenTickets = async () => {
    const data = await apiRequest('/kitchen/orders');
    if (data) setKitchenTickets(data);
    else setKitchenTickets([]);
  };

  const fetchEmployees = async () => {
    const data = await apiRequest('/employees');
    if (data) setEmployees(data);
    else setEmployees([]);
  };

  const fetchActiveSession = async () => {
    const data = await apiRequest('/session/active');
    if (data && data.id) {
      setActiveSession(data);
    } else {
      setActiveSession(null);
    }
  };

  // --- AUTH ACTIONS ---
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });

  const handleGoogleLogin = async () => {
    if (!signInLoaded) return;
    setGoogleAuthLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.origin
      });
    } catch (err) {
      setGoogleAuthLoading(false);
      showToast(err.message, 'error');
    }
  };

  const handleGoogleSignup = async () => {
    if (!signUpLoaded) return;
    setGoogleAuthLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.origin
      });
    } catch (err) {
      setGoogleAuthLoading(false);
      showToast(err.message, 'error');
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const headers = { 'Content-Type': 'application/json' };
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Login failed!");
      }
      const authData = await res.json();
      setUser(authData);
      setToken(authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      localStorage.setItem('token', authData.token);
      showToast("Welcome back, " + authData.name + "!");
      setScreen('main');

      // Redirect depending on Role
      if (authData.role === 'ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('pos');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json' };
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify(authForm)
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Registration failed!");
      }
      const authData = await res.json();
      setUser(authData);
      setToken(authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      localStorage.setItem('token', authData.token);
      showToast("Registration successful! Welcome, " + authData.name);
      setScreen('main');
      if (authData.role === 'ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('pos');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setScreen('login');
    showToast("Logged out successfully");
  };

  // --- SESSION ACTIONS ---
  const handleOpenSession = async () => {
    const openingVal = parseFloat(sessionOpeningAmount) || 0;
    const data = await apiRequest('/session/open', 'POST', { openingAmount: openingVal });
    if (data) {
      setActiveSession(data);
      showToast("Session opened with $" + openingVal);
    } else {
      // Offline fallback
      const mockSession = {
        id: Date.now(),
        openedAt: new Date().toISOString(),
        openingAmount: openingVal,
        employee: user
      };
      setActiveSession(mockSession);
      showToast("Session opened offline with $" + openingVal);
    }
    setSessionModal(false);
    setSessionOpeningAmount('');
  };

  const handleCloseSession = async () => {
    const closingVal = parseFloat(sessionClosingAmount) || 0;
    const data = await apiRequest('/session/close', 'POST', { closingAmount: closingVal });
    if (data) {
      setActiveSession(null);
      showToast("Session closed. Summary updated.");
    } else {
      // Offline fallback
      setActiveSession(null);
      showToast("Session closed offline. Summary updated.");
    }
    setSessionModal(false);
    setSessionClosingAmount('');
  };

  // --- POS CART ACTIONS ---
  const handleAddToCart = (product) => {
    if (!activeSession) {
      showToast("Please open a POS session before building orders!", 'error');
      setSessionActionType('open');
      setSessionModal(true);
      return;
    }
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleQtyChange = (productId, amount) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + amount) };
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTax = () => {
    return cart.reduce((sum, item) => {
      const taxRate = parseFloat(item.product.tax) || 0;
      return sum + ((item.product.price * item.quantity) * (taxRate / 100));
    }, 0);
  };

  const getDiscountAmount = () => {
    const sub = getSubtotal();
    let disc = (sub * (orderDiscount / 100));
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        disc += (sub * (appliedCoupon.discountValue / 100));
      } else {
        disc += appliedCoupon.discountValue;
      }
    }
    return Math.min(sub, disc);
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() + getTax() - getDiscountAmount());
  };

  // --- CHECKOUT & PAYMENTS ---
  const handleCheckoutSubmit = async () => {
    if (!selectedTable) {
      showToast("Please select a table first!", 'error');
      return;
    }
    if (cart.length === 0) {
      showToast("Your cart is empty!", 'error');
      return;
    }

    const orderPayload = {
      orderNumber: "ORD-" + Date.now(),
      status: "DRAFT",
      subtotal: getSubtotal(),
      tax: getTax(),
      discount: getDiscountAmount(),
      total: getTotal(),
      customer: linkCustomer,
      table: selectedTable,
      items: cart.map(item => ({
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        product: { id: item.product.id }
      }))
    };

    // Save Order
    const savedOrder = await apiRequest('/orders', 'POST', orderPayload);
    let orderIdToPay = savedOrder ? savedOrder.id : Date.now();

    // Process Payment
    let payEndpoint = '/payments/cash';
    let payPayload = { orderId: orderIdToPay, amount: getTotal() };

    if (paymentMethod === 'CASH') {
      const cashVal = parseFloat(cashReceived) || getTotal();
      payPayload.amountPaid = cashVal;
      payPayload.change = Math.max(0, cashVal - getTotal());
    } else if (paymentMethod === 'CARD') {
      payEndpoint = '/payments/card';
      payPayload.transactionReference = cardTxRef || "CARD-TX-" + Date.now();
    } else {
      payEndpoint = '/payments/upi';
      payPayload.transactionReference = "UPI-TX-" + Date.now();
    }

    const paymentRes = await apiRequest(payEndpoint, 'POST', payPayload);

    if (paymentRes || !savedOrder) {
      showToast("Payment Processed! Order paid successfully.");
      // Automatically send to kitchen
      await apiRequest(`/orders/${orderIdToPay}/send`, 'POST');
      
      // Clear cart and state
      setCart([]);
      setLinkCustomer(null);
      setAppliedCoupon(null);
      setOrderDiscount(0);
      setCheckoutModal(false);
      setCashReceived('');
      setCardTxRef('');
      setUpiConfirmed(false);
      setSelectedTable(null);

      // Refresh list
      fetchOrders();
      fetchKitchenTickets();
    } else {
      showToast("Failed to process payment. Please try again.", "error");
    }
  };

  // --- KITCHEN TICKETS MANAGEMENT ---
  const handlePrepareTicket = async (id) => {
    const updated = await apiRequest(`/kitchen/orders/${id}/prepare`, 'PATCH');
    if (updated) {
      showToast("Ticket marked as preparing");
      fetchKitchenTickets();
    } else {
      // Offline fallback toggle
      setKitchenTickets(kitchenTickets.map(t => t.id === id ? { ...t, stage: 'PREPARING' } : t));
      showToast("Ticket marked as preparing (offline)");
    }
  };

  const handleCompleteTicket = async (id) => {
    const updated = await apiRequest(`/kitchen/orders/${id}/complete`, 'PATCH');
    if (updated) {
      showToast("Ticket marked as completed");
      fetchKitchenTickets();
    } else {
      // Offline fallback toggle
      setKitchenTickets(kitchenTickets.map(t => t.id === id ? { ...t, stage: 'COMPLETED' } : t));
      showToast("Ticket marked as completed (offline)");
    }
  };

  // --- ADMIN ACTIONS ---
  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    let saved;
    if (categoryForm.id) {
      saved = await apiRequest(`/categories/${categoryForm.id}`, 'PUT', categoryForm);
    } else {
      saved = await apiRequest('/categories', 'POST', categoryForm);
    }
    if (saved) {
      showToast("Category saved!");
      fetchCategories();
      setCategoryForm({ id: null, name: '', color: '#6366f1' });
    } else {
      // offline fallback
      const mockSaved = { id: categoryForm.id || Date.now(), ...categoryForm };
      setCategories(categoryForm.id ? categories.map(c => c.id === categoryForm.id ? mockSaved : c) : [...categories, mockSaved]);
      setCategoryForm({ id: null, name: '', color: '#6366f1' });
      showToast("Category saved offline!");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    const ok = await apiRequest(`/categories/${id}`, 'DELETE');
    if (ok) {
      showToast("Category deleted!");
      fetchCategories();
    } else {
      setCategories(categories.filter(c => c.id !== id));
      showToast("Category deleted offline!");
    }
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = { ...productForm };
    payload.price = parseFloat(payload.price) || 0;
    payload.tax = parseFloat(payload.tax) || 0;
    payload.category = { id: parseInt(payload.category.id) };

    let saved;
    if (productForm.id) {
      saved = await apiRequest(`/products/${productForm.id}`, 'PUT', payload);
    } else {
      saved = await apiRequest('/products', 'POST', payload);
    }

    if (saved) {
      showToast("Product saved!");
      fetchProducts();
      setProductForm({ id: null, productName: '', price: '', uom: 'pcs', tax: '5', description: '', imageUrl: '', available: true, category: { id: '' } });
    } else {
      // offline fallback
      const mockSaved = { id: productForm.id || Date.now(), ...payload };
      setProducts(productForm.id ? products.map(p => p.id === productForm.id ? mockSaved : p) : [...products, mockSaved]);
      setProductForm({ id: null, productName: '', price: '', uom: 'pcs', tax: '5', description: '', imageUrl: '', available: true, category: { id: '' } });
      showToast("Product saved offline!");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    const ok = await apiRequest(`/products/${id}`, 'DELETE');
    if (ok) {
      showToast("Product deleted!");
      fetchProducts();
    } else {
      setProducts(products.filter(p => p.id !== id));
      showToast("Product deleted offline!");
    }
  };

  // Save Employee
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    let saved;
    if (employeeForm.id) {
      saved = await apiRequest(`/employees/${employeeForm.id}`, 'PUT', employeeForm);
    } else {
      saved = await apiRequest('/employees', 'POST', employeeForm);
    }
    if (saved) {
      showToast("Employee added successfully!");
      fetchEmployees();
      setEmployeeForm({ id: null, name: '', email: '', password: '', role: 'EMPLOYEE', active: true });
    } else {
      const mockSaved = { id: employeeForm.id || Date.now(), ...employeeForm };
      setEmployees(employeeForm.id ? employees.map(emp => emp.id === employeeForm.id ? mockSaved : emp) : [...employees, mockSaved]);
      setEmployeeForm({ id: null, name: '', email: '', password: '', role: 'EMPLOYEE', active: true });
      showToast("Employee added offline!");
    }
  };

  // Archive Employee
  const handleArchiveEmployee = async (id) => {
    const updated = await apiRequest(`/employees/${id}/archive`, 'PATCH');
    if (updated) {
      showToast("Employee active status toggled");
      fetchEmployees();
    } else {
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, active: !emp.active } : emp));
      showToast("Employee archived offline");
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id) => {
    const ok = await apiRequest(`/employees/${id}`, 'DELETE');
    if (ok) {
      showToast("Employee deleted!");
      fetchEmployees();
    } else {
      setEmployees(employees.filter(emp => emp.id !== id));
      showToast("Employee deleted offline!");
    }
  };

  // Save Coupon
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const payload = { ...couponForm };
    payload.discountValue = parseFloat(payload.discountValue) || 0;

    let saved;
    if (couponForm.id) {
      saved = await apiRequest(`/coupons/${couponForm.id}`, 'PUT', payload);
    } else {
      saved = await apiRequest('/coupons', 'POST', payload);
    }

    if (saved) {
      showToast("Coupon saved!");
      fetchCoupons();
      setCouponForm({ id: null, code: '', discountType: 'PERCENTAGE', discountValue: '', active: true });
    } else {
      const mockSaved = { id: couponForm.id || Date.now(), ...payload };
      setCoupons(couponForm.id ? coupons.map(c => c.id === couponForm.id ? mockSaved : c) : [...coupons, mockSaved]);
      setCouponForm({ id: null, code: '', discountType: 'PERCENTAGE', discountValue: '', active: true });
      showToast("Coupon saved offline!");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id) => {
    const ok = await apiRequest(`/coupons/${id}`, 'DELETE');
    if (ok) {
      showToast("Coupon deleted!");
      fetchCoupons();
    } else {
      setCoupons(coupons.filter(c => c.id !== id));
      showToast("Coupon deleted offline!");
    }
  };

  // Export helper mock downloads
  const handleExport = (type) => {
    window.open(`${API_BASE_URL}/reports/export/${type}`, '_blank');
    showToast(`Downloading sales_report.${type === 'xls' ? 'csv' : 'pdf'}...`);
  };

  // --- SUB-SCREENS ---

  // AUTH LOADING SCREEN (prevents flash of login on back navigation)
  if (authLoading && screen !== 'landing' && screen !== 'main') {
    return (
      <div className="auth-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="auth-spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>Initializing...</p>
        </div>
      </div>
    );
  }
  
  // LANDING SCREEN
  if (screen === 'landing') {
    return <LandingPage onEnter={() => setScreen('login')} />;
  }
  
  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div className="auth-bg">
        <div className="auth-split-card-wrapper">
          <div className="auth-split-card">
          {/* Left Side: Image with Overlay */}
          <div className="auth-image-side">
            <div className="auth-image-overlay">
              <h1 className="auth-brand-text">GatherPoint</h1>
            </div>
          </div>
          
          {/* Right Side: Form */}
          <div className="auth-form-side">
            <h2>Welcome Back.</h2>
            <p>Log in to access your POS terminal & dashboard.</p>
            
            <form onSubmit={handleLogin}>
              <div>
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="Email Address" 
                  required 
                  value={authForm.email} 
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Password" 
                  required 
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="auth-btn">
                Continue
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#64748b', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(27,46,35,0.1)' }}></div>
              <span style={{ padding: '0 10px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(27,46,35,0.1)' }}></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={googleAuthLoading} className="auth-btn" style={{ background: '#ffffff', color: '#1b2e23', border: '1px solid rgba(27,46,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: googleAuthLoading ? 0.6 : 1 }}>
              {googleAuthLoading ? (
                <span className="auth-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              {googleAuthLoading ? 'Redirecting...' : 'Sign In with Google'}
            </button>
            
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
              Need an account? <span onClick={() => setScreen('signup')} className="auth-link">Create Account</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // SIGNUP SCREEN
  if (screen === 'signup') {
    return (
      <div className="auth-bg">
        <div className="auth-split-card-wrapper">
          <div className="auth-split-card">
          {/* Left Side: Image with Overlay */}
          <div className="auth-image-side">
            <div className="auth-image-overlay">
              <h1 className="auth-brand-text">GatherPoint</h1>
            </div>
          </div>
          
          {/* Right Side: Form */}
          <div className="auth-form-side">
            <h2>Join GatherPoint.</h2>
            <p>Initialize your POS Terminal & Accounts.</p>
            
            <form onSubmit={handleSignup}>
              <div>
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder="Full Name" 
                  required 
                  value={authForm.name} 
                  onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
              <div>
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="Email Address" 
                  required 
                  value={authForm.email} 
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Password" 
                  required 
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>
              <div>
                <select 
                  className="auth-input" 
                  value={authForm.role}
                  onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                >
                  <option value="EMPLOYEE">Employee (POS Terminal)</option>
                  <option value="ADMIN">Admin (Backend Dashboard)</option>
                </select>
              </div>
              <button type="submit" className="auth-btn">
                Register
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#64748b', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(27,46,35,0.1)' }}></div>
              <span style={{ padding: '0 10px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(27,46,35,0.1)' }}></div>
            </div>

            <button type="button" onClick={handleGoogleSignup} disabled={googleAuthLoading} className="auth-btn" style={{ background: '#ffffff', color: '#1b2e23', border: '1px solid rgba(27,46,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: googleAuthLoading ? 0.6 : 1 }}>
              {googleAuthLoading ? (
                <span className="auth-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              {googleAuthLoading ? 'Redirecting...' : 'Sign Up with Google'}
            </button>
            
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
              Already registered? <span onClick={() => setScreen('login')} className="auth-link">Sign In</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // MAIN SYSTEM SCREEN (AUTHENTICATED)
  return (
    <div className="layout-container">
      {/* Toast Alert Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: toast.type === 'error' ? 'var(--danger-gradient)' : 'var(--accent-gradient)',
          color: '#fff',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          animation: 'slideUp 0.2s ease'
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>GatherPoint</span>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            <ShoppingBag size={20} />
            <span>POS Terminal</span>
          </li>
          
          <li 
            className={`sidebar-item ${activeTab === 'kitchen' ? 'active' : ''}`}
            onClick={() => setActiveTab('kitchen')}
          >
            <Clock size={20} />
            <span>Kitchen Display</span>
            {kitchenTickets.filter(t => t.stage !== 'COMPLETED').length > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '2px 6px' }}>
                {kitchenTickets.filter(t => t.stage !== 'COMPLETED').length}
              </span>
            )}
          </li>

          {user && user.role === 'ADMIN' && (
            <>
              <li 
                className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <Settings size={20} />
                <span>Backend Admin</span>
              </li>
              
              <li 
                className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <BarChart3 size={20} />
                <span>Reports & Analytics</span>
              </li>
            </>
          )}
        </ul>

        {/* User profile box in sidebar footer */}
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={10} /> {user?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', padding: '8px' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Screen Content Router */}
      <main className={`main-content ${activeTab === 'pos' ? 'pos-mode' : ''}`}>
        
        {/* POS TERMINAL TAB */}
        {activeTab === 'pos' && (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontFamily: 'var(--font-cinzel)', fontWeight: 'bold' }}>POS Terminal</h1>
                <p style={{ color: '#8b9691', marginBottom: '15px' }}>Select a table to start taking orders</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                    <User size={12} style={{ display: 'inline', marginRight: '4px' }}/> EMPLOYEE: {user?.name || 'CLERK USER'}
                  </span>
                  {activeSession ? (
                    <span className="badge" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', cursor: 'pointer' }} onClick={() => { setSessionActionType('close'); setSessionModal(true); }}>
                      <span className="pos-status-dot occupied" style={{ display: 'inline-block', marginRight: '6px' }}></span> SESSION ACTIVE (CLOSE)
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', cursor: 'pointer' }} onClick={() => { setSessionActionType('open'); setSessionModal(true); }}>
                      <span className="pos-status-dot occupied" style={{ display: 'inline-block', marginRight: '6px' }}></span> NO ACTIVE SESSION (OPEN)
                    </span>
                  )}
                </div>
              </div>

              {/* Time Widget */}
              {!selectedTable && (
                <div className="pos-datetime-widget">
                  <Clock size={24} color="#8b9691" />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8b9691' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
              )}

              {/* Table details */}
              {selectedTable && (
                <div className="glass-panel" style={{ padding: '10px 20px', borderLeft: '4px solid #cfad56', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#8b9691' }}>Selected Location</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#cfad56' }}>{selectedFloor?.name} - Table {selectedTable.tableNumber}</div>
                  </div>
                  <button className="pos-floor-btn" onClick={() => setSelectedTable(null)}>
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* SCREEN 1: FLOOR & TABLE SELECTION */}
            {!selectedTable ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 4.5C8.01472 4.5 6 6.51472 6 9C6 11.4853 8.01472 13.5 10.5 13.5C12.9853 13.5 15 11.4853 15 9C15 6.51472 12.9853 4.5 10.5 4.5Z" stroke="#cfad56" strokeWidth="1.5"/>
                    <path d="M12.5 11L18 16.5" stroke="#cfad56" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-cinzel)', color: '#fff', fontWeight: 600 }}>Select Table Layout</h2>
                  <div style={{ flexGrow: 1, height: '1px', background: 'linear-gradient(to right, #cfad56, transparent)' }}></div>
                </div>
                
                {/* Controls Bar */}
                <div className="pos-controls-bar">
                  {floors.map(floor => (
                    <button 
                      key={floor.id} 
                      className={`pos-floor-btn ${selectedFloor?.id === floor.id ? 'active' : ''}`}
                      onClick={() => setSelectedFloor(floor)}
                    >
                      <MapPin size={16} /> {floor.name}
                    </button>
                  ))}
                  
                  <div className="pos-search-wrapper">
                    <Search size={16} className="pos-search-icon" />
                    <input type="text" placeholder="Search table..." className="pos-search-input" />
                  </div>
                  
                  <button className="pos-filter-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
                    All Status
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>

                {/* Grid of Tables */}
                <div className="pos-table-grid">
                  {tables.filter(t => t.floor.id === selectedFloor?.id).map(table => {
                    const isOccupied = orders.some(o => o.table?.id === table.id && o.status === 'DRAFT');
                    return (
                      <div 
                        key={table.id}
                        className={`pos-table-card ${isOccupied ? 'occupied' : 'available'}`}
                        onClick={() => setSelectedTable(table)}
                      >
                        <div className="pos-table-title">T-{table.tableNumber}</div>
                        <div className="pos-table-seats">{table.seats} Seats</div>
                        
                        <div className="pos-table-graphic-container">
                          {renderTableChairs(table)}
                        </div>
                        
                        <div className={`pos-table-status ${isOccupied ? 'occupied' : 'available'}`}>
                          <span className={`pos-status-dot ${isOccupied ? 'occupied' : 'available'}`}></span>
                          {isOccupied ? 'Occupied' : 'Available'}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add Table Card */}
                  <div className="pos-table-card add-table" onClick={() => !isAddingTable && setIsAddingTable(true)} style={{ cursor: isAddingTable ? 'default' : 'pointer' }}>
                    {isAddingTable ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '15px' }}>
                        <span style={{ color: '#cfad56', fontWeight: 600 }}>Seats:</span>
                        <input 
                          type="number" 
                          value={newTableSeats} 
                          onChange={(e) => setNewTableSeats(e.target.value)}
                          style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #cfad56', background: 'transparent', color: '#fff', textAlign: 'center', outline: 'none' }}
                          min="1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTable(e);
                            if (e.key === 'Escape') setIsAddingTable(false);
                          }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setIsAddingTable(false); }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #4a5568', color: '#8b9691', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleAddTable} style={{ padding: '6px 12px', background: '#cfad56', color: '#0a100d', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#cfad56', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cfad56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={24} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: '#8b9691' }}>Add Table</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // SCREEN 2: ORDER & CATALOG VIEW
              <div className="pos-container">
                
                {/* Left side: Product catalog */}
                <div className="pos-products">
                  
                  {/* Search and Category filter */}
                  <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                      <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search products..." 
                        style={{ paddingLeft: '40px' }}
                        value={posSearch}
                        onChange={e => setPosSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category Horizontal Bar */}
                  <div className="category-bar">
                    <button 
                      className={`category-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('ALL')}
                    >
                      All Dishes
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ borderLeft: `3px solid ${cat.color}` }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Grid of Dishes */}
                  <div className="products-grid">
                    {products
                      .filter(p => selectedCategory === 'ALL' || p.category.id === selectedCategory)
                      .filter(p => p.productName.toLowerCase().includes(posSearch.toLowerCase()))
                      .map(prod => (
                        <div 
                          key={prod.id} 
                          className="glass-panel glass-panel-hover product-card"
                          onClick={() => handleAddToCart(prod)}
                        >
                          <div className="product-image-container">
                            {prod.imageUrl || '🍲'}
                          </div>
                          <div className="product-name">{prod.productName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            UOM: {prod.uom}
                          </div>
                          <div className="product-price">${prod.price.toFixed(2)}</div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Shopping Cart Panel */}
                <div className="glass-panel pos-cart" style={{ padding: '20px' }}>
                  <h3 style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span>Active Cart</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Table {selectedTable.tableNumber}</span>
                  </h3>

                  {cart.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '3rem', marginBottom: '10px' }}>🛒</span>
                      <p>Cart is empty</p>
                      <p style={{ fontSize: '0.8rem' }}>Tap products to add them</p>
                    </div>
                  ) : (
                    <>
                      {/* Cart List */}
                      <div className="cart-items">
                        {cart.map(item => (
                          <div key={item.product.id} className="cart-item">
                            <div className="cart-item-info">
                              <div className="cart-item-name">{item.product.productName}</div>
                              <div className="cart-item-price">${item.product.price.toFixed(2)}</div>
                            </div>
                            <div className="cart-item-actions">
                              <button className="qty-btn" onClick={() => handleQtyChange(item.product.id, -1)}>-</button>
                              <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                              <button className="qty-btn" onClick={() => handleQtyChange(item.product.id, 1)}>+</button>
                              <button 
                                onClick={() => handleRemoveFromCart(item.product.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '6px' }}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Customer / Coupons attachment */}
                      <div style={{ borderTop: '1px solid var(--border-color)', padding: '14px 0', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setCustomerModal(true)}>
                          <User size={14} /> {linkCustomer ? linkCustomer.name : 'Assign Customer'}
                        </button>
                        <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setCouponModal(true)}>
                          <Tag size={14} /> {appliedCoupon ? appliedCoupon.code : 'Apply Coupon'}
                        </button>
                      </div>

                      {/* Totals panel */}
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          <span>Subtotal:</span>
                          <span>${getSubtotal().toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          <span>Tax:</span>
                          <span>${getTax().toFixed(2)}</span>
                        </div>
                        {getDiscountAmount() > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--accent)' }}>
                            <span>Discount:</span>
                            <span>-${getDiscountAmount().toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                          <span>Total:</span>
                          <span>${getTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Checkout button */}
                      <button className="btn btn-accent" style={{ width: '100%', padding: '14px' }} onClick={() => setCheckoutModal(true)}>
                        Proceed to Payment
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KITCHEN DISPLAY SYSTEM TAB */}
        {activeTab === 'kitchen' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Kitchen Display System (KDS)</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Live prep screen & ticket pipeline</p>
              </div>
              <button className="btn btn-secondary" onClick={fetchKitchenTickets}>
                <RefreshCw size={16} /> Refresh Tickets
              </button>
            </div>

            {/* Filter controls */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', marginBottom: '30px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search order number..." 
                  style={{ paddingLeft: '40px' }}
                  value={kdsSearch}
                  onChange={e => setKdsSearch(e.target.value)}
                />
              </div>
              <select className="form-control" style={{ width: '200px', background: '#14161f' }} value={kdsCategoryFilter} onChange={e => setKdsCategoryFilter(e.target.value)}>
                <option value="ALL">All Stages</option>
                <option value="TO_COOK">To Cook</option>
                <option value="PREPARING">Preparing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* KDS Pipeline Card List */}
            {kitchenTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <Clock size={48} style={{ marginBottom: '16px' }} />
                <h3>No Orders in Kitchen</h3>
                <p>New orders submitted from POS will appear here instantly</p>
              </div>
            ) : (
              <div className="kds-grid">
                {kitchenTickets
                  .filter(t => kdsCategoryFilter === 'ALL' || t.stage === kdsCategoryFilter)
                  .filter(t => t.orderNumber.toLowerCase().includes(kdsSearch.toLowerCase()))
                  .map(ticket => (
                    <div key={ticket.id} className="glass-panel kds-card" style={{ borderTop: `4px solid ${ticket.stage === 'TO_COOK' ? 'var(--danger)' : ticket.stage === 'PREPARING' ? 'var(--warning)' : 'var(--accent)'}` }}>
                      <div className="kds-header">
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ticket.orderNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(ticket.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`badge ${ticket.stage === 'TO_COOK' ? 'badge-danger' : ticket.stage === 'PREPARING' ? 'badge-warning' : 'badge-success'}`}>
                          {ticket.stage}
                        </span>
                      </div>
                      
                      <div className="kds-body">
                        {ticket.items?.map((item, idx) => (
                          <div key={idx} className="kds-item">
                            <span style={{ fontWeight: '600' }}>{item.quantity} x {item.productName}</span>
                            {item.completed && <span style={{ color: 'var(--accent)' }}>✓</span>}
                          </div>
                        ))}
                      </div>

                      <div className="kds-footer">
                        {ticket.stage === 'TO_COOK' && (
                          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handlePrepareTicket(ticket.id)}>
                            Start Cooking
                          </button>
                        )}
                        {ticket.stage === 'PREPARING' && (
                          <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => handleCompleteTicket(ticket.id)}>
                            Ready for Serve
                          </button>
                        )}
                        {ticket.stage === 'COMPLETED' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 'bold', margin: 'auto' }}>
                            <CheckCircle size={16} /> Order Dispatched
                          </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BACKEND ADMIN DASHBOARD TAB */}
        {activeTab === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Backend Admin</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Configure DineOS core configurations</p>
              </div>
            </div>

            {/* Admin subtabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '30px' }}>
              <button className={`btn ${adminTab === 'products' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdminTab('products')}>
                Dish Products
              </button>
              <button className={`btn ${adminTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdminTab('categories')}>
                Menu Categories
              </button>
              <button className={`btn ${adminTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdminTab('employees')}>
                Staff Directory
              </button>
              <button className={`btn ${adminTab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdminTab('coupons')}>
                Coupons & Promos
              </button>
            </div>

            {/* ADMIN SCREEN 1: PRODUCT MANAGEMENT */}
            {adminTab === 'products' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
                {/* Product List */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '20px' }}>All Dish Products</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Category</th>
                        <th style={{ padding: '12px' }}>Price</th>
                        <th style={{ padding: '12px' }}>UOM</th>
                        <th style={{ padding: '12px' }}>Tax</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>
                            <span style={{ marginRight: '8px' }}>{prod.imageUrl || '🍲'}</span>
                            {prod.productName}
                          </td>
                          <td style={{ padding: '12px' }}>{prod.category?.name}</td>
                          <td style={{ padding: '12px' }}>${prod.price.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>{prod.uom}</td>
                          <td style={{ padding: '12px' }}>{prod.tax}%</td>
                          <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setProductForm({ ...prod, category: { id: prod.category?.id || '' } })}>
                              Edit
                            </button>
                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteProduct(prod.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add/Edit Form */}
                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h3>{productForm.id ? 'Modify Dish' : 'Create Product'}</h3>
                  <form onSubmit={handleSaveProduct} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Dish Name</label>
                      <input type="text" className="form-control" required value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price ($)</label>
                      <input type="number" step="0.01" className="form-control" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-control" required value={productForm.category.id} onChange={e => setProductForm({ ...productForm, category: { id: e.target.value } })} style={{ background: '#14161f' }}>
                        <option value="">Choose...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">UOM / Unit</label>
                      <input type="text" className="form-control" placeholder="pcs, plate, glass" value={productForm.uom} onChange={e => setProductForm({ ...productForm, uom: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tax Rate (%)</label>
                      <input type="number" className="form-control" value={productForm.tax} onChange={e => setProductForm({ ...productForm, tax: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image Emoji/Url</label>
                      <input type="text" className="form-control" placeholder="🍔" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows="2" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                      Save Product
                    </button>
                    {productForm.id && (
                      <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setProductForm({ id: null, productName: '', price: '', uom: 'pcs', tax: '5', description: '', imageUrl: '', available: true, category: { id: '' } })}>
                        Clear
                      </button>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* ADMIN SCREEN 2: CATEGORY MANAGEMENT */}
            {adminTab === 'categories' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3>All Categories</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                    {categories.map(cat => (
                      <div key={cat.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${cat.color}` }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{cat.name}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setCategoryForm(cat)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleDeleteCategory(cat.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h3>{categoryForm.id ? 'Modify Category' : 'Create Category'}</h3>
                  <form onSubmit={handleSaveCategory} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Category Name</label>
                      <input type="text" className="form-control" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Border Accent Color</label>
                      <input type="color" className="form-control" style={{ height: '50px', padding: '2px' }} value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                      Save Category
                    </button>
                    {categoryForm.id && (
                      <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setCategoryForm({ id: null, name: '', color: '#6366f1' })}>
                        Clear
                      </button>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* ADMIN SCREEN 3: EMPLOYEE MANAGEMENT */}
            {adminTab === 'employees' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3>Active Staff</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Email</th>
                        <th style={{ padding: '12px' }}>Role</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name}</td>
                          <td style={{ padding: '12px' }}>{emp.email}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${emp.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                              {emp.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${emp.active ? 'badge-success' : 'badge-danger'}`} onClick={() => handleArchiveEmployee(emp.id)} style={{ cursor: 'pointer' }}>
                              {emp.active ? 'Active' : 'Archived'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setEmployeeForm({ ...emp, password: '' })}>
                              Edit
                            </button>
                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteEmployee(emp.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h3>{employeeForm.id ? 'Modify Staff' : 'Add Employee'}</h3>
                  <form onSubmit={handleSaveEmployee} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" required value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" required value={employeeForm.email} onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
                    </div>
                    {!employeeForm.id && (
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" required value={employeeForm.password} onChange={e => setEmployeeForm({ ...employeeForm, password: e.target.value })} />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select className="form-control" value={employeeForm.role} onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })} style={{ background: '#14161f' }}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                      Save Employee
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ADMIN SCREEN 4: COUPONS & PROMOS */}
            {adminTab === 'coupons' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3>Configured Coupon Codes</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px' }}>Code</th>
                        <th style={{ padding: '12px' }}>Discount Type</th>
                        <th style={{ padding: '12px' }}>Value</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coup => (
                        <tr key={coup.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{coup.code}</td>
                          <td style={{ padding: '12px' }}>{coup.discountType}</td>
                          <td style={{ padding: '12px' }}>
                            {coup.discountType === 'PERCENTAGE' ? `${coup.discountValue}%` : `$${coup.discountValue}`}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${coup.active ? 'badge-success' : 'badge-danger'}`}>
                              {coup.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteCoupon(coup.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h3>Create Coupon</h3>
                  <form onSubmit={handleSaveCoupon} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Coupon Code</label>
                      <input type="text" className="form-control" placeholder="E.g. DISCO20" required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount Type</label>
                      <select className="form-control" value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} style={{ background: '#14161f' }}>
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Rate ($)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Value</label>
                      <input type="number" className="form-control" required value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                      Create Coupon
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORTS & ANALYTICS TAB */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Reports & Analytics</h1>
                <p style={{ color: 'var(--text-secondary)' }}>DineOS Business Performance</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
                  <FileText size={16} /> Export PDF
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('xls')}>
                  <Printer size={16} /> Export CSV/XLS
                </button>
              </div>
            </div>

            {/* Stat widgets */}
            <div className="stat-grid">
              <div className="glass-panel stat-card">
                <div className="stat-title">Gross Revenue</div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>
                  ${orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-title">Paid Orders</div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>
                  {orders.filter(o => o.status === 'PAID').length}
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-title">Draft Orders</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>
                  {orders.filter(o => o.status === 'DRAFT').length}
                </div>
              </div>
            </div>

            {/* Visual Charts simulation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3>Sales Trend (Last 5 Orders)</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: '30px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  {orders.filter(o => o.status === 'PAID').slice(-5).map((order, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <div style={{
                        height: `${Math.min(150, (order.total / 100) * 150)}px`,
                        width: '30px',
                        background: 'var(--primary-gradient)',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: 'var(--shadow-sm)'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        ${order.total.toFixed(0)}
                      </span>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'PAID').length === 0 && (
                    <div style={{ color: 'var(--text-muted)' }}>No completed sales yet</div>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3>Order History Ledger</h3>
                <div style={{ maxHeight: '220px', overflowY: 'auto', marginTop: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '8px' }}>Order</th>
                        <th style={{ padding: '8px' }}>Table</th>
                        <th style={{ padding: '8px' }}>Total</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(-10).reverse().map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{order.orderNumber}</td>
                          <td style={{ padding: '8px' }}>T - {order.table?.tableNumber}</td>
                          <td style={{ padding: '8px' }}>${order.total?.toFixed(2)}</td>
                          <td style={{ padding: '8px' }}>
                            <span className={`badge ${order.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* SESSION OPEN / CLOSE MODAL */}
      {sessionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '20px' }}>
              {sessionActionType === 'open' ? 'Open POS Session' : 'Close POS Session'}
            </h2>
            {sessionActionType === 'open' ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Opening Cash Float ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="100.00" 
                    value={sessionOpeningAmount}
                    onChange={e => setSessionOpeningAmount(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                  <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setSessionModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-accent" style={{ flexGrow: 1 }} onClick={handleOpenSession}>
                    Confirm & Start
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">Closing Cash Amount ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="250.00" 
                    value={sessionClosingAmount}
                    onChange={e => setSessionClosingAmount(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                  <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setSessionModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" style={{ flexGrow: 1 }} onClick={handleCloseSession}>
                    Confirm & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER SEARCH & ATTACH MODAL */}
      {customerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Assign Customer</h2>
              <button onClick={() => setCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {customers.map(c => (
                <div 
                  key={c.id} 
                  className="glass-panel" 
                  style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderColor: linkCustomer?.id === c.id ? 'var(--primary)' : 'var(--border-color)' }}
                  onClick={() => { setLinkCustomer(c); setCustomerModal(false); }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone} | {c.email}</div>
                  </div>
                  {linkCustomer?.id === c.id && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Selected</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COUPON SEARCH & APPLY MODAL */}
      {couponModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Apply Coupon Code</h2>
              <button onClick={() => setCouponModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coupons.map(c => (
                <div 
                  key={c.id} 
                  className="glass-panel" 
                  style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderColor: appliedCoupon?.id === c.id ? 'var(--primary)' : 'var(--border-color)' }}
                  onClick={() => { setAppliedCoupon(c); setCouponModal(false); }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{c.code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Save {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`} on bill
                    </div>
                  </div>
                  {appliedCoupon?.id === c.id && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Applied</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT & PAYMENT MODAL */}
      {checkoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Billing & Payment</h2>
              <button onClick={() => setCheckoutModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Bill Summary */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Tax:</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--accent)' }}>
                  <span>Discount:</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span>Amount to Pay:</span>
                <span style={{ color: 'var(--accent)' }}>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPaymentMethod('CASH')}
                  style={{ flexGrow: 1 }}
                >
                  💵 Cash
                </button>
                <button 
                  className={`btn ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPaymentMethod('CARD')}
                  style={{ flexGrow: 1 }}
                >
                  💳 Card
                </button>
                <button 
                  className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPaymentMethod('UPI')}
                  style={{ flexGrow: 1 }}
                >
                  📱 UPI QR
                </button>
              </div>
            </div>

            {/* CASH FIELD */}
            {paymentMethod === 'CASH' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Cash Received ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter cash amount" 
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                  />
                </div>
                {parseFloat(cashReceived) >= getTotal() && (
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                    Change Return: ${(parseFloat(cashReceived) - getTotal()).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* CARD FIELD */}
            {paymentMethod === 'CARD' && (
              <div className="form-group">
                <label className="form-label">Transaction Reference #</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="E.g. TX-98218-09" 
                  value={cardTxRef}
                  onChange={e => setCardTxRef(e.target.value)}
                />
              </div>
            )}

            {/* UPI QR FIELD */}
            {paymentMethod === 'UPI' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Premium mock QR code */}
                  <div style={{ width: '150px', height: '150px', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', background: '#000', padding: '6px' }}>
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} style={{ background: (i % 3 === 0 || i % 7 === 0 || (i > 10 && i < 20) || (i > 80 && i % 2 === 0)) ? '#fff' : '#000' }}></div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>Scan QR Code to Pay</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>DineOS UPI Merchant: dineos@upi</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setUpiConfirmed(!upiConfirmed)}>
                  <input type="checkbox" checked={upiConfirmed} onChange={() => {}} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>I have verified the payment arrival on merchant device</span>
                </div>
              </div>
            )}

            {/* Checkout Action Button */}
            <button 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }} 
              onClick={handleCheckoutSubmit}
              disabled={paymentMethod === 'UPI' && !upiConfirmed}
            >
              Finalize Order (Pay & Print)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
