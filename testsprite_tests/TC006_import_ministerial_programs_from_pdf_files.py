import requests
import os

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_EMAIL = os.getenv("TEST_USER_EMAIL")
AUTH_PASSWORD = os.getenv("TEST_USER_PASSWORD")

assert AUTH_EMAIL is not None, "Environment variable TEST_USER_EMAIL must be set."
assert AUTH_PASSWORD is not None, "Environment variable TEST_USER_PASSWORD must be set."

def get_supabase_token(email, password):
    url = f"{BASE_URL}/auth/v1/token"
    payload = {
        "email": email,
        "password": password,
        "grant_type": "password"
    }
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert "access_token" in data
    return data["access_token"]

def test_import_ministerial_program_from_pdf():
    # Authenticate and get bearer token
    token = get_supabase_token(AUTH_EMAIL, AUTH_PASSWORD)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    # Prepare the PDF file for import
    pdf_filename = "sample_jw_ministerial_program.pdf"
    # Assuming we have a sample PDF in the current directory for testing
    assert os.path.isfile(pdf_filename), f"Test PDF file {pdf_filename} must exist."

    files = {"file": (pdf_filename, open(pdf_filename, "rb"), "application/pdf")}

    # Make POST request to import endpoint
    import_url = f"{BASE_URL}/api/programs/import-pdf"
    
    response = None
    try:
        response = requests.post(import_url, headers=headers, files=files, timeout=TIMEOUT)
        response.raise_for_status()
        json_data = response.json()
        # Validate the response structure
        assert isinstance(json_data, dict), "Response should be a dictionary/JSON object."
        # Check keys expected in the imported ministerial program JSON
        expected_keys = ["programs", "imported_at", "source"]
        for key in expected_keys:
            assert key in json_data, f"Response JSON missing expected key: {key}"
        # Validate programs is a non-empty list with dict items having expected fields
        assert isinstance(json_data["programs"], list) and len(json_data["programs"]) > 0, "Programs list should not be empty."
        for program in json_data["programs"]:
            assert isinstance(program, dict), "Each program entry must be a dictionary."
            # Common fields expected in each ministerial program imported from official PDF
            required_program_fields = ["id", "title", "date", "parts"]
            for field in required_program_fields:
                assert field in program, f"Program missing required field: {field}"
            assert isinstance(program["parts"], list), "'parts' field should be a list."
    finally:
        # Close the file handle safely
        files["file"][1].close()

test_import_ministerial_program_from_pdf()
