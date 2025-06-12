import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useDocentes } from '../../hooks/useDocentes';
import { useDisponibilidadDocente } from '../../hooks/useDisponibilidadDocente';

export default function DisponibilidadDocente() {
  const { docentes } = useDocentes();
  const navigate = useNavigate();
  const params = useParams();
  const initialId = params.id || '';

  const [docenteId, setDocenteId] = useState(initialId);
  const { disponibilidad, loading } = useDisponibilidadDocente(docenteId);

  // sincroniza estado con la URL si cambia
  useEffect(() => {
    setDocenteId(initialId);
  }, [initialId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setDocenteId(newId);
    navigate(`/docentes/disponibilidad/${newId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Disponibilidad de Docentes</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">Selecciona un docente</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={docenteId}
            onChange={handleChange}
          >
            <option value="">-- Selecciona --</option>
            {docentes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center">Cargando disponibilidad...</p>
        ) : docenteId && disponibilidad.length > 0 ? (
          <table className="min-w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Día</th>
                <th className="px-4 py-2">Hora Inicio</th>
                <th className="px-4 py-2">Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              {disponibilidad.map((d, idx) => (
                <tr key={idx} className="border-t text-center">
                  <td className="px-4 py-2 capitalize">{d.dia}</td>
                  <td className="px-4 py-2">{d.hora_inicio}</td>
                  <td className="px-4 py-2">{d.hora_fin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : docenteId ? (
          <p className="text-center text-gray-500">Este docente no tiene disponibilidad registrada.</p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
