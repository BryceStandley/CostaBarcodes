import './App.css';
import NavigationBar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import Worksheet from "./pages/Worksheet";
import PalletLabel from "./pages/Pallet-label";
import Scale from "./pages/Scale";

function App() {
        return (
            <Router>
                <div>
                    <NavigationBar/>

                    <Routes>
                        <Route path="/" element={<Navigate to="/worksheet" replace/>}/>
                        <Route path="/worksheet" element={<Worksheet />}/>
                        <Route path="/pallet-label" element={<PalletLabel />}/>
                        <Route path="/scale" element={<Scale />}/>
                    </Routes>
                </div>
            </Router>
        );
}

export default App;
