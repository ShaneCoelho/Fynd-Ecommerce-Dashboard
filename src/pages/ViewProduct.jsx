import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cookieService } from '../services/cookies';
import { productService } from '../services/product';
import { categoryService } from '../services/category';
import toast from 'react-hot-toast';
import Drawer from '../components/Drawer';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    discount: '',
  });
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchProduct = useCallback(async (updateFormData = true) => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      if (response.success) {
        setProduct(response.product);
        // Only update form data on initial load or explicit request
        if (updateFormData) {
          setFormData({
            title: response.product.title,
            description: response.product.description || '',
            category_id: response.product.category_id,
            price: response.product.price.toString(),
            discount: response.product.discount.toString(),
          });
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        cookieService.removeToken();
        navigate('/login');
      } else {
        toast.error('Failed to fetch product');
        navigate('/dashboard/products');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!cookieService.isAuthenticated()) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    fetchProduct();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories(true);
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      toast.error('Maximum 3 images allowed per upload');
      return;
    }

    const totalImages = (product?.images?.length || 0) + files.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    const invalidTypes = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidTypes.length > 0) {
      toast.error('Only image files are allowed');
      return;
    }

    setNewImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseInt(formData.discount) || 0;
    return price - (price * discount) / 100;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.discount && (parseInt(formData.discount) < 0 || parseInt(formData.discount) > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUpdating(true);
      
      // First, update product details if there are changes
      const updateResponse = await productService.updateProduct(id, formData);

      if (!updateResponse.success) {
        throw new Error('Failed to update product');
      }

      // Then, upload new images if any
      if (newImages.length > 0) {
        const imageResponse = await productService.addProductImages(id, newImages);
        
        if (imageResponse.success) {
          setNewImages([]);
          setNewImagePreviews([]);
          toast.success('Product and images updated successfully');
        } else {
          toast.success('Product updated, but some images failed to upload');
        }
      } else {
        toast.success('Product updated successfully');
      }

      // Refresh product data
      fetchProduct(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await productService.deleteProductImage(id, imageId);

      if (response.success) {
        toast.success('Image deleted successfully');
        // Don't update form data, just refresh product images
        fetchProduct(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete image';
      toast.error(message);
    }
  };

  if (!cookieService.isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Drawer />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Drawer />

      <div className="flex-1 lg:ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Details</h1>
            <p className="text-gray-600">View and edit product information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Info Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Product Information</h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                  </div>

                  {/* Price and Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.discount ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.discount && <p className="mt-1 text-sm text-red-500">{errors.discount}</p>}
                    </div>
                  </div>

                  {/* Final Price Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Price (₹)
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-800">
                      ₹{finalPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Update Button */}
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      newImages.length > 0 ? `Update Product & Add ${newImages.length} Image(s)` : 'Update Product'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Image Management */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Product Images</h2>

                {/* Current Images */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Current Images ({product.images?.length || 0}/10)
                  </h3>
                  {product.images && product.images.length > 0 ? (
                    <div className="space-y-3">
                      {product.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image}
                            alt="Product"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No images uploaded yet</p>
                  )}
                </div>

                {/* Add New Images */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Images</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNewImageChange}
                      className="hidden"
                      id="new-image-upload"
                    />
                    <label htmlFor="new-image-upload" className="cursor-pointer flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm text-blue-600 font-medium">Upload Images</span>
                      <span className="text-xs text-gray-500 mt-1">Max 3 per upload, 5MB each</span>
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        {newImages.length} new image(s) selected - click &quot;Update Product&quot; to save
                      </p>
                      <div className="space-y-2">
                        {newImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImagesArray = newImages.filter((_, i) => i !== index);
                                const newPreviewsArray = newImagePreviews.filter((_, i) => i !== index);
                                setNewImages(newImagesArray);
                                setNewImagePreviews(newPreviewsArray);
                              }}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

