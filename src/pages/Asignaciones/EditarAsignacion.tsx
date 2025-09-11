// src/pages/asignaciones/EditarAsignacion.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useDocentes } from '../../hooks/useDocentes';
import { useMaterias } from '../../hooks/useMaterias';
import { Docente } from '../../types/Docente';
import { Materia } from '../../types/Materia';
import { useToast } from '../../hooks/useToast';

export default function EditarAsignacion() {
  const { asignacion_id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ docente_id: '', materia_id: '' });
  const [loading, setLoading] = useState(true);

  const { docentes, loading: loadingDocentes } = useDocentes();
  const { materias, loading: loadingMaterias } = useMaterias();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchAsignacion = async () => {
      try {
        const res = await api.get(`/asignaciones/${asignacion_id}`);
        setForm({
          docente_id: String(res.data.docente.id),
          materia_id: String(res.data.materia.id),
        });
      } catch (err) {
        console.error('Error al cargar asignación:', err);
        showError('No se pudo cargar la asignación.');
      } finally {
        setLoading(false);
      }
    };

    fetchAsignacion();
  }, [asignacion_id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/asignaciones/${asignacion_id}`, {
        docente_id: Number(form.docente_id),
        materia_id: Number(form.materia_id),
      });
      showSuccess('Asignación actualizada correctamente');
      navigate('/asignaciones');
    } catch (err) {
      console.error('Error al actualizar asignación:', err);
      showError('No se pudo actualizar la asignación.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Asignación</h2>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Docente</label>
              <select
                name="docente_id"
                value={form.docente_id}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                disabled={loadingDocentes}
                required
              >
                <option value="">Selecciona un docente</option>
                {docentes.map((d: Docente) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Materia</label>
              <select
                name="materia_id"
                value={form.materia_id}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                disabled={loadingMaterias}
                required
              >
                <option value="">Selecciona una materia</option>
                {materias.map((m: Materia) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Guardar cambios
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
