from fastapi import FastAPI, File, UploadFile
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import wave
import contextlib
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uuid

load_dotenv()
GOOGLE_API_KEY = os.getenv("API_KEY")

client = genai.Client(api_key=GOOGLE_API_KEY)

TEXT_MODEL = "gemini-2.0-flash"
TTS_MODEL = "gemini-2.5-flash-preview-tts"

app = FastAPI()

@contextlib.contextmanager
def wave_file(filename, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        yield wf


# Expõe a pasta onde o áudio é salvo
app.mount("/files", StaticFiles(directory="."), name="files")


@app.get("/audio")
async def get_audio():
    return FileResponse(name_audio, media_type="audio/wav", filename=name_audio)

@app.post("/ai")
async def generate_answer(file: UploadFile = File(...)):
    global name_audio

    if file.filename.split(".")[-1].lower() != "m4a":
        return {"error": "Formato de arquivo inválido. Envie um arquivo .m4a"}

    try:
        audio_bytes = await file.read()

        response = client.models.generate_content(
            model=TEXT_MODEL,
            contents=[
               """
                Você é uma assistente de voz virtual integrada a um aplicativo.

                Regras de comportamento (siga estritamente):
                1. Use a data/hora fornecida em mensagens com o prefixo "CURRENT_DATETIME:" para responder perguntas sobre tempo. Nunca invente data ou hora.
                2. Se não houver essa informação e o usuário perguntar algo sobre data/hora atual, diga: "Não tenho a informação da data/hora atual. Por favor, forneça 'CURRENT_DATETIME:YYYY-MM-DDTHH:MM:SS±HH:MM'."
                3. Para perguntas gerais sobre fatos conhecidos (como área de países, definições, curiosidades, história, ciência, cultura, etc.), responda normalmente com base em conhecimento geral e dados amplamente aceitos.
                4. Só evite responder quando a pergunta exigir informações específicas, privadas ou em tempo real (ex.: cotação atual, previsão do tempo, localização de alguém, dados confidenciais).
                5. Seja claro, natural e fale de forma simples e direta, como se estivesse conversando.
                6. Use empatia e mantenha o tom amigável.
                7. Se realmente não souber ou o tema for incerto, diga: "Ainda não sei isso, mas posso tentar te ajudar de outro jeito."
                """,
                types.Part.from_bytes(data=audio_bytes, mime_type=file.content_type),
            ],
        )

        text_response = response.candidates[0].content.parts[0].text
        print("Texto gerado:", text_response)

        tts_response = client.models.generate_content(
            model=TTS_MODEL,
            contents=text_response,
            config={"response_modalities": ["AUDIO"]},
        )

        blob = tts_response.candidates[0].content.parts[0].inline_data

        output_name = f"out_{uuid.uuid4().hex}.wav"
        with wave_file(output_name) as wav:
            wav.writeframes(blob.data)

        name_audio=output_name
        print(f"Áudio salvo como {output_name} ({len(blob.data)} bytes)")
        audio_url = f"http://192.168.103.31:8000/files/{output_name}"
        
        return {"response": text_response, "audio_url": audio_url}

    except Exception as e:
        print("Erro:", e)
        return {"error": str(e)}
