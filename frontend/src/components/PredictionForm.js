// frontend/src/components/PredictionForm.js
import React, { useState } from 'react';
import api from '../services/api';

// Danh sách môn học đã có sẵn
const SUBJECTS = [
    // Môn học thuộc nhóm Theory (lý thuyết)
    {
        name: "Đại số",
        code: "BAS1201",
        credits: 3,
        type: "theory",
        category: "general",
        skills: ["Tư duy logic", "Giải quyết vấn đề", "Tư duy toán học"]
    },
    {
        name: "Giải tích",
        code: "BAS1203",
        credits: 3,
        type: "theory",
        category: "general",
        skills: ["Phân tích", "Giải quyết vấn đề", "Tư duy toán học"]
    },
    {
        name: "Tiếng Anh",
        code: "BAS1156",
        credits: 2,
        type: "theory",
        category: "general",
        skills: ["Giao tiếp", "Ngoại ngữ", "Thuyết trình"]
    },
    {
        name: "Xác suất thống kê",
        code: "BAS1226",
        credits: 3,
        type: "theory",
        category: "general",
        skills: ["Phân tích dữ liệu", "Xử lý số liệu", "Thống kê"]
    },
    {
        name: "Cấu trúc dữ liệu và giải thuật",
        code: "INT1306",
        credits: 3,
        type: "theory",
        category: "core",
        skills: ["Lập trình", "Tư duy thuật toán", "Tối ưu hóa"]
    },
    {
        name: "Nhập môn trí tuệ nhân tạo",
        code: "INT1341",
        credits: 3,
        type: "theory",
        category: "core",
        skills: ["Machine Learning", "Xử lý dữ liệu", "Tư duy phân tích"]
    },
    {
        name: "Hệ điều hành",
        code: "INT1319",
        credits: 3,
        type: "theory",
        category: "core",
        skills: ["Quản lý tài nguyên", "Lập trình hệ thống", "Process"]
    },
    {
        name: "Nhập môn công nghệ phần mềm",
        code: "INT1340",
        credits: 3,
        type: "theory",
        category: "core",
        skills: ["Quy trình phát triển", "Kiểm thử", "Quản lý dự án"]
    },

    // Môn học thuộc nhóm Technique (kỹ thuật)
    {
        name: "Kỹ năng thuyết trình",
        code: "SKD1101",
        credits: 2,
        type: "technique",
        category: "general",
        skills: ["Thuyết trình", "Giao tiếp", "Tự tin"]
    },
    {
        name: "Kỹ năng làm việc nhóm",
        code: "SKD1102",
        credits: 2,
        type: "technique",
        category: "general",
        skills: ["Làm việc nhóm", "Giao tiếp", "Quản lý thời gian"]
    },
    {
        name: "Xử lý tín hiệu số",
        code: "ELE1330",
        credits: 3,
        type: "technique",
        category: "core",
        skills: ["Xử lý dữ liệu", "Lập trình", "Phân tích tín hiệu"]
    },
    {
        name: "Cơ sở dữ liệu",
        code: "INT1313",
        credits: 3,
        type: "technique",
        category: "core",
        skills: ["Thiết kế database", "Truy vấn", "Quản lý dữ liệu"]
    },
    {
        name: "Mạng máy tính",
        code: "INT1336",
        credits: 3,
        type: "technique",
        category: "core",
        skills: ["Quản trị mạng", "Bảo mật", "Giao thức mạng"]
    },
    {
        name: "An toàn và bảo mật hệ thống thông tin",
        code: "INT1303",
        credits: 3,
        type: "technique",
        category: "core",
        skills: ["Bảo mật", "Mã hóa", "Phân tích rủi ro"]
    },

    // Môn học thuộc nhóm Tool (công nghệ)
    {
        name: "Ngôn ngữ lập trình C++",
        code: "INT1339",
        credits: 3,
        type: "tool",
        category: "core",
        skills: ["Lập trình", "Giải quyết vấn đề", "Tư duy logic"]
    },
    {
        name: "Lập trình hướng đối tượng",
        code: "INT1332",
        credits: 3,
        type: "tool",
        category: "core",
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
        student_id: Date.now().toString(), // Tạo ID ngẫu nhiên dựa trên timestamp
        student_name: '',
        student_current_semester: '',
        student_current_gpa: ''
    });

    // Danh sách môn học đã học
    const [subjectsData, setSubjectsData] = useState([]);

    // Số lượng môn học mỗi trang
    const subjectsPerPage = 6;

    // Tổng số trang
    const totalPages = Math.ceil(SUBJECTS.length / subjectsPerPage);

    // Môn học hiển thị trên trang hiện tại
    const currentSubjects = SUBJECTS.slice(
        (currentPage - 1) * subjectsPerPage,
        currentPage * subjectsPerPage
    );

    // Xử lý thay đổi thông tin sinh viên
    const handleStudentInfoChange = (e) => {
        const { name, value } = e.target;
        setStudentInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm thêm môn học vào danh sách đã học trong PredictionForm.js
    const addSubject = (subjectCode) => {
        // Kiểm tra xem môn học đã tồn tại trong danh sách chưa
        if (subjectsData.some(item => item.subject_code === subjectCode)) {
            return;
        }

        // Tìm thông tin môn học
        const subject = SUBJECTS.find(s => s.code === subjectCode);

        // Thêm môn học mới vào danh sách
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

    // Xóa môn học khỏi danh sách đã học
    const removeSubject = (subjectCode) => {
        setSubjectsData(prev => prev.filter(item => item.subject_code !== subjectCode));
    };

    // Cập nhật thông tin môn học
    const updateSubjectData = (subjectCode, field, value) => {
        setSubjectsData(prev =>
            prev.map(item =>
                item.subject_code === subjectCode
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    // Chuyển trang
    const changePage = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Kiểm tra xem môn học đã được thêm vào danh sách chưa
    const isSubjectAdded = (subjectCode) => {
        return subjectsData.some(item => item.subject_code === subjectCode);
    };

    // Hàm chuẩn bị dữ liệu để gửi đến API trong PredictionForm.js
    const prepareData = () => {
        // Chuyển đổi dữ liệu sang định dạng giống với student_data.csv
        const rows = [];

        // Thêm dữ liệu cho mỗi môn học
        subjectsData.forEach(subject => {
            // Chỉ thêm các môn có điểm (đã học)
            if (subject.final_grade.trim() !== '') {
                // Tìm thông tin môn học trong danh sách SUBJECTS để lấy skills
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

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu đầu vào
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
            setResult(response);
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
                    <div className="major-recommendations">
                        {result.majors.map((item, index) => (
                            <div key={index} className="major-item">
                                <div className="major-rank">{index + 1}</div>
                                <div className="major-info">
                                    <h4>{item.major}</h4>
                                    <div className="probability-bar">
                                        <div className="probability-fill" style={{ width: `${item.probability * 100}%` }}></div>
                                        <span className="probability-text">{(item.probability * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionForm;