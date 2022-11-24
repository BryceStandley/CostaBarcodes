import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from "react";
import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";
import LocationSign from './pages/LocationSign'
import BarcodeGen from './pages/Barcode-Gen';

function App() {
        return (
            <Router>
                <main>
                    <div className="d-flex flex-row mainPage">
                        <NavigationBar/>

                        <div className="d-flex flex-column mainContent">
                            <Routes>
                                    <Route path="/worksheet" element={
                                            <Worksheet />
                                    }/>
                                    <Route path="/pallet-label" element={
                                            <PalletLabel />
                                    }/>
                                    <Route path="/scale-login" element={
                                            <Scale />
                                    }/>
                                    <Route path="/ltbarcode" element={
                                            <BarcodeGen />
                                    }/>

                                    <Route path="/location-sign" element={<LocationSign />} />
                                    
                                    <Route path="/" element={<Navigate to="/worksheet" replace/>}/>
                                    <Route path="*" element={<Navigate to="/worksheet" replace/>}/>
                            </Routes>
                        </div>
                    </div>
                </main>
            </Router>
        );
}

export default App;
