import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Facultad } from '../types/Facultad';

export function useFacultades() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        const res = await api.get('/facultades');
        setFacultades(res.data);
      } catch (err) {
        console.error('Error al cargar facultades', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultades();
  }, []);

  return { facultades, loading };
}
