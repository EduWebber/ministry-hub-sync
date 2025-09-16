import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Test users with roles and their credentials to test authentication and RBAC
TEST_USERS = [
    {"email": "admin@example.com", "password": "AdminPass123!", "role": "admin"},
    {"email": "instructor@example.com", "password": "InstructorPass123!", "role": "instructor"},
    {"email": "student@example.com", "password": "StudentPass123!", "role": "student"},
    {"email": "family@example.com", "password": "FamilyPass123!", "role": "family"},
]

def test_authentication_with_role_based_access_control():
    session_tokens = {}

    # 1. Authenticate each test user and verify JWT token returned and role claims
    for user in TEST_USERS:
        try:
            response = requests.post(
                f"{BASE_URL}/auth/v1/token",
                json={"email": user["email"], "password": user["password"]},
                timeout=TIMEOUT,
            )
        except requests.RequestException as e:
            assert False, f"Request exception for role {user['role']} login: {e}"

        assert response.status_code == 200, f"Login failed for {user['role']} with status {response.status_code}"
        json_response = response.json()
        assert "access_token" in json_response, f"Access token missing for {user['role']} login"

        access_token = json_response["access_token"]
        session_tokens[user["role"]] = access_token

        # Decode JWT payload (without verification, just a naive check for presence of role)
        # JWT is typically in header.payload.signature format base64url encoded
        payload_segment = access_token.split(".")[1]
        import base64, json
        # Pad base64 string properly
        padding = '=' * (-len(payload_segment) % 4)
        try:
            decoded_payload = base64.urlsafe_b64decode(payload_segment + padding)
            payload_json = json.loads(decoded_payload)
        except Exception:
            assert False, f"Failed decoding JWT payload for role {user['role']}"

        # Validate role claim exists and matches expected role (common claim 'role' or 'app_role')
        role_claim = payload_json.get("role") or payload_json.get("app_role") or payload_json.get("user_role")
        assert role_claim == user["role"], f"Role claim {role_claim} does not match expected {user['role']}"

    # 2. Test role-based access control by hitting an admin-only endpoint with each token
    admin_only_endpoint = f"{BASE_URL}/admin/protected-resource"
    for role, token in session_tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = requests.get(admin_only_endpoint, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request exception accessing admin endpoint as {role}: {e}"

        if role == "admin":
            assert resp.status_code == 200, f"Admin access denied unexpectedly with status {resp.status_code}"
            # checking response body contains expected data (e.g. some known key)
            try:
                data = resp.json()
                assert "admin_data" in data or len(data) > 0
            except Exception:
                assert False, "Admin endpoint response invalid JSON or missing data"
        else:
            # Non-admin roles should be denied access (403 Forbidden or 401 Unauthorized)
            assert resp.status_code in (401, 403), f"{role} unexpectedly granted admin access with status {resp.status_code}"

    # 3. Test access to an instructor-only endpoint
    instructor_only_endpoint = f"{BASE_URL}/instructor/protected-resource"
    for role, token in session_tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = requests.get(instructor_only_endpoint, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request exception accessing instructor endpoint as {role}: {e}"

        if role in ("admin", "instructor"):
            assert resp.status_code == 200, f"{role} access denied unexpectedly with status {resp.status_code}"
            try:
                data = resp.json()
                assert "instructor_data" in data or len(data) > 0
            except Exception:
                assert False, "Instructor endpoint response invalid JSON or missing data"
        else:
            assert resp.status_code in (401, 403), f"{role} unexpectedly granted instructor access with status {resp.status_code}"

    # 4. Test access to a student-only endpoint
    student_only_endpoint = f"{BASE_URL}/student/protected-resource"
    for role, token in session_tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = requests.get(student_only_endpoint, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request exception accessing student endpoint as {role}: {e}"

        if role in ("admin", "student", "family"):
            # family might be allowed access assuming familial access, otherwise adjust as per policy
            assert resp.status_code == 200, f"{role} access denied unexpectedly with status {resp.status_code}"
            try:
                data = resp.json()
                assert "student_data" in data or len(data) > 0
            except Exception:
                assert False, "Student endpoint response invalid JSON or missing data"
        else:
            assert resp.status_code in (401, 403), f"{role} unexpectedly granted student access with status {resp.status_code}"

test_authentication_with_role_based_access_control()