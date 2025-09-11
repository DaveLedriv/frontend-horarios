import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useDocentes } from '../../hooks/useDocentes';
import { useMaterias } from '../../hooks/useMaterias';
import { useAulas } from '../../hooks/useAulas';
import { useToast } from '../../hooks/useToast';
import { ClaseProgramada } from '../../types/ClaseProgramada';

interface FormState {
  docente_id: string;
  materia_id: string;
  aula_id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export default function ClaseProgramadaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { docentes } = useDocentes();
  const { materias } = useMaterias();
  const { aulas } = useAulas();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState<FormState>({
    docente_id: '',
    materia_id: '',
    aula_id: '',
    dia: '',
    hora_inicio: '',
    hora_fin: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      api
        .get(`/clases-programadas/${id}`)
        .then((res) => {
          const c: ClaseProgramada = res.data;
          setForm({
            docente_id: String(c.asignacion.docente.id),
            materia_id: String(c.asignacion.materia.id),
            aula_id: String(c.aula.id),
            dia: c.dia,
            hora_inicio: c.hora_inicio,
            hora_fin: c.hora_fin,
          });
        })
        .catch(() => {
          showError('No se pudo cargar la clase programada');
        });
    }
  }, [id, isEdit, showError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && id) {
        await api.put(`/clases-programadas/${id}`, {
          docente_id: Number(form.docente_id),
          materia_id: Number(form.materia_id),
          aula_id: Number(form.aula_id),
          dia: form.dia,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
        });
        showSuccess('Clase programada actualizada');
      } else {
        await api.post('/clases-programadas', {
          docente_id: Number(form.docente_id),
          materia_id: Number(form.materia_id),
          aula_id: Number(form.aula_id),
          dia: form.dia,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
        });
        showSuccess('Clase programada creada');
      }
      navigate(-1);
    } catch (error: any) {
      if (error.status === 409) {
        showError('Conflicto de horario');
      } else if (error.status === 400) {
        showError(error.message || 'Docente o aula no disponible');
      } else {
        showError('Error al guardar la clase programada');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? 'Editar' : 'Crear'} clase programada
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Docente
            </label>
            <select
              name="docente_id"
              value={form.docente_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Selecciona un docente</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Materia
            </label>
            <select
              name="materia_id"
              value={form.materia_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Selecciona una materia</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aula
            </label>
            <select
              name="aula_id"
              value={form.aula_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Selecciona un aula</option>
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Día</label>
            <input
              type="text"
              name="dia"
              value={form.dia}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              placeholder="Lunes"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Hora inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Hora fin
              </label>
              <input
                type="time"
                name="hora_fin"
                value={form.hora_fin}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
