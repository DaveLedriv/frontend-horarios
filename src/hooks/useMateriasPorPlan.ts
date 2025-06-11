// src/hooks/useMateriasPorPlan.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Materia } from '../types/Materia';

export const useMateriasPorPlan = (planId: number | string | undefined) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;

    const fetchMaterias = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/planes-estudio/${planId}/materias`);
        setMaterias(res.data.materias);
      } catch (error) {
        console.error('Error al cargar materias del plan', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [planId]);

  return { materias, loading };
};
