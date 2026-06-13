import { useState, useEffect } from 'react';
import Logo from './customer/Logo';

const API_BASE_URL = 'http://localhost:8080/api/public';

const mStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a100d 0%, #1a2e23 50%, #0d1f16 100%)',
    padding: '0 0 100px 0',
    fontFamily: '"Outfit", sans-serif',
  },
  header: {
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(207,173,86,0.15)',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  brandName: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#cfad56',
  },
  tableBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(207,173,86,0.15)',
    color: '#cfad56',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  categoryBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  categoryChip: {
    whiteSpace: 'nowrap',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#8b9691',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  activeCategoryChip: {
    background: '#cfad56',
    color: '#0a100d',
    borderColor: '#cfad56',
  },
  productsSection: {
    padding: '16px',
  },
  productCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    marginBottom: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  productInfo: {},
  productName: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '4px',
  },
  productDesc: {
    color: '#8b9691',
    fontSize: '0.8rem',
    marginBottom: '6px',
  },
  productPrice: {
    color: '#cfad56',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  productEmoji: {
    fontSize: '2rem',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(207,173,86,0.1)',
    borderRadius: '12px',
    flexShrink: 0,
  },
  cartBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(10,16,13,0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(207,173,86,0.2)',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  cartInfo: {
    color: '#fff',
  },
  cartCount: {
    fontSize: '0.8rem',
    color: '#8b9691',
  },
  cartTotal: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#cfad56',
  },
  orderBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #cfad56, #b8943f)',
    color: '#0a100d',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 30,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80vh',
    background: '#1a2e23',
    borderRadius: '24px 24px 0 0',
    padding: '24px 16px',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  cartItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
  },
};

export default function MenuApp() {
  const params = new URLSearchParams(window.location.search);
  const tableId = params.get('table');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
    fetch(`${API_BASE_URL}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQty = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const getItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    let custId = null;
    if (customerName.trim()) {
      try {
        const custRes = await fetch(`${API_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: customerName.trim() }),
        });
        if (custRes.ok) {
          const cust = await custRes.json();
          custId = cust.id;
        }
      } catch {
        // Fallback: customer lookup/creation failed, order will be placed anonymously
      }
    }

    const payload = {
      tableId: tableId ? parseInt(tableId) : null,
      customerId: custId,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOrderSuccess(true);
        setShowCart(false);
      } else {
        const err = await res.text();
        alert('Failed to place order: ' + err);
      }
    } catch {
      alert('Could not connect to server');
    }
    setSubmitting(false);
  };

  if (orderSuccess) {
    return (
      <div style={{ ...mStyles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Order Placed!</h2>
          <p style={{ color: '#8b9691', marginBottom: '24px' }}>
            Your order has been sent to the kitchen. Sit back and relax!
          </p>
          <button style={mStyles.orderBtn} onClick={() => { setOrderSuccess(false); setCart([]); setCustomerName(''); }}>
            Order More
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.category?.id === parseInt(selectedCategory));

  return (
    <div style={mStyles.container}>
      <div style={mStyles.header}>
        <div style={mStyles.headerTop}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo className="w-8 h-8" />
            <div style={mStyles.brandName}>GatherPoint</div>
          </div>
          {tableId && <div style={mStyles.tableBadge}>Table {tableId}</div>}
        </div>
        <div style={mStyles.categoryBar}>
          <button style={{ ...mStyles.categoryChip, ...(selectedCategory === 'ALL' ? mStyles.activeCategoryChip : {}) }}
            onClick={() => setSelectedCategory('ALL')}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id}
              style={{ ...mStyles.categoryChip, ...(selectedCategory === String(cat.id) ? mStyles.activeCategoryChip : {}) }}
              onClick={() => setSelectedCategory(String(cat.id))}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={mStyles.productsSection}>
        {filteredProducts.map(product => (
          <div key={product.id} style={mStyles.productCard} onClick={() => addToCart(product)}>
            <div style={mStyles.productInfo}>
              <div style={mStyles.productName}>{product.productName}</div>
              {product.description && <div style={mStyles.productDesc}>{product.description}</div>}
              <div style={mStyles.productPrice}>${product.price.toFixed(2)}</div>
            </div>
            <div style={mStyles.productEmoji}>{product.imageUrl || '🍲'}</div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8b9691', padding: '60px 20px' }}>
            No products available in this category
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div style={mStyles.cartBar}>
          <div style={mStyles.cartInfo}>
            <div style={mStyles.cartCount}>{getItemCount()} items</div>
            <div style={mStyles.cartTotal}>${getTotal().toFixed(2)}</div>
          </div>
          <button style={mStyles.orderBtn} onClick={() => setShowCart(true)}>
            View Cart
          </button>
        </div>
      )}

      {showCart && (
        <div style={mStyles.modalOverlay} onClick={() => setShowCart(false)}>
          <div style={mStyles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={{ color: '#fff', margin: 0 }}>Your Order</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#8b9691', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input style={mStyles.nameInput} type="text" placeholder="Your name (optional)" value={customerName}
                onChange={e => setCustomerName(e.target.value)} />
            </div>

            {cart.map(item => (
              <div key={item.product.id} style={mStyles.cartItemRow}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{item.product.productName}</div>
                  <div style={{ color: '#cfad56', fontSize: '0.85rem' }}>${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
                <div style={mStyles.qtyControls}>
                  <button style={mStyles.qtyBtn} onClick={() => updateQty(item.product.id, -1)}>−</button>
                  <span style={{ color: '#fff', fontWeight: 700, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                  <button style={mStyles.qtyBtn} onClick={() => updateQty(item.product.id, 1)}>+</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
              <span style={{ color: '#cfad56', fontWeight: 700, fontSize: '1.1rem' }}>${getTotal().toFixed(2)}</span>
            </div>

            <button style={{ ...mStyles.orderBtn, width: '100%', marginTop: '8px', opacity: submitting ? 0.6 : 1 }}
              onClick={placeOrder} disabled={submitting || cart.length === 0}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
