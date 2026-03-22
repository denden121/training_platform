FROM python:3.12-slim

WORKDIR /app

RUN pip install uv && \
    addgroup --system app && \
    adduser --system --ingroup app app

COPY pyproject.toml .
RUN uv pip install --system -e "."

COPY . .

RUN chmod +x entrypoint.sh && chown -R app:app /app

USER app

CMD ["./entrypoint.sh"]
