import pandas as pd
import numpy as np
import joblib

def recommend_major(student_features, model, scaler, feature_matrix, top_n=3):
    """Gợi ý chuyên ngành cho sinh viên dựa trên các đặc trưng"""
    
    print(f"Số lượng đặc trưng của sinh viên: {len(student_features)}")
    print(f"Số lượng đặc trưng mà scaler mong đợi: {scaler.n_features_in_}")
    
    if len(student_features) != scaler.n_features_in_:
        print("WARNING: Không khớp số lượng đặc trưng!")
        if len(student_features) > scaler.n_features_in_:
            student_features = student_features[:scaler.n_features_in_]
        else:
            student_features = student_features + [0] * (scaler.n_features_in_ - len(student_features))
        
        print(f"Đã điều chỉnh số lượng đặc trưng: {len(student_features)}")
    
    # Chuẩn hóa tính năng
    student_features_scaled = scaler.transform(np.array(student_features).reshape(1, -1))
    
    # Dự đoán xác suất cho mỗi chuyên ngành
    major_probs = model.predict_proba(student_features_scaled)[0]
    
    # Sắp xếp theo xác suất
    major_predictions = pd.DataFrame({
        'major': model.classes_,
        'probability': major_probs
    }).sort_values('probability', ascending=False)
    
    # Lấy top N chuyên ngành
    top_majors = major_predictions.head(top_n)
    
    return top_majors.to_dict(orient='records')

def get_student_info(student_id, df, feature_matrix):
    """Lấy thông tin của sinh viên"""
    if student_id not in df['student_id'].values:
        return None
    
    # Lấy thông tin cơ bản
    student_info = df[df['student_id'] == student_id][
        ['student_id', 'student_name', 'student_current_semester', 'student_current_gpa']
    ].drop_duplicates().iloc[0].to_dict()
    
    # Lấy chuyên ngành hiện tại nếu có
    if 'student_id' in feature_matrix.columns and student_id in feature_matrix['student_id'].values:
        student_major = feature_matrix[feature_matrix['student_id'] == student_id]['major'].iloc[0]
        student_info['current_major'] = student_major
    else:
        student_info['current_major'] = "Chưa xác định"
    
    # Lấy danh sách môn học và điểm
    student_subjects = df[df['student_id'] == student_id][
        ['subject_code', 'subject_name', 'subject_category', 'final_grade']
    ].to_dict(orient='records')
    
    # Lấy danh sách kỹ năng
    student_skills = []
    for skill_list in df[df['student_id'] == student_id]['skill_list'].dropna():
        student_skills.extend([skill.strip() for skill in skill_list.split(',')])
    
    skill_counts = pd.Series(student_skills).value_counts().to_dict()
    
    return {
        'info': student_info,
        'subjects': student_subjects,
        'skills': skill_counts
    }

def get_feature_vector(student_id, df, feature_matrix, expected_features=None):
    """Trích xuất vector đặc trưng của sinh viên từ feature_matrix"""
    if student_id in feature_matrix['student_id'].values:
        # Lấy dòng của sinh viên
        student_row = feature_matrix[feature_matrix['student_id'] == student_id]
        
        if expected_features is not None:
            # Sử dụng chính xác các cột đặc trưng mà scaler mong đợi
            # Nếu có cột nào không tồn tại, sẽ sử dụng giá trị 0
            feature_values = []
            for feature in expected_features:
                if feature in student_row.columns:
                    feature_values.append(student_row[feature].values[0])
                else:
                    feature_values.append(0)
            return feature_values
        else:
            # Lấy tất cả cột trừ 'student_id' và 'major'
            feature_columns = [col for col in student_row.columns 
                             if col not in ['student_id', 'major']]
            
            print(f"Số lượng đặc trưng: {len(feature_columns)}")
            
            return student_row[feature_columns].values[0].tolist()
    return None

