# 🎓 온라인 출석 관리 시스템 (리팩토링 완료)

[![Deploy to Azure](https://img.shields.io/badge/Deploy%20to-Azure-blue)](https://portal.azure.com)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-Educational-yellow)]()

MS AI School 온라인 수업을 위한 **리팩토링된** 실시간 출석 확인 시스템입니다. 모듈화된 아키텍처와 향상된 보안으로 안정적이고 확장 가능한 출석 관리를 제공합니다.

## ✨ 주요 기능

### 👨‍🏫 선생님 모드
- **출석 코드 생성**: 5분간 유효한 보안 출석 코드 생성
- **실시간 모니터링**: 학생들의 출석 현황 실시간 확인
- **학생 관리**: 학생 추가/삭제/복구 기능 (삭제된 학생 완전 분리)
- **데이터 내보내기**: 오늘 날짜 출석부 및 활성 학생 비밀번호 CSV 다운로드
- **출석부 초기화**: 새로운 수업을 위한 출석 상태 리셋
- **일괄 관리**: 다중 학생 선택 삭제 기능

### 👨‍🎓 학생 모드
- **간편 출석**: 이름, 출석코드, 개인비밀번호로 출석 체크
- **실시간 피드백**: 출석 성공/실패 즉시 확인
- **모바일 친화적**: 스마트폰에서도 편리한 사용
- **입력 검증**: 강화된 입력값 검증으로 오류 방지

### 🔧 시스템 기능 (새로 추가/개선)
- **모듈화된 아키텍처**: 유지보수가 쉬운 분리된 컴포넌트 구조
- **향상된 보안**: 입력 검증, Rate Limiting, 환경변수 관리
- **완전한 삭제 시스템**: 삭제된 학생 자동 복구 방지
- **로깅 시스템**: 체계적인 로그 관리 및 모니터링
- **에러 핸들링**: 포괄적인 예외 처리 및 사용자 친화적 오류 메시지
- **CI/CD 최적화**: GitHub Actions를 통한 자동 배포

## 🆕 리팩토링 개선사항

### 🏗️ 아키텍처 개선
- **단일 파일(app.py 578라인) → 모듈화된 구조**
- **React 컴포넌트 분리**: 재사용 가능한 작은 컴포넌트로 분할
- **Blueprint 패턴**: 라우팅 로직 체계화
- **Service Layer**: 비즈니스 로직과 라우팅 분리

### 🔒 보안 강화
- **입력값 검증**: 모든 사용자 입력 철저 검증
- **Rate Limiting**: API 남용 방지
- **환경변수 관리**: 민감한 정보 외부 설정
- **SQL Injection 방지**: 안전한 데이터 처리

### 📊 데이터 관리 개선
- **완전한 삭제 시스템**: 삭제된 학생 자동 복구 방지
- **오늘 날짜 필터링**: 출석부 다운로드 시 당일 데이터만 포함
- **활성 학생 관리**: 삭제된 학생 제외한 데이터 처리
- **데이터 무결성**: 일관성 있는 데이터 상태 관리

## 🚀 빠른 시작 가이드

### 📋 준비사항
- Python 3.11 이상
- Git
- 텍스트 에디터 (VS Code 권장)

### 1️⃣ 프로젝트 다운로드
```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/jm83-database/attend.git
cd attend
```

### 2️⃣ 환경 설정
```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# Windows:
venv\\Scripts\\activate
# Mac/Linux:
source venv/bin/activate

# 필요한 패키지 설치
pip install -r requirements.txt
```

### 3️⃣ 환경변수 설정
```bash
# .env 파일 생성 (프로젝트 루트 폴더에)
echo "TEACHER_PASSWORD=admin123" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
```

또는 `.env` 파일을 직접 생성하고 다음 내용 입력:
```
TEACHER_PASSWORD=admin123
SECRET_KEY=your-secret-key-here
```

### 4️⃣ 애플리케이션 실행
```bash
python app.py
```

웹 브라우저에서 http://localhost:5000 접속

## 📱 사용 방법 (초보자 가이드)

### 🎯 기본 사용 흐름

#### 1단계: 출석부 준비
1. 웹사이트 접속 후 **"선생님 모드로 전환"** 클릭
2. **"출석부 초기화"** 버튼 클릭 (새 수업 시작 시)
3. 선생님 비밀번호 입력: `admin123` (또는 설정한 비밀번호)

#### 2단계: 출석 코드 생성
1. **"코드 생성"** 버튼 클릭
2. 6자리 출석 코드가 화면에 표시됨
3. 이 코드를 학생들에게 공유 (5분간 유효)

#### 3단계: 학생 출석 확인
1. 학생들이 **"학생 모드로 전환"** 클릭
2. 학생 정보 입력:
   - **이름**: 정확한 학생 이름
   - **출석 코드**: 선생님이 제공한 6자리 코드
   - **개인 비밀번호**: 각 학생의 고유 비밀번호
3. **"출석 확인"** 버튼 클릭

#### 4단계: 출석 현황 확인
- 선생님 모드에서 실시간으로 출석 현황 확인
- 출석률과 출석한 학생 수 표시
- 개별 학생별 출석 상태 확인 가능

#### 5단계: 출석부 다운로드
1. 수업 종료 후 **"출석부 다운로드"** 클릭
2. 오늘 날짜의 출석 기록이 CSV 파일로 다운로드
3. Excel에서 열어서 확인/편집 가능

### 🛠️ 고급 기능

#### 학생 관리
- **개별 삭제**: 학생 목록에서 "삭제" 버튼
- **일괄 삭제**: 체크박스로 여러 학생 선택 후 "n명 삭제"
- **학생 복구**: "삭제된 학생" 메뉴에서 복구 가능

#### 데이터 관리
- **비밀번호 다운로드**: 활성 학생들의 비밀번호 목록 CSV
- **삭제된 학생 관리**: 삭제 기록 확인 및 복구
- **출석 기록**: 날짜별 출석 데이터 유지

## 🏗️ 시스템 아키텍처

### 📁 프로젝트 구조
```
attend/
├── app.py                  # 메인 Flask 애플리케이션
├── config.py               # 설정 관리
├── models.py               # 데이터 모델 및 관리
├── services.py             # 비즈니스 로직
├── routes.py               # API 라우트
├── requirements.txt        # Python 패키지 목록
├── .env                    # 환경변수 설정
├── utils/                  # 유틸리티 모듈
│   ├── security.py         # 보안 기능
│   ├── logging_config.py   # 로깅 설정
│   └── error_handlers.py   # 에러 처리
├── static/                 # 정적 파일
│   ├── js/
│   │   ├── components/     # React 컴포넌트
│   │   └── main.js         # 메인 JavaScript
│   └── images/             # 이미지 파일
├── templates/
│   └── index.html          # HTML 템플릿
├── logs/                   # 로그 파일
│   └── deleted_students.json # 삭제된 학생 기록
├── students.json           # 활성 학생 데이터
├── attendance.json         # 출석 기록
└── .github/workflows/      # CI/CD 설정
    └── main_testattend.yml # Azure 배포 워크플로우
```

### 🔧 기술 스택

#### Backend (서버)
- **Flask 2.3.3**: 웹 프레임워크
- **Python 3.11**: 프로그래밍 언어
- **JSON**: 데이터 저장 형식
- **환경변수**: 보안 설정 관리

#### Frontend (클라이언트)
- **React 17**: 사용자 인터페이스
- **Tailwind CSS**: 스타일링
- **Vanilla JavaScript**: 기본 JavaScript

#### 배포 및 인프라
- **Azure WebApp**: 호스팅 플랫폼
- **GitHub Actions**: CI/CD 자동화
- **Python 3.11**: 운영 환경

## 🔒 보안 기능

### 입력 검증
- **이름 검증**: 한글, 영문, 숫자만 허용 (2-10자)
- **출석 코드**: 6자리 영숫자 조합
- **비밀번호**: 특수문자 제한으로 안전성 확보

### 접근 제어
- **선생님 인증**: 모든 관리 기능에 비밀번호 필요
- **Rate Limiting**: API 호출 횟수 제한으로 남용 방지
- **환경변수**: 중요 설정값 외부 관리

### 데이터 보호
- **입력 sanitization**: 악성 입력 차단
- **에러 핸들링**: 민감 정보 노출 방지
- **로깅**: 모든 중요 활동 기록

## 📊 API 문서

### 학생 관리 API
```http
GET /api/students               # 활성 학생 목록
GET /api/student-names          # 학생 이름 목록
DELETE /api/students/<id>       # 학생 삭제
POST /api/students/restore      # 학생 복구
POST /api/students/bulk-delete  # 다중 학생 삭제
GET /api/students/deleted       # 삭제된 학생 목록
```

### 출석 관리 API
```http
GET /api/code                   # 현재 출석코드 조회
POST /api/code/generate         # 새 출석코드 생성
POST /api/attendance           # 출석 확인
POST /api/attendance/reset     # 출석부 초기화
```

### 데이터 내보내기 API
```http
GET /api/attendance/download    # 출석부 CSV (오늘 날짜만)
GET /api/students/passwords     # 비밀번호 목록 CSV (활성 학생만)
```

## 🐛 문제 해결

### 자주 발생하는 문제

#### Q1: "출석 확인에 실패했습니다"
**원인**: 잘못된 정보 입력 또는 만료된 코드
**해결책**:
- 이름, 출석코드, 비밀번호 정확히 입력
- 출석코드가 5분 이내인지 확인
- 선생님에게 새 코드 요청

#### Q2: "선생님 비밀번호가 올바르지 않습니다"
**원인**: 잘못된 비밀번호 입력
**해결책**:
- 기본 비밀번호: `admin123`
- `.env` 파일의 `TEACHER_PASSWORD` 확인
- config.py의 기본값 확인

#### Q3: 삭제된 학생이 다시 나타남
**원인**: 이전 버전에서는 발생했으나 리팩토링 후 해결됨
**해결책**: 
- 현재 버전에서는 발생하지 않음
- 삭제된 학생은 완전히 분리 관리됨

#### Q4: 페이지가 로딩되지 않음
**원인**: 서버 실행 문제 또는 포트 충돌
**해결책**:
```bash
# 서버 재시작
python app.py

# 다른 포트 사용 (config.py 수정)
PORT = 5001
```

### 로그 확인
```bash
# 애플리케이션 로그 확인
ls logs/
cat logs/app.log
```

## 🚀 Azure 배포 가이드

### 자동 배포 (권장)
1. GitHub에 코드 푸시
2. GitHub Actions가 자동으로 Azure에 배포
3. https://testattend.azurewebsites.net/ 에서 확인

### 수동 배포
자세한 내용은 [DEPLOYMENT_MANUAL.md](DEPLOYMENT_MANUAL.md) 참조

## 🔄 업데이트 및 유지보수

### 정기 유지보수
1. **학생 데이터 백업**: 정기적으로 students.json 백업
2. **로그 정리**: logs/ 폴더 정기 정리
3. **출석 기록 보관**: attendance.json 아카이브

### 업데이트 방법
```bash
# 최신 코드 받기
git pull origin main

# 의존성 업데이트
pip install -r requirements.txt --upgrade

# 서버 재시작
python app.py
```

## 🤝 기여 및 피드백

### 버그 리포트
GitHub Issues에 다음 정보와 함께 제출:
- 발생 환경 (OS, 브라우저 등)
- 재현 단계
- 예상 결과 vs 실제 결과
- 로그 메시지 (있는 경우)

### 기능 제안
- GitHub Issues에 "Feature Request" 라벨로 제출
- 구체적인 사용 사례와 기대 효과 설명

## 📞 지원 및 문의

- **GitHub Issues**: https://github.com/jm83-database/attend/issues
- **배포 가이드**: [DEPLOYMENT_MANUAL.md](DEPLOYMENT_MANUAL.md)
- **프로젝트 위키**: GitHub Wiki 페이지

## 🙏 감사의 말

- MS AI School 교육 과정에서 영감을 받아 개발
- Flask 및 React 커뮤니티의 훌륭한 문서들
- Azure의 무료 호스팅 서비스
- 리팩토링 과정에서 도움을 준 모든 분들

---

## 📋 체크리스트 (관리자용)

### 배포 전 점검사항
- [ ] 환경변수 설정 확인 (.env 파일)
- [ ] students.json 파일 존재 확인
- [ ] logs/ 폴더 생성 확인
- [ ] CI/CD 파이프라인 테스트
- [ ] 보안 설정 검토

### 수업 전 점검사항
- [ ] 서버 정상 동작 확인
- [ ] 출석부 초기화 완료
- [ ] 학생 목록 최신 상태 확인
- [ ] 네트워크 연결 상태 확인

⭐ 이 프로젝트가 도움이 되었다면 별표를 눌러주세요!