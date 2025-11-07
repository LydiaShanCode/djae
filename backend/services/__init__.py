"""
Services package for external API integrations and business logic.
"""

from .spotify import get_access_token

__all__ = ["get_access_token"]