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
from server.modals import User

user = User(username="root")
db.session.add(user)
db.session.commit()
```