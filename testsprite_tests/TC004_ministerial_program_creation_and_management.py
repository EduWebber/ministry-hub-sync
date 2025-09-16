import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

# Assuming authentication is required and token is obtained via a function or prior login
# Here we simulate a function that returns a valid admin token for testing
def get_auth_token():
    # In real scenario this should perform login and return a valid JWT token
    # For test, you may hardcode a valid token string if available
    # This placeholder assumes token string is returned
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tokenpayload"

def test_ministerial_program_creation_and_management():
    token = get_auth_token()
    headers = HEADERS.copy()
    headers["Authorization"] = token

    program_data_create = {
        "title": "Test Program April 2025",
        "description": "Program created during automated test",
        "startDate": "2025-04-01",
        "endDate": "2025-04-30",
        "notes": "Initial creation for TC004 testing"
    }

    program_data_update = {
        "title": "Test Program April 2025 - Updated",
        "description": "Program description updated during automated test",
        "startDate": "2025-04-01",
        "endDate": "2025-05-01",
        "notes": "Updated program info for TC004 testing"
    }

    program_id = None

    try:
        # Create ministerial program
        response_create = requests.post(
            f"{BASE_URL}/programas",
            headers=headers,
            json=program_data_create,
            timeout=TIMEOUT
        )
        assert response_create.status_code == 201, f"Expected 201 Created, got {response_create.status_code}"
        create_response_json = response_create.json()
        assert "id" in create_response_json, "Response missing program id on creation"
        program_id = create_response_json["id"]

        # Validate data persistence of created program by retrieving it
        response_get = requests.get(
            f"{BASE_URL}/programas/{program_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_get.status_code == 200, f"Expected 200 OK on get, got {response_get.status_code}"
        get_response_json = response_get.json()
        for key in program_data_create:
            assert get_response_json.get(key) == program_data_create[key], f"Mismatch on field '{key}' after creation"

        # Edit/update ministerial program
        response_update = requests.put(
            f"{BASE_URL}/programas/{program_id}",
            headers=headers,
            json=program_data_update,
            timeout=TIMEOUT
        )
        assert response_update.status_code == 200, f"Expected 200 OK on update, got {response_update.status_code}"
        update_response_json = response_update.json()
        for key in program_data_update:
            assert update_response_json.get(key) == program_data_update[key], f"Mismatch on field '{key}' after update"

        # Validate update persisted by GET
        response_get_after_update = requests.get(
            f"{BASE_URL}/programas/{program_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_get_after_update.status_code == 200, f"Expected 200 OK on get after update, got {response_get_after_update.status_code}"
        get_after_update_json = response_get_after_update.json()
        for key in program_data_update:
            assert get_after_update_json.get(key) == program_data_update[key], f"Mismatch on field '{key}' in get after update"

        # Optionally test UI update is reflected through API check (list)
        response_list = requests.get(
            f"{BASE_URL}/programas",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_list.status_code == 200, f"Expected 200 OK on list, got {response_list.status_code}"
        list_programs = response_list.json()
        assert any(p["id"] == program_id and p["title"] == program_data_update["title"] for p in list_programs), \
            "Updated program not found in program list indicating UI data update failure"

    except RequestException as e:
        assert False, f"HTTP request failed: {e}"
    finally:
        # Clean up - delete the created program
        if program_id:
            try:
                response_delete = requests.delete(
                    f"{BASE_URL}/programas/{program_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert response_delete.status_code in (200, 204), f"Expected 200 or 204 on delete, got {response_delete.status_code}"
            except RequestException as e:
                # Log but don't fail test on cleanup failure
                print(f"Warning: Failed to delete program during cleanup: {e}")

test_ministerial_program_creation_and_management()
