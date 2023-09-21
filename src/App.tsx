import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from "react";
import { useMediaQuery } from 'react-responsive'
import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";
import LocationSign from './pages/LocationSign'
import BarcodeGen from './pages/Barcode-Gen';
import DeliveryBookings from 'pages/DeliveryBookings';
import MobileNavigationBar from 'components/navbar_mobile';

function App() {

        const isDesktopOrLaptop = useMediaQuery({query: '(min-width: 1224px)'})
        const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' })
        const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
        const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
        const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })

        return (
                <Router>
                        <main id="outer-container">
                                <div className="d-flex flex-row mainPage">
                                        { isTabletOrMobile && <MobileNavigationBar/>}
                                        { isDesktopOrLaptop && <NavigationBar/> }
                                        <div className="d-flex flex-column mainContent" id="page-wrap">
                                                <Routes>
                                                        <Route path="/bookings" element={<DeliveryBookings /> }/>
                                                        <Route path="/worksheet" element={<Worksheet /> }/>
                                                        <Route path="/pallet-label" element={ <PalletLabel /> }/>
                                                        <Route path="/scale-login" element={ <Scale /> }/>
                                                        <Route path="/ltbarcode" element={ <BarcodeGen /> }/>
                                                        <Route path="/location-sign" element={<LocationSign />} />
                                                        <Route path="/" element={<Navigate to="/bookings" replace/>}/>
                                                        <Route path="*" element={<Navigate to="/bookings" replace/>}/>
                                                </Routes>
                                        </div>
                                </div>
                        </main>
                </Router>
        );
}

export default App;
