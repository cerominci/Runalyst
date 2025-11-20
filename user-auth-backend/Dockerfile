FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies (optional but often needed)
RUN apt-get update && apt-get install -y build-essential

# Copy requirements first for layer caching
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY . /app/

# Expose port (container internal port)
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
