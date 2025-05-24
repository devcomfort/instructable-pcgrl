import csv
import json


def extract_instructions_to_json(csv_file_path, json_file_path):
    """
    Extracts the 'instruction' column from a CSV file and saves it as a JSON file.

    Args:
        csv_file_path (str): The path to the input CSV file.
        json_file_path (str): The path to the output JSON file.
    """
    instructions = []
    try:
        with open(csv_file_path, "r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            if reader.fieldnames is None:
                print(f"Error: Could not read header from {csv_file_path}")
                return
            if "instruction" not in reader.fieldnames:
                print(f"Error: 'instruction' column not found in {csv_file_path}")
                return

            for row in reader:
                if "instruction" in row and row["instruction"]:
                    instructions.append(row["instruction"])

        output_data = {"instructions": instructions}

        with open(json_file_path, "w", encoding="utf-8") as jsonfile:
            json.dump(output_data, jsonfile, ensure_ascii=False, indent=4)

        print(f"Successfully extracted instructions to {json_file_path}")

    except FileNotFoundError:
        print(f"Error: The file {csv_file_path} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    # NOTE: Set the input CSV file path and the output JSON file path.
    # By default, this script assumes 'whole.csv' is in the same directory
    # as this script (extract_instructions.py) and will create 'instructions.json'
    # in the same directory.
    #
    # If your files are located elsewhere, please adjust the paths accordingly.
    # For example:
    #   To process 'data/input.csv' and save to 'output/results.json':
    #     csv_input_path = "data/input.csv"
    #     json_output_path = "output/results.json"
    #   To process '../static_files/input.csv' (if script is in a subdirectory)
    #   and save to the current script's directory:
    #     csv_input_path = "../static_files/input.csv"
    #     json_output_path = "results.json"
    # ---
    # 참고: 입력 CSV 파일 경로와 출력 JSON 파일 경로를 설정합니다.
    # 기본적으로 이 스크립트는 'whole.csv' 파일이 현재 스크립트(extract_instructions.py)와
    # 동일한 디렉토리에 있다고 가정하며, 'instructions.json' 파일 또한 동일한 디렉토리에 생성합니다.
    #
    # 만약 파일들이 다른 위치에 있다면, 그에 맞게 경로를 수정해주세요.
    # 예시:
    #   'data/input.csv'를 처리하고 'output/results.json'으로 저장하려면:
    #     csv_input_path = "data/input.csv"
    #     json_output_path = "output/results.json"
    #   스크립트가 하위 디렉토리에 있고 '../static_files/input.csv'를 처리하여
    #   현재 스크립트 디렉토리에 저장하려면:
    #     csv_input_path = "../static_files/input.csv"
    #     json_output_path = "results.json"

    # Current configuration:
    # Input CSV file path. Assumes 'whole.csv' is in the same directory as this script.
    # ---
    # 현재 설정:
    # 입력 CSV 파일 경로. 'whole.csv'가 이 스크립트와 동일한 디렉토리에 있다고 가정합니다.
    csv_input_path = "whole.csv"

    # Output JSON file path. 'instructions.json' will be created in the same directory as this script.
    # ---
    # 출력 JSON 파일 경로. 'instructions.json'이 이 스크립트와 동일한 디렉토리에 생성됩니다.
    json_output_path = "instructions.json"

    extract_instructions_to_json(csv_input_path, json_output_path)
