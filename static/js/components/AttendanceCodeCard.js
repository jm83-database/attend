// 출석 코드 카드 컴포넌트
const AttendanceCodeCard = ({ code, codeIsValid, codeIsExpired, timeRemaining, codeGenerationTime, onGenerateCode }) => {
  const getCardStyle = () => {
    if (codeIsValid) return 'from-blue-500 to-blue-700';
    if (codeIsExpired) return 'from-red-500 to-red-700';
    return 'from-gray-500 to-gray-700';
  };

  const getStatusBadge = () => {
    if (codeIsValid) {
      return (
        <span className="inline-block px-2 py-0.5 bg-green-600 rounded-full text-xs">
          유효: {Math.floor(timeRemaining / 60)}분 {timeRemaining % 60}초 남음
        </span>
      );
    }
    if (codeIsExpired) {
      return (
        <span className="inline-block px-2 py-0.5 bg-red-600 rounded-full text-xs">
          만료됨
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-r ${getCardStyle()} p-3 rounded-lg shadow-md text-center text-white`}>
      <div className="text-xs font-medium">수업 출석 코드</div>
      <div className="text-2xl font-bold tracking-wider">{code || '없음'}</div>
      <div className="mt-1 text-xs font-medium">
        {getStatusBadge()}
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-blue-100">
          {codeGenerationTime ? `생성: ${codeGenerationTime}` : ''}
        </div>
        <button 
          onClick={onGenerateCode}
          className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shadow-sm"
        >
          코드 생성
        </button>
      </div>
    </div>
  );
};