echo "Init" /dev/stdout
flask db init
echo "Migrate" /dev/stdout
flask db migrate
echo "Upgrade" /dev/stdout
flask db upgrade

echo "Create user" /dev/stdout
python3 create_default_user.py

echo "Start" /dev/stdout
uwsgi app.ini