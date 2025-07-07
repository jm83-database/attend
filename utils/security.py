import hashlib
import secrets
import re
from functools import wraps
from flask import request, jsonify
from config import Config
from utils.logging_config import get_logger

logger = get_logger(__name__)

class SecurityValidator:
    """보안 검증 유틸리티"""
    
    @staticmethod
    def hash_password(password):
        """비밀번호 해싱"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return salt + password_hash.hex()
    
    @staticmethod
    def verify_password(password, hashed_password):
        """비밀번호 검증"""
        if len(hashed_password) < 32:
            return False
        
        salt = hashed_password[:32]
        stored_hash = hashed_password[32:]
        
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return password_hash.hex() == stored_hash
    
    @staticmethod
    def validate_input_length(text, max_length=100):
        """입력값 길이 검증"""
        return len(text) <= max_length if text else False
    
    @staticmethod
    def validate_student_name(name):
        """학생 이름 검증"""
        if not name or len(name.strip()) == 0:
            return False, "이름을 입력해주세요."
        
        if len(name) > 50:
            return False, "이름이 너무 깁니다."
        
        # 한글, 영문, 숫자, 공백만 허용
        if not re.match(r'^[가-힣a-zA-Z0-9\s]+$', name):
            return False, "이름에 허용되지 않은 문자가 포함되어 있습니다."
        
        return True, "유효한 이름입니다."
    
    @staticmethod
    def validate_attendance_code(code):
        """출석 코드 검증"""
        if not code or len(code.strip()) == 0:
            return False, "출석 코드를 입력해주세요."
        
        if len(code) != Config.CODE_LENGTH:
            return False, f"출석 코드는 {Config.CODE_LENGTH}자리여야 합니다."
        
        # 영문 대문자와 숫자만 허용
        if not re.match(r'^[A-Z0-9]+$', code):
            return False, "출석 코드는 영문 대문자와 숫자만 가능합니다."
        
        return True, "유효한 출석 코드입니다."
    
    @staticmethod
    def validate_password(password):
        """비밀번호 검증"""
        if not password or len(password.strip()) == 0:
            return False, "비밀번호를 입력해주세요."
        
        if len(password) < 3 or len(password) > 20:
            return False, "비밀번호는 3~20자리여야 합니다."
        
        # 영문, 숫자만 허용
        if not re.match(r'^[a-zA-Z0-9]+$', password):
            return False, "비밀번호는 영문과 숫자만 가능합니다."
        
        return True, "유효한 비밀번호입니다."

def require_teacher_auth(func):
    """선생님 인증 필요 데코레이터"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            if request.is_json:
                data = request.json or {}
                teacher_password = data.get('teacher_password')
            else:
                teacher_password = request.args.get('teacher_password')
            
            if not teacher_password:
                logger.warning(f"Missing teacher password in {func.__name__}")
                return jsonify({"success": False, "message": "선생님 비밀번호가 필요합니다."}), 401
            
            if teacher_password != Config.TEACHER_PASSWORD:
                logger.warning(f"Invalid teacher password attempt in {func.__name__}")
                return jsonify({"success": False, "message": "선생님 비밀번호가 올바르지 않습니다."}), 401
            
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in teacher authentication: {str(e)}")
            return jsonify({"success": False, "message": "인증 중 오류가 발생했습니다."}), 500
    
    return wrapper

def rate_limit(max_requests=10, per_seconds=60):
    """요청 횟수 제한 데코레이터 (간단한 구현)"""
    request_counts = {}
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from time import time
            
            client_ip = request.remote_addr
            current_time = time()
            
            # 클라이언트별 요청 기록 초기화
            if client_ip not in request_counts:
                request_counts[client_ip] = []
            
            # 오래된 요청 기록 제거
            request_counts[client_ip] = [
                req_time for req_time in request_counts[client_ip] 
                if current_time - req_time < per_seconds
            ]
            
            # 요청 횟수 확인
            if len(request_counts[client_ip]) >= max_requests:
                logger.warning(f"Rate limit exceeded for IP {client_ip} in {func.__name__}")
                return jsonify({
                    "success": False, 
                    "message": "요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요."
                }), 429
            
            # 현재 요청 기록
            request_counts[client_ip].append(current_time)
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def sanitize_input(text):
    """입력값 정제"""
    if not text:
        return ""
    
    # HTML 태그 제거
    text = re.sub(r'<[^>]+>', '', text)
    
    # 스크립트 관련 문자열 제거
    dangerous_patterns = [
        r'javascript:',
        r'vbscript:',
        r'onload=',
        r'onerror=',
        r'onclick=',
        r'<script',
        r'</script>',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # 앞뒤 공백 제거
    return text.strip()