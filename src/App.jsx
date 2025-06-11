import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Bikes from "./pages/Bikes";
import DeliveryAtLocationPrices from "./pages/PriceMaster/DeliveryAtLocationPrices";
import PickUpTariffPlan from "./pages/PriceMaster/PickUpTariffPlan";
import AllCategories from "./pages/MasterRecords/AllCategories";
import AllBrands from "./pages/MasterRecords/AllBrands";
import AllModels from "./pages/MasterRecords/AllModels";
import AllBookings from "./pages/AllBookings";
import StoreMaster from "./pages/StoreMaster";
import AllUsers from "./pages/AllUsers";
import AllOffers from "./pages/AllOffers";
import AllRegisterCustomers from "./pages/AllRegisterCustomers";
import BookingReport from "./pages/AllReport/BookingReport";
import GstReport from "./pages/AllReport/GstReport";
import SalesReport from "./pages/AllReport/SalesReport";
import Login from "./pages/AdminLogin";
import BookingDetailPage from "./subpages/BookingDetails";
import StoreManager from "./pages/StoreManager";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>

        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path="allBikes" element={<Bikes />}></Route>
          <Route path="allBookings" element={<AllBookings />}></Route>
          <Route path="allBookings/:bookingId" element={<BookingDetailPage />} />
          <Route path="storeMaster" element={<StoreMaster />}></Route>
          <Route path="storeManager" element={<StoreManager/>}></Route>
          <Route path="allUsers" element={<AllUsers />}></Route>
          <Route path="allOffers" element={<AllOffers />}></Route>

          {/* Submenu Routes  */}
          <Route path="priceMaster/deliveryAtLocationPrices" element={<DeliveryAtLocationPrices />}></Route>
          <Route path="priceMaster/pickUpTariffPlan" element={<PickUpTariffPlan />}></Route>
          <Route path="masterRecords/allCategories" element={<AllCategories />}></Route>
          <Route path="masterRecords/allBrands" element={<AllBrands />}></Route>
          <Route path="masterRecords/allModels" element={<AllModels />}></Route>
          <Route path="allRegisterCustomers" element={<AllRegisterCustomers />}></Route>
          <Route path="allReport/bookingReport" element={<BookingReport />}></Route>
          <Route path="allReport/gstReport" element={<GstReport />}></Route>
          <Route path="allReport/salesReport" element={<SalesReport />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
