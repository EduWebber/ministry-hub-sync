import requests
import uuid

BASE_URL = "http://localhost:3000"
HEADERS = {
    "Content-Type": "application/json",
    # Add Authentication header if required, e.g. "Authorization": "Bearer <token>"
}

timeout = 30


def test_family_member_management_and_relationships():
    created_member_ids = []

    def create_family_member(payload):
        resp = requests.post(
            f"{BASE_URL}/family-members",
            json=payload,
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def get_family_member(member_id):
        resp = requests.get(
            f"{BASE_URL}/family-members/{member_id}",
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def update_family_member(member_id, payload):
        resp = requests.put(
            f"{BASE_URL}/family-members/{member_id}",
            json=payload,
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def delete_family_member(member_id):
        resp = requests.delete(
            f"{BASE_URL}/family-members/{member_id}",
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def create_relationship(member_id, related_member_id, relationship_type):
        payload = {
            "related_member_id": related_member_id,
            "relationship_type": relationship_type,
        }
        resp = requests.post(
            f"{BASE_URL}/family-members/{member_id}/relationships",
            json=payload,
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def get_relationships(member_id):
        resp = requests.get(
            f"{BASE_URL}/family-members/{member_id}/relationships",
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    def delete_relationship(member_id, relationship_id):
        resp = requests.delete(
            f"{BASE_URL}/family-members/{member_id}/relationships/{relationship_id}",
            headers=HEADERS,
            timeout=timeout,
        )
        return resp

    # Step 1: Create two family members
    member1_payload = {
        "first_name": "Alice",
        "last_name": "Johnson",
        "birth_date": "1980-01-01",
        "email": f"alice.{uuid.uuid4().hex[:6]}@example.com",
    }
    member2_payload = {
        "first_name": "Bob",
        "last_name": "Johnson",
        "birth_date": "1982-02-02",
        "email": f"bob.{uuid.uuid4().hex[:6]}@example.com",
    }

    try:
        resp1 = create_family_member(member1_payload)
        assert resp1.status_code == 201, f"Failed to create member1: {resp1.text}"
        member1 = resp1.json()
        member1_id = member1["id"]
        created_member_ids.append(member1_id)

        resp2 = create_family_member(member2_payload)
        assert resp2.status_code == 201, f"Failed to create member2: {resp2.text}"
        member2 = resp2.json()
        member2_id = member2["id"]
        created_member_ids.append(member2_id)

        # Step 2: Retrieve first member and validate data
        resp = get_family_member(member1_id)
        assert resp.status_code == 200, f"Failed to get member1: {resp.text}"
        data = resp.json()
        assert data["first_name"] == member1_payload["first_name"]
        assert data["last_name"] == member1_payload["last_name"]
        assert data["email"] == member1_payload["email"]

        # Step 3: Update member1's last name
        updated_payload = {
            "last_name": "Smith"
        }
        resp = update_family_member(member1_id, updated_payload)
        assert resp.status_code == 200, f"Failed to update member1: {resp.text}"
        updated_member = resp.json()
        assert updated_member["last_name"] == "Smith"

        # Step 4: Create relationship: member1 is spouse of member2
        resp = create_relationship(member1_id, member2_id, "spouse")
        assert resp.status_code == 201, f"Failed to create relationship: {resp.text}"
        relationship = resp.json()
        relationship_id = relationship["id"]

        # Step 5: Validate relationship retrieval from member1
        resp = get_relationships(member1_id)
        assert resp.status_code == 200, f"Failed to get relationships: {resp.text}"
        relationships = resp.json()
        assert any(rel["id"] == relationship_id and rel["related_member_id"] == member2_id and rel["relationship_type"] == "spouse" for rel in relationships)

        # Step 6: Delete relationship
        resp = delete_relationship(member1_id, relationship_id)
        assert resp.status_code in (200, 204), f"Failed to delete relationship: {resp.text}"

        # Verify deletion
        resp = get_relationships(member1_id)
        assert resp.status_code == 200, f"Failed to get relationships after deletion: {resp.text}"
        relationships = resp.json()
        assert all(rel["id"] != relationship_id for rel in relationships)

    finally:
        # Cleanup created family members
        for member_id in created_member_ids:
            try:
                resp = delete_family_member(member_id)
                assert resp.status_code in (200, 204), f"Failed to delete member {member_id}: {resp.text}"
            except Exception:
                pass


test_family_member_management_and_relationships()