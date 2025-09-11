import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';

export default function AsignacionesList() {
  const { asignaciones, loading, error, refetch } = useAsignaciones();
  const { showSuccess, showError } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const eliminarAsignacion = async (id: number) => {
    try {
      await api.delete(`/asignaciones/${id}`);
      await refetch();
      showSuccess('Asignación eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      showError('No se pudo eliminar la asignación.');
    }
  };

  const handleEliminar = (id: number) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      eliminarAsignacion(selectedId);
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Asignaciones</h2>
        <Link
          to="/asignaciones/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Nueva asignación
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : asignaciones.length === 0 ? (
        <EmptyState message="No hay asignaciones registradas." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Docente</th>
                <th className="px-4 py-2 text-left">Materia</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.docente.nombre}</td>
                  <td className="px-4 py-2">{a.materia.nombre}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/asignaciones/${a.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                    >
                      Ver detalle
                    </Link>
                    <Link
                      to={`/asignaciones/editar/${a.id}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleEliminar(a.id)}
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
        title="Eliminar asignación"
        message="¿Estás seguro de eliminar esta asignación?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
