import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import CrearMateria from './pages/Materias/CrearMateria';
import ListaMaterias from './pages/Materias/ListaMaterias';
import EditarMateria from './pages/Materias/EditarMateria';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/materias" element={<ListaMaterias />} />
          <Route path="/materias/crear" element={<CrearMateria />} />
          <Route path="/materias/editar/:id" element={<EditarMateria />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
