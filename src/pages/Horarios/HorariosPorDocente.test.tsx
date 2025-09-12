// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../hooks/useDocentes', () => ({
  useDocentes: () => ({
    docentes: [{ id: 1, nombre: 'Docente 1' }],
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../components/Horarios/HorarioGrid', () => ({
  default: vi.fn(() => null),
}));

import api from '../../lib/api';
import HorariosPorDocente from './HorariosPorDocente';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

const mockHorarioGrid = HorarioGrid as unknown as vi.Mock;

describe('HorariosPorDocente', () => {
  it('fetches clases and renders HorarioGrid', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        clases: [
          {
            id: 1,
            dia: 'Lunes',
            hora_inicio: '08:00:00',
            hora_fin: '09:00:00',
          },
        ],
      },
    });

    render(
      <MemoryRouter initialEntries={["/horarios/docente/1"]}>
        <Routes>
          <Route
            path="/horarios/docente/:docenteId"
            element={<HorariosPorDocente />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(mockHorarioGrid).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/horarios/docente/1');
    const lastCall = mockHorarioGrid.mock.calls.at(-1)!;
    const map = lastCall[0].clases;
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });
});

