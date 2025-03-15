from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from utils.recommendation import (
    recommend_major, 
    get_student_info, 
    comprehensive_recommendation,
    get_demo_students
)
from utils.feature_engineering import generate_features_from_student_data

app = Flask(__name__)
CORS(app)  

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data')

try:
    major_model = joblib.load(os.path.join(MODEL_PATH, 'major_model.pkl'))
    major_scaler = joblib.load(os.path.join(MODEL_PATH, 'major_scaler.pkl'))
    
    df = pd.read_csv(os.path.join(DATA_PATH, 'student_data.csv'))
    feature_matrix = pd.read_csv(os.path.join(DATA_PATH, 'feature_matrix.csv'))

    print("\nKiểm tra tính tương thích đặc trưng:")
    feature_columns = [col for col in feature_matrix.columns if col not in ['student_id', 'major']]
    print(f"Số cột đặc trưng trong feature_matrix: {len(feature_columns)}")
    print(f"Số đặc trưng mà scaler mong đợi: {major_scaler.n_features_in_}")
    
    expected_features = None
    if hasattr(major_scaler, 'feature_names_in_'):
        expected_features = major_scaler.feature_names_in_.tolist()
        extra_columns = set(feature_columns) - set(expected_features)
        if extra_columns:
            print(f"Các cột thừa sẽ bị loại bỏ: {extra_columns}")

    print("Đã tải mô hình và dữ liệu thành công!")

except Exception as e:
    print(f"Lỗi khi tải mô hình hoặc dữ liệu: {e}")
    major_model, major_scaler, df, feature_matrix = None, None, None, None
    expected_features = None

@app.route('/api/health', methods=['GET'])
def health():
    if major_model is None or major_scaler is None or df is None or feature_matrix is None:
        return jsonify({"status": "error", "message": "Mô hình hoặc dữ liệu chưa được tải"}), 500
    return jsonify({"status": "ok"})

@app.route('/api/students/demo', methods=['GET'])
def get_demo_student_list():
    limit = request.args.get('limit', default=5, type=int)
    demo_students = get_demo_students(df, limit)
    return jsonify(demo_students)

@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    student_data = get_student_info(student_id, df, feature_matrix)
    if student_data is None:
        return jsonify({"error": f"Không tìm thấy sinh viên với ID {student_id}"}), 404
    return jsonify(student_data)

@app.route('/api/recommend/<int:student_id>', methods=['GET'])
def recommend(student_id):
    """Cung cấp gợi ý toàn diện cho sinh viên"""
    result = comprehensive_recommendation(student_id, df, major_model, major_scaler, feature_matrix, expected_features)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result)

@app.route('/api/predict_with_data', methods=['POST'])
def predict_with_data():
    """Dự đoán chuyên ngành dựa trên dữ liệu sinh viên thô"""
    data = request.json
    
    if not data or 'student_data' not in data:
        return jsonify({"error": "Dữ liệu sinh viên không hợp lệ"}), 400
    
    try:
        # Lấy dữ liệu sinh viên
        student_data = data['student_data']
        print(f"Nhận được dữ liệu của {len(student_data)} môn học")
        
        if len(student_data) == 0:
            return jsonify({"error": "Không có dữ liệu môn học"}), 400
        
        # Kiểm tra trường skill_list có tồn tại không
        has_skills = any('skill_list' in record for record in student_data)
        print(f"Có thông tin kỹ năng: {has_skills}")
        
        if not has_skills:
            print("CẢNH BÁO: Dữ liệu không có thông tin về kỹ năng (skill_list)!")
            # Có thể thêm skill mặc định nếu cần
        
        # Tạo DataFrame từ dữ liệu sinh viên
        student_df = pd.DataFrame(student_data)
        
        # In thông tin cơ bản để debug
        print(f"Student ID: {student_df['student_id'].iloc[0]}")
        print(f"Số môn học: {len(student_df)}")
        print(f"Các cột: {student_df.columns.tolist()}")
            
        # Tạo đặc trưng từ dữ liệu sinh viên
        features = generate_features_from_student_data(student_df)
        
        print(f"Đã tạo {len(features)} đặc trưng từ dữ liệu sinh viên")
        
        # Đảm bảo số lượng đặc trưng chính xác
        if len(features) != major_scaler.n_features_in_:
            print(f"WARNING: Số lượng đặc trưng ({len(features)}) không khớp với mô hình ({major_scaler.n_features_in_})")
            
            if len(features) > major_scaler.n_features_in_:
                print(f"Cắt bớt vector đặc trưng từ {len(features)} xuống {major_scaler.n_features_in_}")
                features = features[:major_scaler.n_features_in_]
            else:
                print(f"Bổ sung vector đặc trưng từ {len(features)} lên {major_scaler.n_features_in_}")
                features = features + [0] * (major_scaler.n_features_in_ - len(features))
        
        # Chuẩn hóa dữ liệu đầu vào
        print('features_scaled',features)
        features_scaled = major_scaler.transform(np.array(features).reshape(1, -1))
        # Dự đoán xác suất
        major_probs = major_model.predict_proba(features_scaled)[0]
        # Lấy top N kết quả
        top_n = data.get('top_n', 3)
        
        # Tạo danh sách các chuyên ngành được dự đoán
        predictions = []
        for major, prob in zip(major_model.classes_, major_probs):
            predictions.append({
                'major': major,
                'probability': float(prob)
            })
        
        # Sắp xếp theo xác suất giảm dần
        predictions.sort(key=lambda x: x['probability'], reverse=True)
        
        # Lấy top N
        result = {
            'majors': predictions[:top_n]
        }
        return jsonify(result)
    except Exception as e:
        print(f"Lỗi khi dự đoán từ dữ liệu sinh viên: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Lỗi khi dự đoán: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)