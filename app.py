"""
리팩토링된 출석 관리 시스템
"""
import os
from flask import Flask
from config import Config
from routes import main_bp, api_bp

def create_app():
    """Flask 애플리케이션 팩토리"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Blueprint 등록
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    return app

def main():
    """메인 실행 함수"""
    app = create_app()
    
    print("서버를 시작합니다...")
    print(f"개발 서버 주소: http://localhost:{Config.PORT}/")
    
    # 개발 환경에서는 Flask 내장 서버 사용
    if Config.DEBUG:
        print("Flask 개발 서버를 사용합니다.")
        app.run(debug=True, host=Config.HOST, port=Config.PORT)
    else:
        try:
            # 프로덕션 환경에서는 Waitress 사용
            from waitress import serve
            print(f"Waitress 서버를 사용합니다. 포트: {Config.PORT}")
            serve(app, host=Config.HOST, port=Config.PORT)
        except Exception as e:
            print(f"서버 시작 중 오류 발생: {e}")

if __name__ == '__main__':
    main()