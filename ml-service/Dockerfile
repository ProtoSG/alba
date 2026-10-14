FROM python:3.12-slim
WORKDIR /srv
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" scikit-learn xgboost joblib pandas numpy
COPY app ./app
COPY model ./model
ENV MODEL_DIR=/srv/model
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
