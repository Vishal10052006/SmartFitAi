from pydantic import BaseModel
from typing import Optional

class UserMetrics(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    age: Optional[int] = None

    chest: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None