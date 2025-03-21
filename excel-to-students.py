import pandas as pd
import json
import os

def extract_students_from_excel(excel_file):
    """
    Excel 파일의 모든 시트에서 학생 정보를 읽어 students 리스트로 변환합니다.
    """
    try:
        # 엑셀 파일의 모든 시트 이름 가져오기
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        print(f"엑셀 파일에서 발견된 시트: {sheet_names}")
        
        all_students = []
        student_id = 1  # 전체 학생에 대한 ID
        
        # 각 시트별로 처리
        for sheet_name in sheet_names:
            print(f"\n--- '{sheet_name}' 시트 처리 중 ---")
            
            # 여러 가능한 헤더 위치 시도 (헤더 없음, 첫 번째 행, 두 번째 행)
            for header_row in [None, 0, 1]:
                try:
                    if header_row is None:
                        # 헤더 없이 데이터 읽기
                        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
                        print(f"헤더 없이 데이터 읽기 시도")
                    else:
                        # 지정된 행을 헤더로 사용
                        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row)
                        print(f"헤더 행 {header_row+1}를 사용해 데이터 읽기 시도")
                    
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
                        # 헤더가 있으면 헤더 다음 행부터 시작
                        start_row = 0  # pandas가 이미 헤더를 제외함
                    else:
                        # 헤더가 없으면 2행부터 시작 (첫 행이 헤더일 가능성)
                        start_row = 1
                    
                    students_in_sheet = []
                    
                    # 학생 데이터 추출
                    for idx, (_, row) in enumerate(df.iloc[start_row:].iterrows()):
                        # 이름 값 가져오기 (열 이름 또는 인덱스로)
                        if isinstance(name_column, (int, float)):
                            name_value = str(row.iloc[name_column]).strip()
                        else:
                            name_value = str(row[name_column]).strip()
                        
                        # 빈 값이나 NaN이 아닌 경우만 처리
                        if name_value and name_value.lower() != 'nan' and len(name_value) > 0:
                            student = {
                                "id": student_id,
                                "name": name_value,
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
            
            # 모든 헤더 위치 시도 후에도 데이터를 찾지 못한 경우
            if not any(student.get("sheet") == sheet_name for student in all_students):
                print(f"'{sheet_name}' 시트에서 학생 데이터를 추출하지 못했습니다.")
        
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

# 사용 예시
if __name__ == "__main__":
    excel_file = "MS AI School 6기 Teams 계정.xlsx"
    students = extract_students_from_excel(excel_file)
    
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
        print("학생 데이터를 추출할 수 없습니다.")