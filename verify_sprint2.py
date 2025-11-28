import urllib.request
import json
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def post_request(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8')), response.getcode()
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        return None, e.code
    except Exception as e:
        print(f"Error: {e}")
        return None, 0

def run_tests():
    print("Waiting for backend to start...")
    # Simple retry loop to wait for backend
    for i in range(10):
        try:
            with urllib.request.urlopen(f"{BASE_URL}/healthz") as response:
                if response.getcode() == 200:
                    print("Backend is up!")
                    break
        except:
            time.sleep(1)
            print(".", end="", flush=True)
    else:
        print("\nBackend not reachable. Please start the backend with `uvicorn backend.main:app --reload`.")
        return

    print("\n--- 1. Start Diagnostic Session ---")
    start_payload = {
        "name": "Test User",
        "email": "test@example.com",
        "company_size": "15-35"
    }
    start_resp, status = post_request("/diagnostic/start", start_payload)
    if not start_resp:
        print("Failed to start session")
        return
    
    session_id = start_resp['session_id']
    print(f"Session Started: {session_id}")

    print("\n--- 2. Test Email Trigger (Complete Diagnostic) ---")
    complete_payload = {
        "answers": [
            {"question_id": "q1", "response": "answer1"},
            {"question_id": "q2", "response": "answer2"}
        ],
        "email": "test@example.com"
    }
    complete_resp, status = post_request(f"/diagnostic/{session_id}/complete", complete_payload)
    if status == 200:
        print("Diagnostic Completed Successfully.")
        print("Response:", complete_resp)
        print("CHECK BACKEND LOGS FOR 'MOCK EMAIL TO test@example.com'")
    else:
        print(f"Failed to complete diagnostic. Status: {status}")

    print("\n--- 3. Test Tracking Endpoint ---")
    tracking_payload = {
        "session_id": session_id,
        "event_type": "cta_click",
        "metadata": {"label": "test_button"},
        "timestamp": "2023-10-27T10:00:00Z"
    }
    track_resp, track_status = post_request("/tracking/event", tracking_payload)
    if track_status == 201:
        print("Tracking Event Recorded Successfully.")
        print("Response:", track_resp)
    else:
        print(f"Failed to track event. Status: {track_status}")

if __name__ == "__main__":
    run_tests()