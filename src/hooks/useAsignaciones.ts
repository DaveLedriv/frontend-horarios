import { useEffect, useState } from 'react';
import api from '../lib/api';
import { AsignacionMateria } from '../types/AsignacionMateria';

export function useAsignaciones() {
  const [asignaciones, setAsignaciones] = useState<AsignacionMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsignaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/asignaciones');
      setAsignaciones(res.data);
    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
      setError('No se pudieron cargar las asignaciones');
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  return { asignaciones, loading, error, refetch: fetchAsignaciones };
}
