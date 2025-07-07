// 학생 모드 컴포넌트
const StudentMode = ({
  studentName,
  setStudentName,
  studentCode,
  setStudentCode,
  studentPassword,
  setStudentPassword,
  onConfirmAttendance,
  codeIsValid,
  code,
  timeRemaining,
  message
}) => {
  return (
    <div className="space-y-4">
      {/* 유효한 코드가 없을 때 알림 표시 */}
      {(!codeIsValid && code) && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center font-medium mb-4">
          출석 코드가 만료되었습니다. 선생님에게 새 코드를 요청하세요.
        </div>
      )}
      {codeIsValid && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-medium mb-4">
          현재 코드: <span className="font-bold">{code}</span>
          <div className="text-xs mt-1">
            유효시간: {Math.floor(timeRemaining / 60)}분 {timeRemaining % 60}초 남음
          </div>
        </div>
      )}
      
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
        onClick={onConfirmAttendance}
        className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={!codeIsValid}
      >
        출석 확인
      </button>
      
      {message && (
        <div className={`mt-2 p-3 rounded text-center ${
          message.includes('성공') || message.includes('확인') 
            ? 'bg-green-100 text-green-800 font-medium' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};