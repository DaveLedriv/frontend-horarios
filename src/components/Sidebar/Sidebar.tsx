import SidebarItem from './SidebarItem';

interface MenuItem {
  label: string;
  subItems: { label: string; path: string }[];
}

const menu: MenuItem[] = [
  {
    label: 'Inicio',
    subItems: [{ label: 'Dashboard', path: '/dashboard' }],
  },
  {
    label: 'Facultades',
    subItems: [
      { label: 'Crear Facultad', path: '/facultades/crear' },
      { label: 'Facultades Existentes', path: '/facultades' },
    ],
  },
  {
    label: 'Planes de Estudio',
    subItems: [
      { label: 'Crear Plan', path: '/planes-estudio/crear' },
      { label: 'Planes Existentes', path: '/planes-estudio' },
    ],
  },
  {
    label: 'Materias',
    subItems: [
      { label: 'Crear Materia', path: '/materias/crear' },
      { label: 'Materias Existentes', path: '/materias' },
    ],
  },
  {
    label: 'Docentes',
    subItems: [
      { label: 'Crear Docente', path: '/docentes/crear' },
      { label: 'Docentes Existentes', path: '/docentes' },
    ],
  },
  {
    label: 'Disponibilidad',
    subItems: [
      { label: 'Ver Disponibilidad', path: '/disponibilidad/ver' },
      { label: 'Crear Disponibilidad', path: '/disponibilidad/crear' },
    ],
  },
  {
    label: 'Asignaciones',
    subItems: [
      { label: 'Crear Asignación', path: '/asignaciones/crear' },
      { label: 'Ver/Editar Asignaciones', path: '/asignaciones' },
      { label: 'Asignaciones por Docente', path: '/asignaciones/docente/1' }, // se puede cambiar el ID dinámicamente si deseas
    ],
  },
  {
    label: 'Horarios',
    subItems: [
      { label: 'Crear Horario', path: '/horarios/crear' },
      { label: 'Horarios Existentes', path: '/horarios' },
    ],
  },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-700">Horarios U</h2>
      </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menu.map((item) => (
            <SidebarItem key={item.label} label={item.label} subItems={item.subItems} />
          ))}
        </nav>

      <div className="px-4 py-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
