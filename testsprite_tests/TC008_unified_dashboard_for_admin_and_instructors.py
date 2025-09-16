import requests

BASE_URL = "http://localhost:3000"
SUPABASE_AUTH_URL = "https://your-supabase-project.supabase.co/auth/v1/token"  # Replace with actual Supabase Auth URL
TIMEOUT = 30

# Admin and instructor credentials (should be valid in the test environment)
ADMIN_CREDENTIALS = {
    "email": "admin@example.com",
    "password": "AdminPass123!"
}

INSTRUCTOR_CREDENTIALS = {
    "email": "instructor@example.com",
    "password": "InstructorPass123!"
}


def supabase_auth_login(email, password):
    url = SUPABASE_AUTH_URL
    headers = {
        "apikey": "anon-key",  # Replace with actual anon/public key or use env var
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    json_data = {"grant_type": "password", "email": email, "password": password}
    resp = requests.post(url, headers=headers, json=json_data, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    access_token = data.get("access_token")
    assert access_token, "Login failed: access_token missing in response"
    return access_token


def test_unified_dashboard_for_admin_and_instructors():
    # Login as admin
    admin_token = None
    instructor_token = None
    try:
        admin_token = supabase_auth_login(ADMIN_CREDENTIALS["email"], ADMIN_CREDENTIALS["password"])
        headers_admin = {
            "Authorization": f"Bearer {admin_token}"
        }
        # Admin dashboard retrieval
        response_admin = requests.get(f"{BASE_URL}/api/dashboard/unified", headers=headers_admin, timeout=TIMEOUT)
        assert response_admin.status_code == 200, f"Admin dashboard status code {response_admin.status_code}"
        admin_data = response_admin.json()

        # Verify expected keys exist for admin dashboard
        assert "ministerialPrograms" in admin_data, "Missing ministerialPrograms key in admin dashboard"
        assert isinstance(admin_data["ministerialPrograms"], list), "ministerialPrograms should be a list"
        assert "assignmentTools" in admin_data, "Missing assignmentTools key in admin dashboard"
        assert isinstance(admin_data["assignmentTools"], dict), "assignmentTools should be a dict"

        # Login as instructor
        instructor_token = supabase_auth_login(INSTRUCTOR_CREDENTIALS["email"], INSTRUCTOR_CREDENTIALS["password"])
        headers_instructor = {
            "Authorization": f"Bearer {instructor_token}"
        }
        # Instructor dashboard retrieval
        response_instr = requests.get(f"{BASE_URL}/api/dashboard/unified", headers=headers_instructor, timeout=TIMEOUT)
        assert response_instr.status_code == 200, f"Instructor dashboard status code {response_instr.status_code}"
        instructor_data = response_instr.json()

        # Verify expected keys exist for instructor dashboard
        assert "ministerialPrograms" in instructor_data, "Missing ministerialPrograms key in instructor dashboard"
        assert isinstance(instructor_data["ministerialPrograms"], list), "ministerialPrograms should be a list"
        assert "assignmentTools" in instructor_data, "Missing assignmentTools key in instructor dashboard"
        assert isinstance(instructor_data["assignmentTools"], dict), "assignmentTools should be a dict"

        # Additional content assertions (e.g. programs not empty)
        assert len(admin_data["ministerialPrograms"]) > 0, "Admin ministerialPrograms list is empty"
        assert len(instructor_data["ministerialPrograms"]) > 0, "Instructor ministerialPrograms list is empty"

    except requests.HTTPError as e:
        assert False, f"HTTP request failed: {str(e)}"
    except Exception as e:
        assert False, f"Test failed: {str(e)}"


test_unified_dashboard_for_admin_and_instructors()
