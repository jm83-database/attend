import logging
import os
from datetime import datetime
from config import Config

def setup_logging():
    """로깅 설정"""
    
    # 로그 디렉토리 생성
    if not os.path.exists(Config.LOG_DIR):
        os.makedirs(Config.LOG_DIR, exist_ok=True)
    
    # 로그 파일명 생성 (날짜별)
    log_filename = f"attendance_system_{datetime.now().strftime('%Y%m%d')}.log"
    log_filepath = os.path.join(Config.LOG_DIR, log_filename)
    
    # 로깅 포매터 설정
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 파일 핸들러 설정
    file_handler = logging.FileHandler(log_filepath, encoding='utf-8')
    file_handler.setFormatter(formatter)
    file_handler.setLevel(getattr(logging, Config.LOG_LEVEL))
    
    # 콘솔 핸들러 설정
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)
    
    # 루트 로거 설정
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

def get_logger(name):
    """특정 모듈용 로거 반환"""
    return logging.getLogger(name)