// 출석률 카드 컴포넌트
const AttendanceRateCard = ({ presentCount, totalCount, attendanceRate }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-green-700 p-3 rounded-lg shadow-md">
      <div className="flex justify-between items-center text-white">
        <div className="text-xs font-medium">현재 출석률</div>
        <div className="text-sm font-bold">{presentCount}/{totalCount}명 ({attendanceRate}%)</div>
      </div>
      <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mt-2">
        <div 
          className="bg-white h-3 rounded-full" 
          style={{ width: `${attendanceRate}%` }}
        ></div>
      </div>
    </div>
  );
};