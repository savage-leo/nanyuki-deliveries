import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3000/api'

interface Vendor {
  id: string
  name: string
  type: string
  address: string
  rating: string
}

interface MenuItem {
  id: string
  name: string
  price: string
  category: string
}

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

function App() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [groupedMenu, setGroupedMenu] = useState<Record<string, MenuItem[]>>({})
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    loadVendors()
  }, [])

  async function loadVendors() {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/vendors`)
      if (res.data.success) {
        setVendors(res.data.data)
      }
    } catch (e) {
      console.error('Failed to load vendors')
    }
    setLoading(false)
  }

  async function loadMenu(vendorId: string) {
    try {
      const res = await axios.get(`${API}/vendors/${vendorId}/menu`)
      if (res.data.success) {
        setMenu(res.data.data)
        setGroupedMenu(res.data.grouped)
      }
    } catch (e) {
      console.error('Failed to load menu')
    }
  }

  function openVendor(vendor: Vendor) {
    setSelectedVendor(vendor)
    loadMenu(vendor.id)
  }

  function closeMenu() {
    setSelectedVendor(null)
    setMenu([])
    setGroupedMenu({})
  }

  function addToCart(item: MenuItem) {
    const existing = cart.find(i => i.id === item.id)
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }])
    }
  }

  function updateQty(id: string, delta: number) {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta
        return newQty > 0 ? { ...i, qty: newQty } : null
      }
      return i
    }).filter(Boolean) as CartItem[])
  }

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const filteredVendors = category === 'all' 
    ? vendors 
    : vendors.filter(v => v.type === category)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-600 sticky top-0 z-50 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐺</span>
            <h1 className="text-xl font-bold text-white">Nanyuki Deliveries</h1>
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
          >
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Location Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2 text-gray-600">
          <span>📍</span>
          <span>Delivering to:</span>
          <strong className="text-gray-900">Kwa Huku, Nanyuki</strong>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto px-4 py-4">
        <input 
          type="text" 
          placeholder="Search..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Categories */}
      <div className="max-w-md mx-auto px-4 pb-4 flex gap-2 overflow-x-auto">
        {[
          { id: 'restaurant', icon: '🍕', label: 'Food' },
          { id: 'grocery', icon: '🛒', label: 'Grocery' },
          { id: 'pharmacy', icon: '💊', label: 'Pharmacy' },
          { id: 'all', icon: '📦', label: 'All' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition shrink-0 ${
              category === cat.id 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Vendors */}
      <main className="max-w-md mx-auto px-4 pb-24">
        <h2 className="text-lg font-semibold mb-4">Popular Near You</h2>
        
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                onClick={() => openVendor(vendor)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className={`h-32 flex items-center justify-center ${
                  vendor.type === 'restaurant' ? 'bg-yellow-100' :
                  vendor.type === 'grocery' ? 'bg-gray-100' : 'bg-teal-100'
                }`}>
                  <span className="text-5xl">
                    {vendor.type === 'restaurant' ? '🍕' : 
                     vendor.type === 'grocery' ? '🛒' : '💊'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="capitalize">{vendor.type}</span>
                    <span>•</span>
                    <span className="text-yellow-500">★ {vendor.rating || 'New'}</span>
                    <span>•</span>
                    <span>{vendor.address || 'Nanyuki'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Menu Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4">
            <button onClick={closeMenu} className="text-2xl">←</button>
            <h2 className="text-xl font-semibold">{selectedVendor.name}</h2>
          </div>
          
          <div className="max-w-md mx-auto px-4 py-6">
            {Object.entries(groupedMenu).map(([cat, items]) => (
              <div key={cat} className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">{cat}</h3>
                <div className="grid gap-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-emerald-600 font-semibold">KES {item.price}</p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-medium transition"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 text-2xl">✕</button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500 text-sm">KES {item.price} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center"
                          >-</button>
                          <span className="font-medium">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center"
                          >+</button>
                          <span className="font-semibold w-20 text-right">KES {item.price * item.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>KES {cartTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>KES 100</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>KES {cartTotal + 100}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold mt-6 transition">
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
