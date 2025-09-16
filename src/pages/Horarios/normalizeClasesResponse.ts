import { ClaseProgramada } from '../../types/ClaseProgramada';

export type ClasesApiResponse =
  | ClaseProgramada[]
  | { clases?: ClaseProgramada[] | null }
  | null
  | undefined;

export const normalizeClasesResponse = (
  data: unknown,
): ClaseProgramada[] => {
  if (Array.isArray(data)) {
    return data as ClaseProgramada[];
  }

  if (data && typeof data === 'object') {
    const maybeClases = (data as { clases?: unknown }).clases;
    if (Array.isArray(maybeClases)) {
      return maybeClases as ClaseProgramada[];
    }
  }

  return [];
};
