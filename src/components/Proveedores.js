import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [nuevoProveedor, setNuevoProveedor] = useState('');
  const [mensaje, setMensaje] = useState('');

  // ====== GASTOS ======
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const [fecha, setFecha] = useState(fechaHoy);

  const [proveedorGasto, setProveedorGasto] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('Efectivo');

  const token = localStorage.getItem('token');

  // =========================
  // Inicializar "Adelanto caja"
  // =========================
  const inicializarAdelantoCaja = async () => {
    try {
      await axios.post('https://planillanegocio.onrender.com/api/proveedores/init-adelanto-caja', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error al inicializar Adelanto caja:', err);
    }
  };

  // =========================
  // Cargar proveedores
  // =========================
  const cargarProveedores = async () => {
    try {
      const res = await axios.get('https://planillanegocio.onrender.com/api/proveedores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProveedores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    inicializarAdelantoCaja().then(() => cargarProveedores());
  }, []);

  // =========================
  // Guardar GASTO proveedor
  // =========================
  const guardarGasto = async () => {
    if (!fecha || !proveedorGasto || !monto || !tipo) {
      setMensaje('Completá todos los datos del gasto');
      return;
    }

    try {
      await axios.post(
        'https://planillanegocio.onrender.com/api/proveedores/gastos',
        {
          fecha,
          proveedor: proveedorGasto,
          monto,
          tipo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      setFecha(fechaHoy);
      setProveedorGasto('');
      setMonto('');
      setTipo('Efectivo');
      setMensaje('Gasto guardado correctamente');
    } catch (err) {
      console.error(err);
      setMensaje('Error al guardar gasto');
    }
  };

  // =========================
  // Crear proveedor
  // =========================
  const guardarProveedor = async () => {
    if (!nuevoProveedor.trim()) return;

    try {
      await axios.post(
        'https://planillanegocio.onrender.com/api/proveedores',
        { nombre: nuevoProveedor },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      setNuevoProveedor('');
      setMensaje('Proveedor agregado correctamente');
      cargarProveedores();
    } catch (err) {
      console.error(err);
      setMensaje('Error al agregar proveedor');
    }
  };

  // =========================
  // Eliminar proveedor
  // =========================
  const eliminarProveedor = async () => {
    if (!proveedorSeleccionado) return;

    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este proveedor? Solo se puede si no tiene registros.'
    );

    if (!confirmar) return;

    try {
      await axios.delete(
        `https://planillanegocio.onrender.com/api/proveedores/${proveedorSeleccionado}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProveedorSeleccionado('');
      setMensaje('Proveedor eliminado correctamente');
      cargarProveedores();
    } catch (err) {
      console.error(err);
      setMensaje(
        err.response?.data?.message ||
        'No se puede eliminar el proveedor'
      );
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="proveedores-container">
      <h2>Gastos de Proveedores</h2><br></br>

      {mensaje && <p>{mensaje}</p>}

      {/* ===== FORM GASTO ===== */}
      <div className="proveedores-form">
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div>
          <label>Proveedor</label>
          <select
            value={proveedorGasto}
            onChange={(e) => setProveedorGasto(e.target.value)}
          >
            <option value="">-- Seleccionar proveedor --</option>
            {proveedores.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Monto</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>

        <div>
          <label>Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-orange"
          onClick={guardarGasto}
        >
          Guardar gasto
        </button>
      </div>

      <hr />

      {/* ===== GESTIÓN PROVEEDORES ===== */}
      <h3>Gestión de proveedores</h3>

      <div className="proveedores-form">
        <div>
          <label>Proveedor</label>
          <select
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccionar proveedor --</option>
            {proveedores.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {proveedorSeleccionado && (() => {
          const proveedor = proveedores.find(p => p._id === proveedorSeleccionado);
          const esProtegido = proveedor?.esAdelantoCaja || proveedor?.esProveedorProtegido || false;

          if (esProtegido) {
            return <p style={{ color: '#ff7f50', fontWeight: 'bold' }}>⚠️ {proveedor.nombre} es un proveedor protegido del sistema y no se puede eliminar</p>;
          }

          return (
            <button
              type="button"
              className="btn btn-danger"
              onClick={eliminarProveedor}
            >
              Eliminar proveedor
            </button>
          );
        })()}

        <div>
          <label>Nuevo proveedor</label>
          <input
            type="text"
            value={nuevoProveedor}
            onChange={(e) => setNuevoProveedor(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn"
          onClick={guardarProveedor}
        >
          Agregar proveedor
        </button>
      </div>
    </div>
  );
}

export default Proveedores;
