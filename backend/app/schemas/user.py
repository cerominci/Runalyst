from auth import SignUpIn

class UserUpdateIn(SignUpIn):
    class Config:
        from_attributes = True