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

# ---- Debug: List files in /app ----
RUN ls -la /app
# ---- End Debug ----

# Make the entrypoint script executable (redundant if done locally, but safe)
RUN chmod +x /app/entrypoint.sh

# Expose port (informational)
EXPOSE 8000 
EXPOSE 10000

# Define HOST env var (used by entrypoint)
ENV HOST=0.0.0.0 
# Removed ENV PORT, entrypoint will use Render's $PORT

# Use the entrypoint script to start the application
ENTRYPOINT ["/app/entrypoint.sh"]

# Remove the previous CMD instruction
# CMD ["uvicorn", "main:app", "--host", "$HOST", "--port", "$PORT"] 