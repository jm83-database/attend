// 리팩토링된 메인 출석 관리 애플리케이션
const AttendanceChecker = () => {
  // 상태 관리
  const [students, setStudents] = React.useState([]);
  const [selectedStudents, setSelectedStudents] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const [confirmationMode, setConfirmationMode] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  // 출석 코드 관련 상태
  const [code, setCode] = React.useState('');
  const [codeGenerationTime, setCodeGenerationTime] = React.useState('');
  const [codeIsValid, setCodeIsValid] = React.useState(false);
  const [codeIsExpired, setCodeIsExpired] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  
  // 학생 입력 상태
  const [studentCode, setStudentCode] = React.useState('');
  const [studentName, setStudentName] = React.useState('');
  const [studentPassword, setStudentPassword] = React.useState('');
  
  // 출석률 관련 상태
  const [attendanceRate, setAttendanceRate] = React.useState(0);
  const [presentCount, setPresentCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  
  // 모달 관련 상태
  const [showTeacherModal, setShowTeacherModal] = React.useState(false);
  const [teacherPassword, setTeacherPassword] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState(null);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = React.useState(false);
  const [multiDeletePassword, setMultiDeletePassword] = React.useState('');
  const [showRestoreModal, setShowRestoreModal] = React.useState(false);
  const [pendingStudentRestore, setPendingStudentRestore] = React.useState(null);
  const [showDeletedStudents, setShowDeletedStudents] = React.useState(false);
  const [deletedStudents, setDeletedStudents] = React.useState([]);
  
  // 인터벌 참조
  const studentsIntervalRef = React.useRef(null);

  // 학생 목록 갱신 인터벌 관리
  const manageStudentsInterval = (isCodeValid) => {
    if (studentsIntervalRef.current) {
      clearInterval(studentsIntervalRef.current);
      studentsIntervalRef.current = null;
    }
    
    if (isCodeValid) {
      studentsIntervalRef.current = setInterval(() => {
        fetchStudents();
      }, 3000);
    } else {
      fetchStudents();
    }
  };

  // 학생 목록 가져오기
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      const sortedStudents = [...data].sort((a, b) => a.id - b.id);
      setStudents(sortedStudents);
      
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
      setCodeGenerationTime(data.generationTime || '');
      setCodeIsValid(data.isValid);
      setCodeIsExpired(data.isExpired);
      setTimeRemaining(data.timeRemaining);
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
        },
        body: JSON.stringify({
          teacher_password: teacherPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCode(data.code);
        setCodeGenerationTime(data.generationTime || '');
        setMessage('새 출석 코드가 생성되었습니다.');
      } else {
        setMessage(data.message || '코드 생성 실패');
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };

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
          password: studentPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStudentName('');
        setStudentCode('');
        setStudentPassword('');
        setMessage(`${data.message} \n출석이 성공적으로 등록되었습니다.`);
      } else {
        setMessage(data.message || '출석 확인 실패');
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };

  // 모달이 열렸는지 확인하는 함수
  const isAnyModalOpen = () => {
    return showTeacherModal || showDeleteConfirm || showMultiDeleteConfirm || showRestoreModal || showDeletedStudents;
  };

  // 체크박스 선택 처리 함수
  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
    
    if (selectedStudents.length + 1 === students.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  // 전체 선택/해제 처리 함수
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
    setSelectAll(!selectAll);
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
        fetchStudents();
      }
      
      setMessage(data.message);
    } catch (error) {
      console.error('Error resetting attendance:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };

  // 삭제된 학생 목록 불러오기
  const fetchDeletedStudents = async () => {
    try {
      const response = await fetch(`/api/students/deleted?teacher_password=${teacherPassword}`);
      
      if (response.ok) {
        const data = await response.json();
        const sortedDeletedStudents = [...data].sort((a, b) => a.id - b.id);
        setDeletedStudents(sortedDeletedStudents);
        setShowDeletedStudents(true);
      } else {
        const data = await response.json();
        setMessage(data.message || '삭제된 학생 조회 실패');
      }
    } catch (error) {
      console.error('Error fetching deleted students:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
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
        window.location.href = '/api/attendance/download';
        break;
      case 'downloadPasswords':
        window.location.href = '/api/students/passwords';
        break;
      case 'viewDeletedStudents':
        fetchDeletedStudents();
        break;
      case 'generateCode':
        generateNewCode();
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
        fetchStudents();
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

  // 일괄 삭제 모달 열기
  const openMultiDeleteModal = () => {
    if (selectedStudents.length === 0) {
      setMessage('삭제할 학생을 선택해주세요.');
      return;
    }
    setMultiDeletePassword('');
    setShowMultiDeleteConfirm(true);
  };

  // 일괄 삭제 모달 닫기
  const closeMultiDeleteModal = () => {
    setShowMultiDeleteConfirm(false);
    setMultiDeletePassword('');
  };

  // 선택된 학생 일괄 삭제 실행
  const deleteSelectedStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      let deletedCount = 0;
      const errors = [];
      
      for (const studentId of selectedStudents) {
        try {
          const response = await fetch(`/api/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacher_password: multiDeletePassword })
          });
          
          if (response.ok) {
            deletedCount++;
          } else {
            const data = await response.json();
            errors.push(`ID ${studentId}: ${data.message || '삭제 실패'}`);
          }
        } catch (err) {
          errors.push(`ID ${studentId}: 서버 오류`);
        }
      }
      
      fetchStudents();
      setSelectedStudents([]);
      setSelectAll(false);
      
      if (errors.length > 0) {
        setMessage(`${deletedCount}명 삭제 성공, ${errors.length}명 실패`);
      } else {
        setMessage(`${deletedCount}명의 학생이 삭제되었습니다.`);
      }
      
      closeMultiDeleteModal();
    } catch (error) {
      console.error('Error in delete process:', error);
      setMessage('서버 오류가 발생했습니다.');
      closeMultiDeleteModal();
    }
  };

  // 학생 복구 모달 열기
  const restoreStudent = (studentId) => {
    setPendingStudentRestore(studentId);
    setTeacherPassword('');
    setShowDeletedStudents(false);
    setShowRestoreModal(true);
  };

  // 학생 복구 실행
  const executeRestore = async () => {
    if (!pendingStudentRestore) return;
    
    try {
      const response = await fetch('/api/students/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: pendingStudentRestore,
          teacher_password: teacherPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchStudents();
        setShowRestoreModal(false);
        setPendingStudentRestore(null);
        setMessage(data.message);
      } else {
        setMessage(data.message || '복구 실패');
        setShowRestoreModal(false);
        setPendingStudentRestore(null);
      }
      
    } catch (error) {
      console.error('Error restoring student:', error);
      setMessage('서버 오류가 발생했습니다.');
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

  // 모드 전환
  const toggleMode = () => {
    setConfirmationMode(!confirmationMode);
    setMessage('');
    setStudentName('');
    setStudentCode('');
    setStudentPassword('');
  };

  // 코드 상태가 변경될 때 학생 목록 인터벌 관리
  React.useEffect(() => {
    manageStudentsInterval(codeIsValid);
    
    return () => {
      if (studentsIntervalRef.current) {
        clearInterval(studentsIntervalRef.current);
      }
    };
  }, [codeIsValid]);

  // 초기 데이터 로드 및 타이머 설정
  React.useEffect(() => {
    fetchStudents();
    fetchCode();
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
      fetchCode();
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
      if (studentsIntervalRef.current) {
        clearInterval(studentsIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* 모달들 */}
      <TeacherPasswordModal
        show={showTeacherModal}
        password={teacherPassword}
        setPassword={setTeacherPassword}
        onConfirm={executeTeacherAction}
        onCancel={closeTeacherModal}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        student={studentToDelete}
        password={teacherPassword}
        setPassword={setTeacherPassword}
        onConfirm={deleteStudent}
        onCancel={closeDeleteModal}
      />

      <BulkDeleteModal
        show={showMultiDeleteConfirm}
        selectedCount={selectedStudents.length}
        password={multiDeletePassword}
        setPassword={setMultiDeletePassword}
        onConfirm={deleteSelectedStudents}
        onCancel={closeMultiDeleteModal}
      />

      <RestoreModal
        show={showRestoreModal}
        password={teacherPassword}
        setPassword={setTeacherPassword}
        onConfirm={executeRestore}
        onCancel={closeRestoreModal}
      />

      <DeletedStudentsModal
        show={showDeletedStudents}
        deletedStudents={deletedStudents}
        onRestore={restoreStudent}
        onClose={closeDeletedStudentsModal}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-full">
        {/* 플로팅 퀵 메뉴 */}
        <FloatingMenu />
        
        {/* 고정 헤더 영역 (선생님 모드) */}
        {!confirmationMode && !isAnyModalOpen() && (
          <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-4xl mx-auto p-3">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm flex items-center gap-2">
                  <span className="inline-block w-4 h-4">⏰</span>
                  {currentTime.toLocaleTimeString()}
                </div>
                <button
                  onClick={toggleMode}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                >
                  학생 모드로 전환
                </button>
              </div>
              
              <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-indigo-800">온라인 수업 출석 확인 시스템</h2>
                <p className="text-xs text-indigo-600 mt-1 font-medium inline-block px-3 py-1 bg-indigo-100 rounded-full">
                  선생님 관리 모드
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-3">
                <AttendanceCodeCard
                  code={code}
                  codeIsValid={codeIsValid}
                  codeIsExpired={codeIsExpired}
                  timeRemaining={timeRemaining}
                  codeGenerationTime={codeGenerationTime}
                  onGenerateCode={() => openTeacherModal('generateCode')}
                />
                
                <AttendanceRateCard
                  presentCount={presentCount}
                  totalCount={totalCount}
                  attendanceRate={attendanceRate}
                />
              </div>
              
              <div className="relative mb-3 pb-2 border-b">
                <h3 className="text-lg font-medium text-center">학생 목록</h3>
                {selectedStudents.length > 0 && (
                  <button
                    onClick={openMultiDeleteModal}
                    className="absolute right-0 top-0 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex-shrink-0"
                  >
                    {selectedStudents.length}명 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 학생 모드 헤더 */}
        {confirmationMode && !isAnyModalOpen() && (
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
                선생님 모드로 전환
              </button>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-indigo-800">온라인 수업 출석 확인 시스템</h2>
              <p className="text-sm text-indigo-600 mt-1 font-medium inline-block px-3 py-1 bg-indigo-100 rounded-full">
                학생 출석 확인 모드
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4">
          {confirmationMode ? (
            <StudentMode
              studentName={studentName}
              setStudentName={setStudentName}
              studentCode={studentCode}
              setStudentCode={setStudentCode}
              studentPassword={studentPassword}
              setStudentPassword={setStudentPassword}
              onConfirmAttendance={handleConfirmAttendance}
              codeIsValid={codeIsValid}
              code={code}
              timeRemaining={timeRemaining}
              message={message}
            />
          ) : (
            <div className="space-y-6">
              <div className={`${isAnyModalOpen() ? 'h-10' : 'h-80 md:h-72'}`}></div>
              
              <div className="mt-3">
                <StudentTable
                  students={students}
                  selectedStudents={selectedStudents}
                  selectAll={selectAll}
                  onSelectStudent={handleSelectStudent}
                  onSelectAll={handleSelectAll}
                  onDeleteStudent={openDeleteModal}
                />
              </div>
              
              <ManagementButtons
                onResetAttendance={() => openTeacherModal('reset')}
                onDownloadAttendance={() => openTeacherModal('downloadAttendance')}
                onDownloadPasswords={() => openTeacherModal('downloadPasswords')}
                onViewDeletedStudents={() => openTeacherModal('viewDeletedStudents')}
              />
            </div>
          )}
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