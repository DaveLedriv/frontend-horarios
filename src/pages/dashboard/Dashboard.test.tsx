import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import Dashboard from './Dashboard';
import api from '../../lib/api';

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

type GetMock = ReturnType<typeof vi.fn>;

const apiGetMock = api.get as unknown as GetMock;

const buildClase = () => ({
  id: 10,
  dia: '1',
  hora_inicio: '07:00',
  hora_fin: '09:00',
  asignacion: {
    materia: { nombre: 'Álgebra Lineal' },
    docente: { nombre: 'Juan Pérez' },
  },
  aula: { nombre: 'A-101' },
});

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders summary metrics and upcoming classes when data is available', async () => {
    apiGetMock
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] }) // docentes
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] }) // materias
      .mockResolvedValueOnce({ data: [{ id: 1 }] }) // aulas
      .mockResolvedValueOnce({ data: [{ id: 1 }] }) // asignaciones
      .mockResolvedValueOnce({ data: { clases: [buildClase()] } }) // clases programadas
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] }) // planes
      .mockResolvedValueOnce({ data: [{ id: 1 }] }); // facultades

    render(<Dashboard />);

    await waitFor(() => expect(apiGetMock).toHaveBeenCalledWith('/docentes'));

    expect(screen.getByText('Docentes registrados').parentElement?.textContent).toContain('2');
    expect(screen.getByText('Materias activas').parentElement?.textContent).toContain('3');
    expect(screen.getByText('Clases programadas').parentElement?.textContent).toContain('1');

    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('07:00 - 09:00')).toBeInTheDocument();
    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('A-101')).toBeInTheDocument();
  });

  it('shows the fallback error when every request fails', async () => {
    apiGetMock.mockRejectedValue(new Error('network down'));

    render(<Dashboard />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudieron cargar los datos del dashboard.');
  });

  it('displays a partial warning when at least one request fails', async () => {
    apiGetMock
      .mockResolvedValueOnce({ data: [{ id: 1 }] }) // docentes
      .mockRejectedValueOnce(new Error('materias API error')) // materias
      .mockResolvedValue({ data: [] });

    render(<Dashboard />);

    await waitFor(() => expect(apiGetMock).toHaveBeenCalledWith('/docentes'));
    const warning = await screen.findByRole('status');
    expect(warning).toHaveTextContent('Algunos datos no respondieron');
  });
});
