import os
import uuid # For generating unique IDs
from datetime import date, datetime # For handling dates
from typing import List, Optional # For type hinting

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Import CORS
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Langchain Imports
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.documents import Document # Added Document import
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma # Added Chroma import
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain

# Load environment variables (for GOOGLE_API_KEY)
load_dotenv()

# --- Configuration ---
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please create a .env file.")

DATA_PATH = "../FirstDataandInfo.md" # Relative to backend/main.py

# --- FastAPI App Setup ---
app = FastAPI(title="Rocky Rehab AI Assistant Backend") # Removed - Serverless suffix

# --- CORS Middleware ---
# Adjust origins based on your deployment targets
origins = [
    "http://localhost:3000",      # Local Next.js dev
    "http://127.0.0.1:3000",
    # Add Vercel deployment URL(s) later
    # e.g., "https://rocky-frontend-*.vercel.app", "https://your-prod-domain.com"
    # Add Render backend URL if needed for direct access (usually not needed if frontend proxies)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RAG Pipeline Setup (Modified for Direct Markdown Reading) ---
def setup_rag_pipeline():
    try:
        # 1. Load Document Content Directly
        script_dir = os.path.dirname(os.path.abspath(__file__))
        absolute_data_path = os.path.normpath(os.path.join(script_dir, DATA_PATH)) # Use normpath for safety
        print(f"Reading document content from: {absolute_data_path}")
        if not os.path.exists(absolute_data_path):
            raise FileNotFoundError(f"Initial resource file not found at resolved path: {absolute_data_path}")
        
        with open(absolute_data_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
            
        if not markdown_content:
             raise ValueError(f"No content found in {absolute_data_path}.")
             
        # Wrap content in Langchain Document object
        docs = [Document(page_content=markdown_content, metadata={"source": DATA_PATH})]
        print(f"Document content loaded successfully. Characters: {len(markdown_content)}")

        # 2. Split Document (remains same, now operates on the single Document)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        splits = text_splitter.split_documents(docs)
        if not splits:
            raise ValueError("Document splitting resulted in zero chunks.")
        print(f"Document split into {len(splits)} chunks.")

        # 3. Define Embedding Function (remains same)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)
        print("Embeddings function defined.")

        # 4. Create Chroma Vector Store (remains same)
        print("Creating Chroma vector store (in-memory)...")
        vectorstore = Chroma.from_documents(
            documents=splits, 
            embedding=embeddings,
            collection_metadata={"hnsw:space": "cosine"}
        )
        print("Chroma vector store created.")

        # 5. Create Retriever (remains same)
        retriever = vectorstore.as_retriever(search_kwargs={'k': 5})
        print("Retriever created.")

        # 6. Setup LLM (remains same)
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest", google_api_key=google_api_key, temperature=0.7)
        print("Gemini chat model initialized.")

        # 7. Create Prompt Template (remains same)
        prompt = ChatPromptTemplate.from_template("""
        You are a knowledgeable and empathetic AI assistant for rehabilitation, specifically focused on helping a user recover from a C4/C5 nerve injury affecting their bicep.
        Use the following retrieved context to answer the user's question. Synthesize the information and provide a helpful, supportive, and clear response.
        If the context doesn't contain the answer, use your general knowledge about rehabilitation, neurology, and related medical fields, but clearly state that the specific information wasn't found in the provided documents.
        Always prioritize safety and advise consulting with healthcare professionals for medical decisions.
        Be encouraging and motivating.

        Context:
        {context}

        Question: {input}

        Helpful Answer:"""
        )
        print("Prompt template created.")

        # 8. Create Chains (remains same)
        document_chain = create_stuff_documents_chain(llm, prompt)
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        print("RAG retrieval chain created successfully.")
        return retrieval_chain

    except Exception as e:
        print(f"Error during RAG pipeline setup: {e}")
        raise RuntimeError(f"Failed to initialize RAG pipeline: {e}")

rag_chain = setup_rag_pipeline()

# --- Data Models for Rehab Plan & Progress --- NEW SECTION

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    instructions: Optional[str] = None # E.g., how to perform, safety notes

class RehabPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Initial Bicep Recovery Plan"
    start_date: date = Field(default_factory=date.today)
    goal: Optional[str] = "Improve bicep activation and range of motion."
    exercises: List[Exercise] = []

class ProgressEntryBase(BaseModel):
    # Base model for creation, ID and date added later
    exercise_id: str
    completed_sets: Optional[int] = None
    completed_reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    pain_level: Optional[int] = Field(None, ge=0, le=10) # 0=no pain, 10=max pain
    difficulty_level: Optional[int] = Field(None, ge=0, le=10) # 0=very easy, 10=very hard
    notes: Optional[str] = None

class ProgressEntry(ProgressEntryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=datetime.now)

# --- NEW Resource Model ---
class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str # Store full markdown content for now
    type: str = "document" # e.g., document, link, video
    source_url: Optional[str] = None
    added_date: datetime = Field(default_factory=datetime.now)

# --- In-Memory Storage --- NEW SECTION (Replace with DB later)

# Start with a simple mock plan
mock_exercises = [
    Exercise(name="Passive Elbow Flexion", description="Gently bend elbow with assistance from other arm or therapist.", sets=3, reps=10, instructions="Move slowly within pain-free range."),
    Exercise(name="Isometric Bicep Contraction", description="Attempt to flex bicep against an immovable object (like a table or wall) without moving the elbow.", sets=3, duration_seconds=5, instructions="Hold contraction gently for 5 seconds, relax. Don't push into pain."),
    Exercise(name="Assisted Active Elbow Flexion (Gravity Eliminated)", description="Lying on your side, slide forearm towards shoulder.", sets=3, reps=10, instructions="Focus on feeling the bicep engage, even slightly.")
]
current_rehab_plan = RehabPlan(exercises=mock_exercises)

progress_log: List[ProgressEntry] = [] # Empty log initially

# --- NEW Resources List & Loading ---
resources_store: List[Resource] = []

def load_initial_resources():
    """Loads the initial markdown file into the resources store."""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        absolute_data_path = os.path.normpath(os.path.join(script_dir, DATA_PATH))
        print(f"Loading initial resource content from: {absolute_data_path}")
        if not os.path.exists(absolute_data_path):
             print(f"Warning: Initial resource file {absolute_data_path} not found. Skipping.")
             return
             
        with open(absolute_data_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if content:
            initial_resource = Resource(
                title="Initial Research: Restoring Bicep Function",
                content=content,
                source_url=None, 
                type="research_summary"
            )
            resources_store.append(initial_resource)
            print(f"Successfully loaded initial resource: {initial_resource.title}")
        else:
            print(f"Warning: Initial resource file {absolute_data_path} is empty.")
    except Exception as e:
        print(f"Error loading initial resource content: {e}")

load_initial_resources()

# --- API Endpoints ---
class ChatMessage(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Rocky Rehab Backend (Render) is running!"}

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    if not rag_chain:
         raise HTTPException(status_code=500, detail="RAG pipeline not initialized.")
    try:
        print(f"Received message: {chat_message.message}")
        response = await rag_chain.ainvoke({"input": chat_message.message})
        print(f"Generated response: {response['answer']}")
        return {"sender": "ai", "text": response['answer']}
    except Exception as e:
        print(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {e}")

# --- NEW Rehab & Progress Endpoints ---

@app.get("/api/rehab-plan", response_model=RehabPlan)
async def get_rehab_plan():
    """Returns the current rehabilitation plan."""
    # In the future, this could fetch a specific plan based on user ID, etc.
    if not current_rehab_plan:
        raise HTTPException(status_code=404, detail="Rehabilitation plan not found.")
    return current_rehab_plan

@app.get("/api/progress", response_model=List[ProgressEntry])
async def get_progress_log():
    """Returns all recorded progress entries."""
    # In the future, add filtering by date, exercise, etc.
    return progress_log

@app.post("/api/progress", response_model=ProgressEntry, status_code=201)
async def add_progress_entry(entry_data: ProgressEntryBase):
    """Adds a new progress entry to the log."""
    # Simple validation: Check if exercise ID exists in the current plan
    exercise_exists = any(ex.id == entry_data.exercise_id for ex in current_rehab_plan.exercises)
    if not exercise_exists:
        raise HTTPException(status_code=400, detail=f"Exercise with ID {entry_data.exercise_id} not found in current plan.")

    new_entry = ProgressEntry(**entry_data.dict())
    progress_log.append(new_entry)
    print(f"Added progress entry: {new_entry.id} for exercise {new_entry.exercise_id}")
    # TODO: Persist to database later
    return new_entry

# --- NEW Resource Endpoint ---
@app.get("/api/resources", response_model=List[Resource])
async def get_resources():
    """Returns the list of available resources."""
    return resources_store

# --- Optional: Add POST/PUT/DELETE for resources later ---

# Add back uvicorn run command for local testing (Render uses Dockerfile)
if __name__ == "__main__":
    import uvicorn
    # Run on 0.0.0.0 to be accessible within Docker/Render network
    uvicorn.run(app, host="0.0.0.0", port=8000) 
