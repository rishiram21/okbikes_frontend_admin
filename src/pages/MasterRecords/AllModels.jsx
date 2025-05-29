import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../../api/apiConfig";

const AllModels = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false); // Form state
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleBrandId: " ",
    modelName: " ",
  });
  const [brands, setBrands] = useState([]);  //for the brands
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(5);

  // Fetch Model data
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

    // Scroll to the top of the window when the component mounts
    window.scrollTo(0, 0);
  }, []);

  // Fetch brand data
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

  // Add Model
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

  // Save Edit
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

  // Edit Model
  const handleEditModel = (model) => {
    setEditingId(model.id);
    setFormData({
      vehicleBrandId: model.vehicleBrandId,
      modelName: model.modelName,
    });
    setFormVisible(true);
  };

  // Delete Model
  const handleDeleteModel = (id) => {
    apiClient
      .delete(`/model/${id}`)
      .then(() => setData(data.filter((model) => model.id !== id)))
      .catch((error) => console.error("Error deleting data:", error))
      .finally(() => setConfirmDeleteId(null));
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vehicleBrandId: " ",
      modelName: " ",
    });
    setFormVisible(false);
  };

  // Filtered data based on search query
  const filteredData = data.filter(
    (item) =>
      item.modelName &&
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) // Model name search
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className=" bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Models</h1>
        {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-indigo-900 text-white rounded-r hover:bg-indigo-600"
          >
            + Add Model
          </button>
        )}
      </div>

      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Model" : "Add New Model"}
          </h2>
          <form onSubmit={editingId ? handleSaveEditModel : handledAddModel}>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Brand Name</label>
                <select
                  name="vehicleBrandId"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleBrandId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleBrandId: e.target.value })
                  }
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="font-medium">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  placeholder="Enter Model Name"
                  className="border p-2 rounded w-full"
                  value={formData.modelName}
                  onChange={(e) =>
                    setFormData({ ...formData, modelName: e.target.value })
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
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 rounded-l px-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Model Name</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Loading...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No data found</td>
                  </tr>
                ) : (
                  currentData.map((model) => (
                    <tr key={model.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{model.id}</td>
                      <td className="px-6 py-4">{model.modelName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button
                            className="px-4 py-2 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
                            onClick={() => handleEditModel(model)}
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation */}
          {confirmDeleteId && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
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

export default AllModels;





// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";

// const AllModels = () => {
//   const [data, setData] = useState([]);
//   const [statuses, setStatuses] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [formVisible, setFormVisible] = useState(false); // Form state
//   const [editingId, setEditingId] = useState(null);
//   const [confirmDeleteId, setConfirmDeleteId] = useState(null);
//   const [formData, setFormData] = useState({
//     vehicleBrandId: " ",
//     modelName: " ",
//   });
//   const [brands, setBrands] = useState([]);  //for the brands
//   // console.log(brands)
//   const [loading, setLoading] = useState(true);
//   const [itemsPerPage] = useState(5);

//   //Fetch Model data
//   useEffect(() => {
//     const fetchModels = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get("http://localhost:8080/model/all");
//         console.log("fetched model data:", response.data);
//         if (Array.isArray(response.data.content)) {
//           setData(response.data.content);
//         } else {
//           console.error("Invalid response format");
//         }
//       } catch (error) {
//         console.error("Error fetchig models data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchModels();
//   }, []);

//   //Add Model
//   const handledAddModel = (e) => {
//     e.preventDefault();
//     console.log(formData);
//     axios
//       .post("http://localhost:8080/model/add", formData)
//       .then((response) => {
//          // Ensure `data` is an array
//          if (!Array.isArray(data)) {
//           console.error("Data is not an array. Resetting to an empty array.");
//           setData([response.data]);
//         } else {
//           setData([...data, response.data]);
//         }
//         resetForm();
//       })
//       .catch((error) => console.error("Error adding Model data", error));
//   };

//   //Fetch brand data
//   useEffect(()=>{
//     const fetchBrands = async () => {
//       try{
//         const response = await axios.get("http://localhost:8080/brand/all")
//         setBrands(response.data.content);
//       }catch(error){
//         console.error("Error fetching brand data:", error);
//       }
//     }
//     fetchBrands();
//   },[])

//   // console.log(brands)

//   //Save Edit
//   const handleSaveEditModel = (e) => {
//     e.preventDefault();
//     axios
//       .put(`http://localhost:8080/api/models/${editingId}`, formData)
//       .then((response) => {
//         setData(
//           data.map((model) => (model.id === editingId ? response.data : model))
//         );
//         resetForm();
//       })
//       .catch((error) => console.error("Error Saving Data:", error));
//   };

//   //Edit Model
//   const handleEditModel = (model) => {
//     setEditingId(model.id);
//     setFormData({
//       vehicleBrandId: model.vehicleBrandId,
//       modelName: model.modelName,
//     });
//     setFormVisible(true);
//   };

//   //Delete Model
//   const handleDeleteModel = (id) => {
//     axios
//       .delete(`http://localhost:8080/api/models/${id}`)
//       .then(() => setData(data.filter((model) => model.id !== id)))
//       .catch((error) => console.error("Error deleting data:", error))
//       .finally(() => setConfirmDeleteId(null));
//   };

//   //Reset Form
//   const resetForm = () => {
//     setEditingId(null);
//     setFormData({
//       vehicleBrandId: " ",
//       modelName: " ",
//     });
//     setFormVisible(false);
//   };

//   // Filtered data based on search query
//   const filteredData = data.filter(
//     (item) =>
//       item.modelName &&
//       item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) // Fix here
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   // Toggle status function
//   const toggleStatus = (id) => {
//     setStatuses((prevStatuses) =>
//       prevStatuses.map((row) =>
//         row.id === id
//           ? { ...row, status: row.status === "Active" ? "Inactive" : "Active" }
//           : row
//       )
//     );
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">All Models</h1>
//         {!formVisible && (
//           <button
//             onClick={() => setFormVisible(true)}
//             className="px-4 py-2 bg-indigo-900 text-white rounded-r hover:bg-indigo-600"
//           >
//             + Add Model
//           </button>
//         )}
//       </div>

//       {formVisible ? (
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <h2 className="text-xl font-bold mb-4">
//             {editingId ? "Edit Model" : "Add New Model"}
//           </h2>
//           <form onSubmit={editingId ? handleSaveEditModel : handledAddModel}>
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-2 sm:col-span-1">
//                 <label className="font-medium">Model Name</label>
//                 <input
//                   type="text"
//                   name="modelName"
//                   placeholder="Enter Model Name"
//                   className="border p-2 rounded w-full"
//                   value={formData.modelName}
//                   onChange={(e) =>
//                     setFormData({ ...formData, modelName: e.target.value })
//                   }
//                   required
//                 />
//               </div>
//               <div className="col-span-2 sm:col-span-1">
//                 <label className="font-medium">Brand Name</label>
//                 <select
//                   name="vehicleBrandId"
//                   placeholder="Enter Brand Name"
//                   className="border p-2 rounded w-full"
//                   value={formData.vehicleBrandId}
//                   onChange={(e) =>
//                     setFormData({ ...formData, vehicleBrandId: e.target.value })
//                   }
//                 >
//                 <option value="">
//                   Select Brand 
//                 </option>
//                 {
//                   brands.map((brand) => (
//                     <option key={brand.id} value={brand.id}>
//                       {brand.name}
//                     </option>  
//                   ))
//                 }
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 className="px-4 py-2 mr-2 text-white bg-indigo-900 rounded hover:bg-indigo-600"
//               >
//                 {editingId ? "Save" : "Add"}
//               </button>
//               <button
//                 type="button"
//                 className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         <div className="bg-white p-6 shadow-md rounded-lg">
//           {/* Search Bar */}
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex items-center">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="border border-gray-300 rounded-l px-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="relative overflow-x-auto">
//             <table className="w-full text-sm text-left text-gray-500">
//               <thead className="text-xs text-gray-700 uppercase bg-gray-200">
//                 <tr>
//                   <th scope="col" className="px-6 py-3">
//                     ID
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Model Name
//                   </th>
//                   {/* <th scope="col" className="px-6 py-3">
//                     Brand Name
//                   </th> */}
//                   <th scope="col" className="px-6 py-3">
//                     Status
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="6" className="text-center py-4">
//                       Loading...{" "}
//                     </td>
//                   </tr>
//                 ) : data.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-center py-4">
//                       No data found
//                     </td>
//                   </tr>
//                 ) : (
//                   data.map((model) => (
//                     <tr
//                       key={model.id}
//                       className="bg-white border-b hover:bg-gray-50"
//                     >
//                       <td className="px-6 py-3">{model.id}</td>
//                       <td className="px-6 py-4">{model.modelName}</td>
//                       {/* <td className="px-6 py-4">{model.brandName}</td> */}
//                       <td className="px-6 py-4">
//                         <button
//                           className={`px-2 py-1 rounded ${
//                             statuses.find((row) => row.id === model.id)
//                               ?.status === "Active"
//                               ? "bg-green-600 hover:bg-green-600 text-white"
//                               : "bg-red-700 hover:bg-red-600 text-white"
//                           }`}
//                           onClick={() => toggleStatus(model.id)}
//                         >
//                           {statuses.find((row) => row.id === model.id)
//                             ?.status ?? "Active"}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center space-x-4">
//                           <button
//                             className="px-4 py-2 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
//                             onClick={() => handleEditModel(model)}
//                           >
//                             <FaEdit className="mr-2" />
//                             Edit
//                           </button>
//                           <button
//                             className="px-4 py-2 flex items-center text-white bg-red-800 hover:bg-red-600 rounded"
//                             onClick={() => setConfirmDeleteId(model.id)}
//                           >
//                             <FaTrash />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Delete Confirmation  */}
//           {confirmDeleteId && (
//             <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//               <div className="bg-white p-6 rounded shadow-lg">
//                 <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
//                 <p className="mb-4">
//                   Are you sure you want to delete this Model?
//                 </p>
//                 <div className="flex justify-end space-x-4">
//                   <button
//                     className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
//                     onClick={() => handleDeleteModel(confirmDeleteId)}
//                   >
//                     Yes, Delete
//                   </button>
//                   <button
//                     className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700"
//                     onClick={() => setConfirmDeleteId(null)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Pagination */}
//           <div className="flex justify-between items-center mt-6">
//             <p className="text-sm text-gray-500">
//               Showing {indexOfFirstItem + 1}to{" "}
//               {Math.min(indexOfLastItem, filteredData.length)} of{" "}
//               {filteredData.length} entries
//             </p>
//             <div className="flex space-x-2">
//               <button
//                 className="px-4 py-2 text-sm text-white bg-indigo-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((prev) => prev - 1)}
//               >
//                 Previous
//               </button>
//               {[...Array(totalPages)].map((_, index) => (
//                 <button
//                   key={index}
//                   className={`px-4 py-2 rounded ${
//                     currentPage === index + 1
//                       ? "bg-indigo-900 text-white"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                   onClick={() => setCurrentPage(index + 1)}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//               <button
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((prev) => prev + 1)}
//                 className={`px-4 py-2 rounded ${
//                   currentPage === totalPages
//                     ? "bg-gray-300 text-gray-500"
//                     : "bg-indigo-900 text-white hover:bg-indigo-600"
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllModels;
