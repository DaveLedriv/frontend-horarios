import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useDocentes } from '../../hooks/useDocentes';

interface BloqueDisponible {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export default function VerDisponibilidad() {
  const { docentes } = useDocentes();
  const [docenteId, setDocenteId] = useState('');
  const [dia, setDia] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<BloqueDisponible[]>([]);
  const [error, setError] = useState('');

  const obtenerDisponibilidad = async () => {
  if (!docenteId) return;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/disponibilidad/docente/${docenteId}`
    );
    setDisponibilidad(res.data.disponibles);
    setError('');
  } catch (err) {
    console.error(err);
    setError('Error al cargar disponibilidad');
  }
};


  useEffect(() => {
    obtenerDisponibilidad();
  }, [docenteId, dia, desde, hasta]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">Disponibilidad de Docentes</h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={docenteId}
            onChange={(e) => setDocenteId(e.target.value)}
          >
            <option value="">Seleccionar docente</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nombre}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          >
            <option value="">Todos los días</option>
            {['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <input
            type="time"
            className="border rounded px-3 py-2"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            placeholder="Desde"
          />

          <input
            type="time"
            className="border rounded px-3 py-2"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            placeholder="Hasta"
          />
        </div>

        {disponibilidad.length > 0 ? (
          <ul className="bg-white shadow rounded-lg divide-y">
            {disponibilidad.map((bloque, index) => (
              <li key={index} className="p-4">
                <span className="font-semibold capitalize">{bloque.dia}</span>: {bloque.hora_inicio} - {bloque.hora_fin}
              </li>
            ))}
          </ul>
        ) : docenteId ? (
          <p className="text-center text-gray-500">Sin bloques disponibles</p>
        ) : (
          <p className="text-center text-gray-400">Selecciona un docente</p>
        )}
      </div>
    </DashboardLayout>
  );
}
