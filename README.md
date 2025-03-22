# 출석 관리 시스템 사용 가이드

## 목차
1. [시스템 개요](#시스템-개요)
2. [주요 기능](#주요-기능)
3. [프로젝트 구조](#프로젝트-구조)
4. [시작하기](#시작하기)
    - [프로젝트 설치](#프로젝트-설치)
    - [학생 명단 준비](#학생-명단-준비)
    - [서버 실행](#서버-실행)
5. [사용 방법](#사용-방법)
    - [선생님 모드](#선생님-모드)
    - [학생 모드](#학생-모드)
6. [학생 관리](#학생-관리)
    - [학생 삭제](#학생-삭제)
    - [학생 복구](#학생-복구)
    - [엑셀 파일 동기화](#엑셀-파일-동기화)
7. [최신 업데이트](#최신-업데이트)
8. [문제 해결](#문제-해결)
9. [커스터마이징](#커스터마이징)

## 시스템 개요

출석 관리 시스템은 교육 환경에서 학생들의 출석을 효율적으로 관리하기 위한 웹 기반 애플리케이션입니다. 이 시스템은 자동 생성되는 출석 코드와 학생별 비밀번호를 통해 출석 확인의 정확성과 신뢰성을 높이고, 실시간으로 출석 현황을 모니터링할 수 있게 해줍니다.

## 주요 기능

- **엑셀 통합**: 기존 엑셀 파일에서 학생 명단 자동 추출 및 동기화
- **출석 코드 관리**: 5분 유효 기간의 출석 코드 자동 생성 및 관리
- **개인 비밀번호**: 학생별 고유 비밀번호로 출석 인증 보안 강화
- **실시간 모니터링**: 총원 대비 실시간 출석률 시각화 및 학생별 상태 확인
- **데이터 내보내기**: 출석 데이터 CSV 파일로 내보내기
- **학생 관리**: 학생 삭제 및 복구 기능
- **모바일 지원**: 다양한 기기에서 최적화된 사용자 경험 제공
- **커스텀 favicon 지원**: 브라우저 탭에 사용자 지정 아이콘 표시

## 프로젝트 구조

```
attend/
├── .git/                      # Git 버전 관리 폴더
├── .github/                   # GitHub 관련 설정 폴더
├── .venv/                     # 파이썬 가상 환경 (필요 시 생성)
├── logs/                      # 로그 폴더
│   └── deleted_students.json  # 삭제된 학생 정보 기록
├── static/                    # 정적 파일 폴더
│   ├── images/                # 이미지 파일 폴더
│   ├── js/                    # JavaScript 파일 폴더
│   │   └── main.js            # 메인 JavaScript 파일 (React 컴포넌트)
│   └── profile.png            # Favicon 이미지
├── templates/                 # HTML 템플릿 폴더
│   └── index.html             # 메인 페이지 HTML
├── .gitignore                 # Git 무시 파일 설정
├── add-passwords-to-students.py  # 학생 비밀번호 생성 스크립트
├── app.py                     # 메인 애플리케이션 서버 (Flask)
├── excel-to-students.py       # 엑셀에서 학생 정보 추출 스크립트
├── MS AI School 6기 Teams 계정.xlsx  # 예시 엑셀 파일
├── README.md                  # 프로젝트 설명서
├── requirements.txt           # 의존성 패키지 목록
├── startup.txt                # 서버 시작 관련 정보
├── students.json              # 학생 데이터 파일
└── update_students.py         # 학생 정보 업데이트 스크립트
```

위 구조는 프로젝트의 전체적인 파일 및 폴더 구성을 보여줍니다. 각 파일과 폴더의 역할을 이해하면 프로젝트를 더 쉽게 관리하고 수정할 수 있습니다.

## 시작하기

### 프로젝트 설치

```bash
# 필요한 패키지 설치
pip install -r requirements.txt
```

### 학생 명단 준비

1. **엑셀 파일 준비**
   - 기본 파일명: `MS AI School 6기 Teams 계정.xlsx`
   - 학생 이름이 포함된 열이 있어야 함 ('이름', 'Name', '성명', '학생명' 등의 열 인식)

2. **학생 목록 추출**
   ```bash
   python excel-to-students.py
   ```

3. **학생 비밀번호 생성**
   ```bash
   python add-passwords-to-students.py
   ```

`students.json` 파일은 다음과 같은 형식의 JSON 배열을 포함합니다:
```json
[
    {
        "id": 1,
        "name": "홍길동",
        "present": false,
        "code": "",
        "timestamp": null,
        "password": "1234"
    },
    // 다른 학생 정보
]
```

### 서버 실행

```bash
python app.py
```

서버는 기본적으로 `http://localhost:5000/`에서 실행됩니다.

## 사용 방법

### 선생님 모드

![출석 관리 시스템 메인 화면](./static/images/teacher_screen.png)

선생님 모드는 시스템에 접속했을 때 기본 모드로, 다음 기능을 제공합니다:

#### 빠른 이동 메뉴
화면 오른쪽 하단에 고정된 메뉴 버튼들이 있어 편리하게 이동할 수 있습니다:
- **상단으로 이동**: 페이지 상단으로 바로 이동
- **학생 목록으로 이동**: 학생 명단 테이블로 바로 이동
- **하단으로 이동**: 페이지 하단으로 바로 이동

#### 출석 코드 관리
![만료 화면](./static/images/expired_screen.png)

- **출석 코드 생성**: '새 코드 생성' 버튼으로 6자리 무작위 코드 생성
- **코드 유효 시간**: 생성 후 5분 동안 유효 (자동 만료)
- **상태 표시**: 코드의 유효/만료 상태를 색상으로 표시 (유효: 파란색, 만료: 빨간색)
- **타이머**: 코드 만료까지 남은 시간 카운트다운

#### 출석 현황 모니터링

- **실시간 출석률**: X/Y명 (Z%) 형식과 프로그레스 바로 시각화
- **학생 목록 테이블**: 이름, 출석 상태, 확인 시간, 관리 기능(삭제)
- **학생 체크박스**: 선택한 여러 학생을 일괄 삭제할 수 있는 기능

#### 관리 기능
![선생님 모드 화면](./static/images/authenticate.png)

- **출석부 초기화**: 모든 학생의 출석 상태 재설정
- **출석부 CSV 다운로드**: 출석 기록 CSV 파일로 내보내기
- **학생 비밀번호 다운로드**: 학생 이름과 비밀번호 목록 CSV 다운로드
- **삭제된 학생 목록**: 삭제된 학생 조회 및 복구

> ⚠️ **주의 사항**: 수업이 끝나고 새로운 수업이 시작되기 전에는 반드시 출석부 CSV 다운로드를 먼저 완료한 후 출석부 초기화를 해야 합니다. 초기화하지 않으면 출석 기록이 계속 유지됩니다.

> 관리 기능을 사용하려면 선생님 비밀번호(기본값: 'teacher')를 입력해야 합니다.

### 학생 모드

![학생 모드 화면](./static/images/student_screen.png)

학생 모드로 전환하여 다음과 같은 방식으로 출석을 확인할 수 있습니다:

1. 화면 우측 상단의 "학생 모드로 전환" 버튼 클릭
2. 다음 정보 입력:
   - **이름**: 본인 이름
   - **출석 코드**: 선생님이 제공한 유효한 코드
   - **개인 비밀번호**: 개인에게 부여된 비밀번호
3. "출석 확인" 버튼 클릭

출석 코드가 유효하고 이름과 비밀번호가 일치하면 성공 메시지가 표시됩니다. ![학생 만료 화면](./static/images/expired_student_screen.png)

## 학생 관리

### 학생 삭제
![삭제 화면](./static/images/delete_screen.png)

1. 선생님 모드의 학생 목록에서 삭제할 학생의 '삭제' 버튼 클릭
2. 확인 팝업에서 선생님 비밀번호 입력
3. '삭제' 버튼 클릭

> 삭제된 학생 정보는 로그 파일에 저장되어 나중에 복구 가능합니다.

### 학생 복구
![복구 화면](./static/images/recover_screen.png)
1. '삭제된 학생 목록' 버튼 클릭
2. 선생님 비밀번호 입력
3. 삭제된 학생 목록 확인 (ID 순 정렬)
4. 복구할 학생 옆의 '복구' 버튼 클릭

![복구 화면](./static/images/recover_check.png)

5. 복구 확인 모달에서 선생님 비밀번호 재입력
6. '복구' 버튼 클릭

> 복구된 학생은 원래 ID를 유지하면서 학생 목록으로 돌아가며, 출석 상태는 초기화됩니다(present = false, code = "", timestamp = null).

### 엑셀 파일 동기화

학생 명단을 엑셀 파일과 동기화하려면:

```bash
python update_students.py
```

이 스크립트는:
- 엑셀 파일에서 최신 학생 명단 가져오기
- 기존 학생의 비밀번호와 출석 상태 유지
- 새로운 학생 추가 및 엑셀에 없는 학생 삭제

다른 엑셀 파일을 사용하려면:
```bash
python update_students.py "다른파일이름.xlsx"
```

## 최신 업데이트

### 2025년 3월 22일 업데이트

#### 1. 학생 복구 로직 개선
- **출석 상태 초기화 개선**: 삭제된 학생 복구 시 출석 상태가 완전히 초기화(present=false, code="", timestamp=null)
- **유지되는 정보**: 학생 ID, 이름, 비밀번호만 보존되어 기본 정보 유지
- **삭제 마크 제거**: 'deleted_at' 필드가 자동으로 제거되어 삭제 히스토리 정보 제거
- **복구 후 학생 목록 자동 갱신**: ID 순서대로 자동 정렬되어 원래 위치에 학생 표시

#### 2. 사용자 편의 기능 추가
- **일괄 삭제 기능**: 테이블 체크박스를 통해 여러 학생을 선택하여 한번에 삭제 가능
- **빠른 이동 메뉴**: 화면 오른쪽 하단에 상단/학생목록/하단으로 이동할 수 있는 버튼 제공
- **모바일 환경 최적화**: 모든 기능이 모바일에서도 원활하게 작동하도록 개선

### 이전 업데이트 현황

#### 한국 시간대(UTC+9) 적용
- 서버와 클라이언트 시간 불일치 문제 해결
- 모든 시간 관련 기능에 한국 시간 적용

#### 실시간 상태 갱신 개선
- 출석 코드가 유효할 때만 3초마다 학생 목록 자동 새로고침
- 페이지 새로고침 없이 자동 상태 반영

#### 출석 코드 시간 제한 기능
- 5분 유효 시간 제한 적용
- 코드 유효/만료 상태 색상 표시
- 실시간 남은 시간 카운트다운

#### UI/UX 개선
- 모바일 기기 지원 강화 (반응형 테이블, 최적화된 레이아웃)
- 테이블 디자인 개선 (중앙 정렬, 일관된 스타일)
- 직관적인 상태 표시 및 메시지 개선

## 문제 해결

### 학생 복구 기능 오류
- **문제**: 학생 복구 시 "선생님 비밀번호가 올바르지 않습니다" 오류 발생
- **해결 방법**: 
  1. 삭제된 학생 목록 모달을 닫고 다시 열어 비밀번호 정확히 입력
  2. 최신 버전의 main.js 파일 확인 (최신 버전에서는 복구 버튼 클릭 시 자동으로 새 비밀번호 입력 모달창 표시)

### 삭제된 학생 정보 오류
- **문제**: 삭제된 학생 목록이 표시되지 않거나 잘못된 정보 표시
- **해결 방법**: 
  1. `logs` 폴더 존재 확인 (없으면 생성)
  2. `logs/deleted_students.json` 파일 확인 (없으면 비어있는 JSON 배열(`[]`)로 생성)

### JavaScript 구문 오류
- **문제**: `Uncaught SyntaxError: Unexpected token '?'` 오류 발생
- **해결 방법**: `static/js/main.js` 파일에서 옵셔널 체이닝 연산자(`?.`)를 논리 연산자로 대체

## 커스터마이징

### 선생님 비밀번호 변경
보안을 위해 `static/js/main.js` 파일과 `app.py` 파일에서 선생님 비밀번호 변경:

1. `static/js/main.js` 파일에서:
```javascript
// 'teacher'를 원하는 비밀번호로 변경
if (teacherPassword !== '새로운비밀번호') {
```

2. `app.py` 파일에서도 변경:
```python
# 관련 코드 모두 업데이트
if teacher_password != '새로운비밀번호':
```

### Favicon 변경
웹 브라우저 탭 아이콘 변경:

1. 원하는 이미지 파일을 `static` 폴더에 저장
2. `templates/index.html` 파일의 `<head>` 섹션에서 참조 경로 수정

### 수동 학생 명단 입력
기본 엑셀 파일 처리가 요구사항에 맞지 않는 경우:

```python
# 예시: 수동으로 학생 목록 입력
student_names = [
    "김민준", "이서연", "이수민", "박지호", "정우진"
]
manual_students = create_students_manually(student_names)
save_students_to_json(manual_students)
```

---

이 출석 관리 시스템은 교육 환경에서 출석 관리를 간소화하고 효율화하기 위한 웹 애플리케이션입니다. 학생별 비밀번호 인증을 통해 출석 체크의 정확성을 높이고, 출석 데이터를 자동으로 저장하고 내보낼 수 있어 관리가 용이합니다. 학생 삭제/복구 기능과 엑셀 동기화 도구를 통해 학생 명단 변경도 효율적으로 관리할 수 있습니다.
