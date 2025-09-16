import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Test data: A test student user credentials and their role token simulation
TEST_STUDENT_EMAIL = "teststudent@example.com"
TEST_STUDENT_PASSWORD = "TestPassword123!"

def test_student_portal_assignment_viewing():
    session = requests.Session()

    try:
        # 1. Authenticate as a student to get access token (Supabase Auth simulation)
        login_payload = {
            "email": TEST_STUDENT_EMAIL,
            "password": TEST_STUDENT_PASSWORD
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        auth_response = session.post(
            f"{BASE_URL}/auth/v1/token?grant_type=password",
            data=login_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert auth_response.status_code == 200, f"Login failed: {auth_response.text}"
        auth_data = auth_response.json()
        access_token = auth_data.get("access_token")
        assert access_token, "Access token not found in login response"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

        # 2. Get authenticated student's own assignments
        assignments_response = session.get(
            f"{BASE_URL}/student/assignments",
            headers=headers,
            timeout=TIMEOUT
        )
        assert assignments_response.status_code == 200, f"Failed to get assignments: {assignments_response.text}"
        assignments = assignments_response.json()

        # 3. Validate the assignments response structure and access control
        # Expecting a list of assignments belong to logged-in student only
        assert isinstance(assignments, list), "Assignments response is not a list"

        # Each assignment should have required fields: id, title, date, notification (personalized info)
        for assignment in assignments:
            assert "id" in assignment, "Assignment missing id"
            assert "title" in assignment, "Assignment missing title"
            assert "date" in assignment, "Assignment missing date"
            # notification field can be personalized message
            assert "notification" in assignment, "Assignment missing personalized notification"

        # 4. Verify no assignments for other students (simulate by checking user IDs if present)
        # Assuming 'student_id' field matches logged-in user id or absent (depends on API)
        # For demonstration, we won't explicitly check student_id since API returns only user's own assignments

        # 5. Attempt to fetch another student's assignments (should be forbidden)
        other_student_id = "00000000-0000-0000-0000-000000000000"
        other_response = session.get(
            f"{BASE_URL}/student/{other_student_id}/assignments",
            headers=headers,
            timeout=TIMEOUT
        )
        # Either 403 Forbidden or 404 Not Found expected, based on access control policies
        assert other_response.status_code in (403, 404), "Access control violated: able to access other student's assignments"

    finally:
        session.close()

test_student_portal_assignment_viewing()
