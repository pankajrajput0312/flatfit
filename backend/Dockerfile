# ==============================================================================
# STAGE 1: COMPILATION BUILDER
# ==============================================================================
FROM python:3.11-slim AS builder

# Prevent Python from writing .pyc files and force unbuffered standard output/error
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /build

# Install basic system layer tools required to compile specific C-bindings (e.g., argon2-cffi)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest and build isolated wheels to avoid cross-contamination
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt


# ==============================================================================
# STAGE 2: LEAN RUNTIME RUNNER
# ==============================================================================
FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH=/home/flatfituser/.local/bin:$PATH

WORKDIR /app

# Create a secure dedicated unprivileged system group and user
RUN groupadd -g 10001 flatfitgroup && \
    useradd -u 10001 -g flatfitgroup -m -s /bin/bash flatfituser

# Extract pre-compiled python package structures cleanly from the builder layer
COPY --from=builder /root/.local /home/flatfituser/.local
COPY --from=builder /build /app

# Copy application source files and transfer asset directory ownership
COPY . /app
RUN chown -R flatfituser:flatfitgroup /app

# Drop root execution capabilities completely
USER flatfituser

# Expose FastAPI's primary interface listening boundary
EXPOSE 8000

# Fire up Uvicorn bound to all interfaces inside the container networking bridge
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]