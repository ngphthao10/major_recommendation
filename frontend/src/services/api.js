// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    // Lấy danh sách sinh viên demo
    getDemoStudents: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students/demo`);
            return response.data;
        } catch (error) {
            console.error('Error fetching demo students:', error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết của sinh viên
    getStudentInfo: async (studentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching student ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy gợi ý toàn diện cho sinh viên
    getRecommendation: async (studentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/recommend/${studentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching recommendations for student ${studentId}:`, error);
            throw error;
        }
    },

    // Dự đoán chuyên ngành dựa trên vector đặc trưng
    predictMajor: async (features, topN = 3) => {
        try {
            console.log('Sending features to API:', features);

            const response = await axios.post(`${API_BASE_URL}/predict`, {
                features,
                top_n: topN
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error predicting major:', error);
            if (error.response) {
                console.error('Server error:', error.response.data);
                throw new Error(error.response.data.error || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối đến server');
            } else {
                throw error;
            }
        }
    },

    // Dự đoán chuyên ngành dựa trên dữ liệu sinh viên thô
    predictMajorWithStudentData: async (studentData, topN = 3) => {
        try {
            console.log('Sending student data to API:', studentData);

            const response = await axios.post(`${API_BASE_URL}/predict_with_data`, {
                student_data: studentData,
                top_n: topN
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error predicting major with student data:', error);
            if (error.response) {
                console.error('Server error:', error.response.data);
                throw new Error(error.response.data.error || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối đến server');
            } else {
                throw error;
            }
        }
    }
};

export default api;