def recommend_subjects(student_id, target_major, df, feature_matrix):
    """Đề xuất các môn học cần cải thiện để phù hợp hơn với chuyên ngành mục tiêu"""
    if student_id not in df['student_id'].values:
        return None
    
    # Lấy thông tin sinh viên
    student_data = df[df['student_id'] == student_id]
    
    # Lấy danh sách môn học của sinh viên
    student_subjects = student_data[['subject_code', 'subject_name', 'final_grade']]
    
    # Lấy thông tin về sinh viên cùng chuyên ngành mục tiêu
    target_major_students = feature_matrix[feature_matrix['major'] == target_major]['student_id'].values
    
    # Nếu không có sinh viên nào trong chuyên ngành mục tiêu
    if len(target_major_students) == 0:
        return {
            'new_subjects': [],
            'improve_subjects': []
        }
    
    # Tìm các môn học phổ biến trong chuyên ngành mục tiêu
    target_major_subjects = df[df['student_id'].isin(target_major_students)].groupby('subject_code').agg({
        'subject_name': 'first',
        'final_grade': 'mean',
        'student_id': 'count'
    }).reset_index()
    
    # Sắp xếp theo số lượng sinh viên để tìm môn học phổ biến
    target_major_subjects = target_major_subjects.sort_values('student_id', ascending=False)
    target_major_subjects.rename(columns={'student_id': 'student_count'}, inplace=True)
    
    # Lọc các môn học phổ biến (học bởi ít nhất 10% sinh viên trong chuyên ngành)
    min_students = max(1, len(target_major_students) * 0.1)  # Tối thiểu 1 sinh viên
    popular_subjects = target_major_subjects[target_major_subjects['student_count'] >= min_students]
    
    # So sánh với các môn học của sinh viên
    student_subject_codes = student_subjects['subject_code'].values
    
    # Tìm các môn học phổ biến mà sinh viên chưa học
    new_subjects = popular_subjects[~popular_subjects['subject_code'].isin(student_subject_codes)].head(5)
    
    # Tìm các môn học có điểm thấp cần cải thiện
    subjects_to_improve = pd.merge(
        student_subjects,
        popular_subjects,
        on='subject_code',
        suffixes=('_student', '_target')
    )
    
    # Tính điểm chênh lệch
    subjects_to_improve['grade_difference'] = subjects_to_improve['final_grade_target'] - subjects_to_improve['final_grade_student']
    
    # Lọc những môn có điểm thấp hơn trung bình chuyên ngành
    subjects_to_improve = subjects_to_improve[subjects_to_improve['grade_difference'] > 1].sort_values('grade_difference', ascending=False)
    
    return {
        'new_subjects': new_subjects.to_dict(orient='records'),
        'improve_subjects': subjects_to_improve.head(5).to_dict(orient='records')
    }

def comprehensive_recommendation(student_id, df, model, scaler, feature_matrix, expected_features=None):
    """Cung cấp gợi ý toàn diện cho sinh viên"""
    # Lấy thông tin sinh viên
    student_info = get_student_info(student_id, df, feature_matrix)
    
    if student_info is None:
        return {"error": f"Không tìm thấy sinh viên với ID {student_id}"}
    
    # Lấy vector đặc trưng của sinh viên
    feature_vector = get_feature_vector(student_id, df, feature_matrix, expected_features)
    
    if feature_vector is None:
        return {"error": f"Không tìm thấy vector đặc trưng cho sinh viên ID {student_id}"}
    
    # Gợi ý chuyên ngành
    top_majors = recommend_major(feature_vector, model, scaler, feature_matrix)
    
    # Gợi ý môn học cho chuyên ngành được gợi ý đầu tiên
    target_major = top_majors[0]['major']
    subject_recommendations = recommend_subjects(student_id, target_major, df, feature_matrix)
    
    return {
        "student": student_info,
        "major_recommendations": top_majors,
        "subject_recommendations": subject_recommendations
    }

def get_demo_students(df, limit=5):
    """Lấy danh sách ID sinh viên để demo"""
    return df['student_id'].drop_duplicates().head(limit).tolist()