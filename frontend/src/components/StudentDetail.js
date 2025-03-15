import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StudentDetail = () => {
    const { studentId } = useParams();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const data = await api.getRecommendation(parseInt(studentId));
                setRecommendation(data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin sinh viên');
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, [studentId]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!recommendation) return <div>Không tìm thấy thông tin sinh viên</div>;

    const { student, major_recommendations, subject_recommendations } = recommendation;
    const { info, subjects, skills } = student;

    // Dữ liệu cho biểu đồ kỹ năng
    const skillData = Object.entries(skills).map(([name, count]) => ({
        name,
        count
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    // Dữ liệu cho biểu đồ gợi ý chuyên ngành
    const majorData = major_recommendations.map(item => ({
        name: item.major,
        probability: Math.round(item.probability * 100)
    }));

    return (
        <div className="student-detail">
            <div className="header">
                <h2>Thông tin sinh viên</h2>
                <div className="student-info">
                    <p><strong>ID:</strong> {info.student_id}</p>
                    <p><strong>Tên:</strong> {info.student_name}</p>
                    <p><strong>Học kỳ hiện tại:</strong> {info.student_current_semester}</p>
                    <p><strong>GPA:</strong> {info.student_current_gpa}</p>
                    <p><strong>Chuyên ngành hiện tại:</strong> {info.current_major}</p>
                </div>
            </div>

            <div className="section">
                <h3>Gợi ý chuyên ngành</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={majorData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Xác suất (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="probability" fill="#8884d8" name="Xác suất (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="recommendations">
                    {major_recommendations.map((item, index) => (
                        <div key={index} className="recommendation-item">
                            <h4>{index + 1}. {item.major}</h4>
                            <p>Xác suất: {(item.probability * 100).toFixed(2)}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="section">
                <h3>Kỹ năng nổi bật</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Số môn học có kỹ năng" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="section">
                <h3>Gợi ý môn học</h3>
                <div className="subsection">
                    <h4>Môn học mới nên học</h4>
                    <ul className="subject-list">
                        {subject_recommendations.new_subjects.map((subject, index) => (
                            <li key={index} className="subject-item">
                                <span className="subject-name">{subject.subject_name}</span>
                                <span className="subject-grade">Điểm TB ngành: {subject.final_grade.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="subsection">
                    <h4>Môn học cần cải thiện</h4>
                    <ul className="subject-list">
                        {subject_recommendations.improve_subjects.map((subject, index) => (
                            <li key={index} className="subject-item">
                                <span className="subject-name">{subject.subject_name_student}</span>
                                <div className="subject-grades">
                                    <span className="your-grade">Điểm của bạn: {subject.final_grade_student.toFixed(1)}</span>
                                    <span className="target-grade">Điểm TB ngành: {subject.final_grade_target.toFixed(1)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="section">
                <h3>Danh sách môn học đã học</h3>
                <table className="subject-table">
                    <thead>
                        <tr>
                            <th>Mã môn</th>
                            <th>Tên môn</th>
                            <th>Loại môn</th>
                            <th>Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.sort((a, b) => b.final_grade - a.final_grade).map((subject, index) => (
                            <tr key={index}>
                                <td>{subject.subject_code}</td>
                                <td>{subject.subject_name}</td>
                                <td>{subject.subject_category}</td>
                                <td className={subject.final_grade >= 8 ? 'high-grade' : subject.final_grade < 5 ? 'low-grade' : ''}>
                                    {subject.final_grade.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDetail;