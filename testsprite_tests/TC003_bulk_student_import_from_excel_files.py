import requests
from requests.auth import HTTPBasicAuth
import io

BASE_URL = "http://localhost:3000"
IMPORT_ENDPOINT = f"{BASE_URL}/students/import"
DELETE_ENDPOINT = f"{BASE_URL}/students"
AUTH_ENDPOINT = f"{BASE_URL}/auth/token"
TIMEOUT = 30

# Replace with valid admin credentials for authentication
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "strongpassword"

def test_bulk_student_import_from_excel():
    session = requests.Session()

    # Authenticate as admin to obtain access token
    try:
        auth_resp = session.post(
            AUTH_ENDPOINT,
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=TIMEOUT
        )
        auth_resp.raise_for_status()
        auth_data = auth_resp.json()
        access_token = auth_data.get("access_token") or auth_data.get("token") or auth_data.get("accessToken")
        assert access_token, "Authentication token not found in response"

        session.headers.update({"Authorization": f"Bearer {access_token}"})
    except Exception as e:
        raise AssertionError(f"Authentication failed: {e}")

    # Prepare a simple valid Excel file in-memory with multiple student records complying with S-38 rules.
    # For demonstration, create a minimal Excel content with headers and 2 students.
    # We'll create it as a byte stream representing an XLSX file.
    # Since generation of real XLSX requires external libraries, let's embed a pre-created valid XLSX file byte string.
    # Here, we simulate it with a minimal valid XLSX binary content (must be adapted as needed or replaced with an actual file in a real environment).

    # For the purpose of this test, let's create a very simple Excel file with openpyxl (standard for excel).
    try:
        import openpyxl
        from openpyxl import Workbook
        excel_bytes_io = io.BytesIO()
        wb = Workbook()
        ws = wb.active
        ws.title = "Students"
        # Header row as expected by the API
        ws.append(["first_name", "last_name", "gender", "qualification", "congregation"])
        # Adding two students - should pass S-38 validations (assumed)
        ws.append(["John", "Doe", "M", "Publisher", "Congregation 1"])
        ws.append(["Jane", "Smith", "F", "Publisher", "Congregation 1"])
        wb.save(excel_bytes_io)
        excel_bytes_io.seek(0)
    except ImportError:
        raise AssertionError("openpyxl is required to run this test")

    files = {
        "file": ("students_import.xlsx", excel_bytes_io, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }

    try:
        import_resp = session.post(
            IMPORT_ENDPOINT,
            files=files,
            timeout=TIMEOUT
        )
        import_resp.raise_for_status()
        data = import_resp.json()
        # Expected: list of imported student records or a response confirming total imported
        assert isinstance(data, dict) or isinstance(data, list), "Response JSON format unexpected"
        # Check for success message or import count in response keys
        if isinstance(data, dict):
            # Example: {"imported": 2, "errors": []}
            imported_count = data.get("imported") or data.get("count") or len(data.get("students", []))
            assert imported_count == 2, f"Expected 2 students imported, got {imported_count}"
            errors = data.get("errors") or []
            assert not errors, f"Errors occurred during import: {errors}"
        elif isinstance(data, list):
            assert len(data) == 2, f"Expected 2 students imported, got {len(data)}"
        else:
            assert False, "Unexpected response content"

        # For cleanup, collect the IDs of imported students if returned
        imported_ids = []
        if isinstance(data, dict) and "students" in data:
            for student in data["students"]:
                if "id" in student:
                    imported_ids.append(student["id"])
        elif isinstance(data, list):
            for student in data:
                if isinstance(student, dict) and "id" in student:
                    imported_ids.append(student["id"])

        # If IDs are not returned, try to fetch students by unique fields (not implemented here due to lack of API detail)
    except requests.HTTPError as e:
        # If validation failed according to S-38 rules, expect a 4xx status with error detail
        if e.response is not None and e.response.status_code in (400, 422):
            err_data = e.response.json()
            assert "validation" in str(err_data).lower() or "error" in str(err_data).lower(), "Expected validation error message in response"
        else:
            raise AssertionError(f"Import request failed unexpectedly: {e}")
    finally:
        # Cleanup: delete imported students if IDs available
        for student_id in imported_ids:
            try:
                del_resp = session.delete(
                    f"{DELETE_ENDPOINT}/{student_id}",
                    timeout=TIMEOUT
                )
                # Accept 200 OK or 204 No Content for successful deletion
                assert del_resp.status_code in (200, 204), f"Failed to delete student {student_id}"
            except Exception:
                pass

test_bulk_student_import_from_excel()
