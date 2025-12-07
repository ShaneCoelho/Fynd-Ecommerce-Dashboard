import api from './api';

export const productService = {
  // Get all products with optional filters and pagination
  getProducts: async (filters = {}) => {
    const params = {};
    if (filters.is_active !== null && filters.is_active !== undefined) {
      params.is_active = filters.is_active;
    }
    if (filters.category) {
      params.category = filters.category;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  // Create a new product (with images)
  createProduct: async (productData) => {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description || '');
    formData.append('category_id', productData.category_id);
    formData.append('price', productData.price);
    formData.append('discount', productData.discount || 0);
    formData.append('is_active', productData.is_active);

    // Append images
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  // Toggle product active status
  toggleProduct: async (id) => {
    const response = await api.patch(`/admin/products/${id}/toggle`);
    return response.data;
  },

  // Add images to product
  addProductImages: async (id, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/admin/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product image
  deleteProductImage: async (productId, imageId) => {
    const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
    return response.data;
  },
};

