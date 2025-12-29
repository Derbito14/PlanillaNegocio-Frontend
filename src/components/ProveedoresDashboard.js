import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';

function ProveedoresDashboard() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('Todos');
  const [proveedoresLista, setProveedoresLista] = useState([]);

  const token = localStorage.getItem('token');

  const formatearFechaLocal = (fecha) => {
    const f = new Date(fecha);
    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const mostrarFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatoPesos = (num) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  const cargarProveedores = async () => {
    try {
      const res = await axios.get('https://planillanegocio.onrender.com/api/proveedores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProveedoresLista(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarProveedoresDashboard = async (d = desde, h = hasta, proveedor = proveedorSeleccionado) => {
    if (!d || !h) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://planillanegocio.onrender.com/api/proveedores/dashboard?desde=${d}&hasta=${h}`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      let datosProcesados = res.data.map(item => {
        const total = Number(item.totalEfectivo || 0) + Number(item.totalTransferencia || 0);
        return { ...item, total };
      });

      if (proveedor !== 'Todos') {
        datosProcesados = datosProcesados.map(d => {
          const prov = d.proveedores[proveedor] || { efectivo: 0, transferencia: 0 };
          return {
            fecha: d.fecha,
            proveedores: { [proveedor]: prov },
            totalEfectivo: prov.efectivo,
            totalTransferencia: prov.transferencia,
            total: prov.efectivo + prov.transferencia
          };
        });
      }

      datosProcesados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setDatos(datosProcesados);
    } catch (err) {
      console.error(err);
      alert('Error al cargar dashboard de proveedores');
    } finally {
      setLoading(false);
    }
  };

  const filtrarHoy = () => {
    const hoyStr = formatearFechaLocal(new Date());
    setDesde(hoyStr);
    setHasta(hoyStr);
    cargarProveedoresDashboard(hoyStr, hoyStr, proveedorSeleccionado);
  };

  const filtrarSemana = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - hoy.getDay());
    const desdeSemana = formatearFechaLocal(primerDia);
    const hastaSemana = formatearFechaLocal(hoy);
    setDesde(desdeSemana);
    setHasta(hastaSemana);
    cargarProveedoresDashboard(desdeSemana, hastaSemana, proveedorSeleccionado);
  };

  const filtrarMes = () => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const desdeMes = formatearFechaLocal(primerDiaMes);
    const hastaMes = formatearFechaLocal(hoy);
    setDesde(desdeMes);
    setHasta(hastaMes);
    cargarProveedoresDashboard(desdeMes, hastaMes, proveedorSeleccionado);
  };

  useEffect(() => {
    const hoyStr = formatearFechaLocal(new Date());
    setDesde(hoyStr);
    setHasta(hoyStr);
    cargarProveedoresDashboard(hoyStr, hoyStr);
    cargarProveedores();
  }, []);

  const totales = useMemo(() => {
    if (!datos || datos.length === 0) return null;
    const totalPagado = datos.reduce((acc, d) => acc + Number(d.total || 0), 0);
    const promedioDiario = totalPagado / datos.length;
    let mayor = datos[0];
    let menor = datos[0];
    datos.forEach(d => {
      if (d.total > mayor.total) mayor = d;
      if (d.total < menor.total) menor = d;
    });
    return { totalPagado, promedioDiario, mayor, menor, diasConGasto: datos.length };
  }, [datos]);

  const datosLineal = useMemo(() => datos.map(d => ({ fecha: mostrarFecha(d.fecha), total: d.total })), [datos]);

  const datosTorta = useMemo(() => [
    { name: 'Efectivo', value: datos.reduce((acc, d) => acc + Number(d.totalEfectivo || 0), 0) },
    { name: 'Transferencia', value: datos.reduce((acc, d) => acc + Number(d.totalTransferencia || 0), 0) }
  ], [datos]);

  const datosProveedores = useMemo(() => {
    if (proveedorSeleccionado !== 'Todos') return [];
    const mapa = {};
    datos.forEach(d => {
      Object.keys(d.proveedores).forEach(nombre => {
        const totalProveedor = d.proveedores[nombre].efectivo + d.proveedores[nombre].transferencia;
        if (!mapa[nombre]) mapa[nombre] = 0;
        mapa[nombre] += totalProveedor;
      });
    });
    return Object.keys(mapa).map(nombre => ({ name: nombre, value: mapa[nombre] }));
  }, [datos, proveedorSeleccionado]);

  return (
    <div className="container">
      <h2>Dashboard Proveedores</h2> <br></br>

      <div className="dashboard-filtros">
        <button className="btn-orange" onClick={filtrarHoy}>Hoy</button>
        <button className="btn-orange" onClick={filtrarSemana}>Semana</button>
        <button className="btn-orange" onClick={filtrarMes}>Mes</button>
      </div>

      <div className="dashboard-filtros-fechas">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <select
          className="dashboard-select"
          value={proveedorSeleccionado}
          onChange={e => {
            setProveedorSeleccionado(e.target.value);
            cargarProveedoresDashboard(desde, hasta, e.target.value);
          }}
        >
          <option>Todos</option>
          {proveedoresLista.map(p => <option key={p._id}>{p.nombre}</option>)}
        </select>

        <button className="btn-orange" onClick={() => cargarProveedoresDashboard(desde, hasta, proveedorSeleccionado)}>Buscar</button>
      </div>

      {loading && <p>Cargando...</p>}

      {totales && (
        <div className="dashboard-cards">
          <div className="card">
            <h4>Total pagado</h4>
            <p>{formatoPesos(totales.totalPagado)}</p>
          </div>
          <div className="card">
            <h4>Promedio diario</h4>
            <p>{formatoPesos(totales.promedioDiario)}</p>
          </div>
          <div className="card">
            <h4>Mayor gasto</h4>
            <p>{mostrarFecha(totales.mayor.fecha)}</p>
            <strong>{formatoPesos(totales.mayor.total)}</strong>
          </div>
          <div className="card">
            <h4>Menor gasto</h4>
            <p>{mostrarFecha(totales.menor.fecha)}</p>
            <strong>{formatoPesos(totales.menor.total)}</strong>
          </div>
          <div className="card">
            <h4>Días con gasto</h4>
            <p>{totales.diasConGasto}</p>
          </div>
        </div>
      )}

      <div className="dashboard-charts">
        <div className="card chart-card">
          <h4>Gasto total por día</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosLineal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => formatoPesos(value)} />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h4>Proporción por tipo de pago</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={datosTorta} dataKey="value" nameKey="name" outerRadius={100} label>
                {datosTorta.map((_, index) => (
                  <Cell key={index} fill={['#0088FE', '#00C49F'][index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatoPesos(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {datosProveedores.length > 0 && (
          <div className="card chart-card">
            <h4>Proporción por proveedor</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={datosProveedores} dataKey="value" nameKey="name" outerRadius={100} label>
                  {datosProveedores.map((_, index) => (
                    <Cell key={index} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatoPesos(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProveedoresDashboard;
