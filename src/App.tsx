import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from "react";
import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";
import LocationSign from './pages/LocationSign'
import BarcodeGen from './pages/Barcode-Gen';
import CodeViewer from './pages/CodeViewer';
import DeliveryBookings from 'pages/DeliveryBookings';

function App() {
        return (
                <Router>
                        <main>
                                <div className="d-flex flex-row mainPage">
                                        <NavigationBar/>
                                        <div className="d-flex flex-column mainContent">
                                                <Routes>
                                                        <Route path="/bookings" element={<DeliveryBookings /> }/>
                                                        <Route path="/worksheet" element={<Worksheet /> }/>
                                                        <Route path="/pallet-label" element={ <PalletLabel /> }/>
                                                        <Route path="/scale-login" element={ <Scale /> }/>
                                                        <Route path="/ltbarcode" element={ <BarcodeGen /> }/>
                                                        <Route path="/code" element={ <CodeViewer /> }/>
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
