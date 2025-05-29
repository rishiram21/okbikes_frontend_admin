// import React, { useEffect, useState } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { toast, ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import apiClient from "../api/apiConfig";

// function convertImageToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       resolve(reader.result);
//     };
//     reader.onerror = (error) => {
//       reject(error);
//     };
//     reader.readAsDataURL(file);
//   });
// }

// const Bikes = () => {
//   const [data, setData] = useState([]);
//   const [statuses, setStatuses] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [formVisible, setFormVisible] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [confirmDeleteId, setConfirmDeleteId] = useState(null);
//   const [brands, setBrands] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [models, setModels] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [fuel, setFuel] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [itemsPerPage] = useState(7);
//   const [totalPages, setTotalPages] = useState(1);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null);

//   const [formData, setFormData] = useState({
//     vehicleBrandId: "",
//     vehicleCategoryId: "",
//     vehicleModelId: "",
//     storeId: "",
//     vehicleRegistrationNumber: "",
//     registrationYear: "",
//     chassisNumber: "",
//     engineNumber: "",
//     fuelType: "",
//     vehicleStatus: "",
//     pucPdfFile: "",
//     insurancePdfFile: "",
//     documentPdfFile: "",
//     image: "",
//   });

//   const fetchBikes = async () => {
//     setLoading(true);
//     try {
//       const response = await apiClient.get("/vehicle/all", {
//         params: {
//           page: currentPage - 1,
//           size: itemsPerPage,
//         },
//       });
//       setData(response.data.content);
//       setStatuses(
//         response.data.content.map((item) => ({
//           id: item.id,
//           status: "AVAILABLE",
//         }))
//       );
//       setTotalPages(response.data.totalPages);
//     } catch (error) {
//       console.error("Error fetching bike data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBike = (e) => {
//     e.preventDefault();
//     setConfirmAction(() => handleAddBikeConfirm);
//     setShowConfirmModal(true);
//   };

//   const handleAddBikeConfirm = () => {
//     apiClient
//       .post("/vehicle/add", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((response) => {
//         setData([...data, response.data]);
//         resetForm();
//         fetchBikes();
//       })
//       .catch((error) => {
//         console.error("Error Adding Bike Data", error);
//       });
//     setShowConfirmModal(false);
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     const maxFileSize = 3 * 1024 * 1024; // 3 MB in bytes

//     if (file) {
//       if (file.size > maxFileSize) {
//         alert("File size should not exceed 3 MB");
//         return;
//       }

//       setFormData({
//         ...formData,
//         [e?.target?.name]: file,
//       });
//     }
//   };

//   const fetchBrands = async () => {
//     try {
//       const response = await apiClient.get("/brand/all");
//       setBrands(response.data.content);
//     } catch (error) {
//       console.error("Error fetching brand data:", error);
//     }
//   };

//   const fetchModels = async (id) => {
//     if (id) {
//       try {
//         const response = await apiClient.get(`/model/bybrandid/${id}`);
//         setModels(response.data);
//       } catch (error) {
//         console.error("Error fetching model data:", error);
//       }
//     }
//   };

//   const fetchCategory = async () => {
//     try {
//       const response = await apiClient.get("/category/all");
//       setCategories(response.data.content);
//     } catch (error) {
//       console.error("Error fetching category data:", error);
//     }
//   };

//   const fetchStores = async () => {
//     try {
//       const response = await apiClient.get("/store/all");
//       setStores(response.data.content);
//     } catch (error) {
//       console.error("Error fetching stores data:", error);
//     }
//   };

//   const fetchFuel = async () => {
//     try {
//       const response = await apiClient.get("/fuel/all");
//       setFuel(response.data.content);
//     } catch (error) {
//       console.error("Error fetching fuel data:", error);
//     }
//   };

//   const handleSaveEdit = async (e) => {
//     e.preventDefault();
//     setConfirmAction(() => handleSaveEditConfirm);
//     setShowConfirmModal(true);
//   };

