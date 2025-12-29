import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Ventas from './components/Ventas';
import Proveedores from './components/Proveedores';
import Dashboard from './components/Dashboard';
import ProveedoresDashboard from './components/ProveedoresDashboard';
import PrivateRoute from './components/PrivateRoute'; // <-- importamos PrivateRoute
import './components/global.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas internas protegidas */}
        <Route
          path="/ventas"
          element={
            <PrivateRoute>
              <Navbar />
              <Ventas />
            </PrivateRoute>
          }
        />

        <Route
          path="/proveedores"
          element={
            <PrivateRoute>
              <Navbar />
              <Proveedores />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/proveedores-dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <ProveedoresDashboard />
            </PrivateRoute>
          }
        />

        {/* Redirige cualquier otra ruta al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
