# api.py
from fastapi import FastAPI, Depends, Header, HTTPException
from pydantic import BaseModel
import uvicorn
import os

from type_core import load_model, make_choices

# ==========================
# 1) โหลดโมเดล + ตั้งค่า API KEY
# ==========================

# โหลดโมเดลทีเดียว
model = load_model(
    r"C:\Users\user\Desktop\WordGame-1\ApiWord\AiModel\type_model.pt"
)

# ตั้ง API KEY (ถ้าไม่ตั้ง env จะใช้ค่า default นี้)
API_KEY = os.getenv("TYPO_API_KEY", "my-secret-key")
API_KEY_HEADER_NAME = "X-API-Key"

app = FastAPI(title="Typo Generator API with API Key")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000", "http://127.0.0.1:4000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# 2) Dependency ตรวจ API KEY
# ==========================

def verify_api_key(x_api_key: str = Header(None)):
    """
    ตรวจว่า header X-API-Key ที่ส่งมา ตรงกับ API_KEY มั้ย
    ถ้าไม่ → 401 Unauthorized
    """
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return True


# ==========================
# 3) Request / Response Models
# ==========================

class TypoRequest(BaseModel):
    word: str
    n_fake: int = 4

class TypoResponse(BaseModel):
    correct: str
    choices: list[str]


# ==========================
# 4) Endpoint แบบมี API KEY
# ==========================

@app.post("/generate", response_model=TypoResponse, dependencies=[Depends(verify_api_key)])
def generate_typos(req: TypoRequest):
    word = req.word.strip().lower()
    choices = make_choices(model, word, n_fake=req.n_fake)

    if word not in choices:
        choices.append(word)

    return TypoResponse(correct=word, choices=choices)


# ==========================
# 5) Endpoint /predict แบบไม่ใช้ API KEY (ไว้เทสง่าย ๆ)
# ==========================

@app.post("/predict", response_model=TypoResponse)
def predict_word(request: TypoRequest):
    word = request.word.strip().lower()
    choices = make_choices(model, word, n_fake=request.n_fake)

    if word not in choices:
        choices.append(word)

    return TypoResponse(correct=word, choices=choices)


# ==========================
# 6) Health check
# ==========================

@app.get("/")
def root():
    return {
        "message": "Typo API is running",
        "usage_generate": "POST /generate  (ต้องมี X-API-Key)",
        "usage_predict": "POST /predict   (ไม่ต้องมี API key)"
    }


# ==========================
# 7) Run server
# ==========================

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
