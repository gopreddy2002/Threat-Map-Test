FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
RUN git clone --depth 1 https://github.com/smicallef/spiderfoot.git
WORKDIR /opt/spiderfoot
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5001
CMD ["python", "sf.py", "-l", "0.0.0.0:5001"]
