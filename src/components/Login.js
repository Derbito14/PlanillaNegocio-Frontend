import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo from '../logo.png';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
     const response = await axios.post('https://planillanegocio.onrender.com/api/login', {
  usuario: usuario.toLowerCase(),
  password,
});

      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', usuario); // <-- NUEVO: guardamos el usuario

      setError('');
      navigate('/ventas');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Usuario o contraseña incorrecta');
      } else {
        setError('Error en el servidor, intenta más tarde');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header">Planilla Negocio</div>
        <img src={logo} alt="Logo" className="logo" />

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Ingresar</button>
      </div>
    </div>
  );
}

export default Login;
