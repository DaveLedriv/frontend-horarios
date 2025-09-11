import { Docente } from './Docente';
import { Materia } from './Materia';

export interface AsignacionMateria {
  id: number;
  docente: Docente;
  materia: Materia;
}
