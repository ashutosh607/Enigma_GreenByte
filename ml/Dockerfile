FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml requirements.lock ./
COPY ps5 ./ps5
RUN pip install --no-cache-dir -r requirements.lock && pip install --no-deps .
COPY data ./data
RUN mkdir /app/var && useradd --uid 10001 --create-home appuser && chown appuser:appuser /app/var
USER appuser
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "ps5.api:app", "--host", "0.0.0.0", "--port", "8000"]
