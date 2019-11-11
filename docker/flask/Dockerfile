FROM python:3.7.3-stretch
WORKDIR /app
RUN https://github.com/HuiiBuh/spotify-playlist-colloboration.git /app
RUN pip install -r ./requirements.txt
COPY app.ini /app
RUN rm -r /app/server/static
RUN flask db init
RUN flask db migrate
RUN flask db upgrade
RUN python3 /app/src/create_default_user.py
CMD ["uwsgi","app.ini"]