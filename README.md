# CivicLang (Demo)

AI-powered local language access for Irvine. Multi-page Next.js app with:
- Translation + simplification
- Plain-language rewriting
- Civic chat with local RAG context
- PDF Form Explainer
- Clean, responsive UI with Tailwind

## Quick Start

1) Install Node.js 18+
2) Download and unzip this project
3) In the project folder:
```bash
npm install
cp .env.local.example .env.local   # add your OpenAI key for AI features
npm run dev
```
Open http://localhost:3000

## Notes
- Without an OpenAI API key, endpoints return demo outputs (still useful for UI testing).
- Add real Irvine datasets under /data and extend lib/rag.ts for better results.
