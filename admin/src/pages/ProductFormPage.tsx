import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { apiClient } from "../api/client";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Upload, HelpCircle } from "lucide-react";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct
} from "../hooks/useProducts";
import { getImageUrl } from "../lib/image-utils";
import Accordion from "../components/Accordion";

interface Category {
  id: string;
  name: string;
  value: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  categoryId: string;
  stock: number;
  careInstructions?: string;
  uses?: string;
  benefits?: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get("/categories");
        setCategories(data.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const { data: responseData, isLoading: loadingProduct } = useProduct(
    isEditMode ? id : undefined
  );
  const product = responseData?.data;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      isActive: true,
      isFeatured: false,
      price: 0,
      costPrice: 0,
      stock: 0
    }
  });

  const nameValue = watch("name");

  // Auto generate slug from name
  useEffect(() => {
    if (nameValue && !isEditMode) {
      const generateSlug = (str: string) => {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      };
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, isEditMode, setValue]);

  useEffect(() => {
    if (isEditMode && product) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice || null,
        costPrice: product.costPrice || null,
        categoryId: product.categoryId,
        stock: product.stock,
        careInstructions: product.careInstructions || "",
        uses: product.uses || "",
        benefits: product.benefits || "",
        isActive: product.isActive,
        isFeatured: product.isFeatured
      });
      setImages(product.images || []);
    }
  }, [isEditMode, reset, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data.success) {
        // Cloudinary returns the full absolute URL, so we use it directly
        setImages((prev) => [...prev, data.data.url]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const onSubmit = async (formData: ProductFormData) => {
    const payload = {
      ...formData,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : 0,
      stock: Number(formData.stock),
      images: images,
      tags: [] // Simplified tags for now
    };

    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data: payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!");
            navigate("/products");
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Lỗi khi cập nhật sản phẩm:", err);
            toast.error(
              err.response?.data?.message || "Lỗi cập nhật sản phẩm."
            );
          }
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Tạo mới thành công!");
          navigate("/products");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          console.error("Lỗi khi lưu sản phẩm:", err);
          toast.error(
            err.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm"
          );
        }
      });
    }
  };

  if (isEditMode && loadingProduct)
    return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/products")}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Accordion title="Thông tin cơ bản">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                {...register("name", { required: "Tên là bắt buộc" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường dẫn (Slug) *
              </label>
              <input
                {...register("slug", { required: "Slug là bắt buộc" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả sản phẩm *
              </label>
              <textarea
                {...register("description", { required: "Mô tả là bắt buộc" })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                {...register("categoryId", {
                  required: "Danh mục là bắt buộc"
                })}
                defaultValue={product.categoryId}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 cursor-pointer text-gray-800"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>
        </Accordion>
        <Accordion title="Đặc tính cây trồng">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Cách chăm sóc
                </label>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  <HelpCircle size={10} />
                  <span>Hỗ trợ Markdown</span>
                </div>
              </div>
              <textarea
                {...register("careInstructions")}
                rows={4}
                placeholder="Hướng dẫn tưới nước, ánh sáng, bón phân...&#10;Dùng - hoặc * để tạo danh sách bullet."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm font-mono"
              ></textarea>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Công dụng
                </label>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  <HelpCircle size={10} />
                  <span>Hỗ trợ Markdown</span>
                </div>
              </div>
              <textarea
                {...register("uses")}
                rows={4}
                placeholder="Trang trí, lọc không khí, làm quà tặng...&#10;Dùng **văn bản** để in đậm."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm font-mono"
              ></textarea>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Lợi ích
                </label>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  <HelpCircle size={10} />
                  <span>Hỗ trợ Markdown</span>
                </div>
              </div>
              <textarea
                {...register("benefits")}
                rows={4}
                placeholder="Giảm căng thẳng, tài lộc, phong thủy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm font-mono"
              ></textarea>
              <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                <p>
                  💡 <strong>Mẹo nhỏ:</strong> Bạn có thể dùng Markdown để nội
                  dung hiển thị đẹp hơn. Ví dụ:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[10px]">
                  <span>**Chữ đậm**</span>
                  <span>- Mục danh sách</span>
                </div>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Giá & Tồn kho">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VNĐ) *
              </label>
              <input
                type="number"
                {...register("price", { required: "Giá là bắt buộc", min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá khuyến mãi (VNĐ)
              </label>
              <input
                type="number"
                {...register("salePrice", { min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá vốn (VNĐ)
              </label>
              <input
                type="number"
                {...register("costPrice", { min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                {...register("stock", {
                  required: "Số lượng là bắt buộc",
                  min: 0
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>
        </Accordion>

        <Accordion title="Hình ảnh sản phẩm">
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative group w-32 h-32">
                <img
                  src={getImageUrl(url)}
                  alt="upload"
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}

            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              {uploading ? (
                <span className="text-sm text-gray-500">Đang tải...</span>
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Tải ảnh lên</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            <div className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Hoặc dán URL ảnh (Cloudinary, v.v...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 cursor-pointer"
              >
                Thêm URL
              </button>
            </div>
          </div>
        </Accordion>

        <div className="bg-white p-8 rounded-xl shadow-sm flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-5 h-5 text-green-600 rounded"
            />
            <span className="text-gray-700 font-medium">
              Đang bán (Hiển thị)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="w-5 h-5 text-green-600 rounded"
            />
            <span className="text-gray-700 font-medium">Sản phẩm nổi bật</span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Save size={20} />
            Lưu Sản Phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
