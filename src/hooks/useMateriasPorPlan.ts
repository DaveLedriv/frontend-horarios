// src/hooks/useMateriasPorPlan.ts
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Materia } from '../types/Materia';

export const useMateriasPorPlan = (planId: number | string | undefined) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterias = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await api.get(`/planes-estudio/${planId}/materias`);
      setMaterias(res.data.materias);
    } catch (error) {
      console.error('Error al cargar materias del plan', error);
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, [planId]);

  return { materias, loading, refetch: fetchMaterias };
};
