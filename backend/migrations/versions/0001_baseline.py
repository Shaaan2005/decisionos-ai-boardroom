"""Create the initial DecisionOS schema."""
from alembic import op

from app.database.base import Base
import app.models.user
import app.models.decision
import app.models.report

revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(op.get_bind())
