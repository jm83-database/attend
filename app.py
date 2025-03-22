from flask import Flask, render_template, jsonify, request, Response
import os
import json
import datetime
import csv
from io import StringIO

app = Flask(__name__)

# 학생 데이터 파일 경로
STUDENTS_FILE = 'students.json'
ATTENDANCE_FILE = 'attendance.json'

# 출석 데이터를 저장할 변수
students = []
current_code = ""
code_generation_time = None

def load_students():
    """JSON 파일에서 학생 목록을 로드합니다."""
    global students
    try:
        if os.path.exists(STUDENTS_FILE):
            with open(STUDENTS_FILE, 'r', encoding='utf-8') as f:
                students = json.load(f)
            print(f"{len(students)}명의 학생 정보를 로드했습니다.")
        else:
            # 기본 학생 목록 (파일이 없을 경우)
            students = [
                {"id": 1, "name": "김민준", "password": "1234", "present": False, "code": "", "timestamp": None},
                {"id": 2, "name": "이서연", "password": "2345", "present": False, "code": "", "timestamp": None},
                {"id": 3, "name": "박지호", "password": "3456", "present": False, "code": "", "timestamp": None},
                {"id": 4, "name": "최수아", "password": "4567", "present": False, "code": "", "timestamp": None},
                {"id": 5, "name": "정우진", "password": "5678", "present": False, "code": "", "timestamp": None},
            ]
            # 학생 목록 저장
            save_students()
    except Exception as e:
        print(f"학생 데이터 로드 중 오류 발생: {e}")
        # 오류 발생 시 기본 목록 사용
        students = [
            {"id": 1, "name": "김민준", "password": "1234", "present": False, "code": "", "timestamp": None},
            {"id": 2, "name": "이서연", "password": "2345", "present": False, "code": "", "timestamp": None},
        ]

