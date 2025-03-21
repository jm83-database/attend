import pandas as pd
import json
import os

def extract_students_with_duplicates(excel_file):
    """
    Excel 파일에서 학생 정보를 읽어 students 리스트로 변환합니다.
    동명이인은 이름 뒤에 A, B, C 등을 붙여 구분합니다.
    """
    try:
        # Excel 파일의 모든 시트 이름 가져오기
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        print(f"엑셀 파일에서 발견된 시트: {sheet_names}")
        
        all_students = []
        student_id = 1  # 전체 학생에 대한 ID
        
        # 이름 중복 확인을 위한 딕셔너리
        name_counter = {}
        
        # 각 시트별로 처리
        for sheet_name in sheet_names:
            print(f"\n--- '{sheet_name}' 시트 처리 중 ---")
            
            # 여러 가능한 헤더 위치 시도
            for header_row in [None, 0, 1]:
                try:
                    if header_row is None:
                        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
                    else:
                        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row)
                    
                    # 데이터 미리보기
                    print("데이터 미리보기:")
                    print(df.head(3))
                    
                    # 이름 열 찾기
                    name_column = None
                    
                    # 헤더가 있는 경우 열 이름으로 찾기
                    if header_row is not None:
                        name_columns = ['이름', 'Name', '성명', '학생명', '이름(Full Name)', 'Full Name', '성함']
                        for col in name_columns:
                            if col in df.columns:
                                name_column = col
                                print(f"이름 열을 찾았습니다: '{col}'")
                                break
                    
                    # 이름 열을 찾지 못했거나 헤더가 없는 경우
                    if name_column is None:
                        # 첫 번째 또는 두 번째 열 사용
                        name_column = 0  # 첫 번째 열
                        print(f"이름 열을 찾지 못해 첫 번째 열을 사용합니다.")
                    
                    # 데이터 시작 행 결정
                    start_row = 0
                    if header_row is not None:
                        start_row = 0  # pandas가 이미 헤더를 제외함
                    else:
                        start_row = 1
                    
                    students_in_sheet = []
                    
                    # 학생 데이터 추출
                    for idx, (_, row) in enumerate(df.iloc[start_row:].iterrows()):
                        # 이름 값 가져오기
                        if isinstance(name_column, (int, float)):
                            name_value = str(row.iloc[name_column]).strip()
                        else:
                            name_value = str(row[name_column]).strip()
                        
                        # 빈 값이나 NaN이 아닌 경우만 처리
                        if name_value and name_value.lower() != 'nan' and len(name_value) > 0:
                            # 이름이 이미 있는지 확인하고 카운터 증가
                            if name_value in name_counter:
                                name_counter[name_value] += 1
                                # 첫 번째 중복이면 기존 이름에 'A' 추가
                                if name_counter[name_value] == 2:
                                    # 이전 학생 찾아서 이름 수정
                                    for s in all_students:
                                        if s['name'] == name_value:
                                            s['name'] = f"{name_value}A"
                                            break
                                # 현재 학생 이름에 알파벳 추가
                                student_name = f"{name_value}{chr(64+name_counter[name_value])}"
                            else:
                                name_counter[name_value] = 1
                                student_name = name_value
                            
                            student = {
                                "id": student_id,
                                "name": student_name,
                                "present": False,
                                "code": "",
                                "timestamp": None
                            }
                            students_in_sheet.append(student)
                            student_id += 1  # 다음 학생 ID
                    
                    if students_in_sheet:
                        print(f"{len(students_in_sheet)}명의 학생을 '{sheet_name}' 시트에서 추출했습니다.")
                        all_students.extend(students_in_sheet)
                        break  # 성공적으로 데이터를 추출했으면 다음 헤더 위치 시도 중단
                    else:
                        print(f"'{sheet_name}' 시트에서 학생 데이터를 찾지 못했습니다. 다른 헤더 위치 시도.")
                
                except Exception as e:
                    print(f"헤더 행 {header_row}로 시도 중 오류 발생: {e}")
                    continue
        
        print(f"\n총 {len(all_students)}명의 학생 데이터를 추출했습니다.")
        return all_students
    
    except Exception as e:
        print(f"Excel 파일 처리 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return []

def save_students_to_json(students, json_file='students.json'):
    """학생 데이터를 JSON 파일로 저장합니다."""
    try:
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(students, f, ensure_ascii=False, indent=4)
        print(f"{len(students)}명의 학생 정보가 {json_file}에 저장되었습니다.")
    except Exception as e:
        print(f"JSON 파일 저장 중 오류 발생: {e}")

# 수동으로 학생 이름을 입력하는 함수 (Excel 처리가 어려울 경우)
def create_students_manually(names):
    """
    학생 이름 목록으로부터 students.json 파일을 생성합니다.
    동명이인은 자동으로 처리합니다.
    
    예시:
    names = ["김민준", "이서연", "이수민", "이수민", "박지호"]
    결과: 이수민A, 이수민B로 저장됩니다.
    """
    students = []
    name_counter = {}
    
    for idx, name in enumerate(names):
        name = name.strip()
        if name in name_counter:
            name_counter[name] += 1
            if name_counter[name] == 2:
                # 이전 학생 찾아서 이름 수정
                for s in students:
                    if s['name'] == name:
                        s['name'] = f"{name}A"
                        break
            # 현재 학생 이름에 알파벳 추가
            student_name = f"{name}{chr(64+name_counter[name])}"
        else:
            name_counter[name] = 1
            student_name = name
        
        student = {
            "id": idx + 1,
            "name": student_name,
            "present": False,
            "code": "",
            "timestamp": None
        }
        students.append(student)
    
    return students

# 사용 예시
if __name__ == "__main__":
    try:
        # Excel 파일에서 학생 데이터 추출
        excel_file = "MS AI School 6기 Teams 계정.xlsx"
        students = extract_students_with_duplicates(excel_file)
        
        if students:
            # JSON 파일로 저장
            save_students_to_json(students)
            
            # 출력하여 확인
            print("\n변환된 학생 목록 (처음 10명):")
            for student in students[:10]:  # 처음 10명만 출력
                print(f"ID: {student['id']}, 이름: {student['name']}")
            
            if len(students) > 10:
                print(f"... 외 {len(students) - 10}명")
        else:
            print("Excel 파일에서 학생 데이터를 추출할 수 없습니다.")
            
            # 수동으로 학생 목록 입력 (예시)
            print("\nExcel 처리에 실패했습니다. 수동으로 학생 목록을 입력하세요.")
            student_names = [
                "김민준", "이서연", "이수민", "이수민", "박지호", "정우진", "최수아", "이수민"
            ]
            manual_students = create_students_manually(student_names)
            save_students_to_json(manual_students)
            print("\n수동으로 생성된 학생 목록:")
            for student in manual_students:
                print(f"ID: {student['id']}, 이름: {student['name']}")
            
    except Exception as e:
        print(f"오류 발생: {e}")