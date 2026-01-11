import os
import time
import requests
from urllib.parse import urlparse
from .parser import HTMLParser
from .utils import get_category_from_url, url_to_filename

class Spider:
    def __init__(self, base_url: str, output_dir: str = "data/raw"):
        self.base_url = base_url
        self.domain = urlparse(base_url).netloc
        self.output_dir = output_dir
        self.parser = HTMLParser()
        self.visited = set()
        self.queue = [base_url]
        self.max_pages = 50 # Safety limit
        self.delay = 1.0 # Seconds
        
        # Ensure output structure
        self.slug = self.domain.replace('.', '_')
        self.base_path = os.path.join(self.output_dir, self.slug)
        
    def run(self):
        print(f"Starting crawl of {self.base_url}...")
        count = 0
        
        while self.queue and count < self.max_pages:
            url = self.queue.pop(0)
            if url in self.visited:
                continue
            
            # Simple domain check
            if urlparse(url).netloc != self.domain:
                continue
                
            self.visited.add(url)
            count += 1
            
            try:
                print(f"Fetching {url}...")
                resp = requests.get(url, headers={'User-Agent': 'CollegeBot/1.0'}, timeout=10)
                if resp.status_code != 200:
                    print(f"Failed to fetch {url}: {resp.status_code}")
                    continue
                
                # Check content type
                c_type = resp.headers.get('Content-Type', '').lower()
                
                if 'pdf' in c_type or url.lower().endswith('.pdf'):
                    self._save_pdf(url, resp.content)
                elif 'text/html' in c_type:
                    self._process_html(url, resp.text)
                
                time.sleep(self.delay)
                
            except Exception as e:
                print(f"Error processing {url}: {e}")
                
        print(f"Crawl finished. Processed {count} pages.")

    def _process_html(self, url: str, html: str):
        data = self.parser.parse(html, url)
        
        # Save text
        category = get_category_from_url(url)
        save_dir = os.path.join(self.base_path, category)
        os.makedirs(save_dir, exist_ok=True)
        
        filename = url_to_filename(url, ".txt")
        filepath = os.path.join(save_dir, filename)
        
        content = f"Source: {url}\nCategory: {category}\nTitle: {data['title']}\n\n{data['text']}"
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        # Add new links to queue
        for link in data['links']:
            # Only internal links
            if urlparse(link).netloc == self.domain and link not in self.visited:
                self.queue.append(link)

    def _save_pdf(self, url: str, content: bytes):
        category = get_category_from_url(url)
        save_dir = os.path.join(self.base_path, category)
        os.makedirs(save_dir, exist_ok=True)
        
        filename = url_to_filename(url, ".pdf")
        filepath = os.path.join(save_dir, filename)
        
        with open(filepath, "wb") as f:
            f.write(content)
        print(f"Saved PDF: {filepath}")
