import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../../api/apiConfig";

const AllModels = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleBrandId: "",
    modelName: "",
  });
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/model/all");
        if (Array.isArray(response.data.content)) {
          setData(response.data.content);
        } else {
          console.error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching models data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/brand/all");
        setBrands(response.data.content);
      } catch (error) {
        console.error("Error fetching brand data:", error);
      }
    };
    fetchBrands();
  }, []);

  const handledAddModel = (e) => {
    e.preventDefault();
    apiClient
      .post("/model/add", formData)
      .then((response) => {
        if (!Array.isArray(data)) {
          setData([response.data]);
        } else {
          setData([...data, response.data]);
        }
        resetForm();
      })
      .catch((error) => console.error("Error adding Model data", error));
  };

  const handleSaveEditModel = (e) => {
    e.preventDefault();
    apiClient
      .put(`/model/${editingId}`, formData)
      .then((response) => {
        setData(
          data.map((model) => (model.id === editingId ? response.data : model))
        );
        resetForm();
      })
      .catch((error) => console.error("Error Saving Data:", error));
  };

  const handleEditModel = (model) => {
    setEditingId(model.id);
    setFormData({
      vehicleBrandId: model.vehicleBrandId,
      modelName: model.modelName,
    });
    setFormVisible(true);
  };

  const handleDeleteModel = (id) => {
    apiClient
      .delete(`/model/${id}`)
      .then(() => setData(data.filter((model) => model.id !== id)))
      .catch((error) => console.error("Error deleting data:", error))
      .finally(() => setConfirmDeleteId(null));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vehicleBrandId: "",
      modelName: "",
    });
    setFormVisible(false);
  };

  const filteredData = data.filter(
    (item) =>
      item.modelName &&
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mt-4 mb-4">
        {/* <h1 className="text-xl font-bold text-gray-800 md:text-2xl">
          All Models
        </h1> */}
      </div>

      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 md:text-xl">
            {editingId ? "Edit Model" : "Add New Model"}
          </h2>
          <form onSubmit={editingId ? handleSaveEditModel : handledAddModel}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Brand Name</label>
                <select
                  name="vehicleBrandId"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.vehicleBrandId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleBrandId: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Brand
                  </option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  placeholder="Enter Model Name"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.modelName}
                  onChange={(e) =>
                    setFormData({ ...formData, modelName: e.target.value })
                  }
                  required
                />
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
            <h3 className="text-xl font-bold text-indigo-900">All Models</h3>
            {!formVisible && (
              <button
                onClick={() => setFormVisible(true)}
                className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
              >
                + Add Model
              </button>
            )}
            <input
              type="text"
              placeholder="Search by model name..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-indigo-900 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    No.
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Model Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentData.map((model, index) => (
                    <tr
                      key={model.id}
                      className={`border-b hover:bg-indigo-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4">{model.modelName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
                            onClick={() => handleEditModel(model)}
                          >
                            <FaEdit className="mr-1.5" size={14} />
                            Edit
                          </button>
                          {/* <button
                            className="px-3 py-1.5 flex items-center text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                            onClick={() => setConfirmDeleteId(model.id)}
                          >
                            <FaTrash className="mr-1.5" size={14} />
                            Delete
                          </button> */}
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
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} entries
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
                    <button className="px-3 py-1.5 rounded-md text-sm bg-indigo-800 text-white">
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 py-1.5">...</span>
                  )}
                  {[...Array(Math.min(3, totalPages - Math.max(0, totalPages - 3)))]
                    .map((_, index) => (
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
            <p className="mb-4">Are you sure you want to delete this Model?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
                onClick={() => handleDeleteModel(confirmDeleteId)}
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

export default AllModels;
