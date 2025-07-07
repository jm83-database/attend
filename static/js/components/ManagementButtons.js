// 관리 기능 버튼들 컴포넌트
const ManagementButtons = ({
  onResetAttendance,
  onDownloadAttendance,
  onDownloadPasswords,
  onViewDeletedStudents
}) => {
  const buttons = [
    {
      onClick: onResetAttendance,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: '출석부 초기화',
      hoverClass: 'hover:bg-red-50 hover:border-red-200'
    },
    {
      onClick: onDownloadAttendance,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      label: '출석부 다운로드',
      hoverClass: 'hover:bg-green-50 hover:border-green-200'
    },
    {
      onClick: onDownloadPasswords,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: '비밀번호 다운로드',
      hoverClass: 'hover:bg-yellow-50 hover:border-yellow-200'
    },
    {
      onClick: onViewDeletedStudents,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: '삭제된 학생',
      hoverClass: 'hover:bg-purple-50 hover:border-purple-200'
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4 text-center">관리 기능</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {buttons.map((button, index) => (
          <ManagementButton
            key={index}
            onClick={button.onClick}
            icon={button.icon}
            label={button.label}
            hoverClass={button.hoverClass}
          />
        ))}
      </div>
    </div>
  );
};

// 개별 관리 버튼 컴포넌트
const ManagementButton = ({ onClick, icon, label, hoverClass }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${hoverClass} transition-all`}
    >
      {icon}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </button>
  );
};