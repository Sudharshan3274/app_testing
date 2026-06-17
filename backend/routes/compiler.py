import os
import sys
import uuid
import time
import subprocess
import shutil
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    source_code: str
    language: str  # 'python', 'javascript', 'cpp', 'c', 'java'
    stdin: str = ""

TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp_run")

def ensure_temp_dir():
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

@router.post("/run")
async def run_code(request: CodeExecutionRequest):
    ensure_temp_dir()
    unique_id = str(uuid.uuid4())[:8]
    lang = request.language.lower().strip()
    
    # We will return: stdout, stderr, compile_output, exit_code, time (seconds)
    response = {
        "stdout": "",
        "stderr": "",
        "compile_output": "",
        "status": {"id": 3, "description": "Accepted"}, # Default to Accepted, will change if error
        "time": 0.0,
        "memory": "N/A"
    }

    run_dir = os.path.join(TEMP_DIR, f"run_{unique_id}")
    os.makedirs(run_dir, exist_ok=True)

    try:
        if lang == "python":
            file_path = os.path.join(run_dir, "main.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(request.source_code)
            
            # Use sys.executable to run with the current virtual environment's Python
            start_time = time.perf_counter()
            try:
                res = subprocess.run(
                    [sys.executable, "main.py"],
                    input=request.stdin,
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=5.0
                )
                response["time"] = round(time.perf_counter() - start_time, 3)
                response["stdout"] = res.stdout
                response["stderr"] = res.stderr
                if res.returncode != 0:
                    response["status"] = {"id": 11, "description": "Runtime Error (NZEC)"}
            except subprocess.TimeoutExpired:
                response["status"] = {"id": 5, "description": "Time Limit Exceeded"}
                response["stderr"] = "Time Limit Exceeded (5s)"
                
        elif lang == "javascript":
            file_path = os.path.join(run_dir, "main.js")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(request.source_code)
                
            start_time = time.perf_counter()
            try:
                res = subprocess.run(
                    ["node", "main.js"],
                    input=request.stdin,
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=5.0
                )
                response["time"] = round(time.perf_counter() - start_time, 3)
                response["stdout"] = res.stdout
                response["stderr"] = res.stderr
                if res.returncode != 0:
                    response["status"] = {"id": 11, "description": "Runtime Error (NZEC)"}
            except FileNotFoundError:
                response["status"] = {"id": 6, "description": "Compilation Error"}
                response["compile_output"] = "Node.js runtime not found on local system. Please install Node.js."
            except subprocess.TimeoutExpired:
                response["status"] = {"id": 5, "description": "Time Limit Exceeded"}
                response["stderr"] = "Time Limit Exceeded (5s)"

        elif lang in ["cpp", "c"]:
            ext = "cpp" if lang == "cpp" else "c"
            compiler = "g++" if lang == "cpp" else "gcc"
            binary_name = "program.exe" if os.name == "nt" else "./program"
            
            src_path = os.path.join(run_dir, f"main.{ext}")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(request.source_code)
                
            # Compile step
            compile_args = [compiler, f"main.{ext}", "-o", "program"]
            if lang == "cpp":
                compile_args.insert(2, "-std=c++17")
                
            try:
                compile_res = subprocess.run(
                    compile_args,
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=10.0
                )
                if compile_res.returncode != 0:
                    response["status"] = {"id": 6, "description": "Compilation Error"}
                    response["compile_output"] = compile_res.stderr or compile_res.stdout
                    return response
            except FileNotFoundError:
                response["status"] = {"id": 6, "description": "Compilation Error"}
                response["compile_output"] = f"C/C++ compiler '{compiler}' not found. Please install gcc/g++ and add it to your System PATH."
                return response
                
            # Execution step
            start_time = time.perf_counter()
            try:
                res = subprocess.run(
                    [binary_name],
                    input=request.stdin,
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=5.0
                )
                response["time"] = round(time.perf_counter() - start_time, 3)
                response["stdout"] = res.stdout
                response["stderr"] = res.stderr
                if res.returncode != 0:
                    response["status"] = {"id": 11, "description": "Runtime Error (NZEC)"}
            except subprocess.TimeoutExpired:
                response["status"] = {"id": 5, "description": "Time Limit Exceeded"}
                response["stderr"] = "Time Limit Exceeded (5s)"
                
        elif lang == "java":
            # Java expects class name to match file name. We write Solution.java
            src_path = os.path.join(run_dir, "Solution.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(request.source_code)
                
            # Compile step
            try:
                compile_res = subprocess.run(
                    ["javac", "Solution.java"],
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=10.0
                )
                if compile_res.returncode != 0:
                    response["status"] = {"id": 6, "description": "Compilation Error"}
                    response["compile_output"] = compile_res.stderr or compile_res.stdout
                    return response
            except FileNotFoundError:
                response["status"] = {"id": 6, "description": "Compilation Error"}
                response["compile_output"] = "Java compiler 'javac' not found. Please install the JDK and configure JAVA_HOME."
                return response
                
            # Execution step
            start_time = time.perf_counter()
            try:
                res = subprocess.run(
                    ["java", "Solution"],
                    input=request.stdin,
                    text=True,
                    capture_output=True,
                    cwd=run_dir,
                    timeout=5.0
                )
                response["time"] = round(time.perf_counter() - start_time, 3)
                response["stdout"] = res.stdout
                response["stderr"] = res.stderr
                if res.returncode != 0:
                    response["status"] = {"id": 11, "description": "Runtime Error (NZEC)"}
            except subprocess.TimeoutExpired:
                response["status"] = {"id": 5, "description": "Time Limit Exceeded"}
                response["stderr"] = "Time Limit Exceeded (5s)"
        else:
            response["status"] = {"id": 13, "description": "Internal Error"}
            response["stderr"] = f"Unsupported compiler language: {lang}"
            
    except Exception as e:
        response["status"] = {"id": 13, "description": "Internal Error"}
        response["stderr"] = str(e)
    finally:
        # Asynchronously clean up directory
        try:
            shutil.rmtree(run_dir, ignore_errors=True)
        except Exception:
            pass

    return response
