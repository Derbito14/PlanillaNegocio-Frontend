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
  const [agua, setAgua] = useState('');
  const [alquiler, setAlquiler] = useState('');
  const [sueldos, setSueldos] = useState('');
  const [varios, setVarios] = useState('');
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
        transferencias: Number(transferencias),
        agua: Number(agua),
        alquiler: Number(alquiler),
        sueldos: Number(sueldos),
        varios: Number(varios)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });


      setMensaje('Venta guardada correctamente!');
      setCaja(''); setDebito(''); setTransferencias('');
      setAgua(''); setAlquiler(''); setSueldos(''); setVarios('');
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

        <div>
          <label>Agua:</label>
          <input type="number" value={agua} onChange={e => setAgua(e.target.value)} required />
        </div>

        <div>
          <label>Alquiler:</label>
          <input type="number" value={alquiler} onChange={e => setAlquiler(e.target.value)} required />
        </div>

        <div>
          <label>Sueldos:</label>
          <input type="number" value={sueldos} onChange={e => setSueldos(e.target.value)} required />
        </div>

        <div>
          <label>Varios:</label>
          <input type="number" value={varios} onChange={e => setVarios(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-orange">Guardar</button>
      </form>
    </div>
  );
}

export default Ventas;
