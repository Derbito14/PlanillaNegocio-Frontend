import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const usuarioRaw = localStorage.getItem('usuario') || 'Usuario';
  const usuario = usuarioRaw.charAt(0).toUpperCase() + usuarioRaw.slice(1);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-user">Hola {usuario} 👋</span>
      </div>

      {/* Botón hamburguesa */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
      </div>

      <div className={`navbar-right ${isOpen ? 'open' : ''}`}>
        <Link to="/ventas" className={isActive('/ventas') ? 'active' : ''}>
          Ventas
        </Link>
        <Link to="/proveedores" className={isActive('/proveedores') ? 'active' : ''}>
          Proveedores
        </Link>
        <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
          Dashboard
        </Link>
        <Link
          to="/proveedores-dashboard"
          className={isActive('/proveedores-dashboard') ? 'active' : ''}>
          Proveedores
        </Link>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