//   const handleSaveEditConfirm = () => {
//     let blob = new Blob([formData.pucPdfFile.fileContent], { type: "pdf" });
//     let file = new File([blob], { type: "pdf" });
//     let blob1 = new Blob([formData.insurancePdfFile.fileContent], { type: "pdf" });
//     let file1 = new File([blob1], { type: "pdf" });
//     let blob2 = new Blob([formData.documentPdfFile.fileContent], { type: "pdf" });
//     let file2 = new File([blob2], { type: "pdf" });

//     apiClient
//       .put(`/vehicle/${editingId}`, { ...formData, pucPdfFile: file, insurancePdfFile: file1, documentPdfFile: file2 }, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((response) => {
//         setData((prevData) =>
//           prevData.map((bike) => (bike.id === editingId ? response.data : bike))
//         );
//         resetForm();
//         fetchBikes();
//       })
//       .catch((error) => {
//         console.error("Error saving data:", error);
//       });
//     setShowConfirmModal(false);
//   };

//   const handleEditBike = (bike) => {
//     setEditingId(bike.id);
//     setFormData({
//       vehicleBrandId: bike.vehicleBrandId,
//       vehicleCategoryId: bike.categoryId,
//       vehicleModelId: bike.vehicleModelId,
//       storeId: bike.storeId,
//       vehicleRegistrationNumber: bike.vehicleRegistrationNumber,
//       registrationYear: bike.registrationYear,
//       chassisNumber: bike.chassisNumber,
//       engineNumber: bike.engineNumber,
//       fuelType: bike.fuelType,
//       vehicleStatus: bike.vehicleStatus,
//       pucPdfFile: bike.pucPdfFile,
//       insurancePdfFile: bike.insurancePdfFile,
//       documentPdfFile: bike.documentPdfFile,
//       image: bike.image,
//     });

//     if (bike.vehicleBrandId) {
//       fetchModels(bike.vehicleBrandId);
//     }

//     setFormVisible(true);
//   };

