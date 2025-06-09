import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import apiClient from "../api/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllBookings = () => {
  const BookingStatus = {
    CONFIRMED: "Confirmed",
    BOOKING_ACCEPTED: "Booking Accepted",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const [data, setData] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/booking/all");
      const sortedData = response.data.sort((a, b) => b.bookingId - a.bookingId);

      const combinedBookings = await Promise.all(
        sortedData.map(async (booking) => {
          const combinedResponse = await apiClient.get(`/booking/combined/${booking.bookingId}`);
          return {
            ...booking,
            vehicle: combinedResponse.data.vehicle,
            store: combinedResponse.data.store,
            vehicleImageUrl: combinedResponse.data.vehicle.image,
            vehiclePackage: combinedResponse.data.vehiclePackage,
            damage: combinedResponse.data.booking.damage,
            challan: combinedResponse.data.booking.challan,
            additionalCharges: combinedResponse.data.booking.additionalCharges,
            challans: combinedResponse.data.booking.challans || [],
            damages: combinedResponse.data.booking.damages || [],
            vehicleNumber: combinedResponse.data.vehicle.vehicleRegistrationNumber,
          };
        })
      );

      const bookingWithUsernames = await Promise.all(
        combinedBookings.map(async (booking) => {
          const userResponse = await apiClient.get(`/users/${booking.userId}`);
          return {
            ...booking,
            userName: userResponse.data.name,
            userEmail: userResponse.data.email,
            userPhone: userResponse.data.phoneNumber,
          };
        })
      );

      setData(bookingWithUsernames);
      setTotalPages(Math.ceil(bookingWithUsernames.length / itemsPerPage));
      setStatuses(bookingWithUsernames.map((item) => ({ id: item.bookingId, status: "Active" })));
    } catch (error) {
      console.error("Error fetching booking data:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    fetchBookings();
  }, [currentPage, fetchBookings]);

  const filteredData = useMemo(() => data.filter((item) =>
    item.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  ), [data, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = useMemo(() => filteredData.slice(indexOfFirstItem, indexOfLastItem), [filteredData, indexOfFirstItem, indexOfLastItem]);

  const handleView = (booking) => {
    navigate(`${booking.bookingId}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen mt-6">
      <ToastContainer />
      <AllBookingsList
        data={data}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentData={currentData}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        filteredData={filteredData}
        handleView={handleView}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />
    </div>
  );
};

const AllBookingsList = ({
  data,
  searchQuery,
  setSearchQuery,
  currentData,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredData,
  handleView,
  indexOfFirstItem,
  indexOfLastItem
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-indigo-900">All Bookings</h3>
        <input
          type="text"
          placeholder="Search by vehicle name..."
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
              {/* <th scope="col" className="px-6 py-3">Booking ID</th> */}
              <th scope="col" className="px-6 py-3">User Name</th>
              <th scope="col" className="px-6 py-3">Vehicle</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">End Date</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.bookingId} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 font-medium">{indexOfFirstItem + index + 1}</td>
                  {/* <td className="px-6 py-4">{item.bookingId}</td> */}
                  <td className="px-6 py-4">{item.userName}</td>
                  <td className="px-6 py-4">{item.vehicle.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">₹{Number(item.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-indigo-100 text-indigo-800'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
                      onClick={() => handleView(item)}
                    >
                      <FaEye className="mr-1.5" size={14} />
                      View
                    </button>
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
  );
};

export default AllBookings;
