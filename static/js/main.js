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
  
  // 선생님 권한 확인을 위한 상태 추가
  const [showTeacherModal, setShowTeacherModal] = React.useState(false);
  const [teacherPassword, setTeacherPassword] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState(null); // 대기 중인 액션 (reset, downloadAttendance, downloadPasswords)
  
  // 학생 삭제 관련 상태 추가
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState(null);
  const [showDeletedStudents, setShowDeletedStudents] = React.useState(false);
  const [deletedStudents, setDeletedStudents] = React.useState([]);
  
  // 학생 목록 가져오기
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
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
      const response = await fetch(`/api/students/deleted?teacher_password=${teacherPassword}`);
      
      if (response.ok) {
        const data = await response.json();
        setDeletedStudents(data);
        setShowDeletedStudents(true);
      } else {
        const data = await response.json();
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching deleted students:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };

  // 학생 복구하기
  const restoreStudent = async (studentId) => {
    try {
      const response = await fetch('/api/students/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          teacher_password: teacherPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 학생 목록과 삭제된 학생 목록 새로고침
        fetchStudents();
        fetchDeletedStudents();
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error restoring student:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">온라인 수업 출석 확인 시스템</h2>
            <div className="text-sm flex items-center gap-2">
              <span className="inline-block w-4 h-4">⏰</span>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {confirmationMode ? '학생 출석 확인 모드' : '선생님 관리 모드'}
          </p>
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
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">현재 출석 코드</div>
                <div className="text-3xl font-bold tracking-wider">{code}</div>
                <div className="text-xs text-gray-500 mt-1">5분마다 자동으로 갱신됩니다</div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">학생 출석 현황</h3>
                <div className="border rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출석 상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">확인 시간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(student => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
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
                              className="text-red-600 hover:text-red-800 text-sm"
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
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={resetAttendance}
                  className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  출석부 초기화
                </button>
                
                <button
                  onClick={downloadAttendanceCSV}
                  className="mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  출석부 CSV 다운로드
                </button>
                
                <button
                  onClick={downloadStudentPasswords}
                  className="mt-4 bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700"
                >
                  학생 비밀번호 다운로드
                </button>
                
                <button
                  onClick={() => {
                    openTeacherModal('viewDeletedStudents');
                  }}
                  className="mt-4 bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                >
                  삭제된 학생 목록
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={toggleMode}
            className="w-full mt-2 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300"
          >
            {confirmationMode ? '선생님 모드로 전환' : '학생 모드로 전환'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 앱 렌더링
ReactDOM.render(
  <AttendanceChecker />,
  document.getElementById('app')
);