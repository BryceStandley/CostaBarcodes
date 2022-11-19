import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from "react";
import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";
import Footer from "./components/footer"
import BarcodeGen from './pages/Barcode-Gen';
import { Worker } from "@react-pdf-viewer/core";

function App() {
        return (
            <Router>
                <main>
                    <div className="d-flex flex-row mainPage">
                        <NavigationBar/>

                        <div className="d-flex flex-column mainContent">
                            <Routes>
                                    <Route path="/worksheet" element={
                                        <Worker workerUrl={process.env.PUBLIC_URL +'/assets/js/pdf.worker.js'}>
                                            <Worksheet />
                                        </Worker>
                                    }/>
                                    <Route path="/pallet-label" element={
                                        <Worker workerUrl={process.env.PUBLIC_URL +'/assets/js/pdf.worker.js'}>
                                            <PalletLabel />
                                        </Worker>
                                    }/>
                                    <Route path="/scale-login" element={
                                        <Worker workerUrl={process.env.PUBLIC_URL +'/assets/js/pdf.worker.js'}>
                                            <Scale />
                                        </Worker>
                                    }/>
                                    <Route path="/ltbarcode" element={
                                        <Worker workerUrl={process.env.PUBLIC_URL +'/assets/js/pdf.worker.js'}>
                                            <BarcodeGen />
                                        </Worker>
                                    }/>
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
