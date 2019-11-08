FROM python:3.7.3-stretch
WORKDIR /app
COPY ./src/ /app
COPY app.ini /app
# flask db init
# flask db migrate
# flask db upgrade
# python3 edit_database.py
RUN pip install -r ./requirements.txt
CMD ["uwsgi","app.ini"]