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

const EditProduct = () => {
  const { data: session } = useSession();
  const { productId } = useParams();
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const uploadingRef = useRef(false);
  const [product, setProduct] = useState({
    user: "",
    name: "",
    description: "",
    condition: "",
    bracelet: "",
    brand: "",
    material: "",
    images: [],
    price: 0,
    originalPrice: 0,
    movement: "",
    thickness: "",
    glass: "",
    luminova: "",
    casematerial: "",
    crown: "",
    bandsize: "",
    lugs: "",
    water: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${productId}`);
        const fetchedProduct = res.data;
        setProduct(fetchedProduct);
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
      const productData = { ...product, images: imageUrls };
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
              <select
                name="brand"
                id="brand"
                value={product.brand}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a brand</option>
                <option value="Rolex">Rolex</option>
                <option value="Patek Philipe">Patek Philippe</option>
                <option value="Audemars Piguet">Audemars Piguet</option>
                <option value="Richard Mille">Richard Mille</option>
                <option value="Omega">Omega</option>
                <option value="IWC">IWC</option>
                <option value="Cartier">Cartier</option>
                <option value="Tudor">Tudor</option>
              </select>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                name="material"
                id="material"
                value={product.material}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select material</option>
                <option value="Stainless Steel">Stainless Steel</option>
                <option value="Gold">Gold</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Two Tone">Two Tone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bracelet Style
              </label>
              <select
                name="bracelet"
                id="bracelet"
                value={product.bracelet}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select bracelet style</option>
                <option value="Oyster Bracelet">Oyster Bracelet</option>
                <option value="Jubilee Bracelet">Jubilee Bracelet</option>
                <option value="Presidential Bracelet">
                  Presidential Bracelet
                </option>
                <option value="Iconic Brand Bracelet">
                  Iconic Brand Bracelet
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Watch Condition
              </label>
              <select
                name="condition"
                id="condition"
                value={product.condition}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select condition</option>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Well Worn">Well Worn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movement
              </label>
              <select
                name="movement"
                id="movement"
                value={product.movement}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select movement</option>
                <option value="Rolex 3235 Automatik Movement">
                  Rolex 3235 Automatik Movement
                </option>
                <option value="Rolex 3225 Automatik Movement">
                  Rolex 3225 Automatik Movement
                </option>
                <option value="Rolex 3245 Automatik Movement">
                  Rolex 3245 Automatik Movement
                </option>
                <option value="Rolex 3265 Automatik Movement">
                  Rolex 3265 Automatik Movement
                </option>
                <option value="Patek Philipe 5711 Automatik Movement">
                  Patek Philipe 5711 Automatik Movement
                </option>
                <option value="Patek Philipe 5712G Automatik Movement">
                  Patek Philipe 5712G Automatik Movement
                </option>
                <option value="Audemars Piguet 412513 Automatik Movement">
                  Audemars Piguet 412513 Automatik Movement
                </option>
                <option value="Audemars Piguet 414221 Automatik Movement">
                  Audemars Piguet 414221 Automatik Movement
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thickness
              </label>
              <Input
                type="text"
                name="thickness"
                id="thickness"
                value={product.thickness}
                onChange={handleChange}
                placeholder="e.g., 12mm"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Glass
              </label>
              <Input
                type="text"
                name="glass"
                id="glass"
                value={product.glass}
                onChange={handleChange}
                placeholder="e.g., Sapphire Glass - Scratch Proof"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminova
              </label>
              <Input
                type="text"
                name="luminova"
                id="luminova"
                value={product.luminova}
                onChange={handleChange}
                placeholder="e.g., Yes"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Material
              </label>
              <select
                name="casematerial"
                id="casematerial"
                value={product.casematerial}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select case material</option>
                <option value="316L Stainless Steel">
                  316L Stainless Steel
                </option>
                <option value="904L Stainless Steel">
                  904L Stainless Steel
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crown
              </label>
              <Input
                type="text"
                name="crown"
                id="crown"
                value={product.crown}
                onChange={handleChange}
                placeholder="e.g., Screwed"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Band Size
              </label>
              <Input
                type="text"
                name="bandsize"
                id="bandsize"
                value={product.bandsize}
                onChange={handleChange}
                placeholder="e.g., 14.5cm to 22cm (Adjustable)"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugs
              </label>
              <Input
                type="text"
                name="lugs"
                id="lugs"
                value={product.lugs}
                onChange={handleChange}
                placeholder="e.g., 20mm"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Resistance
              </label>
              <Input
                type="text"
                name="water"
                id="water"
                value={product.water}
                onChange={handleChange}
                placeholder="e.g., 3 ATM"
                className="w-full"
                required
              />
            </div>
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
                Original Price
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
                Sale Price
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
              onClick={handleDelete}
              variant="destructive"
              className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
