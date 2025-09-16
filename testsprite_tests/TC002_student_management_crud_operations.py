import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

# Credentials for test user with admin or instructor role
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "TestPassword123!"


def login_and_get_token():
    payload = {
        "email": AUTH_EMAIL,
        "password": AUTH_PASSWORD
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=payload, headers=HEADERS, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    data = resp.json()
    assert "access_token" in data, "No access_token in login response"
    return data["access_token"]


def test_student_management_crud_operations():
    token = login_and_get_token()
    auth_headers = HEADERS.copy()
    auth_headers["Authorization"] = f"Bearer {token}"

    student_payload_create = {
        "name": "Test Student",
        "gender": "male",
        "birthdate": "2005-04-23",
        "congregation_id": 1,
        "qualifications": ["public_speaker"],
        "notes": "Initial creation for TC002"
    }

    student_payload_update = {
        "name": "Updated Test Student",
        "gender": "male",
        "birthdate": "2005-04-23",
        "congregation_id": 1,
        "qualifications": ["public_speaker", "baptized"],
        "notes": "Updated after creation for TC002"
    }

    student_id = None

    try:
        # Create student
        create_resp = requests.post(
            f"{BASE_URL}/estudantes",
            json=student_payload_create,
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Create failed: {create_resp.text}"
        student_data = create_resp.json()
        assert "id" in student_data, "Created student response missing id"
        student_id = student_data["id"]

        # Validate creation data persisted correctly
        for key in student_payload_create:
            if key in student_data:
                assert student_data[key] == student_payload_create[key], f"Mismatch in created {key}"

        # Edit student
        update_resp = requests.put(
            f"{BASE_URL}/estudantes/{student_id}",
            json=student_payload_update,
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        updated_data = update_resp.json()
        for key in student_payload_update:
            if key in updated_data:
                assert updated_data[key] == student_payload_update[key], f"Mismatch in updated {key}"

        # View student
        get_resp = requests.get(
            f"{BASE_URL}/estudantes/{student_id}",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert get_resp.status_code == 200, f"View failed: {get_resp.text}"
        get_data = get_resp.json()
        for key in student_payload_update:
            if key in get_data:
                assert get_data[key] == student_payload_update[key], f"Mismatch in viewed {key}"

        # Delete student
        delete_resp = requests.delete(
            f"{BASE_URL}/estudantes/{student_id}",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert delete_resp.status_code == 204, f"Delete failed: {delete_resp.text}"

        # Confirm deletion
        get_after_delete_resp = requests.get(
            f"{BASE_URL}/estudantes/{student_id}",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert get_after_delete_resp.status_code == 404, "Student still exists after deletion"

    finally:
        if student_id is not None:
            # Cleanup in case test failed before delete
            requests.delete(f"{BASE_URL}/estudantes/{student_id}", headers=auth_headers, timeout=TIMEOUT)


test_student_management_crud_operations()
