import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import { checkBlockConflicts } from './checkBlockConflicts';
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

  it('detecta conflicto de docente', async () => {
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url.includes('/horarios/docente/')) {
        return Promise.resolve({
          data: {
            clases: [
              {
                id: 2,
                dia: 'Lunes',
                hora_inicio: '08:30',
                hora_fin: '09:30',
              },
            ],
          },
        } as any);
      }
      return Promise.resolve({ data: { clases: [] } } as any);
    });

    const msg = await checkBlockConflicts(bloque, '1', false);
    expect(msg).toContain('docente');
  });

  it('no hay conflicto', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { clases: [] } } as any);
    const msg = await checkBlockConflicts(bloque, '1', false);
    expect(msg).toBeNull();
  });
});