def save_students():
    """학생 데이터를 JSON 파일로 저장합니다."""
    try:
        with open(STUDENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(students, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"학생 데이터 저장 중 오류 발생: {e}")

def save_attendance():
    """출석 상태를 JSON 파일로 저장합니다."""
    try:
        attendance_data = {
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.datetime.now().strftime("%H:%M:%S"),
            "students": students
        }
        
        # 기존 출석 기록 로드
        all_attendance = []
        if os.path.exists(ATTENDANCE_FILE):
            with open(ATTENDANCE_FILE, 'r', encoding='utf-8') as f:
                all_attendance = json.load(f)
        
        # 오늘 날짜의 기록이 있는지 확인
        today = attendance_data["date"]
        updated = False
        for i, record in enumerate(all_attendance):
            if record["date"] == today:
                all_attendance[i] = attendance_data
                updated = True
                break
        
        # 오늘 기록이 없으면 추가
        if not updated:
            all_attendance.append(attendance_data)
        
        # 파일 저장
        with open(ATTENDANCE_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_attendance, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"출석 데이터 저장 중 오류 발생: {e}")

# 애플리케이션 시작 시 학생 목록 로드
load_students()

# 메인 페이지
@app.route('/')
def index():
    return render_template('index.html')

# API 엔드포인트: 학생 목록 가져오기 (비밀번호 제외)
@app.route('/api/students', methods=['GET'])
def get_students():
    # 비밀번호를 제외한 학생 정보만 반환
    students_without_password = []
    for student in students:
        student_data = {k: v for k, v in student.items() if k != 'password'}
        students_without_password.append(student_data)
    return jsonify(students_without_password)

# API 엔드포인트: 학생 이름 목록 가져오기
@app.route('/api/student-names', methods=['GET'])
def get_student_names():
    names = [{"id": student["id"], "name": student["name"]} for student in students]
    return jsonify(names)

# API 엔드포인트: 출석 코드 가져오기
@app.route('/api/code', methods=['GET'])
def get_code():
    generation_time = ""
    if code_generation_time:
        generation_time = code_generation_time.strftime("%Y-%m-%d %H:%M:%S")
    return jsonify({"code": current_code, "generationTime": generation_time})

# API 엔드포인트: 새 출석 코드 생성 (수동으로만 생성)
@app.route('/api/code/generate', methods=['POST'])
def generate_code():
    import random
    import string
    import datetime
    global current_code, code_generation_time
    
    # 교사 비밀번호 확인 (보안 강화)
    data = request.json
    teacher_password = data.get('teacher_password')
    
    if teacher_password != 'teacher':  # 실제 구현 시 더 안전한 인증 방식 사용 권장
        return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
    
    # 새 코드 생성
    current_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    code_generation_time = datetime.datetime.now()
    
    # 코드 생성 로그 기록
    print(f"새 출석 코드 생성: {current_code} (생성 시간: {code_generation_time})")
    
    return jsonify({
        "success": True,
        "code": current_code,
        "generationTime": code_generation_time.strftime("%Y-%m-%d %H:%M:%S")
    })

# API 엔드포인트: 출석 확인하기 (비밀번호 확인 추가)
@app.route('/api/attendance', methods=['POST'])
def check_attendance():
    global students
    data = request.json
    student_name = data.get('name')
    student_code = data.get('code')
    student_password = data.get('password')  # 비밀번호 추가
    
    if not student_name or not student_code or not student_password:
        return jsonify({"success": False, "message": "이름, 코드, 비밀번호를 모두 입력해야 합니다."}), 400
    
    if student_code != current_code:
        return jsonify({"success": False, "message": "출석 코드가 일치하지 않습니다."}), 400
    
    for i, student in enumerate(students):
        if student['name'].lower() == student_name.lower():
            # 비밀번호 확인 추가
            if student['password'] != student_password:
                return jsonify({"success": False, "message": "비밀번호가 일치하지 않습니다."}), 400
                
            import datetime
            students[i]['present'] = True
            students[i]['code'] = student_code
            students[i]['timestamp'] = datetime.datetime.now().strftime("%H:%M:%S")
            
            # 출석 정보 저장
            save_attendance()
            
            return jsonify({"success": True, "message": "출석이 확인되었습니다!"})
    
    return jsonify({"success": False, "message": "명단에 없는 학생입니다."}), 404

# API 엔드포인트: 출석부 초기화
@app.route('/api/attendance/reset', methods=['POST'])
def reset_attendance():
    global students
    for i in range(len(students)):
        students[i]['present'] = False
        students[i]['code'] = ""
        students[i]['timestamp'] = None
    
    # 출석 정보 저장
    save_attendance()
    
    return jsonify({"success": True, "message": "출석부가 초기화되었습니다."})

# CSV 다운로드 API 엔드포인트
@app.route('/api/attendance/download', methods=['GET'])
def download_attendance_csv():
    try:
        # 출석 기록 파일 읽기
        if not os.path.exists(ATTENDANCE_FILE):
            return jsonify({"success": False, "message": "출석 기록이 없습니다."}), 404
            
        with open(ATTENDANCE_FILE, 'r', encoding='utf-8') as f:
            attendance_records = json.load(f)
        
        # CSV 데이터 생성을 위한 메모리 버퍼
        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer)
        
        # CSV 헤더 작성
        csv_writer.writerow(['날짜', '학생ID', '이름', '출석여부', '출석코드', '출석시간'])
        
        # 모든 출석 기록을 CSV 형식으로 변환
        for record in attendance_records:
            date = record.get('date', '')
            for student in record.get('students', []):
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
        now = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"attendance_{now}.csv"
        
        return Response(
            csv_buffer.getvalue().encode('utf-8-sig'),  # UTF-8 with BOM for Excel compatibility
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
        
    except Exception as e:
        print(f"CSV 다운로드 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 학생 삭제 API 추가
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    global students
    
    # 선생님 비밀번호 확인
    data = request.json
    teacher_password = data.get('teacher_password')
    
    if teacher_password != 'teacher':  # 실제 구현 시 더 안전한 인증 방식 사용 권장
        return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
    
    # 학생 ID로 학생 찾기
    student_to_delete = None
    for i, student in enumerate(students):
        if student['id'] == student_id:
            student_to_delete = students.pop(i)
            break
    
    if student_to_delete:
        # 삭제 로그 저장 (복구 가능하도록)
        log_deleted_student(student_to_delete)
        
        # 변경된 학생 목록 저장
        save_students()
        
        return jsonify({
            "success": True, 
            "message": f"{student_to_delete['name']} 학생이 삭제되었습니다.",
            "deleted_student": student_to_delete
        })
    else:
        return jsonify({"success": False, "message": "해당 ID의 학생을 찾을 수 없습니다."}), 404

# 삭제된 학생 로그 저장 (복구 가능하도록)
def log_deleted_student(student):
    try:
        import datetime
        
        # 로그 디렉토리 확인 및 생성
        log_dir = 'logs'
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        # 삭제 로그 파일 경로
        log_file = os.path.join(log_dir, 'deleted_students.json')
        
        # 기존 로그 불러오기
        deleted_students = []
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                deleted_students = json.load(f)
        
        # 현재 시간 추가
        student['deleted_at'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 삭제된 학생 정보 추가
        deleted_students.append(student)
        
        # 로그 저장
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(deleted_students, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"삭제 로그 저장 중 오류 발생: {e}")

# 삭제된 학생 목록 조회 API
@app.route('/api/students/deleted', methods=['GET'])
def get_deleted_students():
    try:
        # 선생님 비밀번호 확인
        teacher_password = request.args.get('teacher_password')
        print(f"[DEBUG] 삭제된 학생 목록 조회: 교사 비밀번호={teacher_password}")
        
        if teacher_password != 'teacher':  # 실제 구현 시 더 안전한 인증 방식 사용 권장
            print("[DEBUG] 교사 비밀번호 불일치!")
            return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
        
        # 로그 파일 경로
        log_file = os.path.join('logs', 'deleted_students.json')
        print(f"[DEBUG] 로그 파일 경로: {log_file}")
        
        # 삭제된 학생 목록 불러오기
        if os.path.exists(log_file):
            print(f"[DEBUG] 로그 파일 존재: {os.path.getsize(log_file)} 바이트")
            with open(log_file, 'r', encoding='utf-8') as f:
                deleted_students = json.load(f)
            print(f"[DEBUG] 삭제된 학생 수: {len(deleted_students)}")
            return jsonify(deleted_students)
        else:
            print("[DEBUG] 로그 파일 없음")
            return jsonify([])
            
    except Exception as e:
        print(f"삭제된 학생 목록 조회 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 삭제된 학생 복구 API
@app.route('/api/students/restore', methods=['POST'])
def restore_student():
    global students
    
    try:
        data = request.json
        try:
            student_id = int(data.get('student_id'))
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "학생 ID가 유효하지 않습니다."}), 400
        teacher_password = data.get('teacher_password')
        
        if teacher_password != 'teacher':  # 실제 구현 시 더 안전한 인증 방식 사용 권장
            return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
        
        # 로그 파일 경로
        log_file = os.path.join('logs', 'deleted_students.json')
        
        # 삭제된 학생 목록 불러오기
        if not os.path.exists(log_file):
            return jsonify({"success": False, "message": "삭제된 학생 기록이 없습니다."}), 404
            
        with open(log_file, 'r', encoding='utf-8') as f:
            deleted_students = json.load(f)
        
        # ID로 학생 찾기
        student_to_restore = None
        for i, student in enumerate(deleted_students):
            if student['id'] == student_id:
                student_to_restore = deleted_students.pop(i)
                break
        
        if not student_to_restore:
            return jsonify({"success": False, "message": "해당 ID의 삭제된 학생을 찾을 수 없습니다."}), 404
        
        # 삭제 시간 정보 제거
        if 'deleted_at' in student_to_restore:
            del student_to_restore['deleted_at']
        
        # 학생 목록에 복구
        students.append(student_to_restore)
        
        # 업데이트된 목록 저장
        save_students()
        
        # 업데이트된 삭제 로그 저장
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(deleted_students, f, ensure_ascii=False, indent=4)
        
        return jsonify({
            "success": True, 
            "message": f"{student_to_restore['name']} 학생이 복구되었습니다.",
            "restored_student": student_to_restore
        })
        
    except Exception as e:
        print(f"학생 복구 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

# 학생 비밀번호 다운로드 엔드포인트 (교사용)
@app.route('/api/students/passwords', methods=['GET'])
def download_student_passwords():
    try:
        # CSV 데이터 생성을 위한 메모리 버퍼
        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer)
        
        # CSV 헤더 작성
        csv_writer.writerow(['학생ID', '이름', '비밀번호'])
        
        # 학생 비밀번호 정보를 CSV 형식으로 변환
        for student in students:
            csv_writer.writerow([
                student.get('id', ''),
                student.get('name', ''),
                student.get('password', '')
            ])
        
        # 메모리 버퍼의 내용을 파일로 다운로드
        csv_buffer.seek(0)
        
        # 현재 날짜로 파일명 생성
        now = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"student_passwords_{now}.csv"
        
        return Response(
            csv_buffer.getvalue().encode('utf-8-sig'),  # UTF-8 with BOM for Excel compatibility
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
        
    except Exception as e:
        print(f"비밀번호 다운로드 중 오류 발생: {e}")
        return jsonify({"success": False, "message": f"오류 발생: {e}"}), 500

if __name__ == '__main__':
    print("서버를 시작합니다...")
    print("개발 서버 주소: http://localhost:5000/")
    
    # 개발 환경에서는 Flask 내장 서버 사용
    if os.environ.get('FLASK_ENV') == 'development':
        print("Flask 개발 서버를 사용합니다.")
        app.run(debug=True)
    else:
        try:
            # 프로덕션 환경에서는 Waitress 사용 (Windows)
            from waitress import serve
            port = int(os.environ.get('PORT', 5000))
            print(f"Waitress 서버를 사용합니다. 포트: {port}")
            serve(app, host='0.0.0.0', port=port)
        except Exception as e:
            print(f"서버 시작 중 오류 발생: {e}")