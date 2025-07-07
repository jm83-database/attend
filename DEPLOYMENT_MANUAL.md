# 📚 Azure WebApp 배포 매뉴얼

## 🎯 개요
이 문서는 리팩토링된 온라인 출석 관리 시스템을 Azure WebApp Free Tier에 GitHub CI/CD로 배포하는 완전한 가이드입니다.

## 🔍 배포 호환성 분석

### ✅ Azure Free Tier 호환성
- **메모리 사용량**: 최적화된 코드로 1GB 제한 내에서 안정적 운영
- **CPU 사용량**: 가벼운 Flask 애플리케이션으로 제한 없음
- **파일 시스템**: JSON 파일 기반 데이터 저장으로 DB 불필요
- **포트 설정**: Azure 환경변수 `PORT` 자동 감지
- **Python 버전**: Python 3.8-3.10 지원

### 🛠 리팩토링으로 해결된 문제들
1. **모듈 import 오류** → 절대 경로 및 환경 설정 개선
2. **메모리 누수** → 효율적인 데이터 관리 구조
3. **보안 취약점** → 입력값 검증 및 환경변수 활용
4. **에러 핸들링** → 체계적인 예외 처리

## 🚀 1단계: GitHub 저장소 준비

### 1.1 저장소 설정
```bash
# 기존 저장소가 있다면
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 새 저장소라면
git init
git remote add origin https://github.com/your-username/your-repo.git
```

### 1.2 필수 파일 확인
다음 파일들이 저장소에 있어야 합니다:
- ✅ `app.py` (Azure 호환 메인 앱)
- ✅ `requirements.txt` (의존성 목록)
- ✅ `startup.py` (Azure 시작 스크립트)
- ✅ `web.config` (IIS 설정)
- ✅ `.github/workflows/azure-deploy.yml` (CI/CD 워크플로우)
- ✅ `.gitignore` (불필요한 파일 제외)

### 1.3 환경변수 파일 (절대 커밋하지 마세요!)
```bash
# .env.example을 참고하여 로컬 테스트용 .env 생성
cp .env.example .env
```

## 🌐 2단계: Azure WebApp 생성

