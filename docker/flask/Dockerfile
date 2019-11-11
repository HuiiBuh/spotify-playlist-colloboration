FROM python:3.7.3-stretch

WORKDIR /app
# Clone the github repo
RUN https://github.com/HuiiBuh/spotify-playlist-colloboration.git /app
# Remove the static files
RUN rm -r /app/server/static
# Install the requirements
RUN pip install -r ./src/requirements.txt
# Copy the wsgi ini file
COPY app.ini /app

# Init the db
RUN flask db init
RUN flask db migrate
RUN flask db upgrade
# Create a user
RUN python3 /app/src/create_default_user.py

# Server the application
CMD ["uwsgi","app.ini"]