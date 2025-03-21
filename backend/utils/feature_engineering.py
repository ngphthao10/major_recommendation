import pandas as pd
import numpy as np
from collections import defaultdict

def generate_features_from_student_data(student_df):
    print("Đang tạo đặc trưng từ dữ liệu sinh viên...")
    
    # Chuyển đổi kiểu dữ liệu
    numeric_columns = ['student_current_semester', 'student_current_gpa', 
                       'final_grade', 'midterm_grade', 'assignment_grade', 
                       'attendance_grade', 'retake_count']
    
    for col in numeric_columns:
        if col in student_df.columns:
            student_df[col] = pd.to_numeric(student_df[col], errors='coerce')
    
    # Trích xuất thông tin sinh viên từ dòng đầu tiên
    student_id = student_df['student_id'].iloc[0]
    gpa = student_df['student_current_gpa'].iloc[0]
    # semester = student_df['student_current_semester'].iloc[0]
    
    # print(f"Thông tin sinh viên: ID={student_id}, Kỳ={semester}, GPA={gpa}")
    print(f"Thông tin sinh viên: ID={student_id}")

    # Tính điểm trung bình theo loại môn học
    avg_by_category = student_df.groupby('subject_category')['final_grade'].mean()
    
    categories = ['theory', 'technique', 'tool']
    category_grades = {}
    for category in categories:
        if category in avg_by_category:
            category_grades[f'avg_{category}'] = avg_by_category[category]
        else:
            category_grades[f'avg_{category}'] = 0
    
    # Tính điểm trung bình cho từng loại đánh giá
    avg_midterm = student_df['midterm_grade'].mean() if 'midterm_grade' in student_df.columns else 0
    avg_assignment = student_df['assignment_grade'].mean() if 'assignment_grade' in student_df.columns else 0
    avg_attendance = student_df['attendance_grade'].mean() if 'attendance_grade' in student_df.columns else 0
    
    # Đếm số lượng môn học theo loại
    if 'subject_type' in student_df.columns:
        subject_counts = student_df.groupby('subject_type').size()
    else:
        subject_counts = pd.Series()
    
    subject_types = ['core', 'general']
    type_counts = {}
    for subject_type in subject_types:
        if subject_type in subject_counts:
            type_counts[f'count_{subject_type}'] = subject_counts[subject_type]
        else:
            type_counts[f'count_{subject_type}'] = 0
    
    # Tính số môn học theo phân loại điểm
    grade_groups = {}
    grade_groups['count_average'] = len(student_df[(student_df['final_grade'] >= 3) & (student_df['final_grade'] < 6)])
    grade_groups['count_good'] = len(student_df[(student_df['final_grade'] >= 6) & (student_df['final_grade'] < 8)])
    grade_groups['count_excellent'] = len(student_df[student_df['final_grade'] >= 8])
    
    # Phần trăm môn học theo nhóm điểm
    total_subjects = len(student_df)
    if total_subjects > 0:
        grade_groups['percent_average'] = grade_groups['count_average'] / total_subjects * 100
        grade_groups['percent_good'] = grade_groups['count_good'] / total_subjects * 100
        grade_groups['percent_excellent'] = grade_groups['count_excellent'] / total_subjects * 100
    else:
        grade_groups['percent_average'] = 0
        grade_groups['percent_good'] = 0
        grade_groups['percent_excellent'] = 0
    
    # Tính số lần retake trung bình
    avg_retake = student_df['retake_count'].mean() if 'retake_count' in student_df.columns else 0
    
    # Tạo vector kỹ năng với phân loại mức độ thành thạo
    skill_grade_map = {}
    
    if 'skill_list' in student_df.columns:
        for _, row in student_df.iterrows():
            final_grade = row['final_grade']
            if pd.notna(row.get('skill_list')) and isinstance(row['skill_list'], str):
                for skill in [s.strip() for s in row['skill_list'].split(',')]:
                    if skill not in skill_grade_map:
                        skill_grade_map[skill] = {'grades': [], 'counts': 0}
                    
                    skill_grade_map[skill]['grades'].append(final_grade)
                    skill_grade_map[skill]['counts'] += 1
    
    # Tính mức độ thành thạo kỹ năng dựa trên điểm trung bình
    skill_proficiency = {}
    for skill, data in skill_grade_map.items():
        avg_grade = sum(data['grades']) / len(data['grades']) if data['grades'] else 0
        count = data['counts']
        
        if avg_grade >= 8:
            proficiency = 3 
        elif avg_grade >= 6:
            proficiency = 2 
        elif avg_grade >= 3:
            proficiency = 1 
        else:
            proficiency = 0  
        
        skill_proficiency[skill] = {
            'proficiency': proficiency * count,
            'count': count,
            'avg_grade': avg_grade
        }
    
    # Sắp xếp kỹ năng theo mức độ thành thạo (giỏi -> khá -> trung bình) và số lần xuất hiện
    sorted_skills = sorted(
        skill_proficiency.items(),
        key=lambda x: (x[1]['proficiency'], x[1]['count'], x[1]['avg_grade']),
        reverse=True
    )
    
    # Tạo từ điển các đặc trưng
    feature = {
        'student_id': student_id,
        'gpa': gpa,
        # 'semester': semester,
        'avg_midterm': avg_midterm,
        'avg_assignment': avg_assignment,
        'avg_attendance': avg_attendance,
        'avg_retake': avg_retake,
        'skill_count': len(skill_proficiency)
    }
    
    # Thêm điểm trung bình theo loại môn học
    feature.update(category_grades)
    
    # Thêm số lượng môn học theo loại
    feature.update(type_counts)
    
    # Thêm thông tin phân nhóm điểm
    feature.update(grade_groups)
    
    # Thêm top kỹ năng với thông tin mức độ thành thạo
    for i, (skill, data) in enumerate(sorted_skills):
        safe_skill_name = skill.replace(" ", "_").replace("-", "_").replace(".", "_")
        feature[f'skill_{safe_skill_name}'] = data['count']
        feature[f'skill_{safe_skill_name}_level'] = data['proficiency']
        feature[f'skill_{safe_skill_name}_grade'] = data['avg_grade']
    
    # Tạo vector đặc trưng từ từ điển
    feature_vector = _dict_to_vector(feature)

    print(f"\nĐã tạo {len(feature_vector)} đặc trưng")
    return feature_vector

