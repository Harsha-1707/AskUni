import os
import glob
from typing import List, Dict
import yaml

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import pypdf
import docx

class Ingestor:
    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
        
        self.chunk_size = self.config["rag"]["chunk_size"]
        self.chunk_overlap = self.config["rag"]["chunk_overlap"]
        self.model_name = self.config["rag"]["embedding_model"]
        self.vector_store_path = self.config["paths"]["vector_store"]
        
        print(f"Loading embedding model: {self.model_name}...")
        self.model = SentenceTransformer(self.model_name)
        
    def load_documents(self) -> List[Dict]:
        """
        Loads document from data/raw.
        Returns a list of dicts: {'content': str, 'metadata': dict}
        """
        raw_path = self.config["paths"]["data_raw"]
        documents = []
        
        # 1. TXT files
        for file_path in glob.glob(os.path.join(raw_path, "**", "*.txt"), recursive=True):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                documents.append({
                    "content": content,
                    "metadata": {"source": os.path.basename(file_path), "type": "txt"}
                })
        
        # 2. PDF files (Placeholder for pypdf logic)
        # 2. PDF files
        for file_path in glob.glob(os.path.join(raw_path, "**", "*.pdf"), recursive=True):
            try:
                content = self._read_pdf(file_path)
                if content.strip():
                    documents.append({
                        "content": content,
                        "metadata": {"source": os.path.basename(file_path), "type": "pdf"}
                    })
            except Exception as e:
                print(f"Error reading PDF {file_path}: {e}")

        # 3. DOCX files
        for file_path in glob.glob(os.path.join(raw_path, "**", "*.docx"), recursive=True):
            try:
                content = self._read_docx(file_path)
                if content.strip():
                    documents.append({
                        "content": content,
                        "metadata": {"source": os.path.basename(file_path), "type": "docx"}
                    })
            except Exception as e:
                print(f"Error reading DOCX {file_path}: {e}")

        print(f"Loaded {len(documents)} documents.")
        return documents

    def _read_pdf(self, file_path: str) -> str:
        text = ""
        with open(file_path, 'rb') as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text

    def _read_docx(self, file_path: str) -> str:
        doc = docx.Document(file_path)
        text = []
        for para in doc.paragraphs:
            text.append(para.text)
        return "\n".join(text)

    def chunk_text(self, text: str) -> List[str]:
        """
        Splits text into chunks with overlap.
        """
        tokens = text.split() # Naive whitespace tokenization for speed
        chunks = []
        for i in range(0, len(tokens), self.chunk_size - self.chunk_overlap):
            chunk = " ".join(tokens[i : i + self.chunk_size])
            chunks.append(chunk)
        return chunks

    def process_and_index(self):
        """
        Main workflow: Load -> Chunk -> Embed -> Index -> Save
        """
        documents = self.load_documents()
        all_chunks = []
        all_metadata = []

        for doc in documents:
            chunks = self.chunk_text(doc["content"])
            for chunk in chunks:
                all_chunks.append(chunk)
                all_metadata.append(doc["metadata"])
        
        if not all_chunks:
            print("No documents found to process.")
            return

        print(f"Generated {len(all_chunks)} chunks. Embedding...")
        embeddings = self.model.encode(all_chunks, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')

        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension) # Cosine similarity = Inner Product with normalized vectors
        faiss.normalize_L2(embeddings)
        index.add(embeddings)

        # Save index and metadata
        os.makedirs(self.vector_store_path, exist_ok=True)
        faiss.write_index(index, os.path.join(self.vector_store_path, "index.faiss"))
        
        with open(os.path.join(self.vector_store_path, "chunks.pkl"), "wb") as f:
            pickle.dump((all_chunks, all_metadata), f)
            
        print(f"Index saved to {self.vector_store_path}")

if __name__ == "__main__":
    ingestor = Ingestor()
    ingestor.process_and_index()
