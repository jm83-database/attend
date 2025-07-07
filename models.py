import json
import os
import datetime
from typing import List, Dict, Optional
from config import Config

class Student:
    """학생 모델"""
    
    def __init__(self, id: int, name: str, password: str, present: bool = False, 
                 code: str = "", timestamp: Optional[str] = None):
        self.id = id
        self.name = name
        self.password = password
        self.present = present
        self.code = code
        self.timestamp = timestamp
    
    def to_dict(self, include_password: bool = True) -> Dict:
        """딕셔너리로 변환"""
        data = {
            'id': self.id,
            'name': self.name,
            'present': self.present,
            'code': self.code,
            'timestamp': self.timestamp
        }
        if include_password:
            data['password'] = self.password
        return data
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Student':
        """딕셔너리에서 Student 객체 생성"""
        return cls(
            id=data['id'],
            name=data['name'],
            password=data['password'],
            present=data.get('present', False),
            code=data.get('code', ''),
            timestamp=data.get('timestamp')
        )

class AttendanceCode:
    """출석 코드 모델"""
    
    def __init__(self, code: str = "", generation_time: Optional[datetime.datetime] = None):
        self.code = code
        self.generation_time = generation_time
    
    @property
    def is_valid(self) -> bool:
        """코드가 유효한지 확인"""
        if not self.code or not self.generation_time:
            return False
        
        current_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
        elapsed_seconds = (current_time - self.generation_time).total_seconds()
        return elapsed_seconds < Config.CODE_VALIDITY_SECONDS
    
    @property
    def is_expired(self) -> bool:
        """코드가 만료되었는지 확인"""
        return not self.is_valid and bool(self.code)
    
    @property
    def time_remaining(self) -> int:
        """남은 시간 (초)"""
        if not self.is_valid:
            return 0
        
        current_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
        elapsed_seconds = (current_time - self.generation_time).total_seconds()
        return max(0, int(Config.CODE_VALIDITY_SECONDS - elapsed_seconds))
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'code': self.code,
            'generationTime': self.generation_time.strftime("%Y-%m-%d %H:%M:%S") if self.generation_time else '',
            'isValid': self.is_valid,
            'isExpired': self.is_expired,
            'timeRemaining': self.time_remaining
        }