def _dict_to_vector(feature_dict):
    model_features = [
        'gpa','avg_midterm','avg_assignment','avg_attendance','avg_retake','skill_count','avg_theory','avg_technique','avg_tool',
        'count_core','count_general','count_average','count_good','count_excellent','percent_average','percent_good','percent_excellent',
        'skill_Giải_quyết_vấn_đề','skill_Giải_quyết_vấn_đề_level','skill_Giải_quyết_vấn_đề_grade','skill_Bảo_mật','skill_Bảo_mật_level',
        'skill_Bảo_mật_grade','skill_Tư_duy_toán_học','skill_Tư_duy_toán_học_level','skill_Tư_duy_toán_học_grade','skill_Xử_lý_dữ_liệu',
        'skill_Xử_lý_dữ_liệu_level','skill_Xử_lý_dữ_liệu_grade','skill_Lập_trình','skill_Lập_trình_level','skill_Lập_trình_grade',
        'skill_Phân_tích','skill_Phân_tích_level','skill_Phân_tích_grade','skill_Quản_trị_mạng','skill_Quản_trị_mạng_level',
        'skill_Quản_trị_mạng_grade','skill_Giao_thức_mạng','skill_Giao_thức_mạng_level','skill_Giao_thức_mạng_grade','skill_Machine_Learning',
        'skill_Machine_Learning_level','skill_Machine_Learning_grade','skill_Tư_duy_phân_tích','skill_Tư_duy_phân_tích_level',
        'skill_Tư_duy_phân_tích_grade','skill_Tư_duy_logic','skill_Tư_duy_logic_level','skill_Tư_duy_logic_grade','skill_Giao_tiếp',
        'skill_Giao_tiếp_level','skill_Giao_tiếp_grade','skill_Mã_hóa','skill_Mã_hóa_level','skill_Mã_hóa_grade','skill_Phân_tích_rủi_ro',
        'skill_Phân_tích_rủi_ro_level','skill_Phân_tích_rủi_ro_grade','skill_Quy_trình_phát_triển','skill_Quy_trình_phát_triển_level',
        'skill_Quy_trình_phát_triển_grade','skill_Kiểm_thử','skill_Kiểm_thử_level','skill_Kiểm_thử_grade','skill_Quản_lý_dự_án',
        'skill_Quản_lý_dự_án_level','skill_Quản_lý_dự_án_grade','skill_Thiết_kế_database','skill_Thiết_kế_database_level',
        'skill_Thiết_kế_database_grade','skill_Truy_vấn','skill_Truy_vấn_level','skill_Truy_vấn_grade','skill_Quản_lý_dữ_liệu',
        'skill_Quản_lý_dữ_liệu_level','skill_Quản_lý_dữ_liệu_grade','skill_Phân_tích_tín_hiệu','skill_Phân_tích_tín_hiệu_level',
        'skill_Phân_tích_tín_hiệu_grade','skill_Thuyết_trình','skill_Thuyết_trình_level','skill_Thuyết_trình_grade','skill_Tự_tin',
        'skill_Tự_tin_level','skill_Tự_tin_grade','skill_Làm_việc_nhóm','skill_Làm_việc_nhóm_level','skill_Làm_việc_nhóm_grade',
        'skill_Quản_lý_thời_gian','skill_Quản_lý_thời_gian_level','skill_Quản_lý_thời_gian_grade','skill_Quản_lý_tài_nguyên',
        'skill_Quản_lý_tài_nguyên_level','skill_Quản_lý_tài_nguyên_grade','skill_Lập_trình_hệ_thống','skill_Lập_trình_hệ_thống_level',
        'skill_Lập_trình_hệ_thống_grade','skill_Process','skill_Process_level','skill_Process_grade','skill_Phân_tích_dữ_liệu',
        'skill_Phân_tích_dữ_liệu_level','skill_Phân_tích_dữ_liệu_grade','skill_Xử_lý_số_liệu','skill_Xử_lý_số_liệu_level','skill_Xử_lý_số_liệu_grade'
        ,'skill_Thống_kê','skill_Thống_kê_level','skill_Thống_kê_grade','skill_Lập_trình_OOP','skill_Lập_trình_OOP_level','skill_Lập_trình_OOP_grade',
        'skill_Thiết_kế_phần_mềm','skill_Thiết_kế_phần_mềm_level','skill_Thiết_kế_phần_mềm_grade','skill_Mô_hình_hóa','skill_Mô_hình_hóa_level',
        'skill_Mô_hình_hóa_grade','skill_Tư_duy_thuật_toán','skill_Tư_duy_thuật_toán_level','skill_Tư_duy_thuật_toán_grade','skill_Tối_ưu_hóa',
        'skill_Tối_ưu_hóa_level','skill_Tối_ưu_hóa_grade','skill_Ngoại_ngữ','skill_Ngoại_ngữ_level','skill_Ngoại_ngữ_grade'
    ]
    
    if len(model_features) != 130:
        print(f"CẢNH BÁO: Danh sách đặc trưng có {len(model_features)} phần tử, cần 128 phần tử!")
        while len(model_features) < 130:
            model_features.append(f'extra_feature_{len(model_features) + 1}')
    
    feature_vector = []
    for key in model_features:
        if key in feature_dict:
            feature_vector.append(float(feature_dict[key]))
        else:
            feature_vector.append(0.0)
    
    return feature_vector