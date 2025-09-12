import { Link } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useDocentes } from '../../hooks/useDocentes';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';


export default function DocentesList() {
  const { docentes, loading, refetch } = useDocentes();
  const { showSuccess, showError } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const eliminarDocente = async (id: number) => {
    try {
      await api.delete(`/docentes/${id}`);
      await refetch();
      showSuccess('Docente eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar docente:', err);
      showError('No se pudo eliminar el docente.');
    }
  };

  const handleEliminar = (id: number) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      eliminarDocente(selectedId);
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Docentes</h2>
        <Link
          to="/docentes/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Nuevo docente
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : docentes.length === 0 ? (
        <EmptyState message="No hay docentes registrados." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Número Empleado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.nombre}</td>
                  <td className="px-4 py-2">{d.correo}</td>
                  <td className="px-4 py-2">{d.numero_empleado}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/docentes/editar/${d.id}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/asignaciones/docente/${d.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                    >
                      Ver asignaciones
                    </Link>
                    <Link
                      to={`/horarios/docente/${d.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Ver horario
                    </Link>
                    <button
                      onClick={() => handleEliminar(d.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="Eliminar docente"
        message="¿Estás seguro de eliminar este docente?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
