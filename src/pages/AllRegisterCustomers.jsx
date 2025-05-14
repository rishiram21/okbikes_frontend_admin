import React, { useEffect, useState } from "react";
import { FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import apiClient from "../api/apiConfig";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllRegisterCustomers = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentStatus, setDocumentStatus] = useState({
    aadharFrontSide: 'PENDING',
    aadharBackSide: 'PENDING',
    drivingLicense: 'PENDING',
  });

  // Compute verification status based on document statuses
  const userVerificationStatus = () => {
    if (Object.values(documentStatus).every(status => status === 'APPROVED')) {
      return { status: "Verified User", color: "green" };
    } else if (Object.values(documentStatus).some(status => status === 'REJECTED')) {
      return { status: "Unverified User", color: "red" };
    } else {
      return { status: "Pending Verification", color: "orange" };
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/users/all", {
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        });

        // Remove the first user record
        const filteredData = response.data.content.slice(1);

        setData(filteredData);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const filteredData = data.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleView = (user) => {
    setSelectedUser(user);
    setViewMode(true);
    setDocumentStatus({
      aadharFrontSide: user.aadharFrontStatus || 'PENDING',
      aadharBackSide: user.aadharBackStatus || 'PENDING',
      drivingLicense: user.drivingLicenseStatus || 'PENDING',
    });
  };

  const handleBack = () => {
    setViewMode(false);
    setSelectedUser(null);
  };

  const handleImageClick = (imageData) => {
    if (!imageData) {
      console.log("No image data available");
      return;
    }

    setSelectedImage(imageData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  const handleDocumentAction = async (docType, action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized access.");
      return;
    }

    try {
      const response = await apiClient.put(
        `/booking/verify-documents/${selectedUser.id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: action,
            docType: docType,
          },
        }
      );

      if (response.status === 200) {
        setDocumentStatus((prevStatus) => ({
          ...prevStatus,
          [docType]: action,
        }));
        toast.success(`Document ${docType} ${action.toLowerCase()} successfully!`);
        // Update the user data in the state
        setData((prevData) =>
          prevData.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  [`${docType}Status`]: action,
                }
              : user
          )
        );
      } else {
        toast.error("Failed to update document status.");
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      toast.error("Failed to update document status.");
    }
  };

  // Verification Status Card Component
  const VerificationStatusCard = () => {
    const verificationStatus = userVerificationStatus();

    return (
      <div className={`bg-${verificationStatus.color === 'green' ? 'green-100' : verificationStatus.color === 'red' ? 'red-100' : 'yellow-100'} p-3 rounded-lg shadow-md border-l-4 border-${verificationStatus.color === 'green' ? 'green-500' : verificationStatus.color === 'red' ? 'red-500' : 'yellow-500'} flex items-center`}>
        {verificationStatus.color === 'green' ? (
          <FaCheckCircle className="text-green-500 mr-2" size={20} />
        ) : verificationStatus.color === 'red' ? (
          <FaTimesCircle className="text-red-500 mr-2" size={20} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-yellow-500 mr-2"></div>
        )}
        <span className={`font-medium text-${verificationStatus.color === 'green' ? 'green-700' : verificationStatus.color === 'red' ? 'red-700' : 'yellow-700'}`}>
          {verificationStatus.status}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ToastContainer />
      {viewMode ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold md:text-xl">User Details</h3>
            <VerificationStatusCard />
          </div>

          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>

          <div className="flex space-x-4 mt-10">
            <ProfileImageDetail
              label="Aadhar Front Side"
              imageData={selectedUser.aadharFrontSide}
              status={documentStatus.aadharFrontSide}
              onVerify={() => handleDocumentAction('aadharFrontSide', 'APPROVED')}
              onReject={() => handleDocumentAction('aadharFrontSide', 'REJECTED')}
              onImageClick={handleImageClick}
            />
            <ProfileImageDetail
              label="Aadhar Back Side"
              imageData={selectedUser.aadharBackSide}
              status={documentStatus.aadharBackSide}
              onVerify={() => handleDocumentAction('aadharBackSide', 'APPROVED')}
              onReject={() => handleDocumentAction('aadharBackSide', 'REJECTED')}
              onImageClick={handleImageClick}
            />
            <ProfileImageDetail
              label="Driving License"
              imageData={selectedUser.drivingLicense}
              status={documentStatus.drivingLicense}
              onVerify={() => handleDocumentAction('drivingLicense', 'APPROVED')}
              onReject={() => handleDocumentAction('drivingLicense', 'REJECTED')}
              onImageClick={handleImageClick}
            />
          </div>
          <button
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mt-4 mb-4">
            
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-900">All Registered Users List</h3>
                <input
                  type="text"
                  placeholder="Search By User Name..."
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
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Phone Number</th>
                    <th scope="col" className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
                          <span className="ml-2">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 font-medium">{indexOfFirstItem + index + 1}</td>
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="px-3 py-1.5 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
                              onClick={() => handleView(user)}
                            >
                              <FaEye className="mr-1.5" size={14} />
                              View
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
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500"
                      : "bg-indigo-800 text-white hover:bg-indigo-600"
                  } transition-colors`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-full p-2 z-10"
              onClick={handleCloseModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex justify-center items-center p-4 min-h-[400px]">
              {selectedImage ? (
                <img
                  src={`data:image/png;base64,${selectedImage}`}
                  alt="Document"
                  className="max-w-full max-h-[70vh] object-contain border-4 border-gray-300 rounded shadow-lg"
                  onError={(e) => {
                    console.error("Image loading error");
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : (
                <div className="text-xl text-gray-500">Unable to load image</div>
              )}
              <div className="hidden text-xl text-red-500 text-center">
                Error loading image. The image data may be invalid or corrupted.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileImageDetail = ({ label, imageData, status, onVerify, onReject, onImageClick }) => {
  const getImageSource = () => {
    if (!imageData) return null;
    if (typeof imageData === "string" && imageData.startsWith("data:image/")) {
      return imageData;
    }
    return `data:image/png;base64,${imageData}`;
  };

  const handleImageClick = () => {
    if (!imageData) return;

    // Ensure we're passing the raw base64 data without the data URL prefix
    const base64Data = typeof imageData === "string" && imageData.startsWith("data:image/")
      ? imageData.split(',')[1]
      : imageData;

    onImageClick(base64Data);
  };

  return (
    <div className="w-1/3 relative">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div
        className={`w-full h-64 bg-gray-50 border ${imageData ? 'border-indigo-400 hover:border-indigo-600' : 'border-gray-300'}
          flex items-center justify-center rounded-md overflow-hidden transition-all duration-300
          ${imageData ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}`}
        onClick={handleImageClick}
      >
        {imageData ? (
          <img
            src={getImageSource()}
            alt={label}
            className="max-w-full max-h-full object-contain p-2 border-2 border-gray-200 rounded"
            onError={(e) => {
              console.error(`Error loading ${label} image`);
              e.target.onerror = null;
              e.target.style.display = "none";
              // Create and show error message
              const errorText = document.createElement("p");
              errorText.textContent = "Invalid image data";
              errorText.className = "font-medium text-red-500";
              e.target.parentNode.appendChild(errorText);
            }}
          />
        ) : (
          <p className="font-medium text-gray-500">No Image</p>
        )}
      </div>
      {status && (
        <div className="mt-2 flex flex-col items-center space-y-2">
          <div className={`bg-white p-2 rounded shadow text-xs absolute top-2 right-2 ${
            status === 'APPROVED' ? 'text-green-500 font-bold' :
            status === 'REJECTED' ? 'text-red-500 font-bold' :
            'text-gray-500'
          }`}>
            {status}
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              className={`px-3 py-1 text-sm ${status === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-md`}
              onClick={onVerify}
              disabled={status === 'APPROVED'}
            >
              Verify
            </button>
            <button
              className={`px-3 py-1 text-sm ${status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-md`}
              onClick={onReject}
              disabled={status === 'REJECTED'}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRegisterCustomers;
