import { useEffect, useState } from 'react';
import axios from 'axios';
import { PlanEstudio } from '../types/PlanEstudio';

export function usePlanesEstudio() {
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/planes-estudio`);
        setPlanes(res.data);
      } catch (error) {
        console.error('Error al cargar planes de estudio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  return { planes, loading };
}