### 2.1 Azure Portal에서 WebApp 생성
1. **Azure Portal** (https://portal.azure.com) 접속
2. **리소스 만들기** → **웹앱** 선택
3. 다음 설정으로 생성:
   ```
   구독: 본인 구독
   리소스 그룹: 새로 만들기 또는 기존 사용
   이름: your-attendance-app (전역 고유한 이름)
   게시: 코드
   런타임 스택: Python 3.9
   운영 체제: Linux
   지역: Korea Central 또는 가까운 지역
   App Service 계획: Free F1
   ```

### 2.2 Application Settings 설정
Azure Portal에서 WebApp → **구성** → **애플리케이션 설정**에 다음 추가:

| 이름 | 값 | 설명 |
|------|-----|------|
| `TEACHER_PASSWORD` | `your-secure-password` | 선생님 인증 비밀번호 |
| `SECRET_KEY` | `your-very-secret-key-here` | Flask 보안 키 |
| `FLASK_ENV` | `production` | 운영 환경 설정 |
| `PORT` | `8000` | 포트 설정 (보통 자동) |

### 2.3 시작 명령 설정
**구성** → **일반 설정** → **시작 명령**:
```bash
python startup.py
```

## 🔄 3단계: GitHub Actions 설정

### 3.1 Publish Profile 다운로드
1. Azure Portal에서 WebApp → **개요**
2. **게시 프로필 가져오기** 클릭
3. `.publishsettings` 파일 다운로드

### 3.2 GitHub Secrets 설정
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 다음 시크릿 추가:
   ```
   Name: AZUREAPPSERVICE_PUBLISHPROFILE
   Value: [다운로드한 .publishsettings 파일의 전체 내용]
   ```

### 3.3 워크플로우 파일 수정
`.github/workflows/azure-deploy.yml`에서 WebApp 이름 수정:
```yaml
app-name: 'your-attendance-app'  # 실제 WebApp 이름으로 변경
```

## 🚀 4단계: 배포 실행

### 4.1 코드 푸시
```bash
git add .
git commit -m "Add refactored attendance system for Azure deployment"
git push origin main
```

### 4.2 배포 모니터링
1. GitHub → **Actions** 탭에서 워크플로우 실행 확인
2. Azure Portal → WebApp → **배포 센터**에서 배포 상태 확인

### 4.3 배포 완료 확인
- Azure WebApp URL 접속: `https://your-attendance-app.azurewebsites.net`
- 시스템 정상 작동 확인

## 🔧 5단계: 배포 후 설정

### 5.1 초기 데이터 설정
첫 배포 후 다음을 확인:
- 학생 목록이 기본값으로 로드되는지 확인
- 선생님 비밀번호로 로그인 가능한지 확인
- 출석 코드 생성/확인 테스트

### 5.2 도메인 설정 (선택사항)
Free Tier에서는 기본 도메인 `*.azurewebsites.net` 사용

### 5.3 모니터링 설정
Azure Portal → WebApp → **모니터링**:
- **메트릭**: CPU, 메모리 사용량 모니터링
- **로그**: 애플리케이션 로그 확인

## 🐛 문제 해결 가이드

### 배포 실패 시
1. **GitHub Actions 로그 확인**:
   ```
   GitHub → Actions → 실패한 워크플로우 클릭 → 로그 확인
   ```

2. **Azure 진단 로그 확인**:
   ```
   Azure Portal → WebApp → 진단 및 문제 해결 → 애플리케이션 로그
   ```

### 일반적인 오류들

#### ❌ Import Error
**증상**: 모듈을 찾을 수 없음
**해결**: 
- `requirements.txt`에 모든 의존성 포함 확인
- Python 경로 설정 확인

#### ❌ 환경변수 오류
**증상**: 설정값을 읽을 수 없음
**해결**:
- Azure Portal에서 Application Settings 확인
- 변수명 대소문자 정확히 입력

#### ❌ 파일 권한 오류
**증상**: JSON 파일 읽기/쓰기 실패
**해결**:
- Azure 파일 시스템은 읽기/쓰기 가능
- 로그 디렉토리 생성 로직 확인

#### ❌ 메모리 부족
**증상**: 앱이 자주 재시작됨
**해결**:
- Free Tier는 1GB 제한
- 불필요한 라이브러리 제거
- 메모리 사용량 최적화

## 📊 성능 최적화

### Free Tier 최적화 팁
1. **Lazy Loading**: 필요할 때만 모듈 import
2. **메모리 관리**: 큰 데이터 즉시 해제
3. **캐싱**: 자주 사용하는 데이터 메모리 캐시
4. **로그 최소화**: 필수 로그만 기록

### 모니터링 지표
- **응답 시간**: 2초 이내 목표
- **메모리 사용량**: 800MB 이내 유지
- **CPU 사용량**: 평균 30% 이내

## 🔄 업데이트 프로세스

### 코드 업데이트
1. 로컬에서 개발 및 테스트
2. GitHub에 푸시
3. GitHub Actions 자동 배포
4. Azure에서 배포 확인

### 데이터 백업
정기적으로 다음 파일들을 백업:
- `students.json`
- `attendance.json`
- `logs/deleted_students.json`

## 🛡️ 보안 체크리스트

- ✅ 환경변수로 민감한 정보 관리
- ✅ TEACHER_PASSWORD 강력한 비밀번호 설정
- ✅ SECRET_KEY 무작위 긴 문자열 사용
- ✅ HTTPS 강제 (Azure에서 기본 제공)
- ✅ 입력값 검증 활성화
- ✅ 로그에 민감한 정보 기록 안함

## 📋 사전 체크리스트

배포 전 다음을 확인하세요:

### GitHub 준비사항
- [ ] 코드가 main/master 브랜치에 푸시됨
- [ ] `.github/workflows/azure-deploy.yml` 파일 존재
- [ ] `AZUREAPPSERVICE_PUBLISHPROFILE` 시크릿 설정됨
- [ ] `app-name`이 실제 WebApp 이름으로 설정됨

### Azure 준비사항
- [ ] WebApp이 생성됨 (Free F1 계획)
- [ ] Python 3.9 런타임 설정됨
- [ ] Application Settings에 환경변수 설정됨
- [ ] 시작 명령이 `python startup.py`로 설정됨

### 코드 준비사항
- [ ] `requirements.txt` 최신 상태
- [ ] `app.py`가 Azure 호환 버전
- [ ] 모든 모듈 import 경로 확인
- [ ] `.gitignore`로 불필요한 파일 제외

## 🆘 지원 및 문의

### 문제 발생 시
1. **GitHub Issues**: 코드 관련 문제
2. **Azure 지원 센터**: 인프라 관련 문제
3. **개발자 문서**: Flask, Python 관련 문제

### 유용한 링크
- [Azure WebApp 문서](https://docs.microsoft.com/azure/app-service/)
- [GitHub Actions 문서](https://docs.github.com/actions)
- [Flask 배포 가이드](https://flask.palletsprojects.com/deployment/)

---

## 🎉 배포 성공!

모든 단계를 완료하면 다음 URL에서 시스템에 접속할 수 있습니다:
**https://your-attendance-app.azurewebsites.net**

리팩토링된 안정적이고 보안이 강화된 출석 관리 시스템을 즐겨보세요! 🚀