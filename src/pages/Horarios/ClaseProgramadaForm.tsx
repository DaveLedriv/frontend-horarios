import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useDocentes } from '../../hooks/useDocentes';
import { useMaterias } from '../../hooks/useMaterias';
import { useAulas } from '../../hooks/useAulas';
import { useToast } from '../../hooks/useToast';
import { useDisponibilidadDocente } from '../../hooks/useDisponibilidadDocente';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { checkBlockConflicts, FormState } from './checkBlockConflicts';

const normalizeDay = (value: string) =>
  value
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : '';

const parseTimeToMinutes = (time: string): number | null => {
  const match = time.match(/(\d{1,2}):(\d{1,2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
};

const generarHoras = (inicio: string, fin: string) => {
  const times: string[] = [];
  const start = parseTimeToMinutes(inicio);
  const end = parseTimeToMinutes(fin);
  if (start === null || end === null || start > end) {
    return times;
  }
  for (let current = start; current <= end; current += 30) {
    const hours = Math.floor(current / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (current % 60).toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
  }
  return times;
};

const sortTimes = (times: string[]) =>
  Array.from(new Set(times)).sort((a, b) => a.localeCompare(b));

export default function ClaseProgramadaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [docenteId, setDocenteId] = useState('');
  const { docentes } = useDocentes();
  const { materias } = useMaterias();
  const { aulas } = useAulas();
  const { showSuccess, showError } = useToast();
  const { disponibilidad: disponibilidadDocente, loading: disponibilidadLoading } =
    useDisponibilidadDocente(docenteId || null);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [bloques, setBloques] = useState<FormState[]>([
    {
      materia_id: '',
      aula_id: '',
      dia: '',
      hora_inicio: '',
      hora_fin: '',
    },
  ]);

  const obtenerHorasInicio = (dia: string) => {
    if (!dia || !docenteId) return [];
    const normalizedSelectedDay = normalizeDay(dia);
    const horas = disponibilidadDocente
      .filter((d) => normalizeDay(d.dia) === normalizedSelectedDay)
      .flatMap((d) =>
        generarHoras(d.hora_inicio.slice(0, 5), d.hora_fin.slice(0, 5)).slice(0, -1)
      );
    return sortTimes(horas);
  };

  const obtenerHorasFin = (dia: string, horaInicio: string) => {
    if (!dia || !horaInicio || !docenteId) return [];
    const normalizedSelectedDay = normalizeDay(dia);
    const bloque = disponibilidadDocente.find((d) => {
      if (normalizeDay(d.dia) !== normalizedSelectedDay) return false;
      const inicio = d.hora_inicio.slice(0, 5);
      const fin = d.hora_fin.slice(0, 5);
      return horaInicio >= inicio && horaInicio < fin;
    });
    if (!bloque) return [];
    const horas = generarHoras(horaInicio, bloque.hora_fin.slice(0, 5)).slice(1);
    return sortTimes(horas);
  };

  const agregarBloque = () => {
    setBloques([
      ...bloques,
      {
        materia_id: '',
        aula_id: '',
        dia: '',
        hora_inicio: '',
        hora_fin: '',
      },
    ]);
  };

  const actualizarBloque = (index: number, cambios: Partial<FormState>) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      nuevos[index] = { ...nuevos[index], ...cambios };
      return nuevos;
    });
  };

  const eliminarBloque = (index: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocenteChange = (value: string) => {
    setDocenteId(value);
    setBloques((prev) =>
      prev.map((bloque) => ({
        ...bloque,
        dia: '',
        hora_inicio: '',
        hora_fin: '',
      }))
    );
  };

  useEffect(() => {
    if (isEdit && id) {
      api
        .get(`/clases-programadas/${id}`)
        .then((res) => {
          const c: ClaseProgramada = res.data;
          setDocenteId(String(c.asignacion.docente.id));
          setBloques([
            {
              materia_id: String(c.asignacion.materia.id),
              aula_id: String(c.aula.id),
              dia: c.dia,
              hora_inicio: c.hora_inicio.slice(0, 5),
              hora_fin: c.hora_fin.slice(0, 5),
            },
          ]);
        })
        .catch(() => {
          showError('No se pudo cargar la clase programada');
        });
    }
  }, [id, isEdit, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      const bloque = bloques[0];
      const conflictMsg = await checkBlockConflicts(
        bloque,
        docenteId,
        isEdit,
        id
      );
      if (conflictMsg) {
        showError(conflictMsg);
        return;
      }
      try {
        await api.put(`/clases-programadas/${id}`, {
          docente_id: Number(docenteId),
          materia_id: Number(bloque.materia_id),
          aula_id: Number(bloque.aula_id),
          dia: bloque.dia,
          hora_inicio: `${bloque.hora_inicio}:00`,
          hora_fin: `${bloque.hora_fin}:00`,
        });
        showSuccess('Clase programada actualizada');
        navigate(-1);
      } catch (error: any) {
        if (error.status === 409) {
          showError('Conflicto de horario');
        } else if (error.status === 400) {
          showError('El docente no está disponible en ese horario');
        } else {
          showError('Error al guardar la clase programada');
        }
      }
      return;
    }

    let huboError = false;
    for (let i = 0; i < bloques.length; i++) {
      const b = bloques[i];
      const conflictMsg = await checkBlockConflicts(
        b,
        docenteId,
        isEdit,
        id
      );
      if (conflictMsg) {
        showError(`Bloque ${i + 1}: ${conflictMsg}`);
        huboError = true;
        continue;
      }
      try {
        await api.post('/clases-programadas', {
          docente_id: Number(docenteId),
          materia_id: Number(b.materia_id),
          aula_id: Number(b.aula_id),
          dia: b.dia,
          hora_inicio: `${b.hora_inicio}:00`,
          hora_fin: `${b.hora_fin}:00`,
        });
      } catch (error: any) {
        huboError = true;
        if (error.status === 409) {
          showError(`Bloque ${i + 1}: Conflicto de horario`);
        } else if (error.status === 400) {
          showError(`Bloque ${i + 1}: El docente no está disponible en ese horario`);
        } else {
          showError(`Bloque ${i + 1}: Error al guardar la clase programada`);
        }
      }
    }

    if (!huboError) {
      showSuccess('Clases programadas creadas');
      navigate(-1);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? 'Editar' : 'Crear'} clase programada
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Docente
            </label>
            <select
              value={docenteId}
              onChange={(e) => handleDocenteChange(e.target.value)}
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

          {bloques.map((bloque, index) => {
            const horasInicio = obtenerHorasInicio(bloque.dia);
            const horasFin = obtenerHorasFin(bloque.dia, bloque.hora_inicio);
            const sinDisponibilidad = Boolean(
              docenteId &&
                bloque.dia &&
                !disponibilidadLoading &&
                horasInicio.length === 0
            );

            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Materia
                  </label>
                  <select
                    value={bloque.materia_id}
                    onChange={(e) =>
                      actualizarBloque(index, { materia_id: e.target.value })
                    }
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
                    value={bloque.aula_id}
                    onChange={(e) =>
                      actualizarBloque(index, { aula_id: e.target.value })
                    }
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
                  <label className="block text-sm font-medium text-gray-700">
                    Día
                  </label>
                  <select
                    value={bloque.dia}
                    onChange={(e) =>
                      actualizarBloque(index, {
                        dia: e.target.value,
                        hora_inicio: '',
                        hora_fin: '',
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Selecciona un día</option>
                    {dias.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Hora inicio
                    </label>
                    <select
                      value={bloque.hora_inicio}
                      onChange={(e) =>
                        actualizarBloque(index, {
                          hora_inicio: e.target.value,
                          hora_fin: '',
                        })
                      }
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                      disabled={!horasInicio.length}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {horasInicio.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Hora fin
                    </label>
                    <select
                      value={bloque.hora_fin}
                      onChange={(e) =>
                        actualizarBloque(index, { hora_fin: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                      disabled={!horasFin.length}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {horasFin.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {sinDisponibilidad && (
                  <p className="text-xs text-red-600">
                    El docente no tiene disponibilidad registrada para este día.
                  </p>
                )}

                {!isEdit && bloques.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 text-sm"
                    onClick={() => eliminarBloque(index)}
                  >
                    Eliminar bloque
                  </button>
                )}
              </div>
            );
          })}

          {!isEdit && (
            <button
              type="button"
              onClick={agregarBloque}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
            >
              + Agregar bloque
            </button>
          )}

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
