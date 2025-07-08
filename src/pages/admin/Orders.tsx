import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Plus,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import { supabase, Order } from "../../lib/supabase";
import AdminLayout from "../../components/admin/AdminLayout";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Button from "../../components/UI/Button";

export default function Orders() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showLocalSaleModal, setShowLocalSaleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOrderType, setFilterOrderType] = useState<string>("all");

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin");
      return;
    }

    fetchOrders();
  }, [user, isAdmin, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    const matchesType =
      filterOrderType === "all" ||
      (filterOrderType === "local" && order.order_type === "local") ||
      (filterOrderType === "online" &&
        (!order.order_type || order.order_type === "online"));
    return matchesSearch && matchesType;
  });

  const handleCreateLocalSale = async (saleData: any) => {
    try {
      // Start a transaction-like operation
      setLoading(true);

      // First, check if all products have enough stock
      for (const product of saleData.products) {
        const { data: currentProduct, error } = await supabase
          .from("products")
          .select("stock")
          .eq("id", product.id)
          .single();

        if (error) throw error;

        if (currentProduct.stock < product.quantity) {
          throw new Error(
            `Estoque insuficiente para ${product.name}. Disponível: ${currentProduct.stock}, Solicitado: ${product.quantity}`
          );
        }
      }

      // Create the order
      const { error } = await supabase.from("orders").insert([
        {
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone || "Venda Local",
          customer_address: "Retirada na Loja",
          products: saleData.products,
          total: saleData.total,
          payment_method: saleData.payment_method || "Dinheiro",
          order_type: "local",
        },
      ]);

      if (error) throw error;

      // Update stock for each product
      for (const product of saleData.products) {
        const { error: stockError } = await supabase.rpc(
          "decrease_product_stock",
          {
            product_id: product.id,
            quantity_sold: product.quantity,
          }
        );

        if (stockError) {
          // If RPC doesn't exist, use direct update
          const { data: currentProduct, error: fetchError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", product.id)
            .single();

          if (fetchError) throw fetchError;

          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: currentProduct.stock - product.quantity })
            .eq("id", product.id);

          if (updateError) throw updateError;
        }
      }

      fetchOrders();
      setShowLocalSaleModal(false);

      // Show success message
      alert(
        `✅ VENDA FINALIZADA COM SUCESSO!\n\nCliente: ${
          saleData.customer_name
        }\nTotal: ${formatPrice(saleData.total)}\nPagamento: ${
          saleData.payment_method
        }\n\nEstoque atualizado automaticamente.`
      );
    } catch (error) {
      console.error("Error creating local sale:", error);
      alert(`❌ Erro ao registrar venda local:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="orders">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="orders">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
            <p className="text-slate-600">
              {orders.length} pedidos encontrados
            </p>
          </div>
          {/* Removido botão de Venda Local */}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterOrderType}
                onChange={(e) => setFilterOrderType(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Todos os pedidos</option>
                <option value="local">Comprados na loja</option>
                <option value="online">Comprados no site</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {order.customer_name}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.customer_address === "Retirada na Loja"
                          ? "Retirada na Loja"
                          : order.customer_address.substring(0, 30) + "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.products.length} item
                        {order.products.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="text-amber-600 hover:text-amber-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Detalhes do Pedido
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Informações do Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Nome:</p>
                      <p className="font-medium">
                        {selectedOrder.customer_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Telefone:</p>
                      <p className="font-medium">
                        {selectedOrder.customer_phone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-600">Endereço:</p>
                      <p className="font-medium">
                        {selectedOrder.customer_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Produtos
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map(
                      (product: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-slate-800">
                                {product.name}
                              </p>
                              <p className="text-sm text-slate-600">
                                Tamanho: {product.size}
                              </p>
                              <p className="text-sm text-slate-600">
                                Quantidade: {product.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">
                              {formatPrice(product.price * product.quantity)}
                            </p>
                            <p className="text-sm text-slate-600">
                              {formatPrice(product.price)} cada
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-800">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Pedido realizado em {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remover também o modal de venda local */}
        {/* {showLocalSaleModal && (
          <LocalSaleModal
            onClose={() => setShowLocalSaleModal(false)}
            onSubmit={handleCreateLocalSale}
          />
        )} */}
      </div>
    </AdminLayout>
  );
}

// Local Sale Modal Component
function LocalSaleModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [products, setProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .order("name");

      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = (product: any, size: string) => {
    if (!size) {
      alert("Selecione um tamanho");
      return;
    }

    const existingIndex = products.findIndex(
      (p) => p.id === product.id && p.size === size
    );
    if (existingIndex >= 0) {
      const updated = [...products];
      if (updated[existingIndex].quantity < product.stock) {
        updated[existingIndex].quantity += 1;
      } else {
        alert("Quantidade máxima atingida para este produto");
        return;
      }
      setProducts(updated);
    } else {
      setProducts([...products, { ...product, quantity: 1, size }]);
    }

    // Reset selections
    setSelectedProductId("");
    setSelectedSize("");
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(index);
      return;
    }

    const product = products[index];
    const availableProduct = availableProducts.find((p) => p.id === product.id);

    if (quantity > availableProduct?.stock) {
      alert(`Quantidade máxima disponível: ${availableProduct?.stock}`);
      return;
    }

    const updated = [...products];
    updated[index].quantity = quantity;
    setProducts(updated);
  };

  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const handleSubmit = () => {
    if (!customerName || products.length === 0) {
      alert("Preencha o nome do cliente e adicione pelo menos um produto");
      return;
    }

    onSubmit({
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        size: p.size,
        quantity: p.quantity,
        image_url: p.image_url,
      })),
      total,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl sm:max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Nova Venda Local
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">
                Dados do Cliente
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="(xx) xxxxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Forma de Pagamento *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Dinheiro", icon: Banknote, label: "Dinheiro" },
                      {
                        value: "Cartão de Débito",
                        icon: CreditCard,
                        label: "Cartão de Débito",
                      },
                      {
                        value: "Cartão de Crédito",
                        icon: CreditCard,
                        label: "Cartão de Crédito",
                      },
                      { value: "PIX", icon: Smartphone, label: "PIX" },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          className={`flex items-center space-x-2 p-2 border rounded-lg transition-colors ${
                            paymentMethod === method.value
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">
                Adicionar Produto
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Selecionar Produto
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setSelectedSize("");
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Escolha um produto...</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.price)} (Estoque:{" "}
                        {product.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProductId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Selecionar Tamanho
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableProducts
                        .find((p) => p.id === selectedProductId)
                        ?.sizes.map((size: string) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                              selectedSize === size
                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {selectedProductId && selectedSize && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      const product = availableProducts.find(
                        (p) => p.id === selectedProductId
                      );
                      if (product) {
                        addProduct(product, selectedSize);
                      }
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                )}
              </div>

              {/* Quick Add Products */}
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Produtos Disponíveis
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-8 w-8 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatPrice(product.price)} • Estoque:{" "}
                            {product.stock}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedProductId(product.id)}
                        className="text-amber-600 hover:text-amber-700 text-xs font-medium px-2 py-1 border border-amber-200 rounded"
                      >
                        Selecionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Products */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">
                Produtos Selecionados
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatPrice(product.price)} • Tam: {product.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(index, product.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(index, product.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Nenhum produto selecionado</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Desconto:</span>
                    <span className="text-green-600">R$ 0,00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    Pagamento: {paymentMethod}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  className="flex-1"
                  disabled={!customerName || products.length === 0}
                >
                  Finalizar Venda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
