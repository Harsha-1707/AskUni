import gradio as gr
import yaml
from main import CollegeChatbot

# Load Config
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Initialize Backend
bot = CollegeChatbot()

def chat_function(message, history):
    # History in Gradio is list of lists [[user, bot], ...]
    # We might need to rebuild context if we want robust multi-turn
    # For now, we let the backend manage internal ephemeral context 
    # or just rely on the immediate previous turns if we passed them.
    
    result = bot.process_query(message)
    response_text = result["response"]
    
    # Append sources if available and not already in text
    if result["retrieved_docs"] and "Retrieval" in result["source"]:
        response_text += "\n\n**Sources:**\n"
        for doc in result["retrieved_docs"]:
            source_name = doc['metadata'].get('source', 'Unknown')
            response_text += f"- {source_name} (Score: {doc['score']:.2f})\n"
            
    return response_text

def ui_setup():
    theme = gr.themes.Soft(primary_hue="blue", neutral_hue="slate")
    
    with gr.Blocks(theme=theme, title=config["ui"]["title"]) as demo:
        gr.Markdown(f"# 🎓 {config['ui']['title']}")
        gr.Markdown("Ask me about admissions, courses, fees, and campus life.")
        
        with gr.Row():
            with gr.Column(scale=4):
                chatbot = gr.ChatInterface(
                    fn=chat_function,
                    chatbot=gr.Chatbot(height=600),
                    textbox=gr.Textbox(placeholder="Ask a question...", container=False, scale=7),
                    examples=["What are the B.Tech fees?", "How do I apply?", "Is there a hostel facility?", "Tell me about the faculty."],
                )
            
            with gr.Column(scale=1):
                gr.Markdown("### 🛠️ System Status")
                llm_status = "🟢 Active" if bot.llm.is_active() else "🔴 Inactive (Retrieval Mode)"
                gr.Label(value=llm_status, label="Local LLM")
                
                gr.Markdown("### 📄 Setup")
                ingest_btn = gr.Button("🔄 Re-ingest Data")
                ingest_out = gr.Textbox(label="Ingestion Status", interactive=False)
                
                def run_ingest():
                    from rag.ingest import Ingestor
                    try:
                        ingestor = Ingestor()
                        ingestor.process_and_index()
                        # Reload retriever
                        bot.retriever._load_index()
                        return "Ingestion Complete & Index Reloaded!"
                    except Exception as e:
                        return f"Error: {e}"

                ingest_btn.click(run_ingest, outputs=[ingest_out])

    return demo

if __name__ == "__main__":
    app = ui_setup()
    app.launch(server_name="0.0.0.0", server_port=7860, share=True)
