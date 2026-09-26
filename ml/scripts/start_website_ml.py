"""Start the website ML service using the private token in backend/.env."""
import argparse
import os
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8002)
    args = parser.parse_args()
    token = os.getenv('PS5_BRIDGE_TOKEN', '')
    env = ROOT.parent / 'backend' / '.env'
    if not token and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith('FASTAPI_ML_TOKEN='):
                token = line.split('=', 1)[1].strip().strip('"\'')
    if not token or token.startswith(('replace_', 'your-')) or not re.fullmatch(r'[A-Za-z0-9_\-]{16,}', token):
        parser.error('Set a random FASTAPI_ML_TOKEN in backend/.env, or export PS5_BRIDGE_TOKEN. The token must have at least 16 URL-safe characters.')
    os.environ['PS5_BRIDGE_TOKEN'] = token
    os.environ.setdefault('PS5_EMBEDDINGS', 'sentence_transformers')
    os.environ.setdefault('PS5_EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
    os.chdir(ROOT)
    import sys
    sys.path.insert(0, str(ROOT))
    import uvicorn
    uvicorn.run('ps5.api:app', host='127.0.0.1', port=args.port)

if __name__ == '__main__':
    main()
