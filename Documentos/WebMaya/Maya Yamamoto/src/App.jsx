import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginAdmin from "./loginadmin";
import Prontuarios from "./prontuarios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginAdmin />} />
        <Route path="/prontuarios" element={<Prontuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;