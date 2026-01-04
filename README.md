# 📦 chatpack-web

> Web interface for [chatpack](https://github.com/berektassuly/chatpack) — prepare chat data for RAG / LLM ingestion.

🌐 **Live:** [chatpack.berektassuly.com](https://chatpack.berektassuly.com)

## The Problem

You want to ask Claude/ChatGPT about your conversations, but:

- Raw exports are **80% metadata noise**
- JSON structure wastes tokens on brackets and keys
- Context windows are expensive

## The Solution

chatpack-web compresses your chat exports **13x** — entirely in your browser.

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Telegram JSON   │     │              │     │ Clean CSV       │
│ WhatsApp TXT    │ ──▶│ chatpack-web │ ──▶ │ Ready for LLM   │
│ Instagram JSON  │     │   (WASM)     │     │ 13x less tokens │
│ Discord Export  │     │              │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Features

- 🔒 **100% Private** — All processing happens locally in your browser using WebAssembly. Files never leave your device.
- ⚡ **Fast** — Rust-powered WASM, 100K+ messages per second
- 📱 **Multi-platform** — Telegram, WhatsApp, Instagram, Discord
- 📄 **Multiple formats** — CSV (13x compression), JSON, JSONL
- 🔀 **Smart merge** — Consecutive messages from same sender → one entry
- 🎛️ **Configurable** — Toggle timestamps and reply references

## Real Compression Numbers

| Format  | Input (Telegram JSON) | Output      | Savings          |
| ------- | --------------------- | ----------- | ---------------- |
| **CSV** | 11.2M tokens          | 850K tokens | **92% (13x)** 🔥 |
| JSONL   | 11.2M tokens          | 1.0M tokens | 91% (11x)        |
| JSON    | 11.2M tokens          | 1.3M tokens | 88% (8x)         |

## How to Export Your Chats

### Telegram

1. Open **Telegram Desktop** → Settings → Advanced → Export Telegram data
2. Select JSON format, uncheck media
3. Upload `result.json`

### WhatsApp

1. Open chat → ⋮ menu → More → Export chat
2. Choose "Without Media"
3. Upload the `.txt` file

### Instagram

1. Settings → Your activity → Download your information
2. Select JSON format, Messages only
3. Find `messages/inbox/*/message_1.json`

### Discord

Use [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter):

1. Export chat as JSON, TXT, or CSV
2. Upload the exported file

## Development

### Prerequisites

- Node.js 20+ / pnpm
- Rust + wasm-pack

### Setup

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
# Or: cargo install wasm-pack

# Install dependencies
pnpm install

# Build WASM module
pnpm run build:wasm

# Start dev server
pnpm run dev
```

### Build for Production

```bash
pnpm run build
```

### Project Structure

```
chatpack-web/
├── src/
│   ├── components/       # React components
│   │   ├── DropZone.tsx      # File upload area
│   │   ├── SourceDropdown.tsx
│   │   ├── FormatDropdown.tsx
│   │   ├── FlagsSelector.tsx # Timestamps/Replies toggles
│   │   ├── ConvertButton.tsx
│   │   ├── ResultPreview.tsx
│   │   └── ExportGuideButton.tsx
│   ├── hooks/
│   │   └── useWasm.ts    # WASM loading and conversion
│   ├── wasm/             # Built WASM module (generated)
│   ├── App.tsx           # Main application
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles & CSS variables
│   └── wasm.d.ts         # TypeScript declarations
├── wasm/                 # Rust WASM wrapper
│   ├── src/lib.rs        # WASM bindings to chatpack
│   └── Cargo.toml
├── public/
│   └── CNAME             # Custom domain config
└── index.html
```

### WASM API

The WASM module exposes two functions:

```typescript
// Convert chat export to specified format
convert(
  input: string,           // Raw file content
  source: string,          // "telegram" | "whatsapp" | "instagram" | "discord"
  format: string,          // "csv" | "json" | "jsonl"
  includeTimestamps: bool, // Add timestamps to output
  includeReplies: bool     // Add reply references to output
): string

// Get library version
version(): string
```

## Deployment

Automatically deployed to GitHub Pages on push to `main` branch.

### Custom Domain Setup

1. Add `CNAME` record in your DNS pointing to `<username>.github.io`
2. The `public/CNAME` file contains the custom domain

## Related

- [chatpack](https://github.com/berektassuly/chatpack) — CLI & Rust library
- [crates.io/crates/chatpack](https://crates.io/crates/chatpack) — Rust crate
- [docs.rs/chatpack](https://docs.rs/chatpack) — API documentation

## License

[MIT](LICENSE) © [Mukhammedali Berektassuly](https://berektassuly.com)
