import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase, Product, Order } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Budget() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    todayOrders: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin');
      return;
    }
    
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Calculate stats
      calculateStats(productsData || [], ordersData || []);
      calculateCategoryStats(productsData || [], ordersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products: Product[], orders: Order[]) => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockItems = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total, 0);
    
    // Today's orders
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.created_at).toDateString() === today
    ).length;

    setStats({
      totalProducts,
      totalStock,
      lowStockItems,
      outOfStockItems,
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      todayOrders
    });
  };

  const calculateCategoryStats = (products: Product[], orders: Order[]) => {
    const categoryMap = new Map();
    
    // Initialize categories
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          category: product.category,
          totalProducts: 0,
          totalStock: 0,
          totalSold: 0,
          revenue: 0
        });
      }
      
      const cat = categoryMap.get(product.category);
      cat.totalProducts += 1;
      cat.totalStock += product.stock;
    });

    // Calculate sales by category
    orders.forEach(order => {
      order.products.forEach((product: any) => {
        // Find the product to get its category
        const productData = products.find(p => p.id === product.id);
        if (productData && categoryMap.has(productData.category)) {
          const cat = categoryMap.get(productData.category);
          cat.totalSold += product.quantity;
          cat.revenue += product.price * product.quantity;
        }
      });
    });

    setCategoryStats(Array.from(categoryMap.values()));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="budget">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="budget">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Orçamento e Relatórios</h1>
          <p className="text-slate-600">Visão geral do desempenho da loja</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Receita Mensal</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.monthlyRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total de Pedidos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Pedidos Hoje</p>
                <p className="text-2xl font-bold text-amber-600">{stats.todayOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total de Produtos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-slate-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Estoque Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStock}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Estoque Baixo</p>
                <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
              </div>
              <Package className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Desempenho por Categoria</h2>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.category} className="border-b border-slate-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{category.category}</h3>
                    <span className="text-green-600 font-semibold">
                      {formatPrice(category.revenue)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                    <div>
                      <p>Produtos: {category.totalProducts}</p>
                    </div>
                    <div>
                      <p>Estoque: {category.totalStock}</p>
                    </div>
                    <div>
                      <p>Vendidos: {category.totalSold}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Alertas de Estoque</h2>
            <div className="space-y-3">
              {products
                .filter(product => product.stock <= 5)
                .sort((a, b) => a.stock - b.stock)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-sm text-slate-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock <= 3
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {product.stock === 0 ? 'Esgotado' : `${product.stock} restantes`}
                      </span>
                    </div>
                  </div>
                ))}
              
              {products.filter(product => product.stock <= 5).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>Todos os produtos têm estoque adequado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}