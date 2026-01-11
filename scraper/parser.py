from bs4 import BeautifulSoup
from urllib.parse import urljoin
from .utils import clean_text

class HTMLParser:
    def __init__(self):
        pass
        
    def parse(self, html_content: str, base_url: str) -> dict:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove noise
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe', 'noscript']):
            tag.decompose()
            
        # Attempt to find main content
        main_content = soup.find('main') or soup.find('article') or soup.find('div', {'id': 'content'}) or soup.body
        
        text = ""
        if main_content:
            text = main_content.get_text(separator='\n')
        else:
            text = soup.get_text(separator='\n')
            
        cleaned_text = clean_text(text)
        
        # Extract links
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(base_url, href)
            links.append(full_url)
            
        return {
            "text": cleaned_text,
            "links": links,
            "title": soup.title.string if soup.title else ""
        }
