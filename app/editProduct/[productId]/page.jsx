"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import CategorySelect from "@/components/CategorySelect";
import VariantManager from "@/components/VariantManager";

const EditProduct = () => {
  const { data: session } = useSession();
  const { productId } = useParams();
  const router = useRouter();
  const [expectedStock, setExpectedStock] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const uploadingRef = useRef(false);
  const [product, setProduct] = useState({
    name: "", description: "", condition: "", brand: "", category: "",
    material: "", stock: 0, price: "", originalPrice: "", is_demo:false, category_id:null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${productId}`);
        const fetchedProduct = res.data;
        setProduct(fetchedProduct);
        setExpectedStock(fetchedProduct.stock);
        setImageUrls(Array.isArray(fetchedProduct.images) ? fetchedProduct.images : []);
      } catch (error) {
        console.log(error);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    setImageError("");
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) throw new Error("Please select image files only.");
        const form = new FormData();
        form.append("file", file);
        const { data } = await axios.post("/api/images", form);
        if (!data?.id || data.url !== `/api/images/${data.id}`) {
          throw new Error("The image server returned an invalid local URL.");
        }
        setImageUrls((urls) => [...urls, data.url]);
      }
    } catch (error) {
      setImageError(error.response?.data?.error || error.message || "Image upload failed. Please try again.");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  const handleRemoveImage = (e, index) => {
    e.preventDefault();
    setImageUrls((urls) => urls.filter((_, i) => i !== index));
  };

  const handleMoveImage = (e, index, direction) => {
    e.preventDefault();
    setImageUrls((urls) => {
      const next = [...urls];
      const target = index + direction;
      if (target < 0 || target >= next.length) return urls;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingRef.current) {
      setImageError("Please wait for image uploads to finish before submitting.");
      return;
    }
    if (!imageUrls.length) {
      setImageError("Please keep at least one image before submitting.");
      return;
    }
    if (imageUrls.some((url) => !/^\/api\/images\/[^/?#]+$/.test(url))) {
      setImageError("Please remove and replace externally hosted images with new local uploads before saving.");
      return;
    }
    setImageError("");
    try {
      const { name, description, condition, brand, category, material, price, originalPrice } = product;
      const productData = { name, description, condition, brand, category: category || null, category_id:product.category_id, is_demo:product.is_demo, material, price, originalPrice, ...(!product.has_variants?{stock:Number(product.stock),expectedStock}:{}), images: imageUrls };
      const productRes = await axios.put(`/api/product/${productId}`, productData);
      if (productRes.status === 200) {
        toast.success("Product edited successfully!");
        router.push("/products");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Product could not be updated. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/product/${productId}`);
      if (res.status === 200) {
        toast.success("Product deleted successfully!");
        router.push("/products");
      }
    } catch (error) {
      toast.error("Product cloudnt be deleted");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 py-6">
          <h1 className="text-center text-white text-3xl font-extrabold">
            Edit Product
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
          <label className="block"><input name="is_demo" type="checkbox" checked={Boolean(product.is_demo)} onChange={e=>setProduct(prev=>({...prev,is_demo:e.target.checked}))}/> สินค้าสาธิต — ไม่อนุญาตให้เพิ่มลงตะกร้า</label>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <Input type="number" id="stock" name="stock" min="0" max="4294967295" step="1" required disabled={product.has_variants} value={product.stock} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <Input
                type="text"
                name="name"
                id="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <Input name="brand" id="brand" value={product.brand ?? ""} onChange={handleChange} placeholder="Brand" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Upload product images"
                  disabled={uploading}
                  onChange={handleUpload}
                  className="block w-full text-sm text-gray-700"
                />
                {uploading && <p role="status">Uploading images… Please wait before submitting.</p>}
              </div>
            </div>
            {imageError && <p role="alert" className="mt-2 text-sm text-red-600">{imageError}</p>}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="relative group">
                  <Image
                    height={500}
                    width={500}
                    unoptimized={url.startsWith("/api/images/")}
                    className="h-24 w-full object-cover rounded-md"
                    src={url}
                    alt={`Product image ${index + 1}`}
                  />
                  <div className="flex gap-1 mt-1">
                    <button type="button" aria-label={`Move image ${index + 1} up`} disabled={index === 0 || uploading} onClick={(e) => handleMoveImage(e, index, -1)}>↑</button>
                    <button type="button" aria-label={`Move image ${index + 1} down`} disabled={index === imageUrls.length - 1 || uploading} onClick={(e) => handleMoveImage(e, index, 1)}>↓</button>
                    <button type="button" aria-label={`Remove image ${index + 1}`} disabled={uploading} onClick={(e) => handleRemoveImage(e, index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategorySelect value={product.category_id} onChange={category=>setProduct(prev=>({...prev,category_id:category?.id??null,category:category?.name??null}))}/>
            <div><label htmlFor="material">วัสดุ</label><Input id="material" name="material" value={product.material ?? ""} onChange={handleChange} /></div>
            <div><label htmlFor="condition">สภาพ</label><Input id="condition" name="condition" value={product.condition ?? ""} onChange={handleChange} /></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description of the Product
            </label>
            <Textarea
              name="description"
              id="description"
              value={product.description}
              onChange={handleChange}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Detailed product description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (THB)
              </label>
              <Input
                type="number"
                name="originalPrice"
                id="originalPrice"
                value={product.originalPrice}
                onChange={handleChange}
                placeholder="Enter original price"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price (THB)
              </label>
              <Input
                type="number"
                name="price"
                id="price"
                value={product.price}
                onChange={handleChange}
                placeholder="Enter sale price"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="myButton"
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Product
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              variant="destructive"
              className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Product
            </Button>
          </div>
        </form>
        <div className="px-8 py-6"><VariantManager productId={productId} onSaved={async()=>{const {data}=await axios.get(`/api/product/${productId}`);setProduct(prev=>({...prev,stock:data.stock,has_variants:data.has_variants,variants:data.variants}));setExpectedStock(data.stock);}}/></div>
      </div>
    </div>
  );
};

export default EditProduct;
