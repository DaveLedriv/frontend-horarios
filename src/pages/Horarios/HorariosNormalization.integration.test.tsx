// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../hooks/useDocentes', () => ({
  useDocentes: () => ({
    docentes: [
      {
        id: 1,
        nombre: 'Docente Demo',
        correo: 'docente@uni.edu',
        numero_empleado: '123',
        facultad_id: 1,
      },
    ],
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAulas', () => ({
  useAulas: () => ({
    aulas: [
      {
        id: 1,
        nombre: 'Aula 101',
        ubicacion: 'Edificio A',
        capacidad: 30,
      },
    ],
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../lib/api', () => ({
  default: {
    get: apiGetMock,
  },
}));

import HorariosPorDocente from './HorariosPorDocente';
import HorariosPorAula from './HorariosPorAula';

const materiaNombre = 'Cálculo I';
const aulaNombre = 'Aula 101';

const createClase = (overrides?: Partial<{
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}>) => ({
  id: 1,
  dia: overrides?.dia ?? '1',
  hora_inicio: overrides?.hora_inicio ?? '7:0',
  hora_fin: overrides?.hora_fin ?? '9:0',
  asignacion: {
    id: 10,
    docente: {
      id: 1,
      nombre: 'Docente Demo',
      correo: 'docente@uni.edu',
      numero_empleado: '123',
      facultad_id: 1,
    },
    materia: {
      id: 20,
      nombre: materiaNombre,
      codigo: 'MAT101',
      tipo: 'OBLIGATORIA' as const,
      creditos: 6,
      plan_estudio_id: 1,
    },
  },
  aula: {
    id: 1,
    nombre: aulaNombre,
    ubicacion: 'Edificio A',
    capacidad: 30,
  },
});

beforeEach(() => {
  apiGetMock.mockReset();
  window.alert = vi.fn();
});

describe('Horario normalization integration', () => {
  it('shows docente class when day and time need normalization', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: { clases: [createClase()] },
    });

    render(
      <MemoryRouter initialEntries={['/horarios/docente/1']}>
        <Routes>
          <Route path="/horarios/docente/:docenteId" element={<HorariosPorDocente />} />
        </Routes>
      </MemoryRouter>,
    );

    const subjectCell = await screen.findByText(materiaNombre);
    expect(subjectCell.textContent).toContain(materiaNombre);

    const tableCell = subjectCell.closest('td');
    expect(tableCell?.textContent).toContain(aulaNombre);

    expect(apiGetMock).toHaveBeenCalledWith('/horarios/docente/1');
  });

  it('shows aula class when day and time need normalization', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: { clases: [createClase({ dia: '2' })] },
    });

    render(
      <MemoryRouter initialEntries={['/horarios/aula/1']}>
        <Routes>
          <Route path="/horarios/aula/:aulaId" element={<HorariosPorAula />} />
        </Routes>
      </MemoryRouter>,
    );

    const subjectCell = await screen.findByText(materiaNombre);
    expect(subjectCell.textContent).toContain(materiaNombre);

    const tableCell = subjectCell.closest('td');
    expect(tableCell?.textContent).toContain(aulaNombre);

    expect(apiGetMock).toHaveBeenCalledWith('/horarios/aula/1');
  });
});

