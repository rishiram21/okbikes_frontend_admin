import React, { useEffect, useState } from "react";
import { useSpring, animated, useTrail, useChain, useSpringRef } from 'react-spring';
import { useTable } from 'react-table';
import apiClient from "../api/apiConfig";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stores, setStores] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showUsers, setShowUsers] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [showBikes, setShowBikes] = useState(false);
  const [showTodaysBookings, setShowTodaysBookings] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [showOngoingBookings, setShowOngoingBookings] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState([]);

  // Spring references for animation chaining
  const cardsSpringRef = useSpringRef();
  const tableSpringRef = useSpringRef();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/users/all", {
          params: { page: currentPage, size: 10, sortBy: 'id', sortDirection: 'asc' }
        });
        let usersData = response.data.content;

        // Exclude the first row for "Total Users" and "Total Unverified Users"
        if (currentPage === 0) {
          usersData = usersData.slice(1);
        }

        setUsers(usersData);
        setTotalPages(response.data.totalPages);

        // Fetch verified and unverified users
        const verified = usersData.filter(user =>
          user.aadharFrontStatus === 'APPROVED' &&
          user.aadharBackStatus === 'APPROVED' &&
          user.drivingLicenseStatus === 'APPROVED'
        );
        const unverified = usersData.filter(user =>
          !(user.aadharFrontStatus === 'APPROVED' &&
            user.aadharBackStatus === 'APPROVED' &&
            user.drivingLicenseStatus === 'APPROVED')
        );
        setVerifiedUsers(verified);
        setUnverifiedUsers(unverified);
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await apiClient.get("/booking/all");
        const sortedBookings = response.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        // Fetch usernames for each booking
        const bookingWithUsernames = await Promise.all(
          sortedBookings.map(async (booking) => {
            try {
              const userResponse = await apiClient.get(`/users/${booking.userId}`);
              return { ...booking, userName: userResponse.data.name };
            } catch (userError) {
              console.error(`Error fetching username for booking ID ${booking.id}:`, userError);
              return { ...booking, userName: 'Unknown' }; // Handle the error gracefully
            }
          })
        );

        setBookings(bookingWithUsernames);

        // Filter today's bookings
        const today = new Date().toISOString().split('T')[0];
        const todaysBookings = bookingWithUsernames.filter(booking => booking.startDate.includes(today));
        setTodaysBookings(todaysBookings);

        // Filter ongoing bookings
        const ongoing = bookingWithUsernames.filter(booking => booking.status === 'START_TRIP');
        setOngoingBookings(ongoing);
      } catch (error) {
        console.error("Error fetching bookings data:", error);
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

    const fetchBikes = async () => {
      try {
        const response = await apiClient.get("/vehicle/all");
        setBikes(response.data.content);
      } catch (error) {
        console.error("Error fetching bikes data:", error);
      }
    };

    fetchUsers();
    fetchBookings();
    fetchStores();
    fetchBikes();
  }, [currentPage]);

  const stats = [
    { title: "Today's Bookings", count: todaysBookings.length, color: "bg-blue-900", icon: "📅" },
    { title: "Ongoing Bookings", count: ongoingBookings.length, color: "bg-yellow-400", icon: "🔄" },
    { title: "Total Bikes", count: bikes.length, color: "bg-red-500", icon: "🏍️" },
    { title: "Total Bookings", count: bookings.length, color: "bg-teal-400", icon: "📚" },
    { title: "Total Users", count: users.length, color: "bg-cyan-400", icon: "👥" },
    { title: "Total Verified Users", count: verifiedUsers.length, color: "bg-green-400", icon: "✅" },
    { title: "Total Unverified Users", count: unverifiedUsers.length, color: "bg-yellow-400", icon: "⚠️" },
    { title: "Total Stores", count: stores.length, color: "bg-red-400", icon: "🏪" },
  ];

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    const { number } = useSpring({
      from: { number: 0 },
      number: end,
      delay: 300,
      config: { duration }
    });

    useEffect(() => {
      number.start({
        from: { number: 0 },
        to: { number: end }
      });
    }, [end, number]);

    return number;
  };

  // Staggered animation for stat cards
  const trail = useTrail(stats.length, {
    ref: cardsSpringRef,
    from: { opacity: 0, y: 40, scale: 0.9 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: { mass: 1, tension: 280, friction: 20 }
  });

  // Table animations
  const tableAnimation = useSpring({
    ref: tableSpringRef,
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 24 },
  });

  // Chain the animations
  useChain([cardsSpringRef, tableSpringRef], [0, 0.5]);

  const handleViewAllUsers = () => {
    setShowUsers(!showUsers);
    setShowBookings(false);
    setShowStores(false);
    setShowBikes(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);
    setDisplayedUsers(users); // Reset displayedUsers to the original users state

    if (!showUsers) {
      setTimeout(() => {
        const usersSection = document.getElementById('users-section');
        if (usersSection) {
          usersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewAllBookings = () => {
    setShowBookings(!showBookings);
    setShowUsers(false);
    setShowStores(false);
    setShowBikes(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);

    if (!showBookings) {
      setTimeout(() => {
        const bookingsSection = document.getElementById('bookings-section');
        if (bookingsSection) {
          bookingsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewAllStores = () => {
    setShowStores(!showStores);
    setShowUsers(false);
    setShowBookings(false);
    setShowBikes(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);

    if (!showStores) {
      setTimeout(() => {
        const storesSection = document.getElementById('stores-section');
        if (storesSection) {
          storesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewAllBikes = () => {
    setShowBikes(!showBikes);
    setShowUsers(false);
    setShowBookings(false);
    setShowStores(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);

    if (!showBikes) {
      setTimeout(() => {
        const bikesSection = document.getElementById('bikes-section');
        if (bikesSection) {
          bikesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewTodaysBookings = () => {
    setShowTodaysBookings(!showTodaysBookings);
    setShowUsers(false);
    setShowBookings(false);
    setShowStores(false);
    setShowBikes(false);
    setShowOngoingBookings(false);

    if (!showTodaysBookings) {
      setTimeout(() => {
        const todaysBookingsSection = document.getElementById('todays-bookings-section');
        if (todaysBookingsSection) {
          todaysBookingsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewOngoingBookings = () => {
    setShowTodaysBookings(false);
    setShowUsers(false);
    setShowBookings(false);
    setShowStores(false);
    setShowBikes(false);
    setShowOngoingBookings(!showOngoingBookings);

    if (!showOngoingBookings) {
      setTimeout(() => {
        const ongoingBookingsSection = document.getElementById('ongoing-bookings-section');
        if (ongoingBookingsSection) {
          ongoingBookingsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewVerifiedUsers = () => {
    setShowUsers(true);
    setShowBookings(false);
    setShowStores(false);
    setShowBikes(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);
    setDisplayedUsers(verifiedUsers); // Update displayedUsers instead of users

    setTimeout(() => {
      const usersSection = document.getElementById('users-section');
      if (usersSection) {
        usersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleViewUnverifiedUsers = () => {
    setShowUsers(true);
    setShowBookings(false);
    setShowStores(false);
    setShowBikes(false);
    setShowTodaysBookings(false);
    setShowOngoingBookings(false);
    setDisplayedUsers(unverifiedUsers); // Update displayedUsers instead of users

    setTimeout(() => {
      const usersSection = document.getElementById('users-section');
      if (usersSection) {
        usersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pulse animation for the scroll-to-top button
  const pulseAnimation = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      while (true) {
        await next({ scale: 1.1, config: { duration: 1000 } });
        await next({ scale: 1, config: { duration: 1000 } });
      }
    },
  });

  // Fade in animation for section headers
  const sectionHeaderAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: { tension: 300, friction: 20 },
  });

  // Table component with animations
  const Table = ({ columns, data }) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    // Row animation
    const rowAnimations = useTrail(rows.length, {
      from: { opacity: 0, transform: 'translateX(-10px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      config: { tension: 280, friction: 20 },
      delay: 200,
    });

    return (
      <animated.div style={tableAnimation} className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table {...getTableProps()} className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-white uppercase bg-blue-900">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className="px-4 py-3">{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <animated.tr
                  {...row.getRowProps()}
                  style={rowAnimations[rowIndex]}
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                >
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-4 py-3">{cell.render('Cell')}</td>
                  ))}
                </animated.tr>
              );
            })}
          </tbody>
        </table>
      </animated.div>
    );
  };

  // Loading spinner animation
  const spinnerAnimation = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 1000 },
  });

  return (
    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {trail.map((style, index) => {
          const stat = stats[index];
          const countValue = useCounter(stat.count);

          return (
            <animated.div
              key={index}
              style={style}
              className={`p-4 rounded-lg shadow-lg text-white ${stat.color} backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold sm:text-3xl">
                  <animated.span>
                    {countValue.to(n => Math.floor(n))}
                  </animated.span>
                </h2>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="mt-2 text-lg font-medium">{stat.title}</p>
              {stat.title === "Total Users" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewAllUsers}
                >
                  {showUsers ? "Hide Users" : "View All"}
                </button>
              )}
              {stat.title === "Total Bookings" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewAllBookings}
                >
                  {showBookings ? "Hide Bookings" : "View All"}
                </button>
              )}
              {stat.title === "Total Stores" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewAllStores}
                >
                  {showStores ? "Hide Stores" : "View All"}
                </button>
              )}
              {stat.title === "Total Bikes" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewAllBikes}
                >
                  {showBikes ? "Hide Bikes" : "View All"}
                </button>
              )}
              {stat.title === "Today's Bookings" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewTodaysBookings}
                >
                  {showTodaysBookings ? "Hide Bookings" : "View All"}
                </button>
              )}
              {stat.title === "Ongoing Bookings" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewOngoingBookings}
                >
                  {showOngoingBookings ? "Hide Bookings" : "View All"}
                </button>
              )}
              {stat.title === "Total Verified Users" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewVerifiedUsers}
                >
                  View All
                </button>
              )}
              {stat.title === "Total Unverified Users" && (
                <button
                  className="mt-2 bg-white text-gray-800 py-2 px-4 rounded shadow-md w-full hover:bg-gray-100 transition-colors duration-150"
                  onClick={handleViewUnverifiedUsers}
                >
                  View All
                </button>
              )}
            </animated.div>
          );
        })}
      </div>

      {showUsers && (
  <div id="users-section" className="mt-8">
    <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-blue-900 pl-3">
      All Users
    </animated.h2>
    {loading ? (
      <div className="flex justify-center items-center h-32">
        <animated.div
          style={spinnerAnimation}
          className="rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"
        ></animated.div>
      </div>
    ) : (
      <>
        <Table
          columns={[
            { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Contact Number', accessor: 'phoneNumber' },
          ]}
          data={displayedUsers} // Use displayedUsers instead of users
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, displayedUsers.length)} of {displayedUsers.length} entries
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                {index + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
              Next
            </button>
          </div>
        </div>
      </>
    )}
  </div>
)}

      {showOngoingBookings && (
        <div id="ongoing-bookings-section" className="mt-8">
          <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-yellow-400 pl-3">
            Ongoing Bookings
          </animated.h2>
          <Table
            columns={[
              { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
              { Header: 'Booking ID', accessor: 'bookingId' },
              { Header: 'User', accessor: 'userName' },
              { Header: 'Vehicle', accessor: 'vehicle' },
              { Header: 'Start Date', accessor: 'startDate' },
              { Header: 'End Date', accessor: 'endDate' },
              {
                Header: 'Total Amount',
                accessor: 'totalAmount',
                Cell: ({ value }) => `₹${Number(value).toFixed(2)}`
              },
            ]}
            data={ongoingBookings}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, ongoingBookings.length)} of {ongoingBookings.length} entries
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                  {index + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookings && (
        <div id="bookings-section" className="mt-8">
          <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-teal-400 pl-3">
            All Bookings
          </animated.h2>
          <Table
            columns={[
              { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
              { Header: 'Booking ID', accessor: 'bookingId' },
              { Header: 'User', accessor: 'userName' },
              { Header: 'Vehicle', accessor: 'vehicle' },
              { Header: 'Start Date', accessor: 'startDate' },
              { Header: 'End Date', accessor: 'endDate' },
              {
                Header: 'Total Amount',
                accessor: 'totalAmount',
                Cell: ({ value }) => `₹${Number(value).toFixed(2)}`
              },
            ]}
            data={bookings}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, bookings.length)} of {bookings.length} entries
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                  {index + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showStores && (
        <div id="stores-section" className="mt-8">
          <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-red-400 pl-3">
            All Stores
          </animated.h2>
          <Table
            columns={[
              { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
              // { Header: 'ID', accessor: 'id' },
              { Header: 'Store Name', accessor: 'name' },
              { Header: 'Location', accessor: 'address' },
            ]}
            data={stores}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, stores.length)} of {stores.length} entries
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                  {index + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showBikes && (
        <div id="bikes-section" className="mt-8">
          <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-red-500 pl-3">
            All Bikes
          </animated.h2>
          <Table
            columns={[
              { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
              { Header: 'ID', accessor: 'id' },
              { Header: 'Vehicle Number', accessor: 'vehicleRegistrationNumber' },
              { Header: 'Model', accessor: 'model' },
            ]}
            data={bikes}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, bikes.length)} of {bikes.length} entries
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                  {index + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showTodaysBookings && (
        <div id="todays-bookings-section" className="mt-8">
          <animated.h2 style={sectionHeaderAnimation} className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-blue-900 pl-3">
            Today's Bookings
          </animated.h2>
          <Table
            columns={[
              { Header: 'Sr. No.', accessor: (row, i) => i + 1 },
              { Header: 'Booking ID', accessor: 'bookingId' },
              { Header: 'User', accessor: 'userName' },
              { Header: 'Vehicle', accessor: 'vehicle' },
              { Header: 'Start Date', accessor: 'startDate' },
              { Header: 'End Date', accessor: 'endDate' },
              {
                Header: 'Total Amount',
                accessor: 'totalAmount',
                Cell: ({ value }) => `₹${Number(value).toFixed(2)}`
              },
            ]}
            data={todaysBookings}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, todaysBookings.length)} of {todaysBookings.length} entries
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-white bg-blue-900 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === index ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} onClick={() => setCurrentPage(index)}>
                  {index + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className={`px-3 py-1 rounded transition-colors duration-150 ${currentPage === totalPages - 1 ? "bg-gray-300 text-gray-500" : "bg-blue-900 text-white hover:bg-blue-600"}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <animated.button
        onClick={scrollToTop}
        style={pulseAnimation}
        className="fixed bottom-4 right-4 bg-blue-900 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 z-50 flex items-center justify-center"
      >
        <span className="text-xl">↑</span>
      </animated.button>
    </div>
  );
};

export default Home;
