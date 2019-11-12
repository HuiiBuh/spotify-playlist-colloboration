# Installation with docker

+ Replace the key_template file with the key_template_production file in the spotify module and insert your app data.
+ 


## MySQL:

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


