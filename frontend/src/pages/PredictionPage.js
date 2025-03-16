// frontend/src/pages/PredictionPage.js
import React from 'react';
import PredictionForm from '../components/PredictionForm';

const PredictionPage = () => {
    return (
        <div className="prediction-page">
            <div className="page-header">
                <h1>Dự đoán chuyên ngành phù hợp</h1>
                <p className="page-description">
                    Nhập thông tin học tập của bạn để nhận gợi ý về chuyên ngành phù hợp nhất.
                    Hệ thống sẽ phân tích dữ liệu học tập và đưa ra dự đoán dựa trên mô hình machine learning.
                </p>
            </div>

            <div className="instruction-block">
                <h3>Hướng dẫn</h3>
                <ul className="instruction-list">
                    <li>
                        <span className="step-number">1</span>
                        <span className="step-text">Nhập thông tin cơ bản về GPA và học kỳ hiện tại.</span>
                    </li>
                    <li>
                        <span className="step-number">2</span>
                        <span className="step-text">Chọn các môn học mà bạn đã học để thêm vào danh sách. Nên nhập từ 10 môn học trở lên để mô hình đưa ra kết quả tốt nhất.</span>
                    </li>
                    <li>
                        <span className="step-number">3</span>
                        <span className="step-text">Nhập điểm thành phần của các môn học đó. Chú ý nhập đúng thứ tự các cột điểm.</span>
                    </li>

                </ul>
            </div>

            <PredictionForm />
        </div>
    );
};

export default PredictionPage;