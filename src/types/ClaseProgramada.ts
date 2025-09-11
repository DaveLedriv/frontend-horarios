import { AsignacionMateria } from './AsignacionMateria';
import { Aula } from './Aula';

export interface ClaseProgramada {
  id: number;
  asignacion: AsignacionMateria;
  aula: Aula;
  dia: string;
  hora_inicio: string; // formato HH:mm:ss
  hora_fin: string;   // formato HH:mm:ss
}
