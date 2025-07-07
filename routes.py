import os
import json
import csv
import datetime
from io import StringIO
from flask import Blueprint, render_template, jsonify, request, Response
from services import AttendanceService, StudentService, AttendanceManagementService, AuthenticationService
from models import DataManager
from config import Config
from utils.error_handlers import handle_errors, validate_input, log_request
from utils.security import require_teacher_auth, rate_limit, SecurityValidator, sanitize_input
from utils.logging_config import get_logger

logger = get_logger(__name__)

# 전역 데이터 매니저 인스턴스
data_manager = DataManager()

# 서비스 인스턴스들
attendance_service = AttendanceService(data_manager)
student_service = StudentService(data_manager)
management_service = AttendanceManagementService(data_manager)

# Blueprint 생성
main_bp = Blueprint('main', __name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

# 메인 페이지
@main_bp.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Template rendering error: {e}")
        # 폴백으로 기존 템플릿 시도
        try:
            return render_template('index.html')
        except:
            return "출석 시스템 로딩 중 오류가 발생했습니다.", 500

# API 엔드포인트: 학생 목록 가져오기 (비밀번호 제외)
@api_bp.route('/students', methods=['GET'])
def get_students():
    students = student_service.get_students(include_passwords=False)
    return jsonify(students)

# API 엔드포인트: 학생 이름 목록 가져오기
@api_bp.route('/student-names', methods=['GET'])
def get_student_names():
    names = student_service.get_student_names()
    return jsonify(names)

# API 엔드포인트: 출석 코드 가져오기
@api_bp.route('/code', methods=['GET'])
def get_code():
    current_code = attendance_service.get_current_code()
    return jsonify(current_code.to_dict())

# API 엔드포인트: 새 출석 코드 생성
@api_bp.route('/code/generate', methods=['POST'])
@handle_errors
@log_request
@rate_limit(max_requests=5, per_seconds=60)
@require_teacher_auth
def generate_code():
    new_code = attendance_service.generate_attendance_code()
    
    logger.info(f"New attendance code generated: {new_code.code}")
    
    return jsonify({
        "success": True,
        "code": new_code.code,
        "generationTime": new_code.generation_time.strftime("%Y-%m-%d %H:%M:%S")
    })

# API 엔드포인트: 출석 확인하기
@api_bp.route('/attendance', methods=['POST'])
@handle_errors
@log_request
@rate_limit(max_requests=20, per_seconds=60)
@validate_input(['name', 'code', 'password'])
def check_attendance():
    data = request.json
    student_name = sanitize_input(data.get('name'))
    student_code = sanitize_input(data.get('code'))
    student_password = sanitize_input(data.get('password'))
    
    # 입력값 검증
    name_valid, name_msg = SecurityValidator.validate_student_name(student_name)
    if not name_valid:
        return jsonify({"success": False, "message": name_msg}), 400
    
    code_valid, code_msg = SecurityValidator.validate_attendance_code(student_code)
    if not code_valid:
        return jsonify({"success": False, "message": code_msg}), 400
    
    password_valid, password_msg = SecurityValidator.validate_password(student_password)
    if not password_valid:
        return jsonify({"success": False, "message": password_msg}), 400
    
    success, message = attendance_service.confirm_attendance(student_name, student_code, student_password)
    
    if success:
        logger.info(f"Attendance confirmed for student: {student_name}")
        return jsonify({"success": True, "message": message})
    else:
        logger.warning(f"Attendance confirmation failed for {student_name}: {message}")
        return jsonify({"success": False, "message": message}), 400

# API 엔드포인트: 출석부 초기화
@api_bp.route('/attendance/reset', methods=['POST'])
def reset_attendance():
    success, message = management_service.reset_attendance()
    
    if success:
        return jsonify({"success": True, "message": message})
    else:
        return jsonify({"success": False, "message": message}), 500

# CSV 다운로드 API 엔드포인트
@api_bp.route('/attendance/download', methods=['GET'])
def download_attendance_csv():
    try:
        # 출석 기록 파일 읽기
        if not os.path.exists(Config.ATTENDANCE_FILE):
            return jsonify({"success": False, "message": "출석 기록이 없습니다."}), 404
            
        with open(Config.ATTENDANCE_FILE, 'r', encoding='utf-8') as f:
            attendance_records = json.load(f)
        
        # 현재 학생 ID 목록 (현재 활성화된 학생들만)
        current_students = student_service.get_students()
        active_student_ids = [student['id'] for student in current_students]
        
        # CSV 데이터 생성을 위한 메모리 버퍼
        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer)
        
        # CSV 헤더 작성
        csv_writer.writerow(['날짜', '학생ID', '이름', '출석여부', '출석코드', '출석시간'])
        
        # 오늘 날짜만 필터링하여 출석 기록을 CSV 형식으로 변환
        today = (datetime.datetime.now() + Config.TIMEZONE_OFFSET).strftime("%Y-%m-%d")
        
        for record in attendance_records:
            date = record.get('date', '')
            # 오늘 날짜만 포함
            if date == today:
                for student in record.get('students', []):
                    # 현재 활성화된 학생 ID 목록에 있는 학생만 포함
                    if student.get('id') in active_student_ids:
                        csv_writer.writerow([
                            date,
                            student.get('id', ''),
                            student.get('name', ''),
                            '출석' if student.get('present', False) else '미출석',
                            student.get('code', ''),
                            student.get('timestamp', '')
                        ])
        
        # 메모리 버퍼의 내용을 파일로 다운로드
        csv_buffer.seek(0)
        
        # 현재 날짜와 시간으로 파일명 생성 (년월일_시분)
        now = (datetime.datetime.now() + Config.TIMEZONE_OFFSET).strftime("%Y%m%d_%H%M")
        filename = f"attendance_{now}.csv"
        
        return Response(
            csv_buffer.getvalue().encode('utf-8-sig'),  # UTF-8 with BOM for Excel compatibility
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
        
    except Exception as e:
        print(f"CSV 다운로드 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 학생 삭제 API
@api_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    data = request.json
    teacher_password = data.get('teacher_password')
    
    if not AuthenticationService.verify_teacher_password(teacher_password):
        return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
    
    success, message, deleted_student = student_service.delete_student(student_id)
    
    if success:
        return jsonify({
            "success": True, 
            "message": message,
            "deleted_student": deleted_student
        })
    else:
        return jsonify({"success": False, "message": message}), 404

# 삭제된 학생 목록 조회 API
@api_bp.route('/students/deleted', methods=['GET'])
def get_deleted_students():
    try:
        teacher_password = request.args.get('teacher_password')
        print(f"[DEBUG] 삭제된 학생 목록 조회: 교사 비밀번호={teacher_password}")
        
        if not AuthenticationService.verify_teacher_password(teacher_password):
            print("[DEBUG] 교사 비밀번호 불일치!")
            return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
        
        deleted_students = student_service.get_deleted_students()
        print(f"[DEBUG] 삭제된 학생 수: {len(deleted_students)}")
        return jsonify(deleted_students)
            
    except Exception as e:
        print(f"삭제된 학생 목록 조회 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 삭제된 학생 복구 API
@api_bp.route('/students/restore', methods=['POST'])
def restore_student():
    try:
        data = request.json
        student_id = data.get('student_id')
        teacher_password = data.get('teacher_password')
        
        if not AuthenticationService.verify_teacher_password(teacher_password):
            return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
        
        success, message, restored_student = student_service.restore_student(student_id)
        
        if success:
            return jsonify({
                "success": True, 
                "message": message,
                "restored_student": restored_student
            })
        else:
            return jsonify({"success": False, "message": message}), 404
        
    except Exception as e:
        print(f"학생 복구 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 일괄 삭제 API
@api_bp.route('/students/bulk-delete', methods=['POST'])
def bulk_delete_students():
    try:
        data = request.json
        print(f"[일괄 삭제 요청 데이터]: {data}")
        student_ids = data.get('student_ids', [])
        teacher_password = data.get('teacher_password')
        
        print(f"[일괄 삭제] 학생 IDs: {student_ids}, 비밀번호: {teacher_password}")
        
        # 선생님 비밀번호 확인
        if not AuthenticationService.verify_teacher_password(teacher_password):
            print(f"[일괄 삭제] 비밀번호 오류: {teacher_password}")
            return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
        
        success, message, deleted_count, deleted_students_info = student_service.bulk_delete_students(student_ids)
        
        if success:
            print(f"[일괄 삭제] 삭제된 학생 수: {deleted_count}, 삭제된 학생: {deleted_students_info}")
            return jsonify({
                "success": True, 
                "message": message,
                "deleted_count": deleted_count,
                "deleted_students": deleted_students_info
            })
        else:
            print(f"[일괄 삭제] 실패: {message}")
            return jsonify({"success": False, "message": message}), 400
        
    except Exception as e:
        print(f"학생 일괄 삭제 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 학생 비밀번호 다운로드 엔드포인트 (교사용)
@api_bp.route('/students/passwords', methods=['GET'])
def download_student_passwords():
    try:
        # CSV 데이터 생성을 위한 메모리 버퍼
        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer)
        
        # CSV 헤더 작성
        csv_writer.writerow(['학생ID', '이름', '비밀번호'])
        
        # 학생 비밀번호 정보를 CSV 형식으로 변환
        students = student_service.get_students(include_passwords=True)
        for student in students:
            csv_writer.writerow([
                student.get('id', ''),
                student.get('name', ''),
                student.get('password', '')
            ])
        
        # 메모리 버퍼의 내용을 파일로 다운로드
        csv_buffer.seek(0)
        
        # 현재 날짜로 파일명 생성
        now = (datetime.datetime.now() + Config.TIMEZONE_OFFSET).strftime("%Y%m%d_%H%M")
        filename = f"student_passwords_{now}.csv"
        
        return Response(
            csv_buffer.getvalue().encode('utf-8-sig'),  # UTF-8 with BOM for Excel compatibility
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
        
    except Exception as e:
        print(f"비밀번호 다운로드 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500