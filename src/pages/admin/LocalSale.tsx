import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { Banknote, CreditCard, Smartphone, Plus } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

export default function LocalSale() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [products, setProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [valuePaid, setValuePaid] = useState<string>("");

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

  const handleSubmit = async () => {
    if (!customerName || products.length === 0) {
      alert("Preencha o nome do cliente e adicione pelo menos um produto");
      return;
    }
    setLoading(true);
    try {
      // Verifica estoque
      for (const product of products) {
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
      // Cria o pedido
      const { error } = await supabase.from("orders").insert([
        {
          customer_name: customerName,
          customer_phone: customerPhone || "Venda Local",
          customer_address: "Retirada na Loja",
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            size: p.size,
            quantity: p.quantity,
            image_url: p.image_url,
          })),
          total,
          payment_method: paymentMethod || "Dinheiro",
          order_type: "local",
        },
      ]);
      if (error) throw error;
      // Atualiza estoque
      for (const product of products) {
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
      alert(
        `✅ VENDA FINALIZADA COM SUCESSO!\n\nCliente: ${customerName}\nTotal: ${formatPrice(
          total
        )}\nPagamento: ${paymentMethod}\n\nEstoque atualizado automaticamente.`
      );
      setProducts([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("Dinheiro");
      setValuePaid("");
    } catch (error: any) {
      alert(`❌ Erro ao registrar venda local:\n${error.message}`);
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

  const categories = Array.from(
    new Set(availableProducts.map((p) => p.category))
  ).filter(Boolean);

  return (
    <AdminLayout currentPage="localsale">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Venda Local</h1>
        {/* 1. Seleção de Produto */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-800 mb-3">
            Adicionar Produto
          </h3>
          <div className="space-y-4">
            {/* Filtro por categoria */}
            {categories.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Filtrar por categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Selecionar Produto
              </label>
              <div className="grid grid-cols-1 gap-3">
                {availableProducts
                  .filter(
                    (p) => !selectedCategory || p.category === selectedCategory
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedProductId === product.id
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setSelectedSize("");
                      }}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <div>
                        <p className="font-medium text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatPrice(product.price)} • Estoque:{" "}
                          {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
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
        </div>
        {/* 2. Dados do Cliente */}
        <div className="mb-8">
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
          </div>
        </div>
        {/* 3. Forma de Pagamento */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-800 mb-3">
            Forma de Pagamento
          </h3>
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
        {/* 4. Carrinho e Finalizar Venda */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-800 mb-3">Carrinho</h3>
          <div className="space-y-2">
            {products.length === 0 && (
              <p className="text-slate-500 text-sm">
                Nenhum produto adicionado.
              </p>
            )}
            {products.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-100 rounded-lg px-3 py-2"
              >
                <div className="font-medium text-slate-800">
                  {product.name} ({product.size})
                </div>
                <div className="text-xs text-slate-500">
                  {formatPrice(product.price)} x {product.quantity}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={product.quantity}
                    onChange={(e) =>
                      updateQuantity(idx, Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => removeProduct(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Forma de Pagamento dentro do carrinho */}
          <div className="mb-4 mt-6">
            <h4 className="font-semibold text-slate-800 mb-2">
              Forma de Pagamento
            </h4>
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
          <div className="mt-4 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Total:</span>
            <span className="text-lg font-bold text-amber-600">
              {formatPrice(total)}
            </span>
          </div>
          {paymentMethod === "Dinheiro" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor Pago
              </label>
              <input
                type="text"
                value={valuePaid}
                onChange={(e) => setValuePaid(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0,00"
              />
              {valuePaid && Number(valuePaid) > total && (
                <div className="mt-2 text-sm text-green-600">
                  Troco: {formatPrice(Number(valuePaid) - total)}
                </div>
              )}
              {valuePaid && Number(valuePaid) < total && (
                <div className="mt-2 text-sm text-red-600">
                  Faltam: {formatPrice(total - Number(valuePaid))}
                </div>
              )}
            </div>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : "Finalizar Venda"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
