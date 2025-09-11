import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Aula } from '../types/Aula';

export const useAulas = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAulas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/aulas');
      if (Array.isArray(res.data)) {
        setAulas(res.data);
      } else {
        setAulas([]);
      }
    } catch (error) {
      console.error('Error al cargar aulas:', error);
      setAulas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  return { aulas, loading, refetch: fetchAulas };
};

export default useAulas;
