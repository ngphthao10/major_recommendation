import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.getDemoStudents();
                setStudents(data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách sinh viên');
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="student-list">
            <h2>Danh sách sinh viên demo</h2>
            <div className="card-container">
                {students.map(studentId => (
                    <div key={studentId} className="student-card">
                        <h3>Sinh viên ID: {studentId}</h3>
                        <Link to={`/student/${studentId}`} className="button">
                            Xem chi tiết
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentList;