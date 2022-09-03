import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";
import Footer from "./components/footer"

function App() {
        return (
            <Router>
                <div>
                    <div>
                        <NavigationBar/>
                    </div>

                    <Routes>
                        <Route path="/worksheet" element={<Worksheet />}/>
                        <Route path="/pallet-label" element={<PalletLabel />}/>
                        <Route path="/scale-login" element={<Scale />}/>
                        <Route path="/" element={<Navigate to="/worksheet" replace/>}/>
                        <Route path="*" element={<Navigate to="/worksheet" replace/>}/>
                    </Routes>

                    <div>
                        <Footer />
                    </div>
                </div>
            </Router>
        );
}

export default App;
