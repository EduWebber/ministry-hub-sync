import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Example user credentials for authentication (should be valid for the system)
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "SecurePassword123!"

def authenticate():
    url = f"{BASE_URL}/auth/v1/token"
    payload = {
        "grant_type": "password",
        "email": AUTH_EMAIL,
        "password": AUTH_PASSWORD
    }
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert "access_token" in data, "Authentication failed: no access token returned"
    return data["access_token"]

def create_test_resource(token):
    # Create a small test assignment/designation resource to test offline sync
    url = f"{BASE_URL}/assignments"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    assignment_data = {
        "student_id": "offline-test-student-id",
        "program_id": "offline-test-program-id",
        "function": "reader",
        "notes": "Offline mode test assignment"
    }
    resp = requests.post(url, json=assignment_data, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    assignment = resp.json()
    assert "id" in assignment, "Created assignment has no ID"
    return assignment["id"]

def delete_test_resource(token, resource_id):
    url = f"{BASE_URL}/assignments/{resource_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    if resp.status_code not in (200, 204):
        raise Exception(f"Failed to delete test resource {resource_id}, status {resp.status_code}")

def test_offline_mode_data_access_and_synchronization():
    # Step 1: Authenticate and get token
    token = authenticate()

    # Step 2: Create a resource to work with
    resource_id = None
    try:
        resource_id = create_test_resource(token)

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 3: Access the resource online to cache it locally (simulate client caching)
        resp = requests.get(f"{BASE_URL}/assignments/{resource_id}", headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        cached_data = resp.json()

        # Step 4: Simulate offline access by skipping network access:
        # We assume cached_data is the local cache representation accessible offline
        assert cached_data["id"] == resource_id, "Cached resource ID mismatch"
        assert cached_data["notes"] == "Offline mode test assignment", "Cached resource content mismatch"

        # Step 5: Simulate change made while offline (modify cache)
        offline_updated_data = cached_data.copy()
        offline_updated_data["notes"] = "Offline updated notes"

        # Step 6: Simulate reconnection and synchronization:
        # Send update to backend after offline edits are made locally
        update_payload = {"notes": offline_updated_data["notes"]}
        resp_sync = requests.put(f"{BASE_URL}/assignments/{resource_id}", json=update_payload, headers=headers, timeout=TIMEOUT)
        resp_sync.raise_for_status()
        updated_resource = resp_sync.json()

        assert updated_resource["notes"] == "Offline updated notes", "Synchronization update failed"

        # Step 7: Verify backend data matches offline updated data after sync
        resp_final = requests.get(f"{BASE_URL}/assignments/{resource_id}", headers=headers, timeout=TIMEOUT)
        resp_final.raise_for_status()
        final_data = resp_final.json()

        assert final_data["notes"] == "Offline updated notes", "Backend data does not reflect synced changes"

    finally:
        if resource_id:
            delete_test_resource(token, resource_id)

test_offline_mode_data_access_and_synchronization()
