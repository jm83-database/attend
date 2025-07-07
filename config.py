import os
from datetime import timedelta

class Config:
    """애플리케이션 설정"""
    
    # 파일 경로 설정
    STUDENTS_FILE = 'students.json'
    ATTENDANCE_FILE = 'attendance.json'
    DELETED_STUDENTS_LOG = 'logs/deleted_students.json'
    
    # 보안 설정
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    TEACHER_PASSWORD = os.environ.get('TEACHER_PASSWORD') or 'teacher'
    
    # 출석 코드 설정
    CODE_VALIDITY_SECONDS = 300  # 5분
    CODE_LENGTH = 6
    
    # 시간대 설정
    TIMEZONE_OFFSET = timedelta(hours=9)  # UTC+9 (한국 시간)
    
    # 로그 설정
    LOG_DIR = 'logs'
    LOG_LEVEL = 'INFO'
    
    # 서버 설정
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('FLASK_ENV') == 'development'