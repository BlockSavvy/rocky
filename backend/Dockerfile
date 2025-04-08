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

# Make port available (Render uses $PORT, but EXPOSE is documentation)
EXPOSE 8000 
# EXPOSE 10000 # Can add this too if desired, but EXPOSE is informational

# Define HOST env var
ENV HOST=0.0.0.0 
# REMOVED default PORT env var - rely on Render's provided PORT
# ENV PORT=8000

# Run main.py using the HOST and PORT environment variables
CMD ["uvicorn", "main:app", "--host", "$HOST", "--port", "$PORT"] 