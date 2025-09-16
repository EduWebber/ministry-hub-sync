import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Replace these credentials with valid test user credentials with instructor/admin role
AUTH_EMAIL = "instructor@example.com"
AUTH_PASSWORD = "StrongPassword123!"

def test_automatic_assignment_generation_s38_rules():
    session = requests.Session()
    created_student_ids = []
    try:
        # 1. Authenticate user via Supabase Auth
        auth_url = f"{BASE_URL}/auth/v1/token?grant_type=password"
        auth_payload = {
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD
        }
        auth_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "apikey": "public-anon-key"  # Replace with actual anon key if required
        }
        auth_response = session.post(auth_url, data=auth_payload, headers=auth_headers, timeout=TIMEOUT)
        assert auth_response.status_code == 200, f"Auth failed: {auth_response.text}"
        auth_data = auth_response.json()
        access_token = auth_data.get("access_token")
        assert access_token, "No access token received upon authentication"

        # Setup auth header for subsequent requests
        session.headers.update({
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        })

        # 2. Create a test congregation if needed (assuming one exists or is implicit)
        #    For simplicity, assume a congregationId is required to generate assignments.
        #    We try to get congregations or use a default one.
        congregations_resp = session.get(f"{BASE_URL}/congregations", timeout=TIMEOUT)
        assert congregations_resp.status_code == 200, f"Failed to list congregations: {congregations_resp.text}"
        congregations = congregations_resp.json()
        assert isinstance(congregations, list) and len(congregations) > 0, "No congregations found"
        congregation_id = congregations[0]['id']

        # 3. Ensure there are students with various gender and qualifications for assignment
        #    Create minimal students required with known valid/invalid qualifications to test rules.
        # Fetch existing students to simplify or create new students if none exist.
        students_resp = session.get(f"{BASE_URL}/students?congregationId={congregation_id}", timeout=TIMEOUT)
        assert students_resp.status_code == 200, f"Failed to fetch students: {students_resp.text}"
        students = students_resp.json()
        if not students or len(students) < 2:
            # Create sample students for the assignment test - minimal two students, with different gender and qualifications
            students = []
            sample_students_payload = [
                {
                    "name": "Maria Silva",
                    "gender": "female",
                    "congregationId": congregation_id,
                    "qualifications": ["QualifiedSpeaker"]
                },
                {
                    "name": "Joao Pereira",
                    "gender": "male",
                    "congregationId": congregation_id,
                    "qualifications": ["QualifiedReader"]
                }
            ]
            for student_data in sample_students_payload:
                resp = session.post(f"{BASE_URL}/students", json=student_data, timeout=TIMEOUT)
                assert resp.status_code == 201, f"Failed to create student: {resp.text}"
                created_student_ids.append(resp.json()['id'])
            students_resp = session.get(f"{BASE_URL}/students?congregationId={congregation_id}", timeout=TIMEOUT)
            assert students_resp.status_code == 200, f"Failed to fetch students after creation: {students_resp.text}"
            students = students_resp.json()

        # 4. Trigger automatic assignment generation for this congregation
        #    Endpoint and payload assumed based on PRD mentioning "geração automática de designações"
        generation_url = f"{BASE_URL}/assignments/generate"
        generation_payload = {
            "congregationId": congregation_id,
            "ruleset": "S-38-T"
        }

        generation_resp = session.post(generation_url, json=generation_payload, timeout=TIMEOUT)
        assert generation_resp.status_code == 200, f"Assignment generation failed: {generation_resp.text}"
        generation_result = generation_resp.json()

        # Validate response structure and content
        assert 'assignments' in generation_result, "No assignments key in response"
        assignments = generation_result['assignments']
        assert isinstance(assignments, list) and len(assignments) > 0, "No assignments generated"

        # 5. Validate that assignments adhere to S-38 rules - gender restrictions and qualification validations
        students_map = {s['id']: s for s in students}

        # For this test, assume each assignment includes:
        # { "studentId": "...", "assignmentType": "...", "requiredQualification": "...", "genderRestriction": "male"|"female"|None }
        for assignment in assignments:
            student_id = assignment.get("studentId")
            assignment_type = assignment.get("assignmentType")
            required_qualification = assignment.get("requiredQualification")
            gender_restriction = assignment.get("genderRestriction")  # Can be None if no restriction

            assert student_id in students_map, f"Assignment references unknown student id {student_id}"
            student = students_map[student_id]

            # Check qualification
            student_quals = student.get("qualifications", [])
            assert required_qualification in student_quals, (
                f"Student {student['name']} missing required qualification "
                f"'{required_qualification}' for assignment type '{assignment_type}'"
            )

            # Check gender restriction
            if gender_restriction is not None:
                student_gender = student.get("gender")
                assert student_gender == gender_restriction, (
                    f"Student {student['name']} gender '{student_gender}' does not meet gender restriction "
                    f"'{gender_restriction}' for assignment type '{assignment_type}'"
                )

    finally:
        # Cleanup any created students
        for sid in created_student_ids:
            try:
                del_resp = session.delete(f"{BASE_URL}/students/{sid}", timeout=TIMEOUT)
                assert del_resp.status_code in {200, 204}, f"Failed to delete student id {sid}"
            except Exception:
                pass


test_automatic_assignment_generation_s38_rules()