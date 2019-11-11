FROM nginx:mainline-alpine

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Install git
RUN apk add git

# Clone the git repo and copy the static files
RUN git clone https://github.com/HuiiBuh/spotify-playlist-colloboration.git /tmp/spotify-playlist-colloboration
RUN mkdir /static

RUN mv /tmp/spotify-playlist-colloboration/src/server/static /static
RUN rm -r tmp/spotify-playlist-colloboration

# Copy the nginx config
COPY nginx.conf /etc/nginx/conf.d/