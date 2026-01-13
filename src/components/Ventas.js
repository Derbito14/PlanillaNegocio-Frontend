import React, { useState } from 'react';
import axios from 'axios';

function Ventas() {
  // Fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const [fecha, setFecha] = useState(fechaHoy);
  const [caja, setCaja] = useState('');
  const [debito, setDebito] = useState('');
  const [transferencias, setTransferencias] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const fechaArgentina = new Date(fecha + 'T00:00:00-03:00');

      await axios.post('https://planillanegocio.onrender.com/api/ventas', {
        fecha: fechaArgentina,
        caja: Number(caja),
        debito: Number(debito),
        transferencias: Number(transferencias)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });


      setMensaje('Venta guardada correctamente!');
      setCaja(''); setDebito(''); setTransferencias('');
    } catch (err) {
      console.error(err);
      setMensaje('Error al guardar la venta');
    }
  };

  return (
    <div className="ventas-container">
      <h2>Agregar Venta  </h2> <br></br>
      {mensaje && <p>{mensaje}</p>}

      <form onSubmit={handleSubmit} className="ventas-form">

        <div>
          <label>Fecha:</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>

        <div>
          <label>Caja:</label>
          <input type="number" value={caja} onChange={e => setCaja(e.target.value)} required />
        </div>

        <div>
          <label>Débito:</label>
          <input type="number" value={debito} onChange={e => setDebito(e.target.value)} required />
        </div>

        <div>
          <label>Transferencias:</label>
          <input type="number" value={transferencias} onChange={e => setTransferencias(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-orange">Guardar Venta</button>
      </form>
    </div>
  );
}

export default Ventas;
