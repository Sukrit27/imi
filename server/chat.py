import asyncio
import websockets
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()

# Configure the API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found!")

genai.configure(api_key=GOOGLE_API_KEY)

model_id = "gemini-1.5-pro-latest"  # or gemini-2.0-flash if available!
model = genai.GenerativeModel(model_id)
chat = model.start_chat()

async def handle_connection(websocket):  # path argument is needed!
    print("✅ WebSocket client connected!")

    try:
        async for message in websocket:
            print(f">> User said: {message}")

            # Send message to Gemini
            response = chat.send_message(message)

            text_response = response.text
            print("<< AI Response:", text_response)

            # Send response back to frontend
            await websocket.send(text_response)

    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e}")



async def start_server():
    async with websockets.serve(handle_connection, "localhost", 8000):
        print("WebSocket Server is running at ws://localhost:8000")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(start_server())
