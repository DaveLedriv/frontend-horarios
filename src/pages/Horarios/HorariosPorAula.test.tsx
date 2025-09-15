// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockUseParams = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../hooks/useAulas', () => ({
  useAulas: () => ({
    aulas: [{ id: 1, nombre: 'Aula 1' }],
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../components/Horarios/HorarioGrid', () => ({
  default: vi.fn(() => null),
}));

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import api from '../../lib/api';
import HorariosPorAula from './HorariosPorAula';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

const mockHorarioGrid = HorarioGrid as unknown as vi.Mock;
const apiGetMock = api.get as unknown as vi.Mock;

beforeEach(() => {
  mockHorarioGrid.mockReset();
  apiGetMock.mockReset();
  mockUseParams.mockReset();
  mockUseParams.mockReturnValue({ aulaId: '1' });
  mockNavigate.mockReset();
});

describe('HorariosPorAula', () => {
  it('fetches clases and renders HorarioGrid', async () => {
    apiGetMock.mockResolvedValue({
      data: {
        clases: [
          {
            id: 1,
            dia: 'Lunes',
            hora_inicio: '08:00:00',
            hora_fin: '09:00:00',
            asignacion: {},
            aula: {},
          },
        ],
      },
    });

    render(<HorariosPorAula />);

    await waitFor(() => expect(mockHorarioGrid).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/horarios/aula/1');
    const lastCall = mockHorarioGrid.mock.calls.at(-1)!;
    const map = lastCall[0].clases;
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no clases', async () => {
    apiGetMock.mockResolvedValue({
      data: {
        clases: [],
      },
    });

    render(<HorariosPorAula />);

    const emptyMessage = await screen.findByText(
      'No hay clases programadas para este horario.',
    );
    expect(emptyMessage).toBeTruthy();
    expect(mockHorarioGrid).not.toHaveBeenCalled();
  });
});

