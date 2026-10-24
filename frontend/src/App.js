import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Licorera from "./Pages/Licorera";
import Tienda from "./Pages/Tienda";
import Papeleria from "./Pages/Papeleria";
import PedidoPublico from "./Pages/PedidoPublico";
import HistorialVentas from "./Pages/HistorialVentas";
import HistorialMovimientos from "./Pages/HistorialMovimientos"; // ✅ IMPORTANTE

function App() {
    const [logueado, setLogueado] = useState(false);

    const logout = () => {
        localStorage.removeItem("token");
        setLogueado(false);
    };

    return (
        <Router>
            <div>
                <Routes>
                    {/* PÚBLICA */}
                    <Route path="/catalogo" element={<PedidoPublico />} />

                    {/* LOGIN */}
                    <Route path="/login" element={!logueado ? <Login setLogueado={setLogueado} /> : <Dashboard logout={logout} />} />

                    {/* PRIVADAS */}
                    <Route path="/" element={!logueado ? <Login setLogueado={setLogueado} /> : <Dashboard logout={logout} />} />
                    <Route path="/dashboard" element={!logueado ? <Login setLogueado={setLogueado} /> : <Dashboard logout={logout} />} />
                    <Route path="/licorera" element={!logueado ? <Login setLogueado={setLogueado} /> : <Licorera />} />
                    <Route path="/tienda" element={!logueado ? <Login setLogueado={setLogueado} /> : <Tienda />} />
                    <Route path="/papeleria" element={!logueado ? <Login setLogueado={setLogueado} /> : <Papeleria />} />
                    <Route path="/historial" element={!logueado ? <Login setLogueado={setLogueado} /> : <HistorialVentas />} />
                    <Route path="/movimientos" element={!logueado ? <Login setLogueado={setLogueado} /> : <HistorialMovimientos />} />

                    {/* Comodín */}
                    <Route path="*" element={!logueado ? <Login setLogueado={setLogueado} /> : <Dashboard logout={logout} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;