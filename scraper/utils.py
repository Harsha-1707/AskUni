import re
import os
from urllib.parse import urlparse

def clean_text(text: str) -> str:
    """
    Cleans extracted text: removes multiple spaces, newlines, etc.
    """
    if not text:
        return ""
    # Normalize excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_category_from_url(url: str) -> str:
    """
    Determines category based on URL keywords.
    """
    url_lower = url.lower()
    if any(x in url_lower for x in ['admiss', 'apply', 'eligib']):
        return 'admissions'
    elif any(x in url_lower for x in ['course', 'program', 'curricu', 'syllabus']):
        return 'courses'
    elif any(x in url_lower for x in ['fee', 'scholarship', 'cost']):
        return 'fees'
    elif any(x in url_lower for x in ['exam', 'calendar', 'result']):
        return 'exams'
    elif any(x in url_lower for x in ['hostel', 'nss', 'ncc', 'sport', 'facilities', 'transport']):
        return 'hostel'
    elif any(x in url_lower for x in ['placement', 'recruit', 'career']):
        return 'placements'
    elif any(x in url_lower for x in ['policy', 'rule', 'ragging']):
        return 'policies'
    else:
        return 'misc'

def url_to_filename(url: str, ext: str = ".txt") -> str:
    """
    Converts a valid URL to a safe filename.
    """
    parsed = urlparse(url)
    path = parsed.path.strip("/").replace("/", "_")
    if not path:
        path = "index"
    
    # Remove query params for filename usually, unless important.
    # Keep it simple.
    filename = f"{path}{ext}"
    # Ensure it's safe
    filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '', filename)
    return filename
