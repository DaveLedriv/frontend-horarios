import { useEffect, useState } from 'react';
import axios from 'axios';
import { Facultad } from '../types/Facultad';

export function useFacultades() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/facultades`);
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
