import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../../api/apiConfig";

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

const AllBrands = () => {
  const [data, setData] = useState([]); // This stores the unfiltered, full dataset
  const [filteredData, setFilteredData] = useState([]); // This stores the filtered data after search
  const [formVisible, setFormVisible] = useState(false); // Form state
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    brandName: "",
    logo: " ",
  });
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  // Table search state
  const [searchQuery, setSearchQuery] = useState(""); // Search query state for in-table search

  // Fetch Brands data
  useEffect(() => {
    const fetchBrand = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/brand/all");
        console.log("fetched brand data:", response.data);
        if (response.data && response.data.content) {
          setData(response.data.content); // Save the full dataset
          setFilteredData(response.data.content); // Initially no search filter, so full data
          setTotalPages(Math.ceil(response.data.content.length / itemsPerPage)); // Calculate total pages based on full data
        } else {
          console.error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching brands data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();

    // Scroll to the top of the window when the component mounts
    window.scrollTo(0, 0);
  }, [itemsPerPage]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter data based on search query
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredData(filtered); // Update filtered data
    setCurrentPage(1); // Reset to first page when searching
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages after filtering
  };

  // Get data for the current page
  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination logic
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Add Brand
  const handledAddBrand = (e) => {
    e.preventDefault();
    console.log(formData);
    apiClient
      .post("/brand/add", formData)
      .then((response) => {
        setData([...data, response.data]);
        resetForm();
      })
      .catch((error) => console.error("Error adding brand:", error));
  };

  // Save Edit
  const handleSaveEditBrand = (e) => {
    e.preventDefault();
    apiClient
      .put(`/brand/${editingId}`, formData)
      .then((response) => {
        const updatedData = data.map((brand) =>
          brand.id === editingId ? response.data : brand
        );
        setData(updatedData);
        setFilteredData(updatedData); // Ensure filtered data is also updated
        resetForm();
      })
      .catch((error) => console.error("Error saving brand data:", error));
  };

  // Edit form prefill Brand
  const handleEditBrand = (brand) => {
    setEditingId(brand.id);
    setFormData({
      brandName: brand.name,
      logo: brand.logo,
    });
    setFormVisible(true);
  };

  // Confirm Deletion
  const confirmDeleteBrand = (id) => {
    handleDeleteBrand(id);
    setConfirmDeleteId(null); // Reset after deletion
  };

  // Delete Brand
  const handleDeleteBrand = (id) => {
    apiClient
      .delete(`/brand/${id}`)
      .then(() => {
        const updatedData = data.filter((brand) => brand.id !== id);
        setData(updatedData);
        setFilteredData(updatedData); // Ensure filtered data is also updated
      })
      .catch((error) => {
        console.error("Error deleting brand:", error);
        setConfirmDeleteId(null);
      });
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      brandName: " ",
      logo: " ",
    });
    setFormVisible(false);
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Brands</h1>
        {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-indigo-900 text-white rounded-r hover:bg-indigo-600"
          >
            + Add Brand
          </button>
        )}
      </div>

      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Brand" : "Add New Brand"}
          </h2>
          <form onSubmit={editingId ? handleSaveEditBrand : handledAddBrand}>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  placeholder="Enter Brand Name"
                  className="border p-2 rounded w-full"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Image</label>
                <input
                  type="file"
                  name="logo"
                  className="w-full border border-gray-300 p-2 rounded"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const base64String = await convertImageToBase64(file);
                        setFormData({
                          ...formData,
                          logo: base64String,
                        });
                      } catch (error) {
                        console.error("Error converting image:", error);
                      }
                    }
                  }}
                />
                {formData.logo && (
                  <div className="mt-2">
                    <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.logo}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
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
          {/* Search Input */}
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search by Brand Name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-l px-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Sr. No.
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Brand Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      Loading...{" "}
                    </td>
                  </tr>
                ) : currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((brand, index) => (
                    <tr
                      key={brand.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt="Uploaded Base64"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4">{brand.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button
                            className="px-4 py-2 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                          {/* <button
                            className="px-4 py-2 flex items-center text-white bg-red-800 hover:bg-red-600 rounded"
                            onClick={() => setConfirmDeleteId(brand.id)}
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

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </p>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 text-sm text-white bg-indigo-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={handlePrevPage}
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
                onClick={handleNextPage}
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

          {/* Delete Confirmation */}
          {confirmDeleteId && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                <p className="mb-4">
                  Are you sure you want to delete this brand?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
                    onClick={() => handleDeleteBrand(confirmDeleteId)}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllBrands;
