import React, { useState, useEffect, useRef } from "react";
import { IoLayersOutline, IoPricetagsOutline } from "react-icons/io5";
import { LuBox, LuUsers2, LuChevronRight, LuMenu } from "react-icons/lu";
import { RiMotorbikeLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import { TbBrandBooking, TbReportSearch } from "react-icons/tb";
import Header from "./Header";

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState(0);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on small screens
      if (window.innerWidth < 640) {
        setIsDesktopCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setOpenSubmenus({}); // Close all submenus
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const currentPath = location.pathname;
    const findActiveLinkIndex = () => {
      for (let i = 0; i < SIDEBAR_LINKS.length; i++) {
        const link = SIDEBAR_LINKS[i];
        if (link.path === currentPath) {
          return i;
        }
        if (link.submenu) {
          const submenuMatch = link.submenu.findIndex(item => item.path === currentPath);
          if (submenuMatch !== -1) {
            setOpenSubmenus(prev => ({ ...prev, [i]: true }));
            return i;
          }
        }
      }
      return 0;
    };
    setActiveLink(findActiveLinkIndex());
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLinkClick = (index, path) => {
    setActiveLink(index);
    if (windowWidth < 768) {
      setIsMenuOpen(false);
    }
    
    // Check if we're already on the same path
    if (path && path === location.pathname) {
      // Reload the page
      window.location.reload();
    } else if (path) {
      // Normal navigation
      navigate(path);
    }
  };

  const toggleSubmenu = (index) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  const SIDEBAR_LINKS = [
    { id: 1, path: "/dashboard", name: "Dashboard", icon: LuBox },
    { id: 7, path: "/dashboard/allBookings", name: "All Bookings", icon: TbBrandBooking },
    { id: 2, path: "/dashboard/storeMaster", name: "Store Master", icon: MdOutlineLocalGroceryStore },
    { id: 3, path: "/dashboard/allBikes", name: "All Bikes", icon: RiMotorbikeLine },
    { id: 4, name: "Price Master", icon: IoLayersOutline,
      submenu: [
        // { id: 41, path: "/dashboard/priceMaster/deliveryAtLocationPrices", name: "Delivery" },
        { id: 42, path: "/dashboard/priceMaster/PickUpTariffPlan", name: "Pick Up" },
      ],
    },
    { id: 5, name: "Master Records", icon: IoLayersOutline,
      submenu: [
        { id: 52, path: "/dashboard/masterRecords/allBrands", name: "All Brands" },
        { id: 51, path: "/dashboard/masterRecords/allCategories", name: "All Categories" },
        { id: 53, path: "/dashboard/masterRecords/allModels", name: "All Models" },
      ],
    },
    // { id: 6, path: "/dashboard/allOffers", name: "All Offers", icon: IoPricetagsOutline },
    // { id: 9, path: "/dashboard/storeManager", name: "Store Manager ", icon: LuUsers2 },
    { id: 10, path: "/dashboard/allRegisterCustomers", name: "All Registered Customers", icon: LuUsers2 },
    // { id: 10, name: "All Reports", icon: TbReportSearch,
    //   submenu: [
    //     { id: 101, path: "/dashboard/allReport/bookingReport", name: "Booking Report" },
    //     { id: 102, path: "/dashboard/allReport/salesReport", name: "Sales Report" },
    //     { id: 103, path: "/dashboard/allReport/gstReport", name: "GST Report" },
    //   ],
    // },
  ];

  return (
    <>
      {/* Responsive Header Bar */}
      <div className="fixed h-20 top-0 left-0 z-30 w-full bg-blue-900 flex justify-between items-center px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={windowWidth < 768 ? toggleMenu : toggleDesktopSidebar}
            className="text-white p-2 rounded-md hover:bg-blue-800 transition-colors mr-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col items-end justify-center gap-1.5">
              <span className={`bg-white h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen && windowWidth < 768 ? 'w-6 transform rotate-45 translate-y-2' : 'w-6'
              }`}></span>
              <span className={`bg-white h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen && windowWidth < 768 ? 'opacity-0' : 'w-4'
              }`}></span>
              <span className={`bg-white h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen && windowWidth < 768 ? 'w-6 transform -rotate-45 -translate-y-2' : 'w-5'
              }`}></span>
            </div>
          </button>
          <h1 className="text-white font-bold text-lg">
            OKBIKE
          </h1>
        </div>

        {/* Add responsive header actions here if needed */}
        <div className="flex items-center">
          {/* Example: User profile or notification icons */}
          <Header></Header>
        </div>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      {/* Sidebar navigation */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-20 bg-blue-900 flex flex-col transition-all duration-300 ease-in-out
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isDesktopCollapsed ? 'md:w-20' : 'md:w-72'}
                    pt-16
                    ${isMenuOpen ? 'w-3/4 sm:w-64' : 'w-0'}`}
      >
        <div className="flex-grow py-10 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="py-2 px-2">
            <ul className="space-y-1">
              {SIDEBAR_LINKS.map((link, index) => (
                <li key={index}>
                  {!link.submenu ? (
                    <Link
                      to={link.path}
                      className={`flex items-center py-3 px-3 rounded-lg hover:bg-indigo-700 ${activeLink === index ? 'bg-indigo-600 text-white' : 'text-indigo-100'}`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default Link behavior
                        handleLinkClick(index, link.path);
                      }}
                    >
                      <div className={`flex items-center ${isDesktopCollapsed && windowWidth >= 768 ? 'justify-center' : ''}`}>
                        <span className="text-xl">{link.icon && React.createElement(link.icon, { size: isDesktopCollapsed && windowWidth >= 768 ? 22 : 18 })}</span>
                        <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isDesktopCollapsed && windowWidth >= 768 ? 'hidden' : ''}`}>
                          {link.name}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(index)}
                        className={`w-full flex items-center justify-between py-3 px-3 rounded-lg hover:bg-indigo-700 ${
                          (activeLink === index || openSubmenus[index]) ? 'bg-indigo-600 text-white' : 'text-indigo-100'
                        }`}
                      >
                        <div className={`flex items-center ${isDesktopCollapsed && windowWidth >= 768 ? 'justify-center' : ''}`}>
                          <span className="text-xl">{link.icon && React.createElement(link.icon, { size: isDesktopCollapsed && windowWidth >= 768 ? 22 : 18 })}</span>
                          <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isDesktopCollapsed && windowWidth >= 768 ? 'hidden' : ''}`}>
                            {link.name}
                          </span>
                        </div>
                        {(!isDesktopCollapsed || windowWidth < 768) && (
                          <LuChevronRight size={16} className={`transform transition-transform ${openSubmenus[index] ? 'rotate-90' : ''}`} />
                        )}
                      </button>

                      {/* Submenu Dropdown */}
                      {openSubmenus[index] && (!isDesktopCollapsed || windowWidth < 768) && (
                        <div className="mt-1 pl-2 space-y-1 ml-8 border-l border-indigo-700/50">
                          {link.submenu.map((subitem) => (
                            <Link
                              key={subitem.id}
                              to={subitem.path}
                              className="block py-2 px-3 text-sm text-indigo-200 hover:text-white rounded hover:bg-indigo-700/50 transition-colors whitespace-nowrap"
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default Link behavior
                                handleLinkClick(index, subitem.path);
                              }}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Popup submenu for collapsed desktop view */}
                      {isDesktopCollapsed && windowWidth >= 768 && (
                        <div className="group relative">
                          {link.submenu.map((subitem) => (
                            <Link
                              key={subitem.id}
                              to={subitem.path}
                              className="hidden group-hover:block absolute left-full top-0 ml-2 px-4 py-2 bg-blue-800 text-white rounded whitespace-nowrap"
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default Link behavior
                                handleLinkClick(index, subitem.path);
                              }}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Optional: Footer for sidebar - Fixed to properly hide on mobile */}
        {((windowWidth >= 768 && !isDesktopCollapsed) || (windowWidth < 768 && isMenuOpen)) && (
          <div className="p-4 border-t border-indigo-800">
            <div className="text-xs text-indigo-300 text-center">
              OKBIKES ADMIN © 2025
            </div>
          </div>
        )}

        {/* Hide scrollbar for all browsers */}
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'md:ml-20' : 'md:ml-72'} pt-16`}>
        {/* Your main content goes here */}
      </div>
    </>
  );
};

export default Sidebar;