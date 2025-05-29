import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../../api/apiConfig";

const AllCategories = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(5); // Set to 5 items per page
  const [totalPages, setTotalPages] = useState(1); // Keep track of total pages

  // Fetch categories data
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/category/all", {
          params: {
            page: currentPage - 1, // Backend expects 0-indexed page
            size: itemsPerPage, // Number of items per page
          },
        });
        console.log("Fetched category data:", response.data);
        if (response.data && response.data.content) {
          setData(response.data.content);
          setTotalPages(response.data.totalPages); // Set total pages from response
        } else {
          console.error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [currentPage, itemsPerPage]); // Re-fetch when page or itemsPerPage changes

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    apiClient
      .post("/category/add", formData)
      .then((response) => {
        setData([...data, response.data]); // Add new category to data
        resetForm();
        // Optionally reload categories after adding
        setCurrentPage(1); // Go back to the first page after adding
      })
      .catch((error) => console.error("Error adding category:", error));
  };

  // Edit Category
  const handleSaveEditCategory = (e) => {
    e.preventDefault();
    apiClient
      .put(`/category/${editingId}`, formData)
      .then((response) => {
        setData(
          data.map((category) =>
            category.id === editingId ? response.data : category
          )
        );
        resetForm();
      })
      .catch((error) => console.error("Error saving category:", error));
  };

  // Edit form prefill
  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
    setFormVisible(true);
  };

  // Confirm Deletion
  const confirmDeleteCategory = (id) => {
    handleDeleteCategory(id);
    setConfirmDeleteId(null); // Reset after deletion
  };

  // Delete Category
  const handleDeleteCategory = (id) => {
    console.log("Deleting category with ID:", id);
    apiClient
      .delete(`/category/${id}`)
      .then(() => {
        // Remove the deleted category from the state
        setData(data.filter((category) => category.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        setConfirmDeleteId(null); // Close delete confirmation on error
      });
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setFormVisible(false);
  };

  // Filtered data based on search query
  const filteredData = data.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Categories</h1>
        {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-indigo-900 text-white rounded-r hover:bg-indigo-600"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Form Section */}
      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>
          <form
            onSubmit={editingId ? handleSaveEditCategory : handleAddCategory}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  className="border p-2 rounded w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 mr-2 text-white bg-indigo-900 rounded hover:bg-indigo-600"
              >
                {editingId ? "Save" : "Add"}
              </button>
              <button
                type="button"
                className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 shadow-md rounded-lg">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-l px-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Table */}
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentData.map((category) => (
                    <tr
                      key={category.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{category.id}</td>
                      <td className="px-6 py-4">{category.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button
                            className="px-4 py-2 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
                            onClick={() => handleEditCategory(category)}
                          >
                            <FaEdit className="mr-2" /> Edit
                          </button>
                          {/* <button
                            className="px-4 py-2 flex items-center text-white bg-red-800 hover:bg-red-600 rounded"
                            onClick={() => setConfirmDeleteId(category.id)} // Set confirmation ID when clicked
                          >
                            <FaTrash />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {confirmDeleteId && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-lg font-bold mb-4">
                  Are you sure you want to delete this category?
                </h3>
                <div className="flex justify-end">
                  <button
                    onClick={() => confirmDeleteCategory(confirmDeleteId)} // Confirm Deletion
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)} // Cancel Deletion
                    className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </p>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 text-sm text-white bg-indigo-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded ${
                    currentPage === index + 1
                      ? "bg-indigo-900 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500"
                    : "bg-indigo-900 text-white hover:bg-indigo-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCategories;
