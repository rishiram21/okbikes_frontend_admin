import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../api/apiConfig";

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

const StoreMaster = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    storeName: "",
    storeOwner: "",
    storePhone: "",
    storeAddress: "",
    cityId: "",
    subCityId: "",
    mapUrl: "",
    storeEmail: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const [cities, setCities] = useState([]);
  const [subcities, setSubcities] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/store/all", {
        params: {
          page: currentPage - 1,
          size: itemsPerPage,
        },
      });
      if (response.data && response.data.content) {
        setData(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    fetchStores();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/city/all");
        setCities(response.data.content);
      } catch (error) {
        console.error("Error fetching city data:", error);
      }
    };
    fetchCities();
  }, []);

  const fetchSubcities = async (id) => {
    if (id) {
      try {
        const response = await apiClient.get(`/subcity/bycityid/${id}`);
        setSubcities(response.data);
      } catch (error) {
        console.error("Error fetching subcities:", error);
      }
    }
  };

  const handledAddStore = (e) => {
    e.preventDefault();
    apiClient
      .post("/store/add", formData)
      .then((response) => {
        setData([...data, response.data]);
        resetForm();
        fetchStores();
        window.location.reload();
      })
      .catch((error) => console.error("Error adding store data", error));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    apiClient
      .put(`/store/${editingId}`, formData)
      .then((response) => {
        setData(
          data.map((store) => (store.id === editingId ? response.data : store))
        );
        resetForm();
        fetchStores();
        window.location.reload();
      })
      .catch((error) => console.error("Error saving data:", error));
  };

  const handleEditStore = (store) => {
    setEditingId(store.id);
    setFormData({
      storeName: store.name,
      storeOwner: store.storeOwner,
      storePhone: store.phone,
      storeAddress: store.address,
      cityId: store.cityId || "",
      subCityId: store.subCityId || "",
      mapUrl: store.mapUrl,
      storeEmail: store.storeEmail,
      image: store.image,
    });
    if (store.cityId) {
      fetchSubcities(store.cityId);
    }
    setFormVisible(true);
  };

  const handleDeleteStore = (id) => {
    apiClient
      .delete(`/store/${id}`)
      .then(() => setData(data.filter((store) => store.id !== id)))
      .catch((error) => console.error("Error deleting data:", error))
      .finally(() => {
        setConfirmDeleteId(null);
        window.location.reload();
      });
  };

  const toggleStoreStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
        console.log(`Updating store status for store ID: ${id} to status: ${newStatus}`);
        const response = await apiClient.put(`/store/${id}/status`, null, {
            params: { status: newStatus }
        });
        if (response.status === 200) {
            console.log("Store status updated successfully");
            setData((prevData) =>
                prevData.map((store) =>
                    store.id === id ? { ...store, status: newStatus } : store
                )
            );
            window.location.reload();
        }
    } catch (error) {
        console.error("Error updating store status:", error);
    }
};

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      storeName: "",
      storeOwner: "",
      storePhone: "",
      storeAddress: "",
      cityId: "",
      subCityId: "",
      mapUrl: "",
      storeEmail: "",
      image: "",
    });
    setFormVisible(false);
  };

  const filteredData = data.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mt-4 mb-4">
        {/* <h1 className="text-xl font-bold text-gray-800 md:text-2xl">All Stores</h1> */}
      </div>

      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 md:text-xl">
            {editingId ? "Edit Store" : "Add New Store"}
          </h2>
          <form onSubmit={editingId ? handleSaveEdit : handledAddStore}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="Enter Store Name"
                  className="border p-2 rounded w-full"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Store Owner</label>
                <input
                  type="text"
                  name="storeOwner"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.storeOwner}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeOwner: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Contact Number</label>
                <input
                  type="tel"
                  maxLength={12}
                  name="storeContactNumber"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.storePhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storePhone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Address</label>
                <input
                  type="text"
                  name="storeAddress"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.storeAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, storeAddress: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">City</label>
                <select
                  name="cityId"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.cityId}
                  onChange={(e) => {
                    setFormData({ ...formData, cityId: e.target.value });
                    fetchSubcities(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select a city
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Subcity/Area</label>
                <select
                  name="subCityId"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.subCityId}
                  onChange={(e) =>
                    setFormData({ ...formData, subCityId: e.target.value })
                  }
                  disabled={!formData.cityId}
                  required
                >
                  <option value="" disabled>
                    Select a subcity/area
                  </option>
                  {subcities.map((subcity) => (
                    <option key={subcity.id} value={subcity.id}>
                      {subcity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Google Map URL</label>
                <input
                  type="text"
                  name="mapUrl"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.mapUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mapUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Store Photos</label>
                <input
                  type="file"
                  name="image"
                  className="w-full border border-gray-300 p-2 rounded"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const base64String = await convertImageToBase64(file);
                        setFormData({
                          ...formData,
                          image: base64String,
                        });
                      } catch (error) {
                        console.error("Error converting image:", error);
                      }
                    }
                  }}
                />
                {formData.image && (
                  <div className="mt-2">
                    <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-indigo-900">All Stores</h3>
            {!formVisible && (
              <button
                onClick={() => setFormVisible(true)}
                className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
              >
                + Add Store
              </button>
            )}
            <input
              type="text"
              placeholder="Search by store name..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-indigo-900 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3">No.</th>
                  <th scope="col" className="px-6 py-3">Store Image</th>
                  <th scope="col" className="px-6 py-3">Store Name</th>
                  <th scope="col" className="px-6 py-3">Contact Number</th>
                  <th scope="col" className="px-6 py-3">Address</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentData.map((store, index) => (
                    <tr key={store.id} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4">
                        {store.image ? (
                          <img
                            src={store.image}
                            alt="Store"
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">{store.name}</td>
                      <td className="px-6 py-4">{store.phone}</td>
                      <td className="px-6 py-4">{store.address}</td>
                      <td className="px-6 py-4">{store.status}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
                            onClick={() => handleEditStore(store)}
                          >
                            <FaEdit className="mr-1.5" size={14} />
                            Edit
                          </button>
                          {/* <button
                            className="px-3 py-1.5 flex items-center text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                            onClick={() => setConfirmDeleteId(store.id)}
                          >
                            <FaTrash className="mr-1.5" size={14} />
                            Delete
                          </button> */}

                          <button
                              className={`px-4 py-2 flex items-center text-white rounded ${store.status === "ACTIVE" ? "bg-green-500 hover:bg-green-600": "bg-red-500 hover:bg-red-600"}`}
                              onClick={()=> toggleStoreStatus(store.id, store.status)}>

                                {store.status === "ACTIVE" ? "Activate" : "Deactivate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </p>
            <div className="flex space-x-1">
              <button
                className="px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      currentPage === index + 1
                        ? "bg-indigo-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))
              ) : (
                <>
                  {[...Array(Math.min(3, currentPage))].map((_, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        currentPage === index + 1
                          ? "bg-indigo-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-colors`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  {currentPage > 3 && <span className="px-2 py-1.5">...</span>}
                  {currentPage > 3 && currentPage < totalPages - 2 && (
                    <button
                      className="px-3 py-1.5 rounded-md text-sm bg-indigo-800 text-white"
                    >
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && <span className="px-2 py-1.5">...</span>}
                  {[...Array(Math.min(3, totalPages - Math.max(0, totalPages - 3)))].map((_, index) => (
                    <button
                      key={totalPages - 2 + index}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        currentPage === totalPages - 2 + index
                          ? "bg-indigo-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-colors`}
                      onClick={() => setCurrentPage(totalPages - 2 + index)}
                    >
                      {totalPages - 2 + index}
                    </button>
                  ))}
                </>
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-sm rounded-md bg-indigo-800 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete this Store?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
                onClick={() => handleDeleteStore(confirmDeleteId)}
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
  );
};

export default StoreMaster;
