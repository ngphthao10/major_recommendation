import React from 'react';
import { Link } from 'react-router-dom';
import StudentDetail from '../components/StudentDetail';

const StudentPage = () => {
    return (
        <div className="student-page">
            <div className="navigation">
                <Link to="/" className="back-button"> ← Quay lại </Link>
            </div>
            <StudentDetail />
        </div>
    );
};

export default StudentPage;