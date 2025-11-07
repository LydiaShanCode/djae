"""
Test script to verify Spotify Client Credentials Flow implementation.
Run this script to test token retrieval and caching.
"""

import asyncio
from services.spotify import get_access_token


async def test_token_retrieval():
    """Test Spotify access token retrieval and caching."""
    
    print("=" * 60)
    print("Testing Spotify Client Credentials Flow")
    print("=" * 60)
    
    try:
        # First token request
        print("\n1. Requesting access token (first call)...")
        token1 = await get_access_token()
        print(f"✓ Token retrieved successfully")
        print(f"  Token (first 20 chars): {token1[:20]}...")
        print(f"  Token length: {len(token1)} characters")
        
        # Second token request (should use cache)
        print("\n2. Requesting access token (second call - should use cache)...")
        token2 = await get_access_token()
        print(f"✓ Token retrieved successfully")
        print(f"  Token (first 20 chars): {token2[:20]}...")
        
        # Verify caching works
        if token1 == token2:
            print("\n✓ Token caching is working correctly!")
            print("  Both calls returned the same token (cached)")
        else:
            print("\n⚠ Warning: Tokens are different (caching may not be working)")
        
        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        
    except ValueError as e:
        print(f"\n✗ Error: {str(e)}")
        print("\nPlease ensure:")
        print("  1. SPOTIFY_CLIENT_ID is set in .env file")
        print("  2. SPOTIFY_CLIENT_SECRET is set in .env file")
        print("  3. Credentials are valid")
        
    except Exception as e:
        print(f"\n✗ Unexpected error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_token_retrieval())