class DataManager:
    """데이터 관리 클래스"""
    
    def __init__(self):
        self.students: List[Student] = []
        self.current_code = AttendanceCode()
        self._load_students()
    
    def _load_students(self) -> None:
        """학생 데이터 로드"""
        try:
            if os.path.exists(Config.STUDENTS_FILE):
                with open(Config.STUDENTS_FILE, 'r', encoding='utf-8') as f:
                    students_data = json.load(f)
                self.students = [Student.from_dict(data) for data in students_data]
                print(f"{len(self.students)}명의 학생 정보를 로드했습니다.")
            else:
                # 기본 학생 목록
                default_students = [
                    {"id": 1, "name": "김민준", "password": "1234", "present": False, "code": "", "timestamp": None},
                    {"id": 2, "name": "이서연", "password": "2345", "present": False, "code": "", "timestamp": None},
                    {"id": 3, "name": "박지호", "password": "3456", "present": False, "code": "", "timestamp": None},
                    {"id": 4, "name": "최수아", "password": "4567", "present": False, "code": "", "timestamp": None},
                    {"id": 5, "name": "정우진", "password": "5678", "present": False, "code": "", "timestamp": None},
                ]
                self.students = [Student.from_dict(data) for data in default_students]
                self.save_students()
        except Exception as e:
            print(f"학생 데이터 로드 중 오류 발생: {e}")
            # 오류 발생 시 기본 목록 사용
            default_students = [
                {"id": 1, "name": "김민준", "password": "1234", "present": False, "code": "", "timestamp": None},
                {"id": 2, "name": "이서연", "password": "2345", "present": False, "code": "", "timestamp": None},
            ]
            self.students = [Student.from_dict(data) for data in default_students]
    
    def save_students(self) -> None:
        """학생 데이터 저장"""
        try:
            students_data = [student.to_dict() for student in self.students]
            with open(Config.STUDENTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(students_data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"학생 데이터 저장 중 오류 발생: {e}")
    
    def get_students(self, include_passwords: bool = False) -> List[Dict]:
        """학생 목록 반환"""
        return [student.to_dict(include_password=include_passwords) for student in self.students]
    
    def get_student_by_name(self, name: str) -> Optional[Student]:
        """이름으로 학생 찾기"""
        for student in self.students:
            if student.name.lower() == name.lower():
                return student
        return None
    
    def get_student_by_id(self, student_id: int) -> Optional[Student]:
        """ID로 학생 찾기"""
        for student in self.students:
            if student.id == student_id:
                return student
        return None
    
    def delete_student(self, student_id: int) -> Optional[Student]:
        """학생 삭제"""
        for i, student in enumerate(self.students):
            if student.id == student_id:
                deleted_student = self.students.pop(i)
                self.save_students()
                return deleted_student
        return None
    
    def add_student(self, student: Student) -> None:
        """학생 추가"""
        self.students.append(student)
        self.save_students()
    
    def save_attendance(self) -> None:
        """출석 상태 저장"""
        try:
            current_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
            attendance_data = {
                "date": current_time.strftime("%Y-%m-%d"),
                "time": current_time.strftime("%H:%M:%S"),
                "students": [student.to_dict() for student in self.students]
            }
            
            # 기존 출석 기록 로드
            all_attendance = []
            if os.path.exists(Config.ATTENDANCE_FILE):
                with open(Config.ATTENDANCE_FILE, 'r', encoding='utf-8') as f:
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
            with open(Config.ATTENDANCE_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_attendance, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"출석 데이터 저장 중 오류 발생: {e}")
    
    def log_deleted_student(self, student: Student) -> None:
        """삭제된 학생 로그 저장"""
        try:
            # 로그 디렉토리 확인 및 생성
            if not os.path.exists(Config.LOG_DIR):
                os.makedirs(Config.LOG_DIR, exist_ok=True)
            
            # 기존 로그 불러오기
            deleted_students = []
            if os.path.exists(Config.DELETED_STUDENTS_LOG):
                with open(Config.DELETED_STUDENTS_LOG, 'r', encoding='utf-8') as f:
                    deleted_students = json.load(f)
            
            # 현재 시간 추가
            current_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
            student_data = student.to_dict()
            student_data['deleted_at'] = current_time.strftime("%Y-%m-%d %H:%M:%S")
            
            # 삭제된 학생 정보 추가
            deleted_students.append(student_data)
            
            # 로그 저장
            with open(Config.DELETED_STUDENTS_LOG, 'w', encoding='utf-8') as f:
                json.dump(deleted_students, f, ensure_ascii=False, indent=4)
                
        except Exception as e:
            print(f"삭제 로그 저장 중 오류 발생: {e}")
    
    def get_deleted_students(self) -> List[Dict]:
        """삭제된 학생 목록 조회"""
        try:
            if os.path.exists(Config.DELETED_STUDENTS_LOG):
                with open(Config.DELETED_STUDENTS_LOG, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"삭제된 학생 목록 조회 중 오류 발생: {e}")
            return []
    
    def restore_student(self, student_id: int) -> Optional[Student]:
        """삭제된 학생 복구"""
        try:
            deleted_students = self.get_deleted_students()
            
            # ID로 학생 찾기
            student_to_restore = None
            for i, student_data in enumerate(deleted_students):
                if student_data['id'] == student_id:
                    student_to_restore = deleted_students.pop(i)
                    break
            
            if not student_to_restore:
                return None
            
            # 삭제 시간 정보 제거 및 출석 상태 초기화
            if 'deleted_at' in student_to_restore:
                del student_to_restore['deleted_at']
            
            student_to_restore['present'] = False
            student_to_restore['code'] = ""
            student_to_restore['timestamp'] = None
            
            # 학생 목록에 복구
            restored_student = Student.from_dict(student_to_restore)
            self.add_student(restored_student)
            
            # 업데이트된 삭제 로그 저장
            with open(Config.DELETED_STUDENTS_LOG, 'w', encoding='utf-8') as f:
                json.dump(deleted_students, f, ensure_ascii=False, indent=4)
            
            return restored_student
            
        except Exception as e:
            print(f"학생 복구 중 오류 발생: {e}")
            return None