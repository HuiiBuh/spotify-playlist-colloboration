FROM nginx:latest

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Clone the git repo and copy the static files
RUN https://github.com/HuiiBuh/spotify-playlist-colloboration.git /tmp
RUN mkdir /static
RUN cp /tmp/spotify-playlist-colloboration/src/server/static /static
RUN rm -r /tmp/spotify-playlist-colloboration

# Copy the nginx config
COPY nginx.conf /etc/nginx/conf.d/