FROM python:3.6.9-slim-buster
WORKDIR /app
ADD ../../src /app
RUN pip install -r ./requirements.txt
CMD ["uwsgi","app.ini"]