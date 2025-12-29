import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // =========================
  // FORMATO FECHA INPUT (YYYY-MM-DD)
  // =========================
  const formatearFechaLocal = (fecha) => {
    const f = new Date(fecha);
    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // =========================
  // FORMATO FECHA TABLA (DD-MM-YYYY)
  // =========================
  const mostrarFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  };

  // =========================
  // FORMATO MONEDA PESOS
  // =========================
  const formatoPesos = (num) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  // =========================
  // CARGAR DASHBOARD
  // =========================
  const cargarDashboard = async (d = desde, h = hasta) => {
    if (!d || !h) {
      alert('Fechas inválidas');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
  `https://planillanegocio.onrender.com/api/dashboard?desde=${d}&hasta=${h}`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      const datosProcesados = res.data
        .filter(item => {
          const suma =
            (item.caja || 0) +
            (item.ventaEfectivo || 0) +
            (item.debito || 0) +
            (item.transferencias || 0) +
            (item.agua || 0) +
            (item.alquiler || 0) +
            (item.sueldos || 0) +
            (item.varios || 0) +
            (item.proveedoresEfectivo || 0) +
            (item.proveedoresTransferencia || 0);
          return suma > 0;
        })
        .map(item => {
          const ventaTotal =
            Number(item.ventaEfectivo || 0) +
            Number(item.debito || 0) +
            Number(item.transferencias || 0);
          return { ...item, ventaTotal };
        })
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      setDatos(datosProcesados);
    } catch (err) {
      console.error(err);
      alert('Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ELIMINAR VENTA
  // =========================
  const eliminarVenta = async (id) => {
    if (!id) return;
    if (!window.confirm('¿Seguro que quieres eliminar esta venta?')) return;

    try {
      await axios.delete(`https://planillanegocio.onrender.com/api/ventas/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});

      cargarDashboard();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la venta');
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const hoyStr = formatearFechaLocal(new Date());
    setDesde(hoyStr);
    setHasta(hoyStr);
    cargarDashboard(hoyStr, hoyStr);
  }, []);

  // =========================
  // TOTALES (SOLO SI HAY +1 DÍA)
  // =========================
  const totales = useMemo(() => {
    if (!datos || datos.length <= 1) return null;

    return datos.reduce(
      (acc, d) => {
        acc.caja += Number(d.caja || 0);
        acc.ventaEfectivo += Number(d.ventaEfectivo || 0);
        acc.debito += Number(d.debito || 0);
        acc.transferencias += Number(d.transferencias || 0);
        acc.agua += Number(d.agua || 0);
        acc.alquiler += Number(d.alquiler || 0);
        acc.sueldos += Number(d.sueldos || 0);
        acc.varios += Number(d.varios || 0);
        acc.provEfectivo += Number(d.proveedoresEfectivo || 0);
        acc.provTransferencia += Number(d.proveedoresTransferencia || 0);
        acc.ventaTotal += Number(d.ventaTotal || 0);
        return acc;
      },
      {
        caja: 0,
        ventaEfectivo: 0,
        debito: 0,
        transferencias: 0,
        agua: 0,
        alquiler: 0,
        sueldos: 0,
        varios: 0,
        provEfectivo: 0,
        provTransferencia: 0,
        ventaTotal: 0
      }
    );
  }, [datos]);

  // =========================
  // MÉTRICAS PARA CARDS (VENTAS)
  // =========================
  const metricas = useMemo(() => {
    if (!datos || datos.length === 0) return null;

    const totalVendido = datos.reduce(
      (acc, d) => acc + Number(d.ventaTotal || 0),
      0
    );

    const promedioDiario = totalVendido / datos.length;

    let mejorDia = datos[0];
    let peorDia = datos[0];

    datos.forEach(d => {
      if (d.ventaTotal > mejorDia.ventaTotal) mejorDia = d;
      if (d.ventaTotal < peorDia.ventaTotal) peorDia = d;
    });

    return {
      totalVendido,
      promedioDiario,
      mejorDia,
      peorDia
    };
  }, [datos]);

  // =========================
  // DATOS PARA GRÁFICOS
  // =========================
  const datosVentasPorDia = useMemo(() => {
    return datos.map(d => ({
      fecha: mostrarFecha(d.fecha),
      total: d.ventaTotal,
      efectivo: d.ventaEfectivo,
      debito: d.debito,
      transferencias: d.transferencias
    }));
  }, [datos]);

  const datosMediosPago = useMemo(() => {
    if (!datos || datos.length === 0) return [];

    return [
      {
        name: 'Efectivo',
        value: datos.reduce((acc, d) => acc + Number(d.ventaEfectivo || 0), 0)
      },
      {
        name: 'Débito',
        value: datos.reduce((acc, d) => acc + Number(d.debito || 0), 0)
      },
      {
        name: 'Transferencias',
        value: datos.reduce((acc, d) => acc + Number(d.transferencias || 0), 0)
      }
    ];
  }, [datos]);

  // =========================
  // FILTROS
  // =========================
  const filtrarHoy = () => {
    const hoyStr = formatearFechaLocal(new Date());
    setDesde(hoyStr);
    setHasta(hoyStr);
    cargarDashboard(hoyStr, hoyStr);
  };

  const filtrarSemana = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - hoy.getDay());
    const desdeSemana = formatearFechaLocal(primerDia);
    const hastaSemana = formatearFechaLocal(hoy);
    setDesde(desdeSemana);
    setHasta(hastaSemana);
    cargarDashboard(desdeSemana, hastaSemana);
  };

  const filtrarMes = () => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const desdeMes = formatearFechaLocal(primerDiaMes);
    const hastaMes = formatearFechaLocal(hoy);
    setDesde(desdeMes);
    setHasta(hastaMes);
    cargarDashboard(desdeMes, hastaMes);
  };

  return (
    <div className="container">
      <h2>Dashboard Ventas</h2>

      <div className="dashboard-filtros">
        <button className="btn-orange" onClick={filtrarHoy}>Hoy</button>
        <button className="btn-orange" onClick={filtrarSemana}>Semana</button>
        <button className="btn-orange" onClick={filtrarMes}>Mes</button>
      </div>

      <div className="dashboard-filtros-fechas">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <button className="btn-orange" onClick={() => cargarDashboard(desde, hasta)}>Buscar</button>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Caja</th>
              <th>Venta Efectivo</th>
              <th>Débito</th>
              <th>Transferencias</th>
              <th>Agua</th>
              <th>Alquiler</th>
              <th>Sueldos</th>
              <th>Varios</th>
              <th>Proveedores efectivo</th>
              <th>Proveedores transferencia</th>
              <th>Venta Total</th>
              <th>Eliminar</th>
            </tr>
          </thead>

          <tbody>
            {datos.length === 0 && (
              <tr>
                <td colSpan="13" className="text-center">No hay datos</td>
              </tr>
            )}

            {datos.map(d => (
              <tr key={d._id}>
                <td>{mostrarFecha(d.fecha)}</td>
                <td>{formatoPesos(d.caja)}</td>
                <td>{formatoPesos(d.ventaEfectivo)}</td>
                <td>{formatoPesos(d.debito)}</td>
                <td>{formatoPesos(d.transferencias)}</td>
                <td>{formatoPesos(d.agua)}</td>
                <td>{formatoPesos(d.alquiler)}</td>
                <td>{formatoPesos(d.sueldos)}</td>
                <td>{formatoPesos(d.varios)}</td>
                <td>{formatoPesos(d.proveedoresEfectivo)}</td>
                <td>{formatoPesos(d.proveedoresTransferencia)}</td>
                <td>{formatoPesos(d.ventaTotal)}</td>
                <td>
                  {d._id ? <button className="btn-danger" onClick={() => eliminarVenta(d._id)}>Eliminar</button> : '---'}
                </td>
              </tr>
            ))}

            {totales && (
              <tr className="dashboard-totales">
                <td>TOTAL</td>
                <td>{formatoPesos(totales.caja)}</td>
                <td>{formatoPesos(totales.ventaEfectivo)}</td>
                <td>{formatoPesos(totales.debito)}</td>
                <td>{formatoPesos(totales.transferencias)}</td>
                <td>{formatoPesos(totales.agua)}</td>
                <td>{formatoPesos(totales.alquiler)}</td>
                <td>{formatoPesos(totales.sueldos)}</td>
                <td>{formatoPesos(totales.varios)}</td>
                <td>{formatoPesos(totales.provEfectivo)}</td>
                <td>{formatoPesos(totales.provTransferencia)}</td>
                <td>{formatoPesos(totales.ventaTotal)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* =========================
          SECCIÓN DASHBOARD
      ========================= */}
      <div className="dashboard-section">

        {/* CARDS */}
        {metricas && (
          <div className="dashboard-cards">
            <div className="card">
              <h4>Total vendido</h4>
              <p>{formatoPesos(metricas.totalVendido)}</p>
            </div>

            <div className="card">
              <h4>Promedio diario</h4>
              <p>{formatoPesos(metricas.promedioDiario)}</p>
            </div>

            <div className="card">
              <h4>Mejor día</h4>
              <p>{mostrarFecha(metricas.mejorDia.fecha)}</p>
              <strong>{formatoPesos(metricas.mejorDia.ventaTotal)}</strong>
            </div>

            <div className="card">
              <h4>Peor día</h4>
              <p>{mostrarFecha(metricas.peorDia.fecha)}</p>
              <strong>{formatoPesos(metricas.peorDia.ventaTotal)}</strong>
            </div>
          </div>
        )}

        {/* GRÁFICOS */}
        <div className="dashboard-charts">
          {/* 📈 LÍNEA – VENTA TOTAL POR DÍA */}
          <div className="card chart-card">
            <h4>Venta total por día</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosVentasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatoPesos(value)} />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 📈 LÍNEA – VENTAS POR TIPO */}
          <div className="card chart-card">
            <h4>Ventas por tipo</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosVentasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatoPesos(value)} />
                <Line type="monotone" dataKey="efectivo" stroke="#0088FE" name="Efectivo" />
                <Line type="monotone" dataKey="debito" stroke="#00C49F" name="Débito" />
                <Line type="monotone" dataKey="transferencias" stroke="#FFBB28" name="Transferencias" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 🥧 TORTA – MEDIOS DE PAGO */}
          <div className="card chart-card">
            <h4>Medios de pago</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosMediosPago}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {datosMediosPago.map((_, index) => (
                    <Cell key={index} fill={['#0088FE', '#00C49F', '#FFBB28'][index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatoPesos(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
