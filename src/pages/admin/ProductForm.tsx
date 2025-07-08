import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, Product } from "../../lib/supabase";
import AdminLayout from "../../components/admin/AdminLayout";
import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  description: yup.string().required("Descrição é obrigatória"),
  price: yup
    .number()
    .required("Preço é obrigatório")
    .min(0, "Preço deve ser positivo"),
  stock: yup
    .number()
    .required("Estoque é obrigatório")
    .min(0, "Estoque deve ser positivo"),
  image_url: yup.string().required("URL da imagem é obrigatória"),
  category: yup.string().required("Categoria é obrigatória"),
});

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const isEditing = !!id && id !== "new";

  // 1. Adicionar estados para upload e preview
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    "Camisas",
    "Calças",
    "Polos",
    "Blazers",
    "Bermudas",
    "Camisetas",
  ];
  const availableSizes = ["P", "M", "G", "GG", "36", "38", "40", "42", "44"];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: yupResolver(schema),
  });

  // 2. Função para upload no Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (error) {
      alert("Erro ao fazer upload da imagem!");
      setUploading(false);
      return;
    }

    const url = supabase.storage.from("products").getPublicUrl(fileName)
      .data.publicUrl;
    setValue("image_url", url);
    setImagePreview(url);
    setUploading(false);
  };

  // 3. Mostrar preview ao editar produto
  useEffect(() => {
    if (product && product.image_url) setImagePreview(product.image_url);
  }, [product]);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin");
      return;
    }

    if (isEditing) {
      fetchProduct();
    }
  }, [user, isAdmin, navigate, isEditing, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProduct(data);
      setSelectedSizes(data.sizes);

      // Populate form with product data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "sizes") {
          setValue(key as keyof ProductFormData, value);
        }
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const onSubmit = async (data: ProductFormData) => {
    if (selectedSizes.length === 0) {
      alert("Selecione pelo menos um tamanho");
      return;
    }

    try {
      setLoading(true);

      const productData = {
        ...data,
        sizes: selectedSizes,
        price: Number(data.price),
        stock: Number(data.stock),
      };

      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <AdminLayout currentPage="inventory">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="inventory">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate("/admin/inventory")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Estoque</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-800">
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: Camisa Social Slim"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    {...register("stock")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Descrição detalhada do produto..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Imagem do Produto */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagem do Produto *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {uploading && (
                  <p className="text-amber-600 text-sm mt-1">
                    Enviando imagem...
                  </p>
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-32 object-contain rounded"
                  />
                )}
                {errors.image_url && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image_url.message}
                  </p>
                )}
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamanhos Disponíveis *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-2 border rounded-lg transition-all duration-200 ${
                        selectedSizes.includes(size)
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Selecione pelo menos um tamanho
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/admin/inventory")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  {isEditing ? "Atualizar Produto" : "Criar Produto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
