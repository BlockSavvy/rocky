# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies that might be needed by libraries like chromadb or others
# (e.g., build-essential for C extensions, sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    # Add other system deps if needed later based on build errors
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable for the port (Render uses this)
ENV PORT=8000
# Allow FastAPI/Uvicorn to accept connections from outside the container
ENV HOST=0.0.0.0

# Run main.py when the container launches using Uvicorn
# Use the PORT environment variable provided by Render (or the default)
CMD ["uvicorn", "main:app", "--host", "$HOST", "--port", "$PORT"] 