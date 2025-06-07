import SidebarItem from './SidebarItem';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-700">Horarios U</h2>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">

        <SidebarItem
          label="Inicio"
          subItems={[{ label: 'Dashboard', path: '/dashboard' }]}
        />

        <SidebarItem
          label="Facultades"
          subItems={[
            { label: 'Crear Facultad', path: '/facultades/crear' },
            { label: 'Facultades Existentes', path: '/facultades' },
          ]}
        />

        <SidebarItem
  label="Planes de Estudio"
  subItems={[
    { label: 'Crear Plan', path: '/planes-estudio/crear' },
    { label: 'Planes Existentes', path: '/planes-estudio' },
  ]}
/>


        <SidebarItem
          label="Materias"
          subItems={[
            { label: 'Crear Materia', path: '/materias/crear' },
            { label: 'Materias Existentes', path: '/materias' },
          ]}
        />

        <SidebarItem
          label="Docentes"
          subItems={[
            { label: 'Crear Docente', path: '/docentes/crear' },
            { label: 'Docentes Existentes', path: '/docentes' },
          ]}
        />

        <SidebarItem
          label="Asignaciones"
          subItems={[
            { label: 'Crear Asignación', path: '/asignaciones/crear' },
            { label: 'Asignaciones Existentes', path: '/asignaciones' },
          ]}
        />

        <SidebarItem
          label="Horarios"
          subItems={[
            { label: 'Crear Horario', path: '/horarios/crear' },
            { label: 'Horarios Existentes', path: '/horarios' },
          ]}
        />
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
