import React from 'react';
import StudentList from '../components/StudentList';


const HomePage = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <h1>Hệ thống gợi ý chuyên ngành cho sinh viên</h1>
                <p>Dựa trên kết quả học tập</p>
            </div>
            <StudentList />
        </div>
    );
};

export default HomePage;

