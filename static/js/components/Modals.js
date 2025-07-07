// 모달 컴포넌트들
const TeacherPasswordModal = ({ show, password, setPassword, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">선생님 인증</h3>
        <p className="text-sm text-gray-600 mb-4">선생님 비밀번호를 입력해주세요.</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="선생님 비밀번호"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ show, student, password, setPassword, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">학생 삭제 확인</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{student && student.name}</strong> 학생을 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 있지만, 출석 기록은 초기화됩니다.
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="선생님 비밀번호"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkDeleteModal = ({ show, selectedCount, password, setPassword, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">학생 일괄 삭제 확인</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{selectedCount}명</strong>의 학생을 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 있지만, 출석 기록은 초기화됩니다.
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="선생님 비밀번호"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            일괄 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const RestoreModal = ({ show, password, setPassword, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">학생 복구 확인</h3>
        <p className="text-sm text-gray-600 mb-4">
          학생을 복구하려면 선생님 비밀번호를 입력하세요.
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="선생님 비밀번호"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            복구
          </button>
        </div>
      </div>
    </div>
  );
};

const DeletedStudentsModal = ({ show, deletedStudents, onRestore, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-lg font-medium mb-4">삭제된 학생 목록</h3>
        
        {deletedStudents.length === 0 ? (
          <p className="text-gray-600">삭제된 학생이 없습니다.</p>
        ) : (
          <div className="h-64 overflow-y-auto border border-gray-200 rounded mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">이름</th>
                  <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">삭제 시간</th>
                  <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deletedStudents.map(student => (
                  <tr key={student.id}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">{student.id}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">{student.name}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {student.deleted_at || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onRestore(student.id)}
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
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};