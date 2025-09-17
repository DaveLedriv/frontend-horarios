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
  const createClase = () => ({
    id: 1,
    dia: 'Lunes',
    hora_inicio: '08:00:00',
    hora_fin: '09:00:00',
    asignacion: {},
    aula: {},
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
    [
      'un objeto plano con una clase',
      () => createClase(),
    ],
    [
      'un diccionario indexado por identificadores',
      () => ({ '15': createClase() }),
    ],
  ])('fetches clases and renders HorarioGrid cuando la API responde con %s', async (_, getResponse) => {
    apiGetMock.mockResolvedValue({
      data: getResponse(),
    });

    render(<HorariosPorAula />);

    await waitFor(() => expect(mockHorarioGrid).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/horarios/aula/1');
    const lastCall = mockHorarioGrid.mock.calls.at(-1)!;
    const map = lastCall[0].clases;
    expect(map['Lunes-08:00:00']?.rowSpan).toBe(2);
    expect(map['Lunes-08:30:00']).toBeNull();
  });

  it('ignores metadata arrays with asignaciones without schedule fields', async () => {
    apiGetMock.mockResolvedValue({
      data: [
        [
          { asignacion: { id: 20, materia: 'Meta' }, aula: { id: 1 } },
          { aula: { id: 2, nombre: 'Meta Aula' } },
        ],
        { clases: [createClase()] },
      ],
    });

    render(<HorariosPorAula />);

    await waitFor(() => expect(mockHorarioGrid).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/horarios/aula/1');
    const lastCall = mockHorarioGrid.mock.calls.at(-1)!;
    const map = lastCall[0].clases;
    expect(map['Lunes-08:00:00']?.rowSpan).toBe(2);
    expect(map['Lunes-08:30:00']).toBeNull();
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

