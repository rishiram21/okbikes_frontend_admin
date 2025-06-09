import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../api/apiConfig";

const StoreManager = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    storeId: "",
    password: "",
  });

  const fetchStoreManagers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/storeManagers", {
        params: {
          page: currentPage - 1,
          size: itemsPerPage,
        },
      });
      setData(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching store manager data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreManager = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form Data:", formData);
    apiClient
      .post("/admin/createStoreManager", formData)
      .then((response) => {
        console.log("Store Manager Added:", response.data);
        setData([...data, response.data]);
        resetForm();
        fetchStoreManagers().then(() => {
          setIsSubmitting(false);
        });
      })
      .catch((error) => {
        console.error("Error Adding Store Manager Data", error);
        setIsSubmitting(false);
      });
  };

  const fetchStores = async () => {
    try {
      const response = await apiClient.get("/store/all");
      setStores(response.data.content);
      console.log("Fetched stores:", response.data.content);
    } catch (error) {
      console.error("Error fetching stores data:", error);
    }
  };

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    const storeName = store ? store.name : "Unknown Store";
    console.log("Store ID:", storeId, "Store Name:", storeName);
    return storeName;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(
        `/admin/storeManagers/${editingId}`,
        formData
      );

      setData((prevData) =>
        prevData.map((manager) =>
          manager.id === editingId ? response.data : manager
        )
      );

      resetForm();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEditStoreManager = (manager) => {
    setEditingId(manager.id);
    setFormData({
      name: manager.name,
      email: manager.email,
      phoneNumber: manager.phoneNumber,
      storeId: manager.storeId,
      password: "",
    });
    setFormVisible(true);
  };

  const handleDeleteStoreManager = (id) => {
    apiClient
      .delete(`/admin/storeManagers/${id}`)
      .then(() => setData(data.filter((manager) => manager.id !== id)))
      .catch((error) => console.error("Error deleting data:", error))
      .finally(() => setConfirmDeleteId(null));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      storeId: "",
      password: "",
    });
    setFormVisible(false);
    console.log("Form Reset and Visibility Set to False");
  };

  const filteredData = data.filter(
    (item) => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchStoreManagers();
    fetchStores();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Store Managers List</h1>
        {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
          >
            + Add Store Manager
          </button>
        )}
      </div>

      {formVisible ? (
        <div className="p-6 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Store Manager" : "Add New Store Manager"}
          </h2>
          <form onSubmit={editingId ? handleSaveEdit : handleAddStoreManager}>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Contact Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter Contact Number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Store Name *</label>
                <select
                  name="storeId"
                  placeholder="Enter Store Name"
                  className="border p-2 rounded w-full"
                  value={formData.storeId}
                  onChange={(e) =>
                    setFormData({ ...formData, storeId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Password *</label>
                <input
                  type="text"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : editingId ? "Save" : "Add"}
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
        <div className="bg-white p-4 shadow-md rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by Name..."
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Sr. No.
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Contact Number
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Store Name
                  </th>
                  {/* <th scope="col" className="px-6 py-3">
                    Verify
                  </th> */}
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No data Found
                    </td>
                  </tr>
                ) : (
                  currentData?.map((manager, index) => (
                    <tr
                      key={manager?.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4">{manager?.name}</td>
                      <td className="px-6 py-4">{manager?.email}</td>
                      <td className="px-6 py-4">{manager?.phoneNumber}</td>
                      <td className="px-6 py-4">{getStoreName(manager?.storeId)}</td>
                      {/* <td className="px-6 py-4">
                        {manager?.verify ? "Verified" : "Not Verified"}
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button
                            className="px-4 py-2 flex items-center text-white bg-blue-800 hover:bg-blue-600 rounded"
                            onClick={() => handleEditStoreManager(manager)}
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                          {/* <button
                            className="px-4 py-2 flex items-center text-white bg-red-500 hover:bg-red-600 rounded"
                            onClick={() => setConfirmDeleteId(manager.id)}
                          >
                            <FaTrash className="mr-2" />
                            Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="7" className="text-right py-4 font-bold">
                    Number of Rows : {filteredData.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {confirmDeleteId && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                <p className="mb-4">
                  Are you sure you want to delete this Store Manager?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
                    onClick={() => handleDeleteStoreManager(confirmDeleteId)}
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

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} entries
            </p>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                      ? "bg-blue-900 text-white"
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
                    : "bg-blue-900 text-white hover:bg-blue-600"
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

export default StoreManager;
