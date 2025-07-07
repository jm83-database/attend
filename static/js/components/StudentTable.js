// 학생 테이블 컴포넌트
const StudentTable = ({ 
  students, 
  selectedStudents, 
  selectAll, 
  onSelectStudent, 
  onSelectAll, 
  onDeleteStudent 
}) => {
  return (
    <div className="border rounded-lg overflow-x-auto shadow">
      <table id="student-list-table" className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 sm:px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">출석 상태</th>
            <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">확인 시간</th>
            <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onSelect={() => onSelectStudent(student.id)}
              onDelete={() => onDeleteStudent(student)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 학생 행 컴포넌트
const StudentRow = ({ student, isSelected, onSelect, onDelete }) => {
  return (
    <tr className={student.present ? "bg-green-50" : ""}>
      <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium text-center">{student.name}</td>
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          student.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {student.present ? '출석' : '미출석'}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 text-center">
        {student.timestamp || '-'}
      </td>
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm hover:underline"
        >
          삭제
        </button>
      </td>
    </tr>
  );
};