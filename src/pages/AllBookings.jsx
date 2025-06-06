import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import apiClient from "../api/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2 } from 'lucide-react';
import ImageDetail from './ImageDetail';
import Invoice from './Invoice';

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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(BookingStatus.CONFIRMED);
  const [documentStatus, setDocumentStatus] = useState({
    aadharFrontSide: 'PENDING',
    aadharBackSide: 'PENDING',
    drivingLicense: 'PENDING',
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [charges, setCharges] = useState([{ type: 'Challan', amount: 0 }]);
  const [challans, setChallans] = useState([]);
  const [damages, setDamages] = useState([]);
  const [chargesEditable, setChargesEditable] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  const chargeTypes = ['Challan', 'Damage', 'Additional'];

  

  const handleAddCharge = () => {
    setCharges([...charges, { type: 'Challan', amount: 0 }]);
  };

  const handleRemoveCharge = (index) => {
    const updatedCharges = [...charges];
    updatedCharges.splice(index, 1);
    setCharges(updatedCharges);
  };

  const handleChangeType = (index, value) => {
    const updatedCharges = [...charges];
    updatedCharges[index].type = value;
    setCharges(updatedCharges);
  };

  const handleChangeAmount = (index, value) => {
    const updatedCharges = [...charges];
    updatedCharges[index].amount = value;
    setCharges(updatedCharges);
  };

  const totalAdditionalCharges = useMemo(() => charges.reduce((sum, charge) => sum + Number(charge.amount), 0), [charges]);

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
            frontImageUrl: combinedResponse.data.booking.frontImageUrl,
            leftImageUrl: combinedResponse.data.booking.leftImageUrl,
            rightImageUrl: combinedResponse.data.booking.rightImageUrl,
            backImageUrl: combinedResponse.data.booking.backImageUrl,
            frontEndImageUrl: combinedResponse.data.booking.frontEndImageUrl,
            leftEndImageUrl: combinedResponse.data.booking.leftEndImageUrl,
            rightEndImageUrl: combinedResponse.data.booking.rightEndImageUrl,
            backEndImageUrl: combinedResponse.data.booking.backEndImageUrl,
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

  const handleView = async (booking) => {
    setSelectedBooking(booking);
    setViewMode(true);
    setBookingStatus(booking.status || BookingStatus.CONFIRMED);

    try {
      const response = await apiClient.get(`/users/${booking.userId}`);
      setUserDetails(response.data);
      setDocumentStatus({
        aadharFrontSide: response.data.aadharFrontStatus || 'PENDING',
        aadharBackSide: response.data.aadharBackStatus || 'PENDING',
        drivingLicense: response.data.drivingLicenseStatus || 'PENDING',
      });

      setCharges([
        { type: 'Damage', amount: booking.damage || 0 },
        { type: 'Challan', amount: booking.challan || 0 },
        { type: 'Additional', amount: booking.additionalCharges || 0 },
      ]);

      setChallans(booking.challans || []);
      setDamages(booking.damages || []);

      setChargesEditable(booking.status !== BookingStatus.COMPLETED);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleBack = () => {
    setViewMode(false);
    setSelectedBooking(null);
    setUserDetails(null);
    setBookingStatus(BookingStatus.CONFIRMED);
    setStatusMessage("");
  };

  const handleStatusChange = (event) => {
    setBookingStatus(event.target.value);
  };

  const handleUpdateBooking = async () => {
    if (bookingStatus === BookingStatus.CANCELLED) {
      try {
        const response = await apiClient.put(`/booking/cancel/${selectedBooking.bookingId}`);
        toast.success("Booking canceled successfully!");
        setStatusMessage("Booking canceled successfully!");
      } catch (error) {
        console.error("Error canceling booking:", error);
        toast.error("Failed to cancel booking.");
        setStatusMessage("Failed to cancel booking.");
      }
    } else if (bookingStatus === BookingStatus.BOOKING_ACCEPTED) {
      try {
        const response = await apiClient.put(`/booking/admin/accept/${selectedBooking.bookingId}`);
        toast.success("Booking accepted successfully!");
        setStatusMessage("Booking accepted successfully!");
      } catch (error) {
        console.error("Error accepting booking:", error);
        toast.error("Failed to accept booking, Due to documents not verified.");
        setStatusMessage("Failed to accept booking.");
      }
    } else if (bookingStatus === BookingStatus.COMPLETED) {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.put(`booking/admin/complete-trip/${selectedBooking.bookingId}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Trip marked as COMPLETED.");
        setStatusMessage("Trip marked as COMPLETED.");
      } catch (error) {
        console.error("Error marking trip as COMPLETED:", error);
        toast.error("Failed to mark trip as COMPLETED.");
        setStatusMessage("Failed to mark trip as COMPLETED.");
      }
    } else {
      try {
        const response = await apiClient.put(`/booking/update/${selectedBooking.bookingId}`, {
          status: bookingStatus,
        });
        toast.success(`Booking status updated to: ${bookingStatus}`);
        setStatusMessage(`Booking status updated to: ${bookingStatus}`);
      } catch (error) {
        console.error("Error updating booking status:", error);
        toast.error("Failed to update booking status.");
        setStatusMessage("Failed to update booking status.");
      }
    }
  };

  const handleDocumentAction = async (docType, action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized access.");
      return;
    }

    try {
      const response = await apiClient.put(
        `/booking/verify-documents/${userDetails.id}`,
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
      } else {
        toast.error("Failed to update document status.");
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      toast.error("Failed to update document status.");
    }
  };

  const handleViewInvoice = () => {
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
  };

  const calculateLateCharges = () => {
    if (selectedBooking && new Date(selectedBooking.endDate) < new Date()) {
      return 0;
    }
    return 0;
  };

  const handleSaveCharges = async () => {
    const formatDateTime = (date) => {
      const isoString = new Date(date).toISOString();
      return isoString.split('.')[0];
    };

    const bookingRequestDto = {
      vehicleId: selectedBooking.vehicle.id,
      userId: selectedBooking.userId,
      packageId: selectedBooking.vehiclePackage.id,
      totalAmount: selectedBooking.totalAmount,
      addressType: selectedBooking.addressType,
      deliveryLocation: selectedBooking.address,
      deliverySelected: selectedBooking.deliverySelected,
      startTime: formatDateTime(selectedBooking.startDate),
      endTime: formatDateTime(selectedBooking.endDate),
      damage: charges.find(charge => charge.type === 'Damage')?.amount || 0,
      challan: charges.find(charge => charge.type === 'Challan')?.amount || 0,
      additionalCharges: charges.find(charge => charge.type === 'Additional')?.amount || 0,
    };

    try {
      const response = await apiClient.put(`/booking/${selectedBooking.bookingId}`, bookingRequestDto);
      toast.success("Booking updated successfully!");
      setStatusMessage("Booking updated successfully!");
      setChargesEditable(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking.");
      setStatusMessage("Failed to update booking.");
    }
  };

  const calculateDuration = useCallback(() => {
    const start = new Date(selectedBooking.startDate);
    const end = new Date(selectedBooking.endDate);
    const diffTime = Math.abs(end - start);

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    let durationText = "";
    if (diffDays > 0) durationText += `${diffDays} day${diffDays !== 1 ? 's' : ''} `;
    if (diffHours > 0 || diffDays > 0) durationText += `${diffHours} hour${diffHours !== 1 ? 's' : ''} `;
    if (diffMinutes > 0 || diffHours > 0 || diffDays > 0) durationText += `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;

    return durationText.trim();
  }, [selectedBooking]);

  return (
    <div className="bg-gray-100 min-h-screen mt-6">
      <ToastContainer />
      {showInvoice ? (
        <Invoice
          booking={selectedBooking}
          charges={charges}
          lateCharges={calculateLateCharges()}
          challans={challans}
          damages={damages}
          userPhone={selectedBooking?.userPhone}
          vehicleNumber={selectedBooking?.vehicleNumber}
        />
      ) : viewMode ? (
        <BookingDetails
          selectedBooking={selectedBooking}
          userDetails={userDetails}
          bookingStatus={bookingStatus}
          documentStatus={documentStatus}
          charges={charges}
          challans={challans}
          damages={damages}
          chargesEditable={chargesEditable}
          handleViewInvoice={handleViewInvoice}
          handleBack={handleBack}
          handleStatusChange={handleStatusChange}
          handleUpdateBooking={handleUpdateBooking}
          handleDocumentAction={handleDocumentAction}
          handleAddCharge={handleAddCharge}
          handleRemoveCharge={handleRemoveCharge}
          handleChangeType={handleChangeType}
          handleChangeAmount={handleChangeAmount}
          handleSaveCharges={handleSaveCharges}
          calculateDuration={calculateDuration}
          calculateLateCharges={calculateLateCharges}
          statusMessage={statusMessage}
          chargeTypes={chargeTypes}
          BookingStatus={BookingStatus}
        />
      ) : (
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
      )}
    </div>
  );
};

const BookingDetails = ({
  selectedBooking,
  userDetails,
  bookingStatus,
  documentStatus,
  charges,
  challans,
  damages,
  chargesEditable,
  handleViewInvoice,
  handleBack,
  handleStatusChange,
  handleUpdateBooking,
  handleDocumentAction,
  handleAddCharge,
  handleRemoveCharge,
  handleChangeType,
  handleChangeAmount,
  handleSaveCharges,
  calculateDuration,
  calculateLateCharges,
  statusMessage,
  chargeTypes,
  BookingStatus,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-xl font-bold text-indigo-900">Booking Details</h3>
          {selectedBooking && selectedBooking.status === 'COMPLETED' && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={handleViewInvoice}
            >
              View Invoice
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:row-span-2 flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Vehicle</label>
            <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col h-full">
              <img
                src={selectedBooking.vehicleImageUrl}
                alt={selectedBooking.vehicle.model}
                className="rounded-t-lg h-52 w-full object-contain"
              />
              <div className="bg-gray-50 p-4 rounded-b-lg flex-grow">
                <h4 className="font-semibold text-indigo-900 text-lg">{selectedBooking.vehicle.model}</h4>
                <p className="text-gray-600 mt-1">Reg: {selectedBooking.vehicle.vehicleRegistrationNumber}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Booking ID</label>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-grow">
              <div className="flex items-center">
                <span className="font-medium text-indigo-800">{selectedBooking.bookingId}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Payment Details</label>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-grow">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Deposit:</span>
                <span className="font-medium">₹{selectedBooking.vehiclePackage.deposit}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">
                  ₹{(selectedBooking.vehiclePackage.price * 0.18).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Convenience Fee:</span>
                <span className="font-medium">₹2.00</span>
              </div>
              <div className="pt-2 mt-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Mode:</span>
                  <span className="text-green-600 font-semibold">
                    {selectedBooking.paymentMethod || "Cash On Center"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Customer Information</label>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-grow">
              <p className="font-medium text-indigo-900">{userDetails?.name || 'N/A'}</p>
              <p className="text-indigo-600 mt-1">{userDetails?.phoneNumber || 'N/A'}</p>
              <p className="text-sm text-gray-600 mt-3">{selectedBooking.address}</p>
              <p className="text-xs italic text-gray-500 mt-1">Address Type: {selectedBooking.addressType}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Booking Period</label>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-grow">
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase">Start</p>
                <p className="font-medium">
                  {new Date(selectedBooking.startDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="mb-3 border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase">End</p>
                <p className="font-medium">
                  {new Date(selectedBooking.endDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase">Duration</p>
                <p className="font-medium text-indigo-700">{calculateDuration()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 font-semibold">Store Details</label>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-grow">
              <p className="font-medium text-indigo-900">{selectedBooking.store.name}</p>
              <p className="text-gray-600 mt-1">{selectedBooking.store.address}</p>
              <p className="text-gray-600 mt-1">{selectedBooking.store.phone}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 font-semibold">Total</label>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
              <span className="font-bold text-indigo-900">
                ₹{Number(selectedBooking.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {userDetails && (
        <div className="mt-10">
          <h4 className="text-lg font-semibold mb-4 text-indigo-900 border-b pb-2">Document Verification</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageDetail
              label="Aadhar Front Side"
              imageData={userDetails.aadharFrontSide}
              status={documentStatus.aadharFrontSide}
              onVerify={() => handleDocumentAction('aadharFrontSide', 'APPROVED')}
              onReject={() => handleDocumentAction('aadharFrontSide', 'REJECTED')}
            />
            <ImageDetail
              label="Aadhar Back Side"
              imageData={userDetails.aadharBackSide}
              status={documentStatus.aadharBackSide}
              onVerify={() => handleDocumentAction('aadharBackSide', 'APPROVED')}
              onReject={() => handleDocumentAction('aadharBackSide', 'REJECTED')}
            />
            <ImageDetail
              label="Driving License"
              imageData={userDetails.drivingLicense}
              status={documentStatus.drivingLicense}
              onVerify={() => handleDocumentAction('drivingLicense', 'APPROVED')}
              onReject={() => handleDocumentAction('drivingLicense', 'REJECTED')}
            />
          </div>
        </div>
      )}

      <div className="my-8 h-px bg-gray-300"></div>

      <div className="mt-8">
        <div className="flex flex-col gap-6">
          <div className="w-full mt-6">
            <label className="block text-gray-700 font-semibold mb-2">Booking Status</label>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-3 flex items-center">
                <span className="mr-2">Current Status:</span>
                <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                  {selectedBooking.status}
                </span>
              </div>

              <label className="block text-sm text-gray-600 mb-1">Update Status:</label>
              <select
                name="bookingStatus"
                value={bookingStatus}
                onChange={handleStatusChange}
                className="block w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              >
                {Object.values(BookingStatus).map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>

              {statusMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-400 rounded-md text-sm">
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          className="mt-6 px-6 py-2.5 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition duration-300 flex items-center justify-center shadow-md"
          onClick={handleUpdateBooking}
        >
          Update Booking Details
        </button>
      </div>

      <div className="my-8 h-px bg-gray-300"></div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
  <div>
    <h4 className="text-lg font-semibold mb-4 text-indigo-900 border-b pb-2">Before Trip Images</h4>
    <div className="grid grid-cols-2 gap-4">
      {selectedBooking && (
        <>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Front</p>
            <img src={`data:image/png;base64,${selectedBooking.frontImageUrl}`} alt="Front" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Left</p>
            <img src={`data:image/png;base64,${selectedBooking.leftImageUrl}`} alt="Left" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Right</p>
            <img src={`data:image/png;base64,${selectedBooking.rightImageUrl}`} alt="Right" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Back</p>
            <img src={`data:image/png;base64,${selectedBooking.backImageUrl}`} alt="Back" className="border-4 h-32 w-full object-cover" />
          </div>
        </>
      )}
    </div>
  </div>

  <div>
    <h4 className="text-lg font-semibold mb-4 text-indigo-900 border-b pb-2">After Trip Images</h4>
    <div className="grid grid-cols-2 gap-4">
      {selectedBooking && (
        <>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Front</p>
            <img src={`data:image/png;base64,${selectedBooking.frontEndImageUrl}`} alt="Front" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Left</p>
            <img src={`data:image/png;base64,${selectedBooking.leftEndImageUrl}`} alt="Left" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Right</p>
            <img src={`data:image/png;base64,${selectedBooking.rightEndImageUrl}`} alt="Right" className="border-4 h-32 w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Back</p>
            <img src={`data:image/png;base64,${selectedBooking.backEndImageUrl}`} alt="Back" className="border-4 h-32 w-full object-cover" />
          </div>
        </>
      )}
    </div>
  </div>
</div>


      


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
              <th scope="col" className="px-6 py-3">Booking ID</th>
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
                  <td className="px-6 py-4">{item.bookingId}</td>
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
