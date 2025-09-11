import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useDocentes } from '../../hooks/useDocentes';
import { DisponibilidadDocente } from '../../types/DisponibilidadDocente';

export default function VerDisponibilidad() {
  const { docentes } = useDocentes();
  const [docenteId, setDocenteId] = useState('');
  const [dia, setDia] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDocente[]>([]);
  const [error, setError] = useState('');

  const obtenerDisponibilidad = async () => {
    if (!docenteId) return;

    try {
      const res = await api.get(
        `/disponibilidad/docente/${docenteId}`
      );
      setDisponibilidad(res.data.disponibles);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al cargar disponibilidad');
    }
  };

  const eliminarBloque = async (id: number) => {
    try {
      await api.delete(`/disponibilidad/${id}`);
      setDisponibilidad((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar disponibilidad');
    }
  };

  useEffect(() => {
    obtenerDisponibilidad();
  }, [docenteId, dia, desde, hasta]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>

          <input
            type="time"
            className="border rounded px-3 py-2"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />

          <input
            type="time"
            className="border rounded px-3 py-2"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>

        {disponibilidad.length > 0 ? (
          <ul className="bg-white shadow rounded-lg divide-y">
            {disponibilidad.map((bloque) => (
              <li key={bloque.id} className="p-4 flex items-center justify-between">
                <span className="capitalize">
                  <strong>{bloque.dia}</strong>: {bloque.hora_inicio.slice(0, 5)} - {bloque.hora_fin.slice(0, 5)}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => eliminarBloque(bloque.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                  {/* Puedes habilitar el botón de editar más adelante */}
                  {/* <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Editar</button> */}
                </div>
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
