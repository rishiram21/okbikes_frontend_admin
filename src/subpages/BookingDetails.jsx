import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import apiClient from "../api/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2 } from 'lucide-react';
import ImageDetail from '../pages/ImageDetail';
import Invoice from '../pages/Invoice';

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const BookingStatus = {
    CONFIRMED: "Confirmed",
    BOOKING_ACCEPTED: "Booking Accepted",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(BookingStatus.CONFIRMED);
  const [documentStatus, setDocumentStatus] = useState({
    aadharFrontSide: 'PENDING',
    aadharBackSide: 'PENDING',
    drivingLicense: 'PENDING',
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [charges, setCharges] = useState([
    { type: 'Additional', amount: 0 }
  ]);
  const [chargesEditable, setChargesEditable] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  const chargeTypes = ['Additional'];

  const handleAddCharge = () => {
    setCharges([...charges, { type: 'Additional', amount: 0 }]);
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

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await apiClient.get(`/booking/combined/${bookingId}`);
      const bookingData = {
        ...response.data.booking,
        vehicle: response.data.vehicle,
        store: response.data.store,
        vehicleImageUrl: response.data.vehicle.image,
        vehiclePackage: response.data.vehiclePackage,
        additionalCharges: response.data.booking.additionalCharges,
        vehicleNumber: response.data.vehicle.vehicleRegistrationNumber,
        userName: response.data.user.name,
        userPhone: response.data.user.phoneNumber
      };

      setSelectedBooking(bookingData);
      setBookingStatus(bookingData.status || BookingStatus.CONFIRMED);

      const userResponse = await apiClient.get(`/users/${bookingData.userId}`);
      setUserDetails(userResponse.data);
      setDocumentStatus({
        aadharFrontSide: userResponse.data.aadharFrontStatus || 'PENDING',
        aadharBackSide: userResponse.data.aadharBackStatus || 'PENDING',
        drivingLicense: userResponse.data.drivingLicenseStatus || 'PENDING',
      });

      setCharges([
        { type: 'Additional', amount: bookingData.additionalCharges || 0 },
      ]);


      setChargesEditable(bookingData.status !== BookingStatus.COMPLETED);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleBack = () => {
    navigate('/');
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
    if (!selectedBooking) return '';
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

  if (!selectedBooking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen mt-6">
      <ToastContainer />
      {showInvoice ? (
        <Invoice
          booking={selectedBooking}
          charges={charges}
          lateCharges={calculateLateCharges()}
          userPhone={selectedBooking?.userPhone}
          vehicleNumber={selectedBooking?.vehicleNumber}
          onClose={handleCloseInvoice}
        />
      ) : (
        <BookingDetails
          selectedBooking={selectedBooking}
          userDetails={userDetails}
          bookingStatus={bookingStatus}
          documentStatus={documentStatus}
          charges={charges}
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
  BookingStatus
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
        <h4 className="text-lg font-semibold mb-4 text-indigo-900 border-b pb-2">Additional Charges</h4>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <label className="block text-gray-700 font-semibold mb-2">Charge Details</label>

            {charges.map((charge, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                <div className="w-1/3">
                  <select
                    value={charge.type}
                    onChange={(e) => handleChangeType(index, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!chargesEditable}
                  >
                    {chargeTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="w-1/4">
                  <input
                    type="tel"
                    min="0"
                    value={charge.amount}
                    onChange={(e) => handleChangeAmount(index, e.target.value)}
                    placeholder="Amount"
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!chargesEditable}
                  />
                </div>

                {charges.length > 1 && chargesEditable && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(index)}
                    className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-full flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {/* {chargesEditable && (
              <button
                type="button"
                onClick={handleAddCharge}
                className="flex items-center px-4 py-2 bg-indigo-800 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors mt-2"
              >
                <Plus size={16} className="mr-2" /> Add Charge
              </button>
            )} */}

            {chargesEditable && (
              <button
                type="button"
                onClick={handleSaveCharges}
                className="flex items-center px-4 py-2 bg-indigo-800 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors mt-2"
              >
                Save
              </button>
            )}
          </div>

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

export default BookingDetailPage;
