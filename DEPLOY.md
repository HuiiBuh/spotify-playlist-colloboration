# Deploy the server

## Install these packages
+ python3
+ pip3
+ python3-pip 
+ python3-dev 
+ nginx

## Install the requirements.txt

```bash
# Install the virtualenv package
pip3 install virtualenv

# Create a new virtualenv
virtualenv --no-site-packages venv

# Activate the venv
source ./venv/bin/activate

# Install the requierements.txt
pip3 install -r requirements.txt
```

## Test the wsgi 
```bash
# Open port 5000
sudo ufw allow 5000

# Start the wsgi
uwsgi --socket 0.0.0.0:5000 --protocol=http -w wsgi:app

# Visit localhost:5000 to test if the application gets served
``` 

## Create a systemd Unit File

Create a service unit `sudo nano /etc/systemd/system/server.service`  
Contend of the *server.service*:

```bash
[Unit]
Description=uWSGI instance to serve server
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=/home/$USER/spotify-playlist-colloboration/src
Environment="PATH=/home/$USER/spotify-playlist-colloboration/venv/bin"
ExecStart=/home/$USER/spotify-playlist-colloboration/bin/uwsgi --ini server.ini

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl start server
sudo systemctl enable server
```

## Configuring Nginx to Proxy Requests
Edit the `sudo nano /etc/nginx/sites-available/server`
Contend of the *server* file:
```bash
server {
    listen 80;
    server_name 127.0.0.1;

    location / {
        include uwsgi_params;
        uwsgi_pass unix:/home/$USER/spotify-playlist-colloboration/src/server/server.sock;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/server /etc/nginx/sites-enabled
```

After that test for errors with `sudo nginx -t`

If it works without a problem restart nginx with `sudo systemctl restart nginx`

```bash
# Close the open port created earlier
sudo ufw delete allow 5000
# Allow Nginx 
sudo ufw allow 'Nginx Full'
```