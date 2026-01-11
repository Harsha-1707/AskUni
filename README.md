# College Information Chatbot

A local-first, privacy-focused chatbot that answers questions about college admissions, courses, fees, and rules using **CAG (Context-Aware Generation)** and **RAG (Retrieval-Augmented Generation)**.

Optimized for Apple Silicon (Mac M-series).

## Features

- **Local Execution**: No data leaves your machine.
- **RAG + CAG Hybrid**: Combines vector retrieval with conversation history and intent detection.
- **Hallucination Safe**: Strict rules to only answer from provided data.
- **Gradio UI**: Simple, user-friendly chat interface.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements.txt
   ```
   > **Windows Users**: You may need "Visual Studio Build Tools" (C++ workload) to install `llama-cpp-python` and `faiss-cpu`.
   > Creating a conda environment is recommended: `conda install -c pytorch faiss-cpu`

2. **Configuration**:
   - Check `config.yaml` to switch between `mistral` (Cloud) and `local` (TinyLlama).
   - **For Mistral**: Set `export MISTRAL_API_KEY=your_key` (Mac/Linux) or `set MISTRAL_API_KEY=your_key` (Windows).
   - **For Local**: Ensure the model GGUF is in `models/`.

3. **Data Ingestion**:
   - Place PDFs/TXTS in `data/raw/`
   - Run `python main.py --ingest` (To be implemented)

4. **Run Chatbot**:
   ```bash
   python main.py
   ```

## Architecture

- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Store**: FAISS
- **LLM**: TinyLlama (via `llama-cpp-python` or `mlx`)
