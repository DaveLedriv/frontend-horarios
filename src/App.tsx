import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import CrearMateria from './pages/Materias/CrearMateria';
import ListaMaterias from './pages/Materias/ListaMaterias';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/materias" element={<ListaMaterias />} />
          <Route path="/materias/crear" element={<CrearMateria />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
