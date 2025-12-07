import api from './api';

export const categoryService = {
  // Get all categories with optional filter
  getCategories: async (isActive = null) => {
    const params = isActive !== null ? { is_active: isActive } : {};
    const response = await api.get('/admin/categories', { params });
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  // Update a category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  // Toggle category active status
  toggleCategory: async (id) => {
    const response = await api.patch(`/admin/categories/${id}/toggle`);
    return response.data;
  },
};

