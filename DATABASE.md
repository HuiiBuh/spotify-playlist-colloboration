# Create new database

Be aware that there should  be a *.flaskenv file with `FLASK_APP=main.py` as contend.

```bash
# track the changes
flask db migrate

# create the db and the new tables
tlask db upgrade
```