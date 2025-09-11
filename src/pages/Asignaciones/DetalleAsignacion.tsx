import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AsignacionMateria } from '../../types/AsignacionMateria';

export default function DetalleAsignacion() {
  const { id } = useParams<{ id: string }>();
  const [asignacion, setAsignacion] = useState<AsignacionMateria | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchAsignacion = async () => {
      try {
        const res = await api.get(`/asignaciones/${id}`);
        setAsignacion(res.data);
      } catch (error) {
        console.error('Error al obtener la asignación:', error);
        showError('No se pudo cargar la asignación');
      } finally {
        setLoading(false);
      }
    };

    fetchAsignacion();
  }, [id]);

  if (loading) {
    return <DashboardLayout><p className="text-center">Cargando...</p></DashboardLayout>;
  }

  if (!asignacion) {
    return <DashboardLayout><p className="text-center text-red-600">Asignación no encontrada</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Detalle de Asignación #{asignacion.id}</h2>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Docente</h3>
            <p>{asignacion.docente.nombre} ({asignacion.docente.correo})</p>
          </div>

          <div>
            <h3 className="font-semibold">Materia</h3>
            <p>{asignacion.materia.nombre} - {asignacion.materia.codigo}</p>
            <p>Créditos: {asignacion.materia.creditos}</p>
            <p>Tipo: {asignacion.materia.tipo}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/asignaciones"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Volver a la lista de asignaciones
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
