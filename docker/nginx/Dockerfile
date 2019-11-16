FROM nginx:mainline-alpine

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Install git and openssl
RUN apk add git && apk add openssl

# Generate the keys
RUN mkdir /keys
RUN openssl req -newkey rsa:2048 -nodes -keyout /keys/nginx.key -x509 -days 365 -out /keys/nginx.crt \
-subj "/C=DE/ST=BW/L=Friedrichshaven/O=dhbw/OU=IT/CN=nodomain.nodomain"


# Clone the git repo and copy the static files
RUN git clone https://github.com/HuiiBuh/spotify-playlist-colloboration.git /tmp/spotify-playlist-colloboration
RUN mkdir /static

# Move the files and clean
RUN mv /tmp/spotify-playlist-colloboration/src/server/static /static
RUN mkdir /worker && mv /static/static/pwa/service_worker.js /worker
RUN rm -r tmp/spotify-playlist-colloboration

# Copy the nginx config
COPY nginx.conf /etc/nginx/conf.d/
