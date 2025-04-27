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
import FreshToGo from './pages/FreshToGo';

const App : React.FC = () => {

        const isDesktopOrLaptop = useMediaQuery({query: '(min-width: 1224px)'})

        return (
			<Router>
				<main id="outer-container" style={{height: '100%'}}>
					<div className="d-flex flex-row mainPage">
						{ isDesktopOrLaptop ? <NavigationBar/> : <MobileNavigationBar/>}
						<div className="d-flex flex-column mainContent" id="page-wrap">
							<Routes>
								<Route path="/bookings" element={<DeliveryBookings /> }/>
								<Route path="/fresh-to-go" element={<FreshToGo />} />
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
