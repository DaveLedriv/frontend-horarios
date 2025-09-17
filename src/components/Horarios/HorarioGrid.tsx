import { ClaseProgramada } from '../../types/ClaseProgramada';
import './HorarioGrid.css';
import { createTimeSlots } from './horarioUtils';

interface HorarioCell {
  clase: ClaseProgramada;
  rowSpan: number;
}

interface HorarioGridProps {
  clases: Record<string, HorarioCell | null>;
}

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const timeSlots = createTimeSlots();

const baseCellClasses =
  'border border-gray-200 px-4 py-2 text-center align-middle transition-colors duration-150 hover:bg-blue-50';

const materiaBadgeColors = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-sky-100 text-sky-800 border-sky-200',
];

const getMateriaBadgeColor = (materiaId?: number) => {
  if (!materiaId || Number.isNaN(materiaId)) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  const index = Math.abs(materiaId) % materiaBadgeColors.length;
  return materiaBadgeColors[index];
};

export default function HorarioGrid({ clases }: HorarioGridProps) {
  return (
    <div className="horario-grid-scroll min-w-max overflow-auto">
      <table className="min-w-[56rem] w-full border-collapse border border-gray-200 bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-700">
              Hora
            </th>
            {days.map((d) => (
              <th
                key={d}
                className="border border-gray-200 px-4 py-2 text-center font-semibold text-gray-700"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(({ label, timeKey }) => (
            <tr key={timeKey} className="odd:bg-white even:bg-slate-50/60">
              <td className="border border-gray-200 px-2 py-2 text-sm font-semibold text-gray-700">
                {label}
              </td>
              {days.map((day) => {
                const key = `${day}-${timeKey}`;
                const cell = clases[key];
                if (cell === undefined) {
                  return <td key={day} className={baseCellClasses} />;
                }
                if (cell === null) {
                  return null;
                }

                const asignacion = cell.clase.asignacion;
                const aula = cell.clase.aula;

                if (!asignacion || !aula) {
                  return (
                    <td
                      key={day}
                      className={`${baseCellClasses} bg-slate-100 text-sm font-medium text-slate-600`}
                      rowSpan={cell.rowSpan}
                      title="Horario no disponible"
                    >
                      Horario no disponible
                    </td>
                  );
                }

                const materia = asignacion.materia;
                const docente = asignacion.docente;
                const materiaNombre = materia?.nombre ?? 'Sin materia';
                const docenteNombre = docente?.nombre ?? 'Docente no asignado';
                const aulaNombre = aula?.nombre ?? 'Aula no asignada';
                const badgeColor = getMateriaBadgeColor(materia?.id);
                const tooltipContent = `Materia: ${materiaNombre}\nDocente: ${docenteNombre}\nAula: ${aulaNombre}`;

                return (
                  <td
                    key={day}
                    className={`${baseCellClasses} bg-white`}
                    rowSpan={cell.rowSpan}
                    title={tooltipContent}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${badgeColor}`}
                      >
                        {materiaNombre}
                      </span>
                      <span className="text-xs text-gray-600">{docenteNombre}</span>
                      <span className="text-xs text-gray-500">{aulaNombre}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

