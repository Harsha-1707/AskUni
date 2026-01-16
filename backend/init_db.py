"""
Database initialization script for Railway deployment.
Run this once after deploying to create tables and admin user.
"""
import sys
sys.path.insert(0, '/app')

from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app.models.all_models import User, ChatLog, Feedback, EvaluationMetrics
from app.models.analytics_models import SourceUsageStats, QueryAnalytics
from app.core.security import get_password_hash

def init_database():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == "admin@askuni.com").first()
        if existing:
            print("⚠️  Admin user already exists")
            return
        
        admin = User(
            email="admin@askuni.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user created!")
        print("   Email: admin@askuni.com")
        print("   Password: admin123")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    create_admin_user()
    print("\n🎉 Database initialization complete!")
