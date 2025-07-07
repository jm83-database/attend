import random
import string
import datetime
from typing import Dict, Optional, Tuple
from models import DataManager, AttendanceCode, Student
from config import Config

class AttendanceService:
    """출석 관련 서비스"""
    
    def __init__(self, data_manager: DataManager):
        self.data_manager = data_manager
    
    def generate_attendance_code(self) -> AttendanceCode:
        """새 출석 코드 생성"""
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=Config.CODE_LENGTH))
        generation_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
        
        self.data_manager.current_code = AttendanceCode(code, generation_time)
        
        print(f"새 출석 코드 생성: {code} (생성 시간: {generation_time})")
        return self.data_manager.current_code
    
    def get_current_code(self) -> AttendanceCode:
        """현재 출석 코드 반환"""
        return self.data_manager.current_code
    
    def confirm_attendance(self, name: str, code: str, password: str) -> Tuple[bool, str]:
        """출석 확인 처리"""
        # 입력값 검증
        if not all([name.strip(), code.strip(), password.strip()]):
            return False, "이름, 코드, 비밀번호를 모두 입력해야 합니다."
        
        # 코드 일치 확인
        current_code = self.get_current_code()
        if code != current_code.code:
            return False, "출석 코드가 일치하지 않습니다."
        
        # 코드 유효성 확인
        if not current_code.is_valid:
            return False, "출석 코드가 만료되었습니다. 새로운 코드를 요청하세요."
        
        # 학생 찾기
        student = self.data_manager.get_student_by_name(name)
        if not student:
            return False, "명단에 없는 학생입니다."
        
        # 비밀번호 확인
        if student.password != password:
            return False, "비밀번호가 일치하지 않습니다."
        
        # 출석 처리
        current_time = datetime.datetime.now() + Config.TIMEZONE_OFFSET
        student.present = True
        student.code = code
        student.timestamp = current_time.strftime("%H:%M:%S")
        
        # 출석 정보 저장
        self.data_manager.save_attendance()
        
        return True, "출석이 확인되었습니다!"

class StudentService:
    """학생 관리 서비스"""
    
    def __init__(self, data_manager: DataManager):
        self.data_manager = data_manager
    
    def get_students(self, include_passwords: bool = False) -> list:
        """학생 목록 반환"""
        return self.data_manager.get_students(include_passwords)
    
    def get_student_names(self) -> list:
        """학생 이름 목록 반환"""
        return [{"id": student.id, "name": student.name} for student in self.data_manager.students]
    
    def delete_student(self, student_id: int) -> Tuple[bool, str, Optional[Dict]]:
        """학생 삭제"""
        student = self.data_manager.get_student_by_id(student_id)
        if not student:
            return False, "해당 ID의 학생을 찾을 수 없습니다.", None
        
        # 삭제 로그 저장
        self.data_manager.log_deleted_student(student)
        
        # 학생 삭제
        deleted_student = self.data_manager.delete_student(student_id)
        
        return True, f"{deleted_student.name} 학생이 삭제되었습니다.", deleted_student.to_dict()
    
    def bulk_delete_students(self, student_ids: list) -> Tuple[bool, str, int, list]:
        """학생 일괄 삭제"""
        if not student_ids or not isinstance(student_ids, list):
            return False, "삭제할 학생 ID가 지정되지 않았습니다.", 0, []
        
        deleted_count = 0
        deleted_students_info = []
        
        # 삭제할 학생 찾기
        try:
            student_ids = [int(id) for id in student_ids if str(id).isdigit()]
        except (ValueError, TypeError):
            return False, "유효하지 않은 학생 ID가 포함되어 있습니다.", 0, []
        
        for student_id in student_ids:
            student = self.data_manager.get_student_by_id(student_id)
            if student:
                # 삭제 로그 저장
                self.data_manager.log_deleted_student(student)
                
                # 학생 삭제
                deleted_student = self.data_manager.delete_student(student_id)
                if deleted_student:
                    deleted_students_info.append({
                        'id': deleted_student.id,
                        'name': deleted_student.name
                    })
                    deleted_count += 1
        
        message = f"{deleted_count}명의 학생이 삭제되었습니다."
        return True, message, deleted_count, deleted_students_info
    
    def get_deleted_students(self) -> list:
        """삭제된 학생 목록 조회"""
        deleted_students = self.data_manager.get_deleted_students()
        # ID 기준으로 정렬
        return sorted(deleted_students, key=lambda x: x.get('id', 0))
    
    def restore_student(self, student_id: int) -> Tuple[bool, str, Optional[Dict]]:
        """학생 복구"""
        try:
            student_id = int(student_id)
        except (ValueError, TypeError):
            return False, "학생 ID가 유효하지 않습니다.", None
        
        restored_student = self.data_manager.restore_student(student_id)
        if not restored_student:
            return False, "해당 ID의 삭제된 학생을 찾을 수 없습니다.", None
        
        return True, f"{restored_student.name} 학생이 복구되었습니다.", restored_student.to_dict()

class AttendanceManagementService:
    """출석부 관리 서비스"""
    
    def __init__(self, data_manager: DataManager):
        self.data_manager = data_manager
    
    def reset_attendance(self) -> Tuple[bool, str]:
        """출석부 초기화"""
        try:
            # 모든 학생의 출석 상태 초기화
            for student in self.data_manager.students:
                student.present = False
                student.code = ""
                student.timestamp = None
            
            # 기존 출석 기록 완전히 삭제하고 새로 시작
            import json
            with open(Config.ATTENDANCE_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=4)
            
            # 현재 상태(초기화된 상태)만 저장
            self.data_manager.save_attendance()
            
            return True, "모든 출석 기록이 초기화되었습니다."
        except Exception as e:
            print(f"출석부 초기화 중 오류 발생: {e}")
            return False, f"오류 발생: {e}"
    
    def get_attendance_statistics(self) -> Dict:
        """출석 통계 반환"""
        total_students = len(self.data_manager.students)
        present_students = sum(1 for student in self.data_manager.students if student.present)
        attendance_rate = (present_students / total_students * 100) if total_students > 0 else 0
        
        return {
            'total': total_students,
            'present': present_students,
            'rate': round(attendance_rate, 1)
        }

class AuthenticationService:
    """인증 서비스"""
    
    @staticmethod
    def verify_teacher_password(password: str) -> bool:
        """선생님 비밀번호 확인"""
        return password == Config.TEACHER_PASSWORD