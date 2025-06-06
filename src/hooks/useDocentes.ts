// src/hooks/useDocentes.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Docente } from '../types/Docente';

export const useDocentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/docentes`);
        setDocentes(res.data);
      } catch (error) {
        console.error('Error al cargar docentes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocentes();
  }, []);

  return { docentes, loading };
};
