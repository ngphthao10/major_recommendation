import React, { useState, useEffect } from 'react';
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
    },
    infoBox: {
        padding: '10px 15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #b8daff'
    }
};

const SUBJECTS = [
    {
        name: "Đại số",
        code: "BAS1201",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Tư duy logic", "Giải quyết vấn đề", "Tư duy toán học"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Giải tích",
        code: "BAS1203",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Phân tích", "Giải quyết vấn đề", "Tư duy toán học"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Tiếng Anh",
        code: "BAS1156",
        credits: 2,
        category: "theory",
        type: "general",
        no_theory: 30,
        no_practice: 0,
        skills: ["Giao tiếp", "Ngoại ngữ", "Thuyết trình"],
        attendance_percentage: 20.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 0.0
    },
    {
        name: "Xác suất thống kê",
        code: "BAS1226",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Phân tích dữ liệu", "Xử lý số liệu", "Thống kê"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Cấu trúc dữ liệu và giải thuật",
        code: "INT1306",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Lập trình", "Tư duy thuật toán", "Tối ưu hóa"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Nhập môn trí tuệ nhân tạo",
        code: "INT1341",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Machine Learning", "Xử lý dữ liệu", "Tư duy phân tích"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Hệ điều hành",
        code: "INT1319",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Quản lý tài nguyên", "Lập trình hệ thống", "Process"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Nhập môn công nghệ phần mềm",
        code: "INT1340",
        credits: 3,
        category: "theory",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Quy trình phát triển", "Kiểm thử", "Quản lý dự án"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Kỹ năng thuyết trình",
        code: "SKD1101",
        credits: 2,
        category: "technique",
        type: "general",
        no_theory: 15,
        no_practice: 15,
        skills: ["Thuyết trình", "Giao tiếp", "Tự tin"],
        attendance_percentage: 20.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 0.0
    },
    {
        name: "Kỹ năng làm việc nhóm",
        code: "SKD1102",
        credits: 2,
        category: "technique",
        type: "general",
        no_theory: 15,
        no_practice: 15,
        skills: ["Làm việc nhóm", "Giao tiếp", "Quản lý thời gian"],
        attendance_percentage: 20.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 0.0
    },
    {
        name: "Xử lý tín hiệu số",
        code: "ELE1330",
        credits: 3,
        category: "technique",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Xử lý dữ liệu", "Lập trình", "Phân tích tín hiệu"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Cơ sở dữ liệu",
        code: "INT1313",
        credits: 3,
        category: "technique",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Thiết kế database", "Truy vấn", "Quản lý dữ liệu"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Mạng máy tính",
        code: "INT1336",
        credits: 3,
        category: "technique",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Quản trị mạng", "Bảo mật", "Giao thức mạng"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "An toàn và bảo mật hệ thống thông tin",
        code: "INT1303",
        credits: 3,
        category: "technique",
        type: "core",
        no_theory: 30,
        no_practice: 15,
        skills: ["Bảo mật", "Mã hóa", "Phân tích rủi ro"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Ngôn ngữ lập trình C++",
        code: "INT1339",
        credits: 3,
        category: "tool",
        type: "core",
        no_theory: 15,
        no_practice: 30,
        skills: ["Lập trình", "Giải quyết vấn đề", "Tư duy logic"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    },
    {
        name: "Lập trình hướng đối tượng",
        code: "INT1332",
        credits: 3,
        category: "tool",
        type: "core",
        no_theory: 15,
        no_practice: 30,
        skills: ["Lập trình OOP", "Thiết kế phần mềm", "Mô hình hóa"],
        attendance_percentage: 10.0,
        midterm_percentage: 30.0,
        final_percentage: 50.0,
        assignment_percentage: 10.0
    }
];

const PredictionForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Thông tin cơ bản - được tính toán tự động
    const [studentInfo, setStudentInfo] = useState({
        student_id: Date.now().toString(),
        student_name: '',
        student_current_gpa: '' // Sẽ được tính từ các môn học
    });

    const [subjectsData, setSubjectsData] = useState([]);
    const [calculatedGPA, setCalculatedGPA] = useState(0);

    const subjectsPerPage = 6;
    const totalPages = Math.ceil(SUBJECTS.length / subjectsPerPage);

    const currentSubjects = SUBJECTS.slice(
        (currentPage - 1) * subjectsPerPage,
        currentPage * subjectsPerPage
    );

    // Tính GPA và ước tính học kỳ hiện tại dựa trên môn học đã hoàn thành
    useEffect(() => {
        calculateGPAAndSemester();
    }, [subjectsData]);

    const calculateGPAAndSemester = () => {
        // Chỉ tính các môn có điểm cuối kỳ
        const completedSubjects = subjectsData.filter(
            subject => subject.final_grade && parseFloat(subject.final_grade) > 0
        );

        if (completedSubjects.length === 0) {
            setCalculatedGPA(0);
            return;
        }

        let totalCredits = 0;
        let weightedScore = 0;

        completedSubjects.forEach(subject => {
            const subjectInfo = SUBJECTS.find(s => s.code === subject.subject_code);
            if (subjectInfo) {
                const credits = subjectInfo.credits;

                // Lấy các điểm thành phần, sử dụng 0 nếu không có
                const attendanceGrade = subject.attendance_grade ? parseFloat(subject.attendance_grade) : 0;
                const midtermGrade = subject.midterm_grade ? parseFloat(subject.midterm_grade) : 0;
                const assignmentGrade = subject.assignment_grade ? parseFloat(subject.assignment_grade) : 0;
                const finalGrade = subject.final_grade ? parseFloat(subject.final_grade) : 0;
                const attendancePercentage = attendanceGrade * 10;

                const calculatedGrade =
                    (finalGrade * subjectInfo.final_percentage +
                        midtermGrade * subjectInfo.midterm_percentage +
                        assignmentGrade * subjectInfo.assignment_percentage +
                        attendancePercentage * subjectInfo.attendance_percentage / 100.0) / 100.0;

                totalCredits += credits;
                weightedScore += credits * calculatedGrade;
            }
        });

        // Tính GPA
        const gpa = totalCredits > 0 ? (weightedScore / totalCredits).toFixed(2) : 0;
        setCalculatedGPA(gpa);

        // Cập nhật thông tin sinh viên
        setStudentInfo(prev => ({
            ...prev,
            student_current_gpa: gpa.toString(),
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

        const completedSubjects = subjectsData.filter(
            subject => subject.final_grade && parseFloat(subject.final_grade) > 0
        );

        if (completedSubjects.length === 0) {
            setError('Vui lòng thêm ít nhất một môn học và nhập điểm cuối kỳ');
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
                    <h3>Thông tin học tập</h3>
                    <div style={styles.infoBox}>
                        <p><strong>GPA hiện tại:</strong> {calculatedGPA > 0 ? calculatedGPA : 'Chưa có dữ liệu'}</p>
                        <p><em>Lưu ý: GPA được tính tự động dựa trên điểm các thành phần (chuyên cần, giữa kỳ, cuối kỳ, bài tập) theo tỷ lệ phần trăm riêng của từng môn.</em></p>
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
                    <h2>Kết quả dự đoán</h2>

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