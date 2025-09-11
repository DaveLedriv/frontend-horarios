import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Materia } from '../types/Materia';

export function useMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const res = await apiClient.get('/materias');
        setMaterias(res.data);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setError('No se pudieron cargar las materias');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  return { materias, loading, error };
}