//   const handleDeleteBike = (id) => {
//     apiClient
//       .delete(`/vehicle/${id}`)
//       .then(() => setData(data.filter((bike) => bike.id !== id)))
//       .catch((error) => console.error("Error deleting data:", error))
//       .finally(() => setConfirmDeleteId(null));
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setFormData({
//       vehicleBrandId: "",
//       vehicleCategoryId: "",
//       vehicleModelId: "",
//       storeId: "",
//       vehicleRegistrationNumber: "",
//       registrationYear: "",
//       chassisNumber: "",
//       engineNumber: "",
//       fuelType: "",
//       vehicleStatus: "",
//       pucPdfFile: "",
//       insurancePdfFile: "",
//       documentPdfFile: "",
//       image: "",
//     });
//     setFormVisible(false);
//   };

//   const filteredData = data.filter(
//     (item) =>
//       item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   const toggleStatus = (id) => {
//     setStatuses((prevStatuses) =>
//       prevStatuses.map((row) =>
//         row.id === id
//           ? {
//               ...row,
//               status: row.status === "AVAILABLE" ? "BOOKED" : "AVAILABLE",
//             }
//           : row
//       )
//     );
//   };

//   useEffect(() => {
//     fetchBikes();
//     fetchBrands();
//     fetchCategory();
//     fetchStores();
//     fetchFuel();

//     window.scrollTo(0, 0);
//   }, [currentPage, itemsPerPage]);

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <ToastContainer />
      

//       {formVisible ? (
//         <div className="bg-white p-4 rounded-lg shadow-lg">
//           <h2 className="text-lg font-bold mb-4 md:text-xl">
//             {editingId ? "Edit Bike" : "Add New Bike"}
//           </h2>
//           <form onSubmit={editingId ? handleSaveEdit : handleAddBike}>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div className="col-span-1">
//                 <label className="font-medium">Brand Name *</label>
//                 <select
//                   name="vehicleBrandId"
//                   className="border p-2 rounded w-full"
//                   value={formData.vehicleBrandId}
//                   onChange={(e) => {
//                     setFormData({
//                       ...formData,
//                       vehicleBrandId: e.target.value,
//                       vehicleModelId: ""
//                     });
//                     fetchModels(e.target.value);
//                   }}
//                   required
//                 >
//                   <option value="">Select Brand</option>
//                   {brands.map((brand) => (
//                     <option key={brand.id} value={brand.id}>
//                       {brand.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Model Name *</label>
//                 <select
//                   name="vehicleModelId"
//                   className="border p-2 rounded w-full"
//                   defaultValue={formData.vehicleModelId}
//                   onChange={(e) =>{
//                     setFormData({ ...formData, vehicleModelId: e.target.value })
//                   }}
//                   disabled={!formData.vehicleBrandId}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Model
//                   </option>
//                   {models.map((model) => (
//                     <option key={model.id} value={model.id}>
//                       {model.modelName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Category Name *</label>
//                 <select
//                   name="vehicleCategoryId"
//                   className="border p-2 rounded w-full"
//                   value={formData.vehicleCategoryId}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       vehicleCategoryId: e.target.value,
//                     })
//                   }
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((category) => (
//                     <option key={category.id} value={category.id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">
//                   Vehicle Registration Number *
//                 </label>
//                 <input
//                   type="text"
//                   name="vehicleRegistrationNumber"
//                   placeholder="Enter Vehicle Registration Number"
//                   value={formData.vehicleRegistrationNumber}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       vehicleRegistrationNumber: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Registration Year *</label>
//                 <input
//                   type="text"
//                   name="registrationYear"
//                   placeholder="Enter Registration Year"
//                   value={formData.registrationYear}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       registrationYear: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Vehicle Chassis Number *</label>
//                 <input
//                   type="text"
//                   name="chassisNumber"
//                   placeholder="Enter Vehicle Chassis Number"
//                   value={formData.chassisNumber}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       chassisNumber: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Vehicle Engine Number *</label>
//                 <input
//                   type="text"
//                   name="engineNumber"
//                   placeholder="Enter Vehicle Engine Number"
//                   value={formData.engineNumber}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       engineNumber: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="col-span-1">
//                 <label className="font-medium">Store Name *</label>
//                 <select
//                   name="storeId"
//                   className="border p-2 rounded w-full"
//                   value={formData.storeId}
//                   onChange={(e) =>
//                     setFormData({ ...formData, storeId: e.target.value })
//                   }
//                   required
//                 >
//                   <option value="">Select Store</option>
//                   {stores.map((store) => (
//                     <option key={store.id} value={store.id}>
//                       {store.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-2 font-medium">Upload PUC</label>
//                 <input
//                   type="file"
//                   name="pucPdfFile"
//                   className="w-full border border-gray-300 p-2 rounded"
//                   onChange={handleFileUpload}
//                   required
//                 />
//                 {formData.pucPdfFile && (
//                   <div className="mt-2">
//                     <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
//                       <img
//                         src={formData.pucPdfFile}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-2 font-medium">
//                   Upload Insurance
//                 </label>
//                 <input
//                   type="file"
//                   name="insurancePdfFile"
//                   className="w-full border border-gray-300 p-2 rounded"
//                   onChange={handleFileUpload}
//                   required
//                 />
//                 {formData.insurancePdfFile && (
//                   <div className="mt-2">
//                     <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
//                       <img
//                         src={formData.insurancePdfFile}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-2 font-medium">
//                   Upload Document
//                 </label>
//                 <input
//                   type="file"
//                   name="documentPdfFile"
//                   className="w-full border border-gray-300 p-2 rounded"
//                   onChange={handleFileUpload}
//                   required
//                 />
//                 {formData.documentPdfFile && (
//                   <div className="mt-2">
//                     <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
//                       <img
//                         src={formData.documentPdfFile}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-2 font-medium">
//                   Upload Vehicle Images *
//                 </label>
//                 <input
//                   type="file"
//                   name="image"
//                   className="w-full border border-gray-300 p-2 rounded"
//                   onChange={async (e) => {
//                     const file = e.target.files[0];
//                     if (file) {
//                       try {
//                         const base64String = await convertImageToBase64(file);
//                         setFormData({
//                           ...formData,
//                           image: base64String,
//                         });
//                       } catch (error) {
//                         console.error("Error converting image:", error);
//                       }
//                     }
//                   }}
//                   required
//                 />
//                 {formData.image && (
//                   <div className="mt-2">
//                     <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
//                       <img
//                         src={formData.image}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}
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
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <div className="flex justify-between items-center mb-6">
//   <div className="flex items-center gap-4">
//     <h3 className="text-xl font-bold text-indigo-900">All Bikes</h3>
//     {!formVisible && (
//       <button
//         onClick={() => setFormVisible(true)}
//         className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
//       >
//         + Add Bike
//       </button>
//     )}
//   </div>

//   <input
//     type="text"
//     placeholder="Search by Brand Name..."
//     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
//     value={searchQuery}
//     onChange={(e) => setSearchQuery(e.target.value)}
//   />
// </div>

//           <div className="overflow-x-auto shadow-md rounded-lg">
//             <table className="w-full text-sm text-left">
//               <thead className="text-xs uppercase bg-indigo-900 text-white">
//                 <tr>
//                   <th scope="col" className="px-6 py-3">No.</th>
//                   <th scope="col" className="px-6 py-3">Brand Name</th>
//                   <th scope="col" className="px-6 py-3">Category</th>
//                   <th scope="col" className="px-6 py-3">Model Name</th>
//                   <th scope="col" className="px-6 py-3">Vehicle Registration Number</th>
//                   <th scope="col" className="px-6 py-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-6">
//                       <div className="flex justify-center items-center">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
//                         <span className="ml-2">Loading...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : currentData.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-4">
//                       No data found
//                     </td>
//                   </tr>
//                 ) : (
//                   currentData.map((bike, index) => (
//                     <tr key={bike.id} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                       <td className="px-6 py-4 font-medium">{indexOfFirstItem + index + 1}</td>
//                       <td className="px-6 py-4">{bike.brand}</td>
//                       <td className="px-6 py-4">{bike.categoryName}</td>
//                       <td className="px-6 py-4">{bike.model}</td>
//                       <td className="px-6 py-4">{bike.vehicleRegistrationNumber}</td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
//                             onClick={() => handleEditBike(bike)}
//                           >
//                             <FaEdit className="mr-1.5" size={14} />
//                             Edit
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <div className="flex justify-between items-center mt-6">
//             <p className="text-sm text-gray-600">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
//             </p>
//             <div className="flex space-x-1">
//               <button
//                 className="px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((prev) => prev - 1)}
//               >
//                 Previous
//               </button>
//               {totalPages <= 5 ? (
//                 [...Array(totalPages)].map((_, index) => (
//                   <button
//                     key={index}
//                     className={`px-3 py-1.5 rounded-md text-sm ${
//                       currentPage === index + 1
//                         ? "bg-indigo-800 text-white"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     } transition-colors`}
//                     onClick={() => setCurrentPage(index + 1)}
//                   >
//                     {index + 1}
//                   </button>
//                 ))
//               ) : (
//                 <>
//                   {[...Array(Math.min(3, currentPage))].map((_, index) => (
//                     <button
//                       key={index}
//                       className={`px-3 py-1.5 rounded-md text-sm ${
//                         currentPage === index + 1
//                           ? "bg-indigo-800 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       } transition-colors`}
//                       onClick={() => setCurrentPage(index + 1)}
//                     >
//                       {index + 1}
//                     </button>
//                   ))}
//                   {currentPage > 3 && <span className="px-2 py-1.5">...</span>}
//                   {currentPage > 3 && currentPage < totalPages - 2 && (
//                     <button
//                       className="px-3 py-1.5 rounded-md text-sm bg-indigo-800 text-white"
//                     >
//                       {currentPage}
//                     </button>
//                   )}
//                   {currentPage < totalPages - 2 && <span className="px-2 py-1.5">...</span>}
//                   {[...Array(Math.min(3, totalPages - Math.max(0, totalPages - 3)))].map((_, index) => (
//                     <button
//                       key={totalPages - 2 + index}
//                       className={`px-3 py-1.5 rounded-md text-sm ${
//                         currentPage === totalPages - 2 + index
//                           ? "bg-indigo-800 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       } transition-colors`}
//                       onClick={() => setCurrentPage(totalPages - 2 + index)}
//                     >
//                       {totalPages - 2 + index}
//                     </button>
//                   ))}
//                 </>
//               )}
//               <button
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((prev) => prev + 1)}
//                 className="px-3 py-1.5 text-sm rounded-md bg-indigo-800 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {confirmDeleteId && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
//             <p className="mb-4">
//               Are you sure you want to delete this Bike?
//             </p>
//             <div className="flex justify-end space-x-4">
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
//                 onClick={() => handleDeleteBike(confirmDeleteId)}
//               >
//                 Yes, Delete
//               </button>
//               <button
//                 className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700"
//                 onClick={() => setConfirmDeleteId(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {showConfirmModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
//             <p className="mb-4">Are you sure?</p>
//             <div className="flex justify-end space-x-4">
//               <button
//                 className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-700"
//                 onClick={confirmAction}
//               >
//                 Yes
//               </button>
//               <button
//                 className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700"
//                 onClick={() => setShowConfirmModal(false)}
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Bikes;



import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../api/api";
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

const Bikes = () => {
  const [data, setData] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [stores, setStores] = useState([]);
  const [fuel, setFuel] = useState([]);

  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  const fuelTypes = [
    { id: 1, name: "PETROL" },
    { id: 2, name: "DIESEL" },
    { id: 3, name: "CNG" },
    { id: 4, name: "ELECTRIC" },
    { id: 5, name: "PETROL_CNG" },
  ];

  const [formData, setFormData] = useState({
    vehicleBrandId: "",
    vehicleCategoryId: "",
    vehicleModelId: "",
    storeId: "",
    vehicleRegistrationNumber: "",
    registrationYear: "",
    chassisNumber: "",
    engineNumber: "",
    fuelType: "",
    vehicleStatus: "",
    pucPdfFile: "",
    insurancePdfFile: "",
    documentPdfFile: "",
    image: "",
  });

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/vehicle/all", {
        params: {
          page: currentPage - 1,
          size: itemsPerPage,
        },
      });
      setData(response.data.content);
      setStatuses(
        response.data.content.map((item) => ({
          id: item.id,
          status: "AVAILABLE",
        }))
      );
      if (response.data && response.data.content) {
        setData(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching bike data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBike = (e) => {
    e.preventDefault();
    apiClient
      .post("/vehicle/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (!Array.isArray(data)) {
          console.error("Data is not an array. Resetting to an empty array.");
          setData([response.data]);
        } else {
          setData([...data, response.data]);
        }
        resetForm();
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error Adding Bike Data", error);
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const maxFileSize = 3 * 1024 * 1024; // 3 MB in bytes

    if (file) {
      if (file.size > maxFileSize) {
        alert("File size should not exceed 3 MB");
        return;
      }

      setFormData({
        ...formData,
        [e?.target?.name]: file,
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await apiClient.get("/brand/all");
      setBrands(response.data.content);
    } catch (error) {
      console.error("Error fetching brand data:", error);
    }
  };

  const fetchModels = async (id) => {
    if (id) {
      try {
        const response = await apiClient.get(`/model/bybrandid/${id}`);
        setModels(response.data);
      } catch (error) {
        console.error("Error fetching model data:", error);
      }
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await apiClient.get("/category/all");
      setCategories(response.data.content);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await apiClient.get("/store/all");
      setStores(response.data.content);
    } catch (error) {
      console.error("Error fetching stores data:", error);
    }
  };

  const fetchFuel = async () => {
    try {
      const response = await axios.get("");
      setFuel(response.data.content);
    } catch (error) {
      console.error("Error fetching stores data:", error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    console.log("Editing ID:", editingId);

    let blob = new Blob([formData.pucPdfFile.fileContent], { type: "pdf" });
    let file = new File([blob], { type: "pdf" });
    let blob1 = new Blob([formData.insurancePdfFile.fileContent], { type: "pdf" });
    let file1 = new File([blob1], { type: "pdf" });
    let blob2 = new Blob([formData.documentPdfFile.fileContent], { type: "pdf" });
    let file2 = new File([blob2], { type: "pdf" });

    try {
      const response = await apiClient.put(
        `/vehicle/${editingId}`,
        { ...formData, pucPdfFile: file, insurancePdfFile : file1,  documentPdfFile: file2},
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setData((prevData) =>
        prevData.map((bike) => (bike.id === editingId ? response.data : bike))
      );

      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEditBike = (bike) => {
    setEditingId(bike.id);
    setFormData({
      vehicleBrandId: bike.vehicleBrandId,
      vehicleCategoryId: bike.categoryId,
      vehicleModelId: bike.vehicleModelId,
      storeId: bike.storeId,
      vehicleRegistrationNumber: bike.vehicleRegistrationNumber,
      registrationYear: bike.registrationYear,
      chassisNumber: bike.chassisNumber,
      engineNumber: bike.engineNumber,
      fuelType: bike.fuelType,
      vehicleStatus: bike.vehicleStatus,
      pucPdfFile: bike.pucPdfFile,
      insurancePdfFile: bike.insurancePdfFile,
      documentPdfFile: bike.documentPdfFile,
      image: bike.image,
    });

    // Fetch models based on the selected brand
    if (bike.vehicleBrandId) {
      fetchModels(bike.vehicleBrandId);
    }

    setFormVisible(true);
  };

  const handleDeleteBike = (id) => {
    apiClient
      .delete(`/bike/${id}`)
      .then(() => setData(data.filter((bike) => bike.id !== id)))
      .catch((error) => console.error("Error deleting data:", error))
      .finally(() => {
        setConfirmDeleteId(null);
        window.location.reload();
      });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vehicleBrandId: "",
      vehicleCategoryId: "",
      vehicleModelId: "",
      storeId: "",
      vehicleRegistrationNumber: "",
      registrationYear: "",
      chassisNumber: "",
      engineNumber: "",
      fuelType: "",
      vehicleStatus: "",
      pucPdfFile: "",
      insurancePdfFile: "",
      documentPdfFile: "",
      image: "",
    });
    setFormVisible(false);
  };

  const filteredData = data.filter(
    (item) =>
      item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const toggleStatus = async (id, currentStatus) => {
    if (currentStatus === "BOOKED") {
        alert("Bike is booked, you are not able to disable the bike.");
        return;
    }
    const newStatus = currentStatus === "AVAILABLE" ? "DISABLED" : "AVAILABLE";
    try {
        const response = await apiClient.put(`/vehicle/${id}/status?status=${newStatus}`);
        if (response.status === 400) {
            alert("Bike is booked, you are not able to disable the bike.");
        } else {
            setData((prevData) =>
                prevData.map((bike) =>
                    bike.id === id ? { ...bike, vehicleStatus: newStatus } : bike
                )
            );
            window.location.reload();
        }
    } catch (error) {
        console.error("Error updating bike status:", error);
        if (error.response && error.response.status === 400) {
            alert("Bike is booked, you are not able to disable the bike.");
        } else {
            alert("An error occurred while updating the bike status.");
        }
    }
};

  useEffect(() => {
    fetchBikes();
    fetchBrands();
    fetchModels();
    fetchCategory();
    fetchStores();
    fetchFuel();

    // Scroll to the top of the window when the component mounts
    window.scrollTo(0, 0);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="bg-gray-100 min-h-screen">

      <div className="flex justify-between items-center mt-4 mb-4">
        {/* <h1 className="text-2xl font-bold text-gray-800">All Bikes</h1> */}

      </div>

      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Bike" : "Add New Bike"}
          </h2>
          <form onSubmit={editingId ? handleSaveEdit : handleAddBike}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Brand Name *</label>
                <select
                  name="vehicleBrandId"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleBrandId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      vehicleBrandId: e.target.value,
                      vehicleModelId: ""
                    });
                    fetchModels(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Model Name *</label>
                <select
                  name="vehicleModelId"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleModelId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleModelId: e.target.value })
                  }
                  disabled={!formData.vehicleBrandId}
                  required
                >
                  <option value="" disabled>Select Model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.modelName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Category Name *</label>
                <select
                  name="vehicleCategoryId"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleCategoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleCategoryId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  name="vehicleRegistrationNumber"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleRegistrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleRegistrationNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Registration Year *</label>
                <input
                  type="text"
                  name="registrationYear"
                  className="border p-2 rounded w-full"
                  value={formData.registrationYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationYear: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Vehicle Chassis Number *</label>
                <input
                  type="text"
                  name="chassisNumber"
                  className="border p-2 rounded w-full"
                  value={formData.chassisNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chassisNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Vehicle Engine Number *</label>
                <input
                  type="text"
                  name="engineNumber"
                  className="border p-2 rounded w-full"
                  value={formData.engineNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      engineNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Store Name *</label>
                <select
                  name="storeId"
                  className="border p-2 rounded w-full"
                  value={formData.storeId}
                  onChange={(e) =>
                    setFormData({ ...formData, storeId: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Fuel Type *</label>
                <select
                  name="fuelType"
                  className="border p-2 rounded w-full"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fuelType: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>Select Fuel Type</option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel.id} value={fuel.name}>
                      {fuel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Upload PUC *</label>
                <input
                  type="file"
                  name="pucPdfFile"
                  className="w-full border border-gray-300 p-2 rounded"
                  onChange={handleFileUpload}
                  required
                />
                {formData.pucPdfFile && (
                  <div className="mt-2">
                    <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.pucPdfFile}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Upload Insurance *</label>
                <input
                  type="file"
                  name="insurancePdfFile"
                  className="w-full border border-gray-300 p-2 rounded"
                  onChange={handleFileUpload}
                  required
                />
                {formData.insurancePdfFile && (
                  <div className="mt-2">
                    <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.insurancePdfFile}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Upload Document *</label>
                <input
                  type="file"
                  name="documentPdfFile"
                  className="w-full border border-gray-300 p-2 rounded"
                  onChange={handleFileUpload}
                  required
                />
                {formData.documentPdfFile && (
                  <div className="mt-2">
                    <div className="w-[90px] h-[90px] border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.documentPdfFile}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Upload Vehicle Images *</label>
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
                  required
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
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
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
          <h1 className="text-xl font-bold text-indigo-900">All Bikes</h1>
          {!formVisible && (
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
          >
            + Add Bike
          </button>
        )}
            <input
              type="text"
              placeholder="Search by Brand Name..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-indigo-900 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3">No.</th>
                  <th scope="col" className="px-6 py-3">Brand Name</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Model Name</th>
                  <th scope="col" className="px-6 py-3">Vehicle Registration Number</th>
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
                  currentData.map((bike, index) => (
                    <tr key={bike.id} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4">{bike.brand}</td>
                      <td className="px-6 py-4">{bike.categoryName}</td>
                      <td className="px-6 py-4">{bike.model}</td>
                      <td className="px-6 py-4">{bike.vehicleRegistrationNumber}</td>
                      <td className="px-6 py-4">{bike.vehicleStatus === "DISABLED" ? "Maintenance" : bike.vehicleStatus}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
                            onClick={() => handleEditBike(bike)}
                          >
                            <FaEdit className="mr-1.5" size={14} />
                            Edit
                          </button>
                          <button
                            className={`px-3 py-1.5 flex items-center text-white rounded ${bike.vehicleStatus === "AVAILABLE" || bike.vehicleStatus === "BOOKED" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                            onClick={() => toggleStatus(bike.id, bike.vehicleStatus)}
                          >
                            {bike.vehicleStatus === "AVAILABLE" || bike.vehicleStatus === "BOOKED" ? "Activate" : "Deactivate"}
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
          {confirmDeleteId && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-4">
                  Are you sure you want to delete this Bike?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
                    onClick={() => handleDeleteBike(confirmDeleteId)}
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

export default Bikes;

