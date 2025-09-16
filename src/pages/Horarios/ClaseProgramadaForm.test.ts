import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import { checkBlockConflicts, DUPLICATE_CLASS_MESSAGE } from './checkBlockConflicts';
import api from '../../lib/api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('checkBlockConflicts', () => {
  const bloque = {
    materia_id: '1',
    aula_id: '1',
    dia: 'Lunes',
    hora_inicio: '08:00',
    hora_fin: '09:00',
  } as any;

  const createClase = () => ({
    id: 2,
    dia: 'Lunes',
    hora_inicio: '08:30',
    hora_fin: '09:30',
    asignacion: {
      id: 10,
      docente: {
        id: 20,
        nombre: 'Docente Demo',
        correo: 'docente@uni.edu',
        numero_empleado: '123',
        facultad_id: 1,
      },
      materia: {
        id: 1,
        nombre: 'Materia 1',
        codigo: 'MAT101',
        tipo: 'OBLIGATORIA',
        creditos: 6,
        plan_estudio_id: 1,
      },
    },
    aula: {
      id: 1,
      nombre: 'Aula 1',
      ubicacion: 'Edificio A',
      capacidad: 30,
    },
  });

  it.each([
    [
      'un objeto con la propiedad clases',
      () => ({ clases: [createClase()] }),
    ],
    [
      'un arreglo plano de clases',
      () => [createClase()],
    ],
  ])('detecta conflicto de docente cuando la API responde con %s', async (_, getDocenteResponse) => {
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url.includes('/horarios/docente/')) {
        return Promise.resolve({ data: getDocenteResponse() } as any);
      }
      return Promise.resolve({ data: [] } as any);
    });

    const msg = await checkBlockConflicts(bloque, '1', false);
    expect(msg).toContain('docente');
  });

  it('detecta conflicto de materia cuando el aula responde con un arreglo', async () => {
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url.includes('/horarios/docente/')) {
        return Promise.resolve({ data: [] } as any);
      }
      return Promise.resolve({ data: [createClase()] } as any);
    });

    const msg = await checkBlockConflicts(bloque, '1', false);
    expect(msg).toBe(DUPLICATE_CLASS_MESSAGE);
  });

  it.each([
    [
      'objetos vacíos',
      () => ({ clases: [] }),
      () => ({ clases: [] }),
    ],
    [
      'arreglos vacíos',
      () => [],
      () => [],
    ],
  ])('no hay conflicto cuando la API responde con %s', async (_, getDocenteResponse, getAulaResponse) => {
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url.includes('/horarios/docente/')) {
        return Promise.resolve({ data: getDocenteResponse() } as any);
      }
      return Promise.resolve({ data: getAulaResponse() } as any);
    });

    const msg = await checkBlockConflicts(bloque, '1', false);
    expect(msg).toBeNull();
  });
});
