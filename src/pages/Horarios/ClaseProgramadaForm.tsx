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

interface FormState {
  materia_id: string;
  aula_id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

function toAmPm(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  const hours = hour.toString().padStart(2, '0');
  const minutes = minuteStr.padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
}

export default function ClaseProgramadaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { docentes } = useDocentes();
  const { materias } = useMaterias();
  const { aulas } = useAulas();
  const { showSuccess, showError } = useToast();
  const { disponibilidad: disponibilidadDocente } =
    useDisponibilidadDocente(docenteId);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const [docenteId, setDocenteId] = useState('');
  const [bloques, setBloques] = useState<FormState[]>([
    {
      materia_id: '',
      aula_id: '',
      dia: '',
      hora_inicio: '',
      hora_fin: '',
    },
  ]);

  const generarHoras = (inicio: string, fin: string) => {
    const times: string[] = [];
    const [sh, sm] = inicio.split(':').map(Number);
    const [eh, em] = fin.split(':').map(Number);
    let start = sh * 60 + sm;
    const end = eh * 60 + em;
    for (; start <= end; start += 30) {
      const h = Math.floor(start / 60)
        .toString()
        .padStart(2, '0');
      const m = (start % 60).toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
    return times;
  };

  const obtenerHorasInicio = (dia: string) => {
    return disponibilidadDocente
      .filter((d) => d.dia.toLowerCase() === dia.toLowerCase())
      .flatMap((d) =>
        generarHoras(
          d.hora_inicio.slice(0, 5),
          d.hora_fin.slice(0, 5)
        ).slice(0, -1)
      );
  };

  const obtenerHorasFin = (dia: string, horaInicio: string) => {
    const bloque = disponibilidadDocente.find((d) => {
      const inicio = d.hora_inicio.slice(0, 5);
      const fin = d.hora_fin.slice(0, 5);
      return (
        d.dia.toLowerCase() === dia.toLowerCase() &&
        horaInicio >= inicio &&
        horaInicio < fin
      );
    });
    if (!bloque) return [];
    return generarHoras(horaInicio, bloque.hora_fin.slice(0, 5)).slice(1);
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

  const actualizarBloque = (
    index: number,
    campo: keyof FormState,
    valor: string
  ) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return nuevos;
    });
  };

  const eliminarBloque = (index: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== index));
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

  const checkBlockConflicts = async (
    bloque: FormState
  ): Promise<string | null> => {
    if (
      !docenteId ||
      !bloque.aula_id ||
      !bloque.dia ||
      !bloque.hora_inicio ||
      !bloque.hora_fin
    ) {
      return null;
    }
    try {
      const [docRes, aulaRes] = await Promise.all([
        api.get<{ clases: ClaseProgramada[] }>(
          `/horarios/docente/${docenteId}`
        ),
        api.get<{ clases: ClaseProgramada[] }>(
          `/horarios/aula/${bloque.aula_id}`
        ),
      ]);

      const hasConflict = (
        clases: ClaseProgramada[],
        tipo: 'docente' | 'aula'
      ): string | null => {
        const conflictClass = clases.find((c) => {
          if (isEdit && id && c.id === Number(id)) return false;
          return (
            c.dia === bloque.dia &&
            !(
              bloque.hora_fin <= c.hora_inicio ||
              bloque.hora_inicio >= c.hora_fin
            )
          );
        });
        if (conflictClass) {
          const msgBase =
            tipo === 'docente'
              ? 'El docente ya tiene clase'
              : 'El aula está ocupada';
          return `${msgBase} el ${conflictClass.dia} de ${conflictClass.hora_inicio.slice(
            0,
            5
          )} a ${conflictClass.hora_fin.slice(0, 5)}`;
        }
        return null;
      };

      const docenteClases: ClaseProgramada[] = docRes.data.clases;
      const aulaClases: ClaseProgramada[] = aulaRes.data.clases;
      const docenteConflict = hasConflict(docenteClases, 'docente');
      if (docenteConflict) return docenteConflict;
      const aulaConflict = hasConflict(aulaClases, 'aula');
      if (aulaConflict) return aulaConflict;
      return null;
    } catch (err) {
      console.error('Error verificando conflictos', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      const bloque = bloques[0];
      const conflictMsg = await checkBlockConflicts(bloque);
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
          hora_inicio: toAmPm(bloque.hora_inicio),
          hora_fin: toAmPm(bloque.hora_fin),
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
      const conflictMsg = await checkBlockConflicts(b);
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
          hora_inicio: toAmPm(b.hora_inicio),
          hora_fin: toAmPm(b.hora_fin),
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
              onChange={(e) => setDocenteId(e.target.value)}
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
            let horasInicio = obtenerHorasInicio(bloque.dia);
            let horasFin = obtenerHorasFin(bloque.dia, bloque.hora_inicio);
            if (bloque.hora_inicio && !horasInicio.includes(bloque.hora_inicio)) {
              horasInicio = [...horasInicio, bloque.hora_inicio];
            }
            if (bloque.hora_fin && !horasFin.includes(bloque.hora_fin)) {
              horasFin = [...horasFin, bloque.hora_fin];
            }
            return (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Materia
                </label>
                <select
                  value={bloque.materia_id}
                  onChange={(e) =>
                    actualizarBloque(index, 'materia_id', e.target.value)
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
                    actualizarBloque(index, 'aula_id', e.target.value)
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
                    actualizarBloque(index, 'dia', e.target.value)
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
                      actualizarBloque(index, 'hora_inicio', e.target.value)
                    }
                    className="w-full mt-1 px-4 py-2 border rounded-lg"
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
                      actualizarBloque(index, 'hora_fin', e.target.value)
                    }
                    className="w-full mt-1 px-4 py-2 border rounded-lg"
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
