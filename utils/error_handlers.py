import traceback
from functools import wraps
from flask import jsonify
from utils.logging_config import get_logger

logger = get_logger(__name__)

def handle_errors(func):
    """에러 처리 데코레이터"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as e:
            logger.error(f"ValueError in {func.__name__}: {str(e)}")
            return jsonify({"success": False, "message": "잘못된 입력값입니다."}), 400
        except FileNotFoundError as e:
            logger.error(f"FileNotFoundError in {func.__name__}: {str(e)}")
            return jsonify({"success": False, "message": "파일을 찾을 수 없습니다."}), 404
        except PermissionError as e:
            logger.error(f"PermissionError in {func.__name__}: {str(e)}")
            return jsonify({"success": False, "message": "권한이 없습니다."}), 403
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return jsonify({"success": False, "message": "서버 내부 오류가 발생했습니다."}), 500
    return wrapper

def validate_input(required_fields):
    """입력값 검증 데코레이터"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from flask import request
            
            if request.is_json:
                data = request.json or {}
            else:
                data = request.form.to_dict()
            
            missing_fields = []
            for field in required_fields:
                if field not in data or not data[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                logger.warning(f"Missing required fields in {func.__name__}: {missing_fields}")
                return jsonify({
                    "success": False, 
                    "message": f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}"
                }), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def log_request(func):
    """요청 로깅 데코레이터"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        from flask import request
        logger.info(f"Request to {func.__name__}: {request.method} {request.url}")
        
        result = func(*args, **kwargs)
        
        if hasattr(result, 'status_code'):
            logger.info(f"Response from {func.__name__}: {result.status_code}")
        
        return result
    return wrapper