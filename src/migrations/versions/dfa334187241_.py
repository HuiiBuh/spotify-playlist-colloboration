"""empty message

Revision ID: dfa334187241
Revises: c4175cf399cc
Create Date: 2020-01-10 12:17:29.781150

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'dfa334187241'
down_revision = 'c4175cf399cc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('spotify_user_ibfk_1', 'spotify_user', type_='foreignkey')
    op.drop_column('spotify_user', 'queue_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('spotify_user', sa.Column('queue_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))
    op.create_foreign_key('spotify_user_ibfk_1', 'spotify_user', 'queue', ['queue_id'], ['id'])
    # ### end Alembic commands ###
