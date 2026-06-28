from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
import auth

from database import Base, engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TimeFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ---------------- DATABASE ---------------- #

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- ROOT ---------------- #

@app.get("/")
def root():
    return {
        "message": "TimeFlow Backend Running Successfully"
    }


# ---------------- SIGNUP ---------------- #

@app.post("/signup")
def signup(user: schemas.SignupRequest, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account created successfully"
    }


# ---------------- LOGIN ---------------- #

@app.post("/login")
def login(user: schemas.LoginRequest, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not auth.verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    return {
        "message": "Login successful",
        "token": str(existing_user.id),
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email
        }
    }


# ---------------- GET ACTIVITIES ---------------- #

@app.get("/activities/{date}")
def get_activities(
    date: str,
    user_id: int = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):

    activities = db.query(models.Activity).filter(
        models.Activity.user_id == user_id,
        models.Activity.date == date
    ).all()

    return [
        {
            "id": activity.id,
            "name": activity.name,
            "category": activity.category,
            "duration": activity.duration,
            "date": activity.date
        }
        for activity in activities
    ]


# ---------------- ADD ACTIVITY ---------------- #

@app.post("/activities/{date}")
def add_activity(
    date: str,
    activity: schemas.ActivityCreate,
    user_id: int = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):

    new_activity = models.Activity(
        name=activity.name,
        category=activity.category,
        duration=activity.duration,
        date=date,
        user_id=user_id
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return {
        "id": new_activity.id,
        "message": "Activity added successfully"
    }


# ---------------- UPDATE ACTIVITY ---------------- #

@app.put("/activities/{date}/{activity_id}")
def update_activity(
    date: str,
    activity_id: int,
    activity: schemas.ActivityUpdate,
    user_id: int = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):

    existing = db.query(models.Activity).filter(
        models.Activity.id == activity_id,
        models.Activity.user_id == user_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    existing.name = activity.name
    existing.category = activity.category
    existing.duration = activity.duration
    existing.date = date

    db.commit()

    return {
        "message": "Activity updated successfully"
    }


# ---------------- DELETE ACTIVITY ---------------- #

@app.delete("/activities/{date}/{activity_id}")
def delete_activity(
    date: str,
    activity_id: int,
    user_id: int = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):

    activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id,
        models.Activity.user_id == user_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    db.delete(activity)
    db.commit()

    return {
        "message": "Activity deleted successfully"
    }


# ---------------- UPDATE PROFILE ---------------- #

@app.put("/users/profile")
def update_profile(
    body: dict,
    user_id: int = Depends(auth.get_current_user_id),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.name = body["name"]

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }