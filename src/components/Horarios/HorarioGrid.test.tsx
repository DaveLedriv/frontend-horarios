// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import HorarioGrid from './HorarioGrid';
import { ClaseProgramada } from '../../types/ClaseProgramada';

const createClasesMap = (): Record<string, { clase: ClaseProgramada; rowSpan: number } | null> => ({
  'Lunes-07:00:00': {
    clase: {
      id: 1,
      dia: 'Lunes',
      hora_inicio: '07:00:00',
      hora_fin: '08:00:00',
      aula: {
        id: 10,
        nombre: 'Aula 101',
        ubicacion: 'Edificio A',
        capacidad: 30,
      },
      asignacion: {
        id: 20,
        materia: {
          id: 5,
          nombre: 'Matemáticas Avanzadas',
          codigo: 'MAT-201',
          tipo: 'OBLIGATORIA',
          creditos: 8,
          plan_estudio_id: 2,
        },
        docente: {
          id: 30,
          nombre: 'Juan Pérez',
          correo: 'juan.perez@example.com',
          numero_empleado: 'DOC-001',
          facultad_id: 4,
        },
      },
    },
    rowSpan: 2,
  },
  'Lunes-07:30:00': null,
});

describe('HorarioGrid', () => {
  it('renders table with enhanced styling and tooltips', () => {
    const clases = createClasesMap();
    const { container } = render(<HorarioGrid clases={clases} />);

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table!.className).toContain('border-collapse');

    const wrapper = table?.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain('horario-grid-scroll');
    expect(wrapper!.className).toContain('overflow-auto');

    const firstBodyRow = container.querySelector('tbody tr');
    expect(firstBodyRow).not.toBeNull();
    expect(firstBodyRow!.className).toContain('odd:bg-white');
    expect(firstBodyRow!.className).toContain('even:bg-slate-50/60');

    const cellWithTooltip = screen.getByTitle(/Materia: Matemáticas Avanzadas/);
    expect(cellWithTooltip.className).toContain('hover:bg-blue-50');

    const tooltipText = cellWithTooltip.getAttribute('title') ?? '';
    expect(tooltipText).toContain('Materia: Matemáticas Avanzadas');
    expect(tooltipText).toContain('Docente: Juan Pérez');
    expect(tooltipText).toContain('Aula: Aula 101');
  });

  it('applies dynamic badge colors based on materia id', () => {
    const clases = createClasesMap();
    render(<HorarioGrid clases={clases} />);

    const [badge] = screen.getAllByText('Matemáticas Avanzadas');
    expect(badge.className).toContain('bg-sky-100');
    expect(badge.className).toContain('rounded-full');
  });
});

