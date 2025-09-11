import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Facultad } from '../types/Facultad';

export function useFacultades() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacultades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facultades');
      setFacultades(res.data);
    } catch (err) {
      console.error('Error al cargar facultades', err);
      setFacultades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultades();
  }, []);

  return { facultades, loading, refetch: fetchFacultades };
}
