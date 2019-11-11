FROM python:3.7.3-stretch

WORKDIR /app
# Clone the github repo
RUN git clone https://github.com/HuiiBuh/spotify-playlist-colloboration.git /app

#TODO remove later
RUN git checkout dev


# Remove the static files
RUN rm -r /app/src/server/static
# Install the requirements
RUN pip install -r ./src/requirements.txt
# Copy the wsgi ini file
COPY app.ini /app

WORKDIR /app/src
RUN cd /app/src

# Init the db
RUN flask db init
RUN flask db migrate
RUN flask db upgrade
# Create a user
RUN python3 /app/src/create_default_user.py

# Server the application
CMD ["uwsgi","app.ini"]