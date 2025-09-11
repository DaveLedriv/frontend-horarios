import { useEffect, useState } from 'react';
import api from '../lib/api';
import { PlanEstudio } from '../types/PlanEstudio';

export function usePlanesEstudio() {
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await api.get('/planes-estudio');
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
