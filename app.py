from flask import Flask, render_template, jsonify, request
import os
import json
import datetime

app = Flask(__name__)

# 학생 데이터 파일 경로
STUDENTS_FILE = 'students.json'
ATTENDANCE_FILE = 'attendance.json'

# 출석 데이터를 저장할 변수
students = []
current_code = ""

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
                {"id": 1, "name": "김민준", "present": False, "code": "", "timestamp": None},
                {"id": 2, "name": "이서연", "present": False, "code": "", "timestamp": None},
                {"id": 3, "name": "박지호", "present": False, "code": "", "timestamp": None},
                {"id": 4, "name": "최수아", "present": False, "code": "", "timestamp": None},
                {"id": 5, "name": "정우진", "present": False, "code": "", "timestamp": None},
            ]
            # 학생 목록 저장
            save_students()
    except Exception as e:
        print(f"학생 데이터 로드 중 오류 발생: {e}")
        # 오류 발생 시 기본 목록 사용
        students = [
            {"id": 1, "name": "김민준", "present": False, "code": "", "timestamp": None},
            {"id": 2, "name": "이서연", "present": False, "code": "", "timestamp": None},
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

# API 엔드포인트: 학생 목록 가져오기
@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify(students)

# API 엔드포인트: 출석 코드 가져오기
@app.route('/api/code', methods=['GET'])
def get_code():
    return jsonify({"code": current_code})

# API 엔드포인트: 새 출석 코드 생성
@app.route('/api/code/generate', methods=['POST'])
def generate_code():
    import random
    import string
    global current_code
    current_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return jsonify({"code": current_code})

# API 엔드포인트: 출석 확인하기
@app.route('/api/attendance', methods=['POST'])
def check_attendance():
    global students
    data = request.json
    student_name = data.get('name')
    student_code = data.get('code')
    
    if not student_name or not student_code:
        return jsonify({"success": False, "message": "이름과 코드를 모두 입력해야 합니다."}), 400
    
    if student_code != current_code:
        return jsonify({"success": False, "message": "출석 코드가 일치하지 않습니다."}), 400
    
    for i, student in enumerate(students):
        if student['name'].lower() == student_name.lower():
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


# app.py에 추가할 코드

import csv
from io import StringIO
from flask import send_file, Response
import datetime

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
        
        # 현재 날짜로 파일명 생성
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