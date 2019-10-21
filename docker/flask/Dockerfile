FROM python:3.7.3-stretch
WORKDIR /app
ADD ./src /app
COPY app.ini /app
RUN pip install -r ./requirements.txt
CMD ["uwsgi","app.ini"]