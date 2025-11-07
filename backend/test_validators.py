"""
Test script for playlist URL validation.
"""
from utils.validators import extract_playlist_id


def test_extract_playlist_id():
    """Test the extract_playlist_id function with various URL formats."""
    
    print("Testing Spotify Playlist URL Validation\n")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        # Valid URLs
        {
            "url": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
            "expected_id": "37i9dQZF1DXcBWIGoYBM5M",
            "should_pass": True,
            "description": "Valid URL without query params"
        },
        {
            "url": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123",
            "expected_id": "37i9dQZF1DXcBWIGoYBM5M",
            "should_pass": True,
            "description": "Valid URL with query params"
        },
        {
            "url": "https://open.spotify.com/playlist/5ABHKGoOzxkaa28ttQV9sE?si=xyz789&utm_source=copy-link",
            "expected_id": "5ABHKGoOzxkaa28ttQV9sE",
            "should_pass": True,
            "description": "Valid URL with multiple query params"
        },
        # Invalid URLs
        {
            "url": "https://open.spotify.com/track/37i9dQZF1DXcBWIGoYBM5M",
            "expected_id": None,
            "should_pass": False,
            "description": "Invalid URL (track instead of playlist)"
        },
        {
            "url": "https://spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
            "expected_id": None,
            "should_pass": False,
            "description": "Invalid URL (missing 'open' subdomain)"
        },
        {
            "url": "http://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
            "expected_id": None,
            "should_pass": False,
            "description": "Invalid URL (http instead of https)"
        },
        {
            "url": "",
            "expected_id": None,
            "should_pass": False,
            "description": "Empty string"
        },
        {
            "url": "not a url",
            "expected_id": None,
            "should_pass": False,
            "description": "Invalid string"
        },
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test['description']}")
        print(f"URL: {test['url']}")
        
        try:
            result = extract_playlist_id(test['url'])
            
            if test['should_pass']:
                if result == test['expected_id']:
                    print(f"✅ PASS - Extracted ID: {result}")
                    passed += 1
                else:
                    print(f"❌ FAIL - Expected: {test['expected_id']}, Got: {result}")
                    failed += 1
            else:
                print(f"❌ FAIL - Should have raised ValueError but got: {result}")
                failed += 1
                
        except ValueError as e:
            if not test['should_pass']:
                print(f"✅ PASS - Correctly raised ValueError: {e}")
                passed += 1
            else:
                print(f"❌ FAIL - Unexpected ValueError: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ FAIL - Unexpected error: {type(e).__name__}: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"\nTest Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    
    if failed == 0:
        print("✅ All tests passed!")
    else:
        print(f"❌ {failed} test(s) failed")
    
    return failed == 0


if __name__ == "__main__":
    success = test_extract_playlist_id()
    exit(0 if success else 1)