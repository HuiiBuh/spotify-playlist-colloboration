flask db init 
flask db migrate 
flask db upgrade

python3 create_default_user.py

uwsgi app.ini