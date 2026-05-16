import json
import requests

# Config
SUPABASE_URL = "https://ywyxefzfhkbswaafeslp.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eXhlZnpmaGtic3dhYWZlc2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExMjM2OCwiZXhwIjoyMDg5Njg4MzY4fQ.fGkmESJvusOZH0WbGS60x7L3A2DsSS3XptnGvzKvPEw"
USER_ID = "2777a0b1-b556-423a-b64c-739570a6f137"

# Load embedding
with open("scratch/embedding_param.json", "r") as f:
    embedding_data = json.load(f)

embedding = embedding_data["embedding"]["values"]

# Prepare payload
payload = [
    {
        "user_id": USER_ID,
        "source_type": "note",
        "source_id": "80f4ecf5-af89-4fd6-bb29-5c86eee00019",
        "chunk_index": 0,
        "content": "Almond Milk, Organic Eggs, Sourdough Bread, Avocados and Greek Yogurt.",
        "embedding": embedding,
        "metadata": {"title": "Weekly Grocery List"}
    }
]

# Upsert to Supabase
headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/knowledge_chunks",
    headers=headers,
    json=payload
)

print(f"Status: {response.status_code}")
if response.status_code >= 400:
    print(response.text)
else:
    print("Success! Ingested 1 chunk.")
