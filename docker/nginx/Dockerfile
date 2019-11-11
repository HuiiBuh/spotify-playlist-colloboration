FROM nginx:latest
RUN rm /etc/nginx/conf.d/default.conf
RUN https://github.com/HuiiBuh/spotify-playlist-colloboration.git /tmp
RUN mkdir /static
RUN cp /tmp/spotify-playlist-colloboration/src/server/static /static

COPY nginx.conf /etc/nginx/conf.d/