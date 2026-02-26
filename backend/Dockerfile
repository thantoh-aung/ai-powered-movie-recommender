# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install SWI-Prolog and other dependencies required by PySWIP
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        swi-prolog \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Expose port (Render expects 8000 by default but can be configured)
EXPOSE 8000

# Run gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "movie_recommender.wsgi:application"]
