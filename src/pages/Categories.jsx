import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cookieService } from '../services/cookies';
import { categoryService } from '../services/category';
import toast from 'react-hot-toast';
import Drawer from '../components/Drawer';
import CategoryModal from '../components/CategoryModal';

export default function Categories() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!cookieService.isAuthenticated()) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    fetchCategories();
  }, [navigate, filter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const filterValue = filter === 'all' ? null : filter === 'active' ? true : false;
      const response = await categoryService.getCategories(filterValue);

      if (response.success) {
        setCategories(response.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        cookieService.removeToken();
        navigate('/login');
      } else {
        toast.error('Failed to fetch categories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        const response = await categoryService.createCategory(formData);
        if (response.success) {
          toast.success('Category created successfully');
          fetchCategories();
          setIsModalOpen(false);
        }
      } else {
        const response = await categoryService.updateCategory(selectedCategory.id, formData);
        if (response.success) {
          toast.success('Category updated successfully');
          fetchCategories();
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save category';
      toast.error(message);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const response = await categoryService.toggleCategory(category.id);
      if (response.success) {
        toast.success(`Category ${response.category.is_active ? 'activated' : 'deactivated'}`);
        fetchCategories();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle category status';
      toast.error(message);
    }
  };

  // Don't render if not authenticated
  if (!cookieService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Drawer Navigation */}
      <Drawer />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Categories</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'active'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'inactive'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Categories Table */}
              {categories.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No categories found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first category</p>
                  <button
                    onClick={handleAddCategory}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                  >
                    Add Category
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {category.slug}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleActive(category)}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                category.is_active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {category.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        category={selectedCategory}
        mode={modalMode}
      />
    </div>
  );
}

