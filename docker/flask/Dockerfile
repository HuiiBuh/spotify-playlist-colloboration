FROM python:3.7.3-stretch

WORKDIR /app
RUN pip install --upgrade pip

# Clone the github repo
RUN git clone https://github.com/HuiiBuh/spotify-playlist-colloboration.git /app

#TODO remove later
RUN git checkout dev

# Remove the static files
RUN rm -r /app/src/server/static
# Install the requirements
RUN pip install -r ./src/requirements.txt
# Copy the wsgi ini file
COPY app.ini /app/src

WORKDIR /app/src
RUN cd /app/src

# Server the application
RUN  chmod +x start.sh
CMD ./start.sh