import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import apiClient from "../../api/apiConfig";

const DeliveryAtLocationPrices = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    price: "",
    perKilometer: "",
  });
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDeliveryPrices = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          "/api/deliveryprice/list"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching delivery price", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryPrices();
  }, []);

  const handleAddDeliveryPrice = (e) => {
    e.preventDefault();
    apiClient
      .post("/api/deliveryprice/save", formData)
      .then((response) => {
        setData([...data, response.data]);
        resetForm();
      })
      .catch((error) => console.error("Error adding delivery price", error));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    apiClient
      .put(`/api/deliveryprice/${editingId}`, formData)
      .then((response) => {
        setData(
          data.map((item) => (item.id === editingId ? response.data : item))
        );
        resetForm();
      })
      .catch((error) => console.error("Error saving data", error));
  };

  const handleEditDeliveryPrice = (deliveryprice) => {
    setEditingId(deliveryprice.id);
    setFormData({
      price: deliveryprice.price,
      perKilometer: deliveryprice.perKilometer,
    });
    setFormVisible(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      price: "",
      perKilometer: "",
    });
    setFormVisible(false);
  };

  const filteredData = data.filter((item) =>
    item.perKilometer.toString().includes(searchQuery)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Price List</h1>
        {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
          >
            + Add Price
          </button>
        )}
      </div>

      {formVisible ? (
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Delivery Price" : "Add New Delivery Price"}
          </h2>

          <form onSubmit={editingId ? handleSaveEdit : handleAddDeliveryPrice}>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Select Kilometer</label>
                <input
                  type="number"
                  name="perKilometer"
                  placeholder="Enter kilometer"
                  className="border p-2 rounded w-full"
                  value={formData.perKilometer}
                  onChange={(e) =>
                    setFormData({ ...formData, perKilometer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Amount</label>
                <input
                  type="number"
                  name="price"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 mr-2 text-white bg-blue-900 rounded hover:bg-blue-600"
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
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Per Kilometer
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price
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
                  currentData.map((deliveryprice) => (
                    <tr
                      key={deliveryprice.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {deliveryprice.perKilometer}
                      </td>
                      <td className="px-6 py-4">{deliveryprice.price}</td>
                      <td className="px-6 py-4">
                        <button
                          className="px-4 py-2 flex items-center text-white bg-blue-800 hover:bg-blue-600 rounded mr-2"
                          onClick={() => handleEditDeliveryPrice(deliveryprice)}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

export default DeliveryAtLocationPrices;
