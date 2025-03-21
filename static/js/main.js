// AttendanceChecker 컴포넌트
const AttendanceChecker = () => {
  const [students, setStudents] = React.useState([]);
  const [code, setCode] = React.useState('');
  const [studentCode, setStudentCode] = React.useState('');
  const [studentName, setStudentName] = React.useState('');
  const [studentPassword, setStudentPassword] = React.useState('');  // 비밀번호 상태 추가
  const [confirmationMode, setConfirmationMode] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  // 출석률 관련 상태 추가
  const [attendanceRate, setAttendanceRate] = React.useState(0);
  const [presentCount, setPresentCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  
  // 선생님 권한 확인을 위한 상태 추가
  const [showTeacherModal, setShowTeacherModal] = React.useState(false);
  const [teacherPassword, setTeacherPassword] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState(null); // 대기 중인 액션 (reset, downloadAttendance, downloadPasswords)
  
  // 학생 삭제 관련 상태 추가
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState(null);
  const [showDeletedStudents, setShowDeletedStudents] = React.useState(false);
  const [deletedStudents, setDeletedStudents] = React.useState([]);
  
  // 학생 복구 관련 상태 추가
  const [showRestoreModal, setShowRestoreModal] = React.useState(false);
  const [pendingStudentRestore, setPendingStudentRestore] = React.useState(null);
  
  // 학생 목록 가져오기
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      // ID 기준으로 학생 목록 정렬 (원본 배열을 변경하지 않기 위해 새 배열 생성)
      const sortedStudents = [...data].sort((a, b) => a.id - b.id);
      setStudents(sortedStudents);
      
      // 출석률 계산
      const totalStudents = sortedStudents.length;
      const presentStudents = sortedStudents.filter(student => student.present).length;
      const rate = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;
      
      setTotalCount(totalStudents);
      setPresentCount(presentStudents);
      setAttendanceRate(rate.toFixed(1));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };
  
  // 출석 코드 가져오기
  const fetchCode = async () => {
    try {
      const response = await fetch('/api/code');
      const data = await response.json();
      setCode(data.code);
    } catch (error) {
      console.error('Failed to fetch code:', error);
    }
  };
  
  // 새 출석 코드 생성하기
  const generateNewCode = async () => {
    try {
      const response = await fetch('/api/code/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setCode(data.code);
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };
  
  // 초기 데이터 로드 및 타이머 설정
  React.useEffect(() => {
    fetchStudents();
    generateNewCode();
    
    // 5분마다 새로운 코드 생성
    const interval = setInterval(() => {
      generateNewCode();
      setCurrentTime(new Date());
    }, 300000);
    
    // 1초마다 시간 업데이트
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);
  
  // 출석 확인 처리
  const handleConfirmAttendance = async () => {
    if (!studentName.trim()) {
      setMessage('이름을 입력해주세요.');
      return;
    }
    
    if (!studentCode.trim()) {
      setMessage('출석 코드를 입력해주세요.');
      return;
    }
    
    if (!studentPassword.trim()) {
      setMessage('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: studentName,
          code: studentCode,
          password: studentPassword  // 비밀번호 추가
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchStudents(); // 학생 목록 새로고침
        setStudentName('');
        setStudentCode('');
        setStudentPassword('');  // 비밀번호 초기화
      }
      
      setMessage(data.message);
    } catch (error) {
      console.error('Error confirming attendance:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };
  
  // 선생님 권한 확인 모달 열기
  const openTeacherModal = (action) => {
    setPendingAction(action);
    setTeacherPassword('');
    setShowTeacherModal(true);
  };
  
  // 선생님 권한 확인 모달 닫기
  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setPendingAction(null);
    setTeacherPassword('');
  };
  
  // 선생님 비밀번호 확인
  const verifyTeacherPassword = () => {
    if (teacherPassword !== 'teacher') {
      setMessage('선생님 비밀번호가 올바르지 않습니다.');
      closeTeacherModal();
      return false;
    }
    closeTeacherModal();
    return true;
  };
  
  // 선생님 비밀번호 검증 후 액션 실행
  const executeTeacherAction = async () => {
    if (!verifyTeacherPassword()) {
      return;
    }
    
    switch (pendingAction) {
      case 'reset':
        await resetAttendanceExecute();
        break;
      case 'downloadAttendance':
        downloadAttendanceCSVExecute();
        break;
      case 'downloadPasswords':
        downloadStudentPasswordsExecute();
        break;
      case 'viewDeletedStudents':
        fetchDeletedStudents();
        break;
    }
  };
  
  // 학생 삭제 모달 열기
  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  // 학생 삭제 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
    setTeacherPassword('');
  };

  // 학생 삭제 실행
  const deleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const response = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_password: teacherPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchStudents(); // 학생 목록 새로고침
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
      
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage('서버 오류가 발생했습니다.');
      closeDeleteModal();
    }
  };

  // 삭제된 학생 목록 불러오기
  const fetchDeletedStudents = async () => {
    try {
      console.log(`삭제된 학생 목록 조회 시도: 교사 비밀번호 길이=${teacherPassword.length}`);
      
      const response = await fetch(`/api/students/deleted?teacher_password=${teacherPassword}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('삭제된 학생 목록:', data);
        
        // ID 기준으로 삭제된 학생 목록 정렬
        const sortedDeletedStudents = [...data].sort((a, b) => a.id - b.id);
        setDeletedStudents(sortedDeletedStudents);
        
        setShowDeletedStudents(true);
      } else {
        const data = await response.json();
        console.error('삭제된 학생 목록 조회 실패:', data);
        setMessage(data.message || '삭제된 학생 조회 실패');
      }
    } catch (error) {
      console.error('Error fetching deleted students:', error);
      setMessage('서버 오류가 발생했습니다. 개발자 콘솔을 확인하세요.');
    }
  };

  // 학생 복구 모달 열기 (수정된 부분)
  const restoreStudent = (studentId) => {
    // 복구할 학생 ID 저장
    setPendingStudentRestore(studentId);
    
    // 비밀번호 초기화 및 모달 표시
    setTeacherPassword('');
    
    // 먼저 삭제된 학생 목록 모달을 닫고 바로 복구 모달 표시
    setShowDeletedStudents(false);
    setShowRestoreModal(true);
  };

  // 학생 복구 실행 (수정된 부분)
  const executeRestore = async () => {
    if (!pendingStudentRestore) return;
    
    try {
      console.log(`복구 시도: 학생 ID=${pendingStudentRestore}, 교사 비밀번호 길이=${teacherPassword.length}`);
      
      const response = await fetch('/api/students/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: pendingStudentRestore,
          teacher_password: teacherPassword
        })
      });
      
      const data = await response.json();
      console.log('복구 응답:', data);
      
      if (response.ok) {
        // 학생 목록 새로고침
        fetchStudents();
        
        // 모달 닫기 및 초기화
        setShowRestoreModal(false);
        setPendingStudentRestore(null);
        
        // 성공 메시지 표시 - 팝업 효과를 주기 위해 사용자 인터페이스에 명확하게 표시
        setMessage(data.message);
      } else {
        setMessage(data.message || '복구 실패: 서버 응답 오류');
        setShowRestoreModal(false);
        setPendingStudentRestore(null);
      }
      
    } catch (error) {
      console.error('Error restoring student:', error);
      setMessage('서버 오류가 발생했습니다. 개발자 콘솔을 확인하세요.');
      setShowRestoreModal(false);
      setPendingStudentRestore(null);
    }
  };

  // 복구 모달 닫기
  const closeRestoreModal = () => {
    setShowRestoreModal(false);
    setPendingStudentRestore(null);
    setTeacherPassword('');
  };

  // 삭제된 학생 목록 모달 닫기
  const closeDeletedStudentsModal = () => {
    setShowDeletedStudents(false);
  };
  
  // 출석부 초기화 요청
  const resetAttendance = () => {
    openTeacherModal('reset');
  };
  
  // 출석부 초기화 실행
  const resetAttendanceExecute = async () => {
    try {
      const response = await fetch('/api/attendance/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchStudents(); // 학생 목록 새로고침
      }
      
      setMessage(data.message);
    } catch (error) {
      console.error('Error resetting attendance:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };
  
  // 출석부 CSV 다운로드 요청
  const downloadAttendanceCSV = () => {
    openTeacherModal('downloadAttendance');
  };
  
  // 출석부 CSV 다운로드 실행
  const downloadAttendanceCSVExecute = () => {
    window.location.href = '/api/attendance/download';
  };
  
  // 학생 비밀번호 CSV 다운로드 요청 (선생님용)
  const downloadStudentPasswords = () => {
    openTeacherModal('downloadPasswords');
  };
  
  // 학생 비밀번호 CSV 다운로드 실행
  const downloadStudentPasswordsExecute = () => {
    window.location.href = '/api/students/passwords';
  };
  
  // 모드 전환
  const toggleMode = () => {
    setConfirmationMode(!confirmationMode);
    setMessage('');
    setStudentName('');
    setStudentCode('');
    setStudentPassword('');
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* 선생님 비밀번호 확인 모달 */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">선생님 인증</h3>
            <p className="text-sm text-gray-600 mb-4">선생님 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              value={teacherPassword}
              onChange={e => setTeacherPassword(e.target.value)}
              placeholder="선생님 비밀번호"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeTeacherModal}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={executeTeacherAction}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">학생 삭제 확인</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{studentToDelete && studentToDelete.name}</strong> 학생을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 있지만, 출석 기록은 초기화됩니다.
            </p>
            <input
              type="password"
              value={teacherPassword}
              onChange={e => setTeacherPassword(e.target.value)}
              placeholder="선생님 비밀번호"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={deleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 복구 확인 모달 (새로 추가) */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">학생 복구 확인</h3>
            <p className="text-sm text-gray-600 mb-4">
              학생을 복구하려면 선생님 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              value={teacherPassword}
              onChange={e => setTeacherPassword(e.target.value)}
              placeholder="선생님 비밀번호"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRestoreModal}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={executeRestore}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                복구
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제된 학생 목록 모달 */}
      {showDeletedStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">삭제된 학생 목록</h3>
            
            {deletedStudents.length === 0 ? (
              <p className="text-gray-600">삭제된 학생이 없습니다.</p>
            ) : (
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제 시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deletedStudents.map(student => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.deleted_at || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => restoreStudent(student.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            복구
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDeletedStudentsModal}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm flex items-center gap-2">
              <span className="inline-block w-4 h-4">⏰</span>
              {currentTime.toLocaleTimeString()}
            </div>
            <button
              onClick={toggleMode}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
            >
              {confirmationMode ? '선생님 모드로 전환' : '학생 모드로 전환'}
            </button>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-800">온라인 수업 출석 확인 시스템</h2>
            <p className="text-sm text-indigo-600 mt-1 font-medium inline-block px-3 py-1 bg-indigo-100 rounded-full">
              {confirmationMode ? '학생 출석 확인 모드' : '선생님 관리 모드'}
            </p>
          </div>
        </div>
        
        <div className="p-4">
          {confirmationMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">출석 코드</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  placeholder="선생님이 제공한 코드를 입력하세요"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">개인 비밀번호</label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  placeholder="개인 비밀번호를 입력하세요"
                  className="w-full p-2 border rounded"
                />
              </div>
              <button 
                onClick={handleConfirmAttendance}
                className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                출석 확인
              </button>
              {message && (
                <div className={`mt-2 p-2 rounded text-center ${message.includes('확인') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 출석 코드와 출석률을 나란히 배치하는 카드 디자인 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                {/* 출석 코드 카드 */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-lg shadow-lg text-center text-white">
                  <div className="text-sm font-medium mb-1">현재 출석 코드</div>
                  <div className="text-4xl font-bold tracking-wider">{code}</div>
                  <div className="text-xs mt-1 text-blue-100">5분마다 자동으로 갱신됩니다</div>
                </div>
                
                {/* 출석률 카드 */}
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 rounded-lg shadow-lg">
                  <div className="flex justify-between items-center mb-1 text-white">
                    <div className="text-sm font-medium">현재 출석률</div>
                    <div className="text-lg font-bold">{presentCount}/{totalCount}명 ({attendanceRate}%)</div>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full" 
                      style={{ width: `${attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 border-b pb-2 text-center">
                  학생 목록
                </h3>
                
                <div className="border rounded-lg overflow-hidden shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출석 상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">확인 시간</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(student => (
                        <tr key={student.id} className={student.present ? "bg-green-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${student.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {student.present ? '출석' : '미출석'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.timestamp || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => openDeleteModal(student)}
                              className="text-red-600 hover:text-red-800 text-sm hover:underline"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4 text-center">관리 기능</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={resetAttendance}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">출석부 초기화</span>
                  </button>
                  
                  <button
                    onClick={downloadAttendanceCSV}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-green-50 hover:border-green-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm font-medium">출석부 CSV 다운로드</span>
                  </button>
                  
                  <button
                    onClick={downloadStudentPasswords}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-yellow-50 hover:border-yellow-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium">학생 비밀번호 다운로드</span>
                  </button>
                  
                  <button
                    onClick={() => { openTeacherModal('viewDeletedStudents'); }}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium">삭제된 학생 목록</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 하단 모드 전환 버튼 제거 */}
      </div>
    </div>
  );
};

// 앱 렌더링
ReactDOM.render(
  <AttendanceChecker />,
  document.getElementById('app')
);