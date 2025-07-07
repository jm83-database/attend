# Azure WebApp 시작 스크립트
# Azure에서 자동으로 실행되는 파일

import os
from app import app

if __name__ == "__main__":
    # Azure WebApp에서 제공하는 포트 사용
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=False, host='0.0.0.0', port=port)