import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudentPage from './pages/StudentPage';
import PredictionPage from './pages/PredictionPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <Link to="/">Dự đoán chuyên ngành sinh viên</Link>
          </div>
          <nav className="navigation">
            <Link to="/">Trang chủ</Link>
            <Link to="/predict">Dự đoán</Link>
          </nav>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/student/:studentId" element={<StudentPage />} />
            <Route path="/predict" element={<PredictionPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 MajorMatch - Hệ thống gợi ý chuyên ngành</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;