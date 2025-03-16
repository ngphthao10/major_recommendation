import React, { useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Thêm kiểu CSS cho thông báo không có dữ liệu
const styles = {
    noDataMessage: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        color: '#6c757d',
        fontStyle: 'italic',
        textAlign: 'center',
        border: '1px dashed #dee2e6'
    }
};

const SUBJECTS = [
    {
        name: "Đại số",
        code: "BAS1201",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Tư duy logic", "Giải quyết vấn đề", "Tư duy toán học"]
    },
    {
        name: "Giải tích",
        code: "BAS1203",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Phân tích", "Giải quyết vấn đề", "Tư duy toán học"]
    },
    {
        name: "Tiếng Anh",
        code: "BAS1156",
        credits: 2,
        category: "theory",
        type: "general",
        skills: ["Giao tiếp", "Ngoại ngữ", "Thuyết trình"]
    },
    {
        name: "Xác suất thống kê",
        code: "BAS1226",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Phân tích dữ liệu", "Xử lý số liệu", "Thống kê"]
    },
    {
        name: "Cấu trúc dữ liệu và giải thuật",
        code: "INT1306",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Lập trình", "Tư duy thuật toán", "Tối ưu hóa"]
    },
    {
        name: "Nhập môn trí tuệ nhân tạo",
        code: "INT1341",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Machine Learning", "Xử lý dữ liệu", "Tư duy phân tích"]
    },
    {
        name: "Hệ điều hành",
        code: "INT1319",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Quản lý tài nguyên", "Lập trình hệ thống", "Process"]
    },
    {
        name: "Nhập môn công nghệ phần mềm",
        code: "INT1340",
        credits: 3,
        category: "theory",
        type: "core",
        skills: ["Quy trình phát triển", "Kiểm thử", "Quản lý dự án"]
    },

    {
        name: "Kỹ năng thuyết trình",
        code: "SKD1101",
        credits: 2,
        category: "technique",
        type: "general",
        skills: ["Thuyết trình", "Giao tiếp", "Tự tin"]
    },
    {
        name: "Kỹ năng làm việc nhóm",
        code: "SKD1102",
        credits: 2,
        category: "technique",
        type: "general",
        skills: ["Làm việc nhóm", "Giao tiếp", "Quản lý thời gian"]
    },
    {
        name: "Xử lý tín hiệu số",
        code: "ELE1330",
        credits: 3,
        category: "technique",
        type: "core",
        skills: ["Xử lý dữ liệu", "Lập trình", "Phân tích tín hiệu"]
    },
    {
        name: "Cơ sở dữ liệu",
        code: "INT1313",
        credits: 3,
        category: "technique",
        type: "core",
        skills: ["Thiết kế database", "Truy vấn", "Quản lý dữ liệu"]
    },
    {
        name: "Mạng máy tính",
        code: "INT1336",
        credits: 3,
        category: "technique",
        type: "core",
        skills: ["Quản trị mạng", "Bảo mật", "Giao thức mạng"]
    },
    {
        name: "An toàn và bảo mật hệ thống thông tin",
        code: "INT1303",
        credits: 3,
        category: "technique",
        type: "core",
        skills: ["Bảo mật", "Mã hóa", "Phân tích rủi ro"]
    },

    {
        name: "Ngôn ngữ lập trình C++",
        code: "INT1339",
        credits: 3,
        category: "tool",
        type: "core",
        skills: ["Lập trình", "Giải quyết vấn đề", "Tư duy logic"]
    },
    {
        name: "Lập trình hướng đối tượng",
        code: "INT1332",
        credits: 3,
        category: "tool",
        type: "core",
        skills: ["Lập trình OOP", "Thiết kế phần mềm", "Mô hình hóa"]
    }
];

const PredictionForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Thông tin cơ bản
    const [studentInfo, setStudentInfo] = useState({
        student_id: Date.now().toString(),
        student_name: '',
        student_current_semester: '',
        student_current_gpa: ''
    });

    const [subjectsData, setSubjectsData] = useState([]);

    const subjectsPerPage = 6;

    const totalPages = Math.ceil(SUBJECTS.length / subjectsPerPage);

    const currentSubjects = SUBJECTS.slice(
        (currentPage - 1) * subjectsPerPage,
        currentPage * subjectsPerPage
    );

    const handleStudentInfoChange = (e) => {
        const { name, value } = e.target;
        setStudentInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSubject = (subjectCode) => {
        if (subjectsData.some(item => item.subject_code === subjectCode)) {
            return;
        }

        const subject = SUBJECTS.find(s => s.code === subjectCode);

        setSubjectsData(prev => [
            ...prev,
            {
                subject_code: subjectCode,
                subject_name: subject.name,
                subject_credits: subject.credits,
                subject_category: subject.category,
                subject_type: subject.type,
                final_grade: '',
                midterm_grade: '',
                assignment_grade: '',
                attendance_grade: '',
                retake_count: '0',
                skill_list: subject.skills.join(', ')
            }
        ]);
    };

    const removeSubject = (subjectCode) => {
        setSubjectsData(prev => prev.filter(item => item.subject_code !== subjectCode));
    };

    const updateSubjectData = (subjectCode, field, value) => {
        setSubjectsData(prev =>
            prev.map(item =>
                item.subject_code === subjectCode
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const changePage = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const isSubjectAdded = (subjectCode) => {
        return subjectsData.some(item => item.subject_code === subjectCode);
    };

    // Phân tích kỹ năng từ các môn học đã chọn
    const analyzeSkills = () => {
        const skillsCount = {};

        subjectsData.forEach(subject => {
            if (subject.final_grade && parseFloat(subject.final_grade) > 0) {
                const subjectInfo = SUBJECTS.find(s => s.code === subject.subject_code);
                if (subjectInfo && subjectInfo.skills) {
                    subjectInfo.skills.forEach(skill => {
                        if (!skillsCount[skill]) {
                            skillsCount[skill] = 0;
                        }
                        skillsCount[skill] += 1;
                    });
                }
            }
        });

        // Chuyển object thành array và sắp xếp
        return Object.entries(skillsCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Lấy top 10 kỹ năng
    };

    // Đề xuất các môn học có thể học tiếp
    const suggestNewSubjects = () => {
        // Lấy danh sách các môn đã có điểm
        const currentSubjectCodes = subjectsData
            .filter(subject => subject.final_grade && parseFloat(subject.final_grade) > 0)
            .map(subject => subject.subject_code);

        // Gợi ý các môn học chưa có trong danh sách đã học
        return SUBJECTS
            .filter(subject => !currentSubjectCodes.includes(subject.code))
            .slice(0, 5); // Lấy 5 môn đầu tiên
    };

    // Đề xuất các môn học cần cải thiện
    const suggestImprovements = () => {
        // Lấy các môn học có điểm dưới 7
        return subjectsData
            .filter(subject =>
                subject.final_grade &&
                parseFloat(subject.final_grade) > 0 &&
                parseFloat(subject.final_grade) < 7
            )
            .sort((a, b) => parseFloat(a.final_grade) - parseFloat(b.final_grade))
            .slice(0, 5); // Lấy 5 môn có điểm thấp nhất
    };

    const prepareData = () => {
        const rows = [];

        subjectsData.forEach(subject => {
            if (subject.final_grade.trim() !== '') {
                const subjectInfo = SUBJECTS.find(s => s.code === subject.subject_code);
                const skillList = subjectInfo ? subjectInfo.skills.join(', ') : '';

                const row = {
                    student_id: studentInfo.student_id,
                    student_name: studentInfo.student_name,
                    student_current_semester: studentInfo.student_current_semester,
                    student_current_gpa: studentInfo.student_current_gpa,
                    subject_code: subject.subject_code,
                    subject_name: subject.subject_name,
                    subject_credits: subject.subject_credits,
                    subject_category: subject.subject_category,
                    subject_type: subject.subject_type,
                    final_grade: subject.final_grade,
                    midterm_grade: subject.midterm_grade || '0',
                    assignment_grade: subject.assignment_grade || '0',
                    attendance_grade: subject.attendance_grade || '0',
                    retake_count: subject.retake_count || '0',
                    skill_list: skillList
                };

                rows.push(row);
            }
        });

        return rows;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (subjectsData.length === 0) {
            setError('Vui lòng thêm ít nhất một môn học đã học');
            return;
        }

        if (!studentInfo.student_current_gpa || !studentInfo.student_current_semester) {
            setError('Vui lòng nhập GPA và học kỳ hiện tại');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = prepareData();
            console.log("Dữ liệu gửi đi:", data);

            const response = await api.predictMajorWithStudentData(data);

            // Bổ sung phân tích kỹ năng và gợi ý môn học
            const enhancedResult = {
                ...response,
                skills: analyzeSkills(),
                subject_recommendations: {
                    new_subjects: suggestNewSubjects().map(subject => ({
                        subject_name: subject.name,
                        subject_code: subject.code,
                        final_grade: 8.0 // Giá trị mặc định cho điểm trung bình ngành
                    })),
                    improve_subjects: suggestImprovements().map(subject => ({
                        subject_name_student: subject.subject_name,
                        subject_code: subject.subject_code,
                        final_grade_student: parseFloat(subject.final_grade),
                        final_grade_target: 8.0 // Giá trị mặc định cho điểm cần đạt
                    }))
                }
            };

            setResult(enhancedResult);
        } catch (err) {
            setError('Lỗi khi dự đoán: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prediction-form-container">
            <h2>Dự đoán chuyên ngành phù hợp</h2>

            <form className="prediction-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Thông tin cơ bản</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="student_current_gpa">GPA hiện tại:</label>
                            <input
                                type="number"
                                id="student_current_gpa"
                                name="student_current_gpa"
                                min="0"
                                max="10"
                                step="0.01"
                                value={studentInfo.student_current_gpa}
                                onChange={handleStudentInfoChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="student_current_semester">Học kỳ hiện tại:</label>
                            <input
                                type="number"
                                id="student_current_semester"
                                name="student_current_semester"
                                min="1"
                                max="12"
                                value={studentInfo.student_current_semester}
                                onChange={handleStudentInfoChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Chọn môn học đã học</h3>
                    <p className="hint">
                        Chọn các môn học bạn đã học và nhập điểm. Để bỏ qua môn chưa học, không cần thêm môn đó vào danh sách.
                    </p>

                    <div className="subjects-browse">
                        <h4>Danh sách môn học ({currentPage}/{totalPages})</h4>
                        <div className="subjects-grid">
                            {currentSubjects.map(subject => (
                                <div
                                    key={subject.code}
                                    className={`subject-item ${isSubjectAdded(subject.code) ? 'added' : ''}`}
                                >
                                    <div className="subject-details">
                                        <div className="subject-name">{subject.name}</div>
                                        <div className="subject-code">{subject.code}</div>
                                        <div className="subject-meta">
                                            {subject.credits} tín chỉ | {subject.type} | {subject.category}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={`subject-action ${isSubjectAdded(subject.code) ? 'remove' : 'add'}`}
                                        onClick={() => isSubjectAdded(subject.code)
                                            ? removeSubject(subject.code)
                                            : addSubject(subject.code)
                                        }
                                    >
                                        {isSubjectAdded(subject.code) ? 'Xóa' : 'Thêm'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pagination">
                            <button
                                type="button"
                                onClick={() => changePage('prev')}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                &larr; Trang trước
                            </button>
                            <span className="page-indicator">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => changePage('next')}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                Trang tiếp &rarr;
                            </button>
                        </div>
                    </div>

                    {subjectsData.length > 0 && (
                        <div className="subjects-added">
                            <h4>Môn học đã thêm ({subjectsData.length})</h4>
                            <div className="subjects-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Môn học</th>
                                            <th>Điểm cuối kỳ</th>
                                            <th>Điểm giữa kỳ</th>
                                            <th>Điểm bài tập</th>
                                            <th>Điểm chuyên cần</th>
                                            <th>Số lần học lại</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectsData.map(subject => (
                                            <tr key={subject.subject_code}>
                                                <td className="subject-name-cell">
                                                    <div>{subject.subject_name}</div>
                                                    <small>{subject.subject_code}</small>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={subject.final_grade}
                                                        onChange={(e) => updateSubjectData(subject.subject_code, 'final_grade', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={subject.midterm_grade}
                                                        onChange={(e) => updateSubjectData(subject.subject_code, 'midterm_grade', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={subject.assignment_grade}
                                                        onChange={(e) => updateSubjectData(subject.subject_code, 'assignment_grade', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={subject.attendance_grade}
                                                        onChange={(e) => updateSubjectData(subject.subject_code, 'attendance_grade', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="1"
                                                        value={subject.retake_count}
                                                        onChange={(e) => updateSubjectData(subject.subject_code, 'retake_count', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="remove-button"
                                                        onClick={() => removeSubject(subject.subject_code)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Đang dự đoán...' : 'Dự đoán chuyên ngành'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {result && (
                <div className="prediction-result">
                    <h3>Kết quả dự đoán</h3>

                    {/* Phần dự đoán chuyên ngành */}
                    <div className="section">
                        <h3>Chuyên ngành phù hợp</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={result.majors.map(major => ({
                                    name: major.major,
                                    probability: Math.round(major.probability * 100)
                                }))}>
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
                            {result.majors.map((item, index) => (
                                <div key={index} className="recommendation-item">
                                    <h4>{index + 1}. {item.major}</h4>
                                    <p>Xác suất: {(item.probability * 100).toFixed(2)}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phần kỹ năng nổi bật */}
                    <div className="section">
                        <h3>Kỹ năng nổi bật</h3>
                        {result.skills && result.skills.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={result.skills} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={150} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#82ca9d" name="Số môn học có kỹ năng" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p style={styles.noDataMessage}>Không có dữ liệu kỹ năng. Vui lòng nhập điểm cho nhiều môn học hơn để phân tích kỹ năng.</p>
                        )}
                    </div>

                    {/* Phần gợi ý môn học */}
                    <div className="section">
                        <h3>Gợi ý môn học</h3>
                        <div className="subsection">
                            <h4>Môn học mới nên học</h4>
                            {result.subject_recommendations && result.subject_recommendations.new_subjects && result.subject_recommendations.new_subjects.length > 0 ? (
                                <ul className="subject-list">
                                    {result.subject_recommendations.new_subjects.map((subject, index) => (
                                        <li key={index} className="subject-item">
                                            <span className="subject-name">{subject.subject_name}</span>
                                            <span className="subject-grade">Điểm TB ngành: {subject.final_grade.toFixed(1)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={styles.noDataMessage}>Không có môn học mới để gợi ý.</p>
                            )}
                        </div>
                        <div className="subsection">
                            <h4>Môn học cần cải thiện</h4>
                            {result.subject_recommendations && result.subject_recommendations.improve_subjects && result.subject_recommendations.improve_subjects.length > 0 ? (
                                <ul className="subject-list">
                                    {result.subject_recommendations.improve_subjects.map((subject, index) => (
                                        <li key={index} className="subject-item">
                                            <span className="subject-name">{subject.subject_name_student}</span>
                                            <div className="subject-grades">
                                                <span className="your-grade">Điểm của bạn: {subject.final_grade_student.toFixed(1)}</span>
                                                <span className="target-grade">Điểm TB ngành: {subject.final_grade_target.toFixed(1)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={styles.noDataMessage}>Không có môn học nào cần cải thiện.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionForm;