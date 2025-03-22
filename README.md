# 출석 관리 시스템 사용 가이드

이 문서는 출석 관리 시스템 프로젝트의 사용법에 대한 안내입니다. 이 시스템은 엑셀 파일에서 학생들의 이름 정보를 불러와 출석 체크를 관리하는 웹 기반 애플리케이션입니다.

## 목차

1. [시스템 개요](#시스템-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [초기 설정](#초기-설정)
4. [선생님 모드 사용법](#선생님-모드-사용법)
5. [학생 모드 사용법](#학생-모드-사용법)
6. [학생 관리 기능](#학생-관리-기능)
7. [관리자 기능](#관리자-기능)

## 시스템 개요

이 출석 관리 시스템은 다음과 같은 기능을 제공합니다:

- 엑셀 파일에서 학생 명단 자동 추출
- 자동 생성되는 출석 코드를 통한 출석 확인
- 학생별 비밀번호 관리
- 출석 현황 실시간 모니터링
- 총원 대비 실시간 출석률 시각화
- 출석 데이터 CSV 내보내기
- 학생/선생님 모드 전환
- 학생 삭제 및 복구 기능
- 엑셀 파일과 학생 명단 자동 동기화
- 커스텀 favicon 지원

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

## 초기 설정

### 1. 프로젝트 설치

```bash
# 필요한 패키지 설치
pip install -r requirements.txt
```

### 2. 학생 명단 준비하기

1. 엑셀 파일 준비
   - 엑셀 파일의 시트에 학생 이름이 포함된 열이 있어야 합니다.
   - 기본 파일명: `MS AI School 6기 Teams 계정.xlsx`
   - 열 이름으로 '이름', 'Name', '성명', '학생명' 등이 인식됩니다.

2. 엑셀 파일에서 학생 목록 추출
   ```bash
   python excel-to-students.py
   ```
   - 이 명령어를 실행하면 `students.json` 파일이 생성됩니다.
   - 동명이인의 경우 자동으로 A, B, C 등의 접미사가 추가됩니다.

3. 학생 비밀번호 생성
   ```bash
   python add-passwords-to-students.py
   ```
   - 모든 학생에게 4자리 숫자로 구성된 비밀번호가 자동 생성됩니다.

4. students.json 파일 형식

   - `students.json` 파일은 다음과 같은 형식의 JSON 배열을 포함합니다:
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
  {
    // 다른 추가된 학생 정보
  }
]
```

### 3. 서버 시작하기

```bash
python app.py
```

- 서버는 기본적으로 `http://localhost:5000/`에서 실행됩니다.
- 개발 환경에서는 Flask 내장 서버가 사용되며, 프로덕션 환경에서는 Waitress 서버가 사용됩니다.

## 선생님 모드 사용법
![출석 관리 시스템 메인 화면](./static/images/teacher_screen.png)
### 1. 모드 전환
애플리케이션 접속 시 기본적으로 선생님 모드로 시작합니다. 선생님 모드에서 학생 모드로 전환하려면 화면 우측 상단의 "학생 모드로 전환" 버튼을 클릭합니다.

### 2. 출석 코드 확인
선생님 모드의 메인 화면에서는 현재 유효한 출석 코드가 크게 표시됩니다:
- **5분 유효 시간 제한**: 출석 코드가 생성된 후 5분 동안만 유효하며, 이후 자동으로 만료됩니다.
- **실시간 상태 표시**: 코드의 유효/만료 상태를 색상으로 표시 (유효: 파란색, 만료: 빨간색)
- **남은 시간 카운트다운**: 코드 만료까지 남은 시간을 분:초 형식으로 실시간 표시합니다.
![만료 화면](./static/images/expired_screen.png)

### 3. 출석 현황 확인
#### 실시간 출석률 대시보드
출석 코드 오른쪽에 실시간 출석률 대시보드가 표시됩니다:
- **현재 출석률** : X/Y명 (Z%) 형태로 표시
- 직관적인 프로그레스 바를 통해 시각적으로 출석률 확인 가능
- 학생이 출석 체크할 때마다 자동으로 업데이트됨

#### 학생 출석 현황 테이블
화면 중앙에 학생 출석 현황 테이블이 표시됩니다:
- 이름
- 출석 상태 (출석/미출석)
- 확인 시간
- 관리 (삭제 버튼)

### 4. 관리 기능
![선생님 모드 화면](./static/images/authenticate.png)

선생님 모드에서는 다음과 같은 관리 기능을 사용할 수 있습니다:

- **출석부 초기화**: 모든 학생의 출석 상태를 미출석으로 리셋합니다.
  > ### ⚠️ **주의 사항**
  > **수업이 끝나고 새로운 수업이 시작되기 전에는 반드시 출석부 CSV 다운로드를 먼저 완료한 후 출석부 초기화를 해야 합니다. 초기화하지 않으면 출석 기록이 계속 유지됩니다.**
- **출석부 CSV 다운로드**: 현재까지의 출석 기록을 CSV 파일로 다운로드합니다.
- **학생 비밀번호 다운로드**: 학생들의 이름과 비밀번호 목록을 CSV 파일로 다운로드합니다.
- **삭제된 학생 목록**: 이전에 삭제된 학생 목록을 조회하고 필요시 복구할 수 있습니다.

> 참고: 관리 기능을 사용하려면 선생님 비밀번호(기본값: 'teacher')를 입력해야 합니다.

## 학생 모드 사용법
![학생 모드 화면](./static/images/student_screen.png)

### 1. 모드 전환
화면 우측 상단의 "학생 모드로 전환" 버튼을 클릭하여 학생 모드로 전환합니다.

### 2. 출석 체크하기
학생 모드에서는 다음 정보를 입력하여 출석을 체크합니다:

1. **이름**: 본인의 이름을 정확히 입력합니다.
2. **출석 코드**: 선생님이 제공한 현재 유효한 출석 코드를 입력합니다.
3. **개인 비밀번호**: 개인에게 부여된 비밀번호를 입력합니다.

모든 정보를 입력한 후 "출석 확인" 버튼을 클릭합니다.

- 성공적으로 출석이 확인되면 녹색 배경의 확인 메시지가 표시됩니다.
- 실패하면 빨간색 배경의 오류 메시지가 표시됩니다.

## 학생 관리 기능

### 1. 학생 삭제 기능
![삭제 화면](./static/images/delete_screen.png)
선생님 모드에서 학생을 삭제할 수 있습니다:

1. 학생 목록에서 삭제하려는 학생의 행 오른쪽 끝에 있는 '삭제' 버튼을 클릭합니다.
2. 삭제 확인 팝업에서 선생님 비밀번호를 입력합니다.
3. '삭제' 버튼을 클릭하여 학생을 삭제합니다.

> 삭제된 학생 정보는 로그 파일에 저장되어 나중에 복구할 수 있습니다.

### 2. 삭제된 학생 관리
![복구 화면](./static/images/recover_screen.png)
선생님 모드에서 삭제된 학생을 조회하고 복구할 수 있습니다:

1. '삭제된 학생 목록' 버튼을 클릭합니다.
2. 선생님 비밀번호를 입력합니다.
3. 삭제된 학생 목록이 표시됩니다(ID 순으로 정렬됨).
4. 복구하려는 학생 옆의 '복구' 버튼을 클릭합니다.

![복구 화면](./static/images/recover_check.png)
5. 복구 확인 모달 창이 나타나면 다시 선생님 비밀번호를 입력합니다.
6. '복구' 버튼을 클릭하여 학생을 복구합니다.

> 복구된 학생은 원래 ID를 유지하면서 학생 목록으로 돌아가며, 출석 상태는 초기화됩니다.
> 학생 목록은 항상 ID 순서대로 정렬되어 표시되므로 복구된 학생이 항상 같은 위치에 표시됩니다.

### 3. 엑셀 파일 동기화 (update_students.py)

엑셀 파일을 수정하고 학생 명단을 자동으로 업데이트할 수 있습니다:

```bash
python update_students.py
```

이 스크립트는 다음과 같이 작동합니다:
- 엑셀 파일에서 최신 학생 명단을 가져옵니다.
- 기존 학생의 비밀번호와 출석 상태를 유지합니다.
- 새로운 학생을 추가하고 엑셀에 없는 학생은 자동으로 삭제합니다.
- 중간에 수업을 그만둔 학생들을 효율적으로 관리할 수 있습니다.

다른 엑셀 파일을 사용하려면:

```bash
python update_students.py "다른파일이름.xlsx"
```

## 관리자 기능

### 1. 학생 관리 시스템 동작 방식

#### 학생 삭제 및 복구 경로
기술적으로 학생 삭제 및 복구 기능은 다음과 같이 동작합니다:

1. **학생 삭제**:
   - 학생이 삭제되면 `students.json` 파일에서 제거됩니다.
   - 삭제된 학생 정보는 `logs/deleted_students.json` 파일에 저장됩니다.
   - 삭제 시점 정보(`deleted_at` 필드)가 추가됩니다.

2. **학생 복구**:
   - 복구 버튼을 클릭하면 자동으로 삭제된 학생 목록 모달창이 닫히고 새로운 복구 인증 모달창이 열립니다.
   - 복구에 성공하면 `logs/deleted_students.json`에서 해당 학생 정보가 제거됩니다.
   - 삭제 시점 정보는 제거된 상태로 `students.json`에 학생 정보가 다시 추가됩니다.
   - 학생의 이름, ID, 비밀번호는 보존되지만 출석 상태는 초기화됩니다.

#### 복구 관련 파일 구조

`logs/deleted_students.json` 파일은 다음과 같은 형식의 JSON 배열을 포함합니다:

```json
[
  {
    "id": 1,
    "name": "홍길동",
    "password": "1234",
    "present": false,
    "code": "",
    "timestamp": null,
    "deleted_at": "2025-03-21 15:30:45"
  },
  {
    // 다른 삭제된 학생 정보
  }
]
```

## 기능 개선 사항 (2025년 3월)

최근 업데이트로 시스템이 더 안정적이고 사용자 친화적으로 개선되었습니다:

### 1. 출석 코드 시간 제한 기능 추가

- **5분 유효 시간 제한**: 출석 코드가 생성된 후 5분 동안만 유효하며, 이후 자동으로 만료됩니다.
- **실시간 상태 표시**: 코드의 유효/만료 상태를 색상으로 표시 (유효: 파란색, 만료: 빨간색)
- **남은 시간 카운트다운**: 코드 만료까지 남은 시간을 분:초 형식으로 실시간 표시합니다.
- **자동 페이지 갱신 없음**: 페이지 새로고침 없이도 코드 상태가 실시간으로 업데이트됩니다.

### 2. 학생 모드 개선
![학생 만료 화면](./static/images/expired_student_screen.png)
- **코드 상태 표시**: 현재 코드가 유효한지 여부를 시각적으로 표시합니다.
- **유효한 코드 알림**: 유효한 코드일 경우 녹색 박스로 코드와 남은 시간을 표시합니다.
- **만료된 코드 경고**: 만료된 코드일 경우 빨간색 경고 메시지를 표시합니다.
- **버튼 비활성화**: 유효하지 않은 코드일 때는 출석 확인 버튼이 비활성화됩니다.

### 3. UI 개선 사항

- **모드 전환 버튼 위치 변경**: 하단에 있던 모드 전환 버튼을 상단 오른쪽으로 이동하여 접근성 개선
- **시스템 제목 중앙 정렬**: "온라인 수업 출석 확인 시스템" 제목을 중앙에 배치하여 시각적 가독성 향상
- **모드 표시 디자인 개선**: 현재 모드(학생/선생님)를 뷰티풀 방식의 배지로 표시하여 시각적 주목도 향상
- **학생 목록 파트 간소화**: 학생 목록 제목을 "학생 출석 현황 (X/Y명)" 에서 "학생 목록"으로 간소화하여 중복 정보 제거

### 4. 색상 및 스타일 개선

- **상태 기반 색상 코딩**: 코드 상태에 따라 색상이 달라져 직관적인 상태 확인 가능
- **모드 전환 버튼 색상 변경**: 기존 회색에서 인디고 색상으로 변경하여 테마와 일관성 향상
- **디자인 통일성 개선**: 인디고 계열 색상을 환영 화면에 적용하여 전체 일관성 향상
- **모드 전환 버튼 디자인**: 둥근 모서리와 그림자를 추가하여 외관 향상

### 5. 시스템 안정성 및 성능 개선

- **실시간 상태 업데이트**: 백그라운드에서 1초마다 코드 상태를 자동으로 확인하여 실시간성 향상
- **서버 측 검증 강화**: 출석 체크 시 서버에서도 코드 유효성과 시간을 검증하여 보안 강화
- **에러 처리 개선**: 유효하지 않은 코드에 대한 명확한 오류 메시지 표시

이러한 기능 개선은 사용자의 접근성과 시스템의 안정성을 향상시켜 더욱 효율적인 출석 관리가 가능하도록 하였습니다.

## 최신 업데이트 (2025년 3월 22일)

최근 추가 업데이트로 시스템이 더욱 개선되었습니다:

### 1. 한국 시간대(UTC+9) 적용

- **시간대 문제 해결**: 서버와 클라이언트 시간 불일치 문제를 해결하여 정확한 한국 시간으로 표시
- **생성 시간 정확화**: 출석 코드 생성 시간이 UTC+9(한국 시간)로 정확하게 표시
- **학생 출석 시간 정확화**: 학생들의 출석 확인 시간이 올바른 한국 시간으로 기록
- **CSV 파일명 시간 정확화**: 다운로드되는 CSV 파일명에도 정확한 한국 시간 적용

### 2. 실시간 상태 갱신 개선

- **학생 출석 현황 조건부 자동 갱신**: 출석 코드가 유효할 때만 3초마다 학생 목록을 자동으로 새로고침
- **출석 코드 만료 시 갱신 중지**: 출석 코드가 만료되면 자동 갱신이 중지되어 서버와 클라이언트 리소스 낭비 방지
- **페이지 새로고침 필요 없음**: 학생이 출석 확인 후 선생님 화면에서 새로고침 없이 자동으로 상태 반영
- **리소스 효율성 개선**: 전체 페이지 로드 대신 필요한 데이터만 갱신하여 성능 향상

### 3. 테이블 UI 개선

- **테이블 헤더 중앙 정렬**: 학생 목록 테이블의 모든 헤더가 중앙 정렬되어 가독성 향상
- **테이블 데이터 중앙 정렬**: 학생 이름, 출석 상태, 시간 등 모든 데이터가 중앙 정렬되어 일관된 디자인 제공
- **삭제된 학생 목록 테이블 정렬**: 삭제된 학생 조회 테이블도 모든 항목이 중앙 정렬되어 통일성 유지
- **테이블 관리 버튼 위치 조정**: 삭제/복구 버튼들도 중앙 정렬되어 사용성 향상

### 4. 학생 모드 UI/UX 개선

- **출석 확인 성공 메시지 개선**: 성공 메시지를 더 명확하고 상세하게 표시
- **메시지 스타일 향상**: 메시지 표시 영역을 개선하여 안내 메시지를 더 눌린하게 표시
- **멀티라인 메시지 지원**: 여러 줄로 구성된 메시지를 가독성 높게 표시
![모바일 학생 화면](static\images\mobile_student_screen.jpg)

### 5. 모바일 브라우저 지원 강화

- **반응형 테이블 구현**: 테이블에 가로 스크롤을 적용하여 모바일에서 테이블이 잘리는 문제 해결
![모바일 반응형 테이블 화면](./static/images/mobile_header_screen.png)
- **모바일 최적화 패딩**: 화면 크기에 따라 패딩 크기가 자동으로 조정되어 모바일에서 효율적인 공간 활용
- **관리 기능 버튼 최적화**: 관리 기능 버튼들의 크기와 텍스트를 모바일 화면에 맞게 조정
- **그리드 레이아웃 개선**: 모바일 환경에서 2x2 그리드로 관리 버튼을 배치하여 충분한 크기 확보
![모바일 그리드 레이아웃 화면](./static/images/mobile_footer_screen.png)
- **Viewport 설정 최적화**: 모바일 브라우저에서 화면 확대/축소 없이 최적화된 뷰 제공

이러한 추가 업데이트로 한국 시간대 문제가 해결되었고, 학생들의 출석 현황을 실시간으로 파악할 수 있게 되었습니다. 출석 확인에 필요한 정보가 더 명확하게 표시되어 사용자 경험이 한층 개선되었습니다. 또한, 모바일 브라우저 지원이 강화되어 다양한 기기에서 원활하게 사용할 수 있게 되었습니다.



## 트러블슈팅

### 학생 복구 기능 오류
- **문제**: 학생 복구 시 "선생님 비밀번호가 올바르지 않습니다" 오류가 발생하는 경우
- **원인**: 삭제된 학생 목록 모달창 열어서 복구 버튼을 누르면 비밀번호가 올바르게 전달되지 않을 수 있습니다.
- **해결 방법**: 
  1. 삭제된 학생 목록 모달을 닫고 다시 열어 비밀번호를 정확히 입력하세요.
  2. 최신 버전의 main.js 파일이 있는지 확인하세요. 최신 버전에서는 복구 버튼을 누르면 자동으로 새로운 비밀번호 입력 모달창이 나타납니다.

### 삭제된 학생 정보 잘못됨
- **문제**: 삭제된 학생 목록이 표시되지 않거나 잘못된 정보가 표시되는 경우
- **원인**: `logs` 폴더가 없거나 `deleted_students.json` 파일이 잘못되었을 수 있습니다.
- **해결 방법**: 
  1. 프로젝트 디렉토리에 `logs` 폴더가 존재하는지 확인하세요. 없다면 생성하세요.
  2. `logs/deleted_students.json` 파일이 있는지 확인하세요. 파일이 없는 경우 비어있는 JSON 배열(`[]`)로 생성해주세요.

### JavaScript 구문 오류
- **문제**: `Uncaught SyntaxError: Unexpected token '?'` 오류가 발생하는 경우
- **원인**: 일부 브라우저나 환경에서는 옵셔널 체이닝 연산자(`?.`)를 지원하지 않을 수 있습니다.
- **해결 방법**: `static/js/main.js` 파일에서 옵셔널 체이닝 연산자를 논리 연산자로 대체합니다.
  ```javascript
  // 변경 전
  <strong>{studentToDelete?.name}</strong>
  
  // 변경 후
  <strong>{studentToDelete && studentToDelete.name}</strong>
  ```

### 엑셀에서 학생 명단 추출 (커스터마이징)

기본 엑셀 파일 처리가 요구사항에 맞지 않는 경우, `excel-to-students.py` 파일의 파라미터를 조정할 수 있습니다:

- 다른 엑셀 파일을 사용하려면 코드에서 `excel_file` 변수의 값을 변경합니다.
- 수동으로 학생 명단을 입력하려면 `create_students_manually` 함수를 사용합니다.

```python
# 예시: 수동으로 학생 목록 입력
student_names = [
    "김민준", "이서연", "이수민", "박지호", "정우진"
]
manual_students = create_students_manually(student_names)
save_students_to_json(manual_students)
```

### 선생님 비밀번호 변경

보안을 위해 `static/js/main.js` 파일과 `app.py` 파일에서 선생님 비밀번호를 변경할 수 있습니다:

1. `static/js/main.js` 파일에서:
```javascript
// verifyTeacherPassword 함수에서 'teacher'를 원하는 비밀번호로 변경합니다
if (teacherPassword !== 'teacher') {
  // 변경 예시
  if (teacherPassword !== '새로운비밀번호') {
```

2. `app.py` 파일에서도 관련 코드를 동일하게 업데이트해야 합니다:
```python
# 학생 삭제 API, 복구 API 등에서 비밀번호 체크 부분 업데이트
if teacher_password != 'teacher':  # 이 부분을 수정
```

### Favicon 변경

웹 브라우저 탭에 표시되는 아이콘(favicon)을 변경할 수 있습니다:

1. 원하는 이미지 파일을 `static` 폴더에 저장합니다 (예: profile.png).
2. `templates/index.html` 파일의 `<head>` 섹션에 다음 코드가 있는지 확인합니다:
```html
<link rel="icon" href="{{ url_for('static', filename='profile.png') }}" type="image/png">
<link rel="shortcut icon" href="{{ url_for('static', filename='profile.png') }}" type="image/png">
```

---

이 시스템은 웹 브라우저를 통해 간편하게 출석 관리를 할 수 있으며, 학생별 비밀번호 인증을 통해 출석 체크의 정확성과 신뢰성을 높였습니다. 또한 출석 데이터는 자동으로 저장되고 CSV 형식으로 내보낼 수 있어 쉽게 관리할 수 있습니다. 새로 추가된 학생 삭제/복구 기능과 엑셀 동기화 도구를 통해 중간에 수업을 그만두는 학생이 있어도 효율적으로 관리할 수 있습니다.
