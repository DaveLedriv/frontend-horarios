import { ClaseProgramada } from '../../types/ClaseProgramada';

interface HorarioCell {
  clase: ClaseProgramada;
  rowSpan: number;
}

interface HorarioGridProps {
  clases: Record<string, HorarioCell | null>;
}

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

export default function HorarioGrid({ clases }: HorarioGridProps) {
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="border px-2 py-2">Hora</th>
          {days.map((d) => (
            <th key={d} className="border px-4 py-2">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => (
          <tr key={hour}>
            <td className="border px-2 py-2">{formatHour(hour)}</td>
            {days.map((day) => {
              const timeKey = `${hour.toString().padStart(2, '0')}:00:00`;
              const key = `${day}-${timeKey}`;
              const cell = clases[key];
              if (cell === undefined) {
                return <td key={day} className="border px-4 py-2"></td>;
              }
              if (cell === null) {
                return null;
              }
              return (
                <td
                  key={day}
                  className="border px-4 py-2 text-center bg-blue-100"
                  rowSpan={cell.rowSpan}
                >
                  <div className="font-semibold">
                    {cell.clase.asignacion.materia.nombre}
                  </div>
                  <div className="text-sm">{cell.clase.aula.nombre}</div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

