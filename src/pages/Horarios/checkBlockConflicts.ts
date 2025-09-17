import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import {
  ClasesApiResponse,
  normalizeClasesResponse,
  normalizeDay,
  parseTimeToMinutes,
  toTimeLabel,
} from '../../utils/horarios';

export const DUPLICATE_CLASS_MESSAGE =
  'Ya existe un horario para esta clase en el salón seleccionado';

export interface FormState {
  materia_id: string;
  aula_id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

const overlaps = (
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean => startA < endB && endA > startB;

export async function checkBlockConflicts(
  bloque: FormState,
  docenteId: string,
  isEdit: boolean,
  id?: string,
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
    const normalizedBlockDay = normalizeDay(bloque.dia);
    const blockStartMinutes = parseTimeToMinutes(bloque.hora_inicio);
    const blockEndMinutes = parseTimeToMinutes(bloque.hora_fin);

    if (
      !Number.isFinite(blockStartMinutes) ||
      !Number.isFinite(blockEndMinutes) ||
      blockEndMinutes <= blockStartMinutes
    ) {
      return null;
    }

    const docenteEndpoint = '/horarios/docente/' + docenteId;
    const aulaEndpoint = '/horarios/aula/' + bloque.aula_id;

    const [docRes, aulaRes] = await Promise.all([
      api.get<ClasesApiResponse>(docenteEndpoint),
      api.get<ClasesApiResponse>(aulaEndpoint),
    ]);

    const docenteClases: ClaseProgramada[] = normalizeClasesResponse(docRes.data);
    const aulaClases: ClaseProgramada[] = normalizeClasesResponse(aulaRes.data);
    const materiaId = Number.parseInt(bloque.materia_id, 10);

    const findTimeConflict = (
      clases: ClaseProgramada[],
      tipo: 'docente' | 'aula',
    ): string | null => {
      const conflictClass = clases.find((c) => {
        if (editingId && c.id === editingId) return false;

        const claseDay = normalizeDay(c.dia);
        if (!claseDay || claseDay !== normalizedBlockDay) {
          return false;
        }

        const claseStart = parseTimeToMinutes(c.hora_inicio);
        const claseEnd = parseTimeToMinutes(c.hora_fin);
        if (!Number.isFinite(claseStart) || !Number.isFinite(claseEnd) || claseEnd <= claseStart) {
          return false;
        }

        return overlaps(blockStartMinutes, blockEndMinutes, claseStart, claseEnd);
      });

      if (!conflictClass) {
        return null;
      }

      const base = tipo === 'docente' ? 'El docente ya tiene clase' : 'El aula está ocupada';
      const dayLabel = normalizeDay(conflictClass.dia) || 'este día';
      const startLabel = toTimeLabel(conflictClass.hora_inicio) || 'la hora seleccionada';
      const endLabel = toTimeLabel(conflictClass.hora_fin) || 'la hora seleccionada';

      return base + ' el ' + dayLabel + ' de ' + startLabel + ' a ' + endLabel;
    };

    if (!Number.isNaN(materiaId)) {
      const materiaConflict = aulaClases.find((c) => {
        if (editingId && c.id === editingId) return false;
        const claseDay = normalizeDay(c.dia);
        if (!claseDay || claseDay !== normalizedBlockDay) {
          return false;
        }

        const claseStart = parseTimeToMinutes(c.hora_inicio);
        const claseEnd = parseTimeToMinutes(c.hora_fin);
        if (!Number.isFinite(claseStart) || !Number.isFinite(claseEnd) || claseEnd <= claseStart) {
          return false;
        }

        return (
          c.asignacion?.materia?.id === materiaId &&
          overlaps(blockStartMinutes, blockEndMinutes, claseStart, claseEnd)
        );
      });

      if (materiaConflict) {
        return DUPLICATE_CLASS_MESSAGE;
      }
    }

    const docenteConflict = findTimeConflict(docenteClases, 'docente');
    if (docenteConflict) {
      return docenteConflict;
    }

    const aulaConflict = findTimeConflict(aulaClases, 'aula');
    if (aulaConflict) {
      return aulaConflict;
    }

    return null;
  } catch (err) {
    console.error('Error verificando conflictos', err);
    return null;
  }
}
