# Database

## Initialise

Be aware that there should  be a _*.flaskenv_ file with `FLASK_APP=main_file.py` as contend.

To initialize the database:

```bash
flask db init
```

To migrate the database:

```bash
flask db migrate
```

To apply changes in the flask models:

```bash
flask db upgrade
```

## Create User

Go into your python3 shell with `python3` (execute in the src folder with active venv).

```python
from server import db
from server.main.modals import User

user = User(username="root", password_hash="hash")
db.session.add(user)
db.session.commit()
```

### Installation

+ `sudo apt-get install mysql-server`
+ Change preferences `sudo mysql_secure_installation utility`
+ Restart MySQL `sudo systemctl restart mysql`

### User
```
$ sudo mysql -u root # I had to use "sudo" since is new installation

mysql> USE mysql;
mysql> SELECT User, Host, plugin FROM mysql.user;

+------------------+-----------------------+
| User             | plugin                |
+------------------+-----------------------+
| root             | auth_socket           |
| mysql.sys        | mysql_native_password |
| debian-sys-maint | mysql_native_password |
+------------------+-----------------------+
```

```
mysql> UPDATE user SET plugin='mysql_native_password' WHERE User='root';
mysql> FLUSH PRIVILEGES;
mysql> exit;

$ service mysql restart
$ mysql_secure_installation
```

+ Create the database `CREATE DATABASE spotify_playlist;`

+ pip3 install mysqlclient
+ sudo apt-get install libmysqlclient-dev  
+ sudo apt-get install python3-dev


