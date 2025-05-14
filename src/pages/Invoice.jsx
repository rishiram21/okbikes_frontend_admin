import React from 'react';

const Invoice = ({ booking, charges, lateCharges = 0, challans = [], damages = [] }) => {
  const calculateDuration = () => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    let durationText = "";
    if (diffDays > 0) durationText += `${diffDays} day${diffDays !== 1 ? 's' : ''} `;
    if (diffHours > 0 || diffDays > 0) durationText += `${diffHours} hour${diffHours !== 1 ? 's' : ''} `;
    if (diffMinutes > 0 || diffHours > 0 || diffDays > 0) durationText += `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;

    return durationText.trim();
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate subtotal and total
  const packagePrice = booking.vehiclePackage.price || 0;
  const gst = packagePrice * 0.18;
  const convenienceFee = 2.00;
  const subtotal = packagePrice + gst + convenienceFee;
  const additionalChargesTotal = charges.reduce((sum, charge) => sum + Number(charge.amount), 0);
  const challansTotal = challans.reduce((sum, challan) => sum + Number(challan.amount), 0);
  const damagesTotal = damages.reduce((sum, damage) => sum + Number(damage.amount), 0);
  const totalAmount = subtotal + additionalChargesTotal + lateCharges + challansTotal + damagesTotal;

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-3xl mx-auto print:shadow-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* <div className="bg-white rounded-full p-2 shadow-lg">
            <svg className="w-10 h-10 text-blue-800" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="24" stroke="currentColor" strokeWidth="2" />
              <path d="M15 30C18.866 30 22 26.866 22 23C22 19.134 18.866 16 15 16C11.134 16 8 19.134 8 23C8 26.866 11.134 30 15 30Z" fill="currentColor" />
              <path d="M35 30C38.866 30 42 26.866 42 23C42 19.134 38.866 16 35 16C31.134 16 28 19.134 28 23C28 26.866 31.134 30 35 30Z" fill="currentColor" />
              <path d="M25 15L25 35" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div> */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">OkBikes</h1>
            <p className="text-blue-100">Ride with confidence</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold tracking-wide uppercase">Invoice</h2>
          <div className="bg-blue-700 px-3 py-1 rounded mt-1 inline-block">
            <p className="text-blue-100">OKB-{booking.bookingId}</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-blue-50 px-8 py-3 border-b border-blue-100 flex justify-between items-center">
        {/* <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${booking.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="font-medium text-gray-700">Status: {booking.paymentStatus || "Pending"}</span>
        </div> */}
        <div className="text-gray-600">
          <span>Invoice Date: </span>
          <span className="font-medium">{today}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        {/* Address and Date Section */}
        <div className="flex justify-between mb-8">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-800 w-5/12">
            <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider">Billed To:</h3>
            <p className="text-gray-800 font-medium text-lg">{booking.userName}</p>
            {/* <p className="text-gray-600 mt-1">{booking.userEmail || "email@example.com"}</p> */}
            <p className="text-gray-600">{booking.userPhone || "+91 XXXXX-XXXXX"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-800 w-5/12">
            <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider">Payment Details:</h3>
            <p className="text-gray-600">Payment Mode: <span className="font-medium">{booking.paymentMode || "Cash On Center"}</span></p>
            <p className="text-gray-600">Security Deposit: <span className="font-medium">₹{booking.vehiclePackage.deposit}</span></p>
            {/* <p className="text-gray-600">Payment ID: <span className="font-medium">{booking.paymentId || "N/A"}</span></p> */}
          </div>
        </div>

        {/* Booking Details */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-blue-900 pb-2 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Booking Summary
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">Vehicle Model</p>
                <p className="font-medium text-gray-900 text-lg">{booking.vehicle.model}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Vehicle Number</p>
                <p className="font-medium text-gray-900 text-lg">{booking.vehicleNumber || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Start Date & Time</p>
                <p className="font-medium text-gray-900">{new Date(booking.startDate).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">End Date & Time</p>
                <p className="font-medium text-gray-900">{new Date(booking.endDate).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Duration</p>
                <p className="font-medium text-gray-900">{calculateDuration()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Package</p>
                <p className="font-medium text-gray-900">{booking.vehiclePackage.name || "Standard Package"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charges Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-blue-900 pb-2 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Charges
          </h3>
          <div className="rounded-lg border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Package Price</td>
                  <td className="py-3 px-4 text-gray-700 text-right">₹{packagePrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">GST (18%)</td>
                  <td className="py-3 px-4 text-gray-700 text-right">₹{gst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Convenience Fee</td>
                  <td className="py-3 px-4 text-gray-700 text-right">₹{convenienceFee.toFixed(2)}</td>
                </tr>
                {charges.map((charge, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 text-gray-700">{charge.type}</td>
                    <td className="py-3 px-4 text-gray-700 text-right">₹{charge.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {lateCharges > 0 && (
                  <tr className="bg-red-50">
                    <td className="py-3 px-4 text-red-700 font-medium">Late Charges</td>
                    <td className="py-3 px-4 text-red-700 font-medium text-right">₹{lateCharges.toFixed(2)}</td>
                  </tr>
                )}
                {challans.map((challan, index) => (
                  <tr key={index} className="bg-orange-50">
                    <td className="py-3 px-4 text-orange-700">Traffic Challan: {challan.description}</td>
                    <td className="py-3 px-4 text-orange-700 text-right">₹{challan.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {damages.map((damage, index) => (
                  <tr key={index} className="bg-red-50">
                    <td className="py-3 px-4 text-red-700">Damage: {damage.description}</td>
                    <td className="py-3 px-4 text-red-700 text-right">₹{damage.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50">
                <tr className="border-t-2 border-blue-200">
                  <td className="py-4 px-4 text-lg font-bold text-blue-900">Total Amount</td>
                  <td className="py-4 px-4 text-2xl font-bold text-blue-900 text-right">₹{totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
             <td className='font-semibold text-red-600'>* Note Deposit is not included in Total Amount</td>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8 text-sm text-gray-600 border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Terms & Conditions:
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Security deposit will be refunded after the bike is returned in good condition.</li>
            <li>Late returns will incur additional charges as per rental agreement.</li>
            <li>Fuel charges are not included in the package price.</li>
            <li>The renter is responsible for any traffic violations during the rental period.</li>
            <li>Damages to the vehicle will be charged as per assessment.</li>
          </ul>
        </div>

        {/* QR Code
        <div className="flex justify-end mb-6">
          <div className="text-center">
            <div className="bg-gray-100 p-2 rounded-lg inline-block">
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <rect x="10" y="10" width="80" height="80" fill="white" />
                <path d="M20 20h20v20h-20z M60 20h20v20h-20z M20 60h20v20h-20z M45 20h10v60h-10z M60 45h20v10h-20z M60 60h10v10h-10z M75 60h5v20h-5z M60 75h10v5h-10z" fill="black" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mt-1">Scan for digital copy</p>
          </div>
        </div> */}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-8 border-t border-gray-200 pt-6">
          <p className="font-medium">Thank you for choosing OkBikes!</p>
          <div className="flex justify-center items-center mt-2 space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@okbikes.com</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+91 1234567890</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="bg-gray-50 px-8 py-4 rounded-b-lg border-t border-gray-200 print:hidden">
        <div className="flex justify-end">
          <button
            className="px-6 py-2.5 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center shadow-md"
            onClick={() => window.print()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;