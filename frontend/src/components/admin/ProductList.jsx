
const ProductList = ({ products }) => {
  const maxRevenue = Math.max(...products.map(p => p.revenue));

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="flex flex-col p-4 rounded-2xl hover:bg-gray-800/50 transition-colors border border-transparent hover:border-[#D4AF37]/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-gray-700 bg-gray-800 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                  />
                ) : null}
                <div className="text-gray-500 font-extrabold text-lg" style={{ display: product.image ? 'none' : 'block' }}>
                  {product.name.charAt(0)}
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold tracking-wide">{product.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[#D4AF37] font-extrabold tracking-wide">₹{product.revenue.toLocaleString('en-IN')}</p>
              <p className="text-gray-400 text-xs mt-0.5">{product.salesCount} Sales</p>
            </div>
          </div>
          
          {/* Revenue Progress Bar */}
          <div className="mt-4 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#b8943f] rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
