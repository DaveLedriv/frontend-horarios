// src/hooks/useDocentes.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Docente } from '../types/Docente';

export const useDocentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/docentes`);
      if (Array.isArray(res.data)) {
        setDocentes(res.data);
      } else {
        console.warn('La respuesta no contiene un arreglo de docentes');
        setDocentes([]);
      }
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      setDocentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  return { docentes, loading, refetch: fetchDocentes };
};
