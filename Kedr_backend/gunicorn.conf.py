import multiprocessing

bind = "0.0.0.0:8000"
workers = 1  # Начните с 1 воркера
worker_class = "sync"
timeout = 120
graceful_timeout = 30
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

