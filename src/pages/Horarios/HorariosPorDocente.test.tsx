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

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import api from '../../lib/api';
import HorariosPorDocente from './HorariosPorDocente';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

const mockHorarioGrid = HorarioGrid as unknown as vi.Mock;
const apiGetMock = api.get as unknown as vi.Mock;

beforeEach(() => {
  mockHorarioGrid.mockReset();
  apiGetMock.mockReset();
  mockUseParams.mockReset();
  mockUseParams.mockReturnValue({ docenteId: '1' });
  mockNavigate.mockReset();
});

describe('HorariosPorDocente', () => {
  const createClase = () => ({
    id: 1,
    dia: 'Lunes',
    hora_inicio: '08:00:00',
    hora_fin: '09:00:00',
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
      () => ({ '10': createClase() }),
    ],
    [
      'un arreglo que inicia con metadata antes de las clases',
      () => [[{ total: 1 }], { clases: [createClase()] }],
    ],
  ])('fetches clases and renders HorarioGrid cuando la API responde con %s', async (_, getResponse) => {
    apiGetMock.mockResolvedValue({
      data: getResponse(),
    });

    render(<HorariosPorDocente />);

    await waitFor(() => expect(mockHorarioGrid).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/horarios/docente/1');
    const lastCall = mockHorarioGrid.mock.calls.at(-1)!;
    const map = lastCall[0].clases;
    expect(map['Lunes-08:00:00']?.rowSpan).toBe(2);
    expect(map['Lunes-08:30:00']).toBeNull();
  });

  it('shows empty state when there are no clases', async () => {
    apiGetMock.mockResolvedValue({
      data: [],
    });

    render(<HorariosPorDocente />);

    const emptyMessage = await screen.findByText(
      'No hay clases programadas para este horario.',
    );
    expect(emptyMessage).toBeTruthy();
    expect(mockHorarioGrid).not.toHaveBeenCalled();
  });
});

