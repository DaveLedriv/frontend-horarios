import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Materia } from '../types/Materia';

export function useMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterias = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/materias');
      setMaterias(res.data);
    } catch (err) {
      console.error('Error al cargar materias:', err);
      setError('No se pudieron cargar las materias');
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  return { materias, loading, error, refetch: fetchMaterias };
}
