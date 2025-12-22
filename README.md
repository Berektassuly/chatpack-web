# chatpack-web

Web interface for [chatpack](https://github.com/berektassuly/chatpack) — chat export converter for LLM/RAG.

🌐 **Live:** [chatpack.berektassuly.com](https://chatpack.berektassuly.com)

## Features

- 🔒 **100% Private** — All processing happens locally in your browser using WebAssembly
- ⚡ **Fast** — Rust-powered WASM, 100K+ messages per second
- 📱 **Multi-platform** — Telegram, WhatsApp, Instagram, Discord
- 📄 **Multiple formats** — CSV (13x compression), JSON, JSONL

## Development

### Prerequisites

- Node.js 20+
- Rust + wasm-pack

### Setup

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install dependencies
npm install

# Build WASM module
npm run build:wasm

# Start dev server
npm run dev
```

### Build

```bash
npm run build
```

### Project Structure

```
chatpack-web/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks (useWasm)
│   ├── wasm/           # Built WASM module (generated)
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── wasm/               # Rust WASM wrapper
│   ├── src/lib.rs      # WASM bindings
│   └── Cargo.toml
├── public/             # Static assets
└── index.html
```

## Deployment

Automatically deployed to GitHub Pages on push to `main` branch.

### Custom Domain Setup

1. Add `CNAME` record in your DNS pointing to `<username>.github.io`
2. The `public/CNAME` file contains the custom domain

## License

MIT
