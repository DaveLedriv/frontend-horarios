import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';

export const DUPLICATE_CLASS_MESSAGE =
  'Ya existe un horario para esta clase en el salón seleccionado';

export interface FormState {
  materia_id: string;
  aula_id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export async function checkBlockConflicts(
  bloque: FormState,
  docenteId: string,
  isEdit: boolean,
  id?: string
): Promise<string | null> {
  if (
    !docenteId ||
    !bloque.materia_id ||
    !bloque.aula_id ||
    !bloque.dia ||
    !bloque.hora_inicio ||
    !bloque.hora_fin
  ) {
    return null;
  }
  try {
    const editingId = isEdit && id ? Number(id) : null;
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
        if (editingId && c.id === editingId) return false;
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
    const materiaId = Number.parseInt(bloque.materia_id, 10);

    if (!Number.isNaN(materiaId)) {
      const materiaConflict = aulaClases.find((c) => {
        if (editingId && c.id === editingId) return false;
        return (
          c.asignacion?.materia?.id === materiaId &&
          !(bloque.hora_fin <= c.hora_inicio || bloque.hora_inicio >= c.hora_fin)
        );
      });
      if (materiaConflict) {
        return DUPLICATE_CLASS_MESSAGE;
      }
    }

    const docenteConflict = hasConflict(docenteClases, 'docente');
    if (docenteConflict) return docenteConflict;
    const aulaConflict = hasConflict(aulaClases, 'aula');
    if (aulaConflict) return aulaConflict;
    return null;
  } catch (err) {
    console.error('Error verificando conflictos', err);
    return null;
  }
}
