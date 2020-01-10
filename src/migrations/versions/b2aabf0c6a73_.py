"""empty message

Revision ID: b2aabf0c6a73
Revises: 7745d9c83ca4
Create Date: 2020-01-10 11:51:08.909915

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'b2aabf0c6a73'
down_revision = '7745d9c83ca4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('queue', sa.Column('current_song', sa.Text(), nullable=True))
    op.drop_column('spotify_user', 'playback_info')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('spotify_user', sa.Column('playback_info', mysql.TEXT(), nullable=True))
    op.drop_column('queue', 'current_song')
    # ### end Alembic commands ###
