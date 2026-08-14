# Miniger

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-24C8DB)
![Rust](https://img.shields.io/badge/rust-%3E%3D1.82-orange)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)

A multi-platform desktop app for managing and playing your personal movie collection.

Miniger indexes the movies you already own, enriches them with metadata and thumbnails, and gives you fast, flexible ways to browse and play them — by actor, genre, or series — without relying on a cloud service or streaming account.

## Features

- **Fast library browsing** — find movies by actor, genre, or series
- **Automatic metadata & thumbnails** — movies are tagged and given thumbnails automatically on import
- **In-app FFmpeg downloader** — easily download and set up FFmpeg directly within the app if you don't already have it
- **Playlists** — build playlists from your collection and export them as `.m3u`, `.mpcpl`, `.pls`, or `.asx`
- **Playlist converter** — convert existing playlists between any of the supported formats
- **Simple video conversion** — transcode files using FFmpeg directly from the app
- **Built for large libraries** — virtualized lists keep the UI smooth even with huge collections

## Screenshots

> _Screenshots coming soon._

<!--
![Library view](docs/screenshots/library.png)
![Playlist editor](docs/screenshots/playlists.png)
![Video conversion](docs/screenshots/convert.png)
-->

## Tech Stack

| Layer | Technology |
|---|---|
| UI | [Solid.js](https://www.solidjs.com/) + TypeScript |
| List/Grid virtualization | [TanStack Virtual](https://tanstack.com/virtual) |
| App shell | [Tauri v2](https://v2.tauri.app/) |
| Backend logic | Rust |
| Database | SQLite |
| Query builder | [Kysely](https://kysely.dev/) |
| Media processing | FFmpeg |

## FFmpeg Requirement

Miniger relies on FFmpeg and FFprobe for thumbnail generation, metadata extraction, and video conversion.

You can set up FFmpeg in one of two ways:

1. **In-App Downloader (Recommended):** Click the **Download FFmpeg** button in Miniger's settings/UI to fetch and configure the required binaries automatically.
2. **System PATH:** Alternatively, install FFmpeg manually from [ffmpeg.org](https://ffmpeg.org/download.html) and ensure `ffmpeg` and `ffprobe` are available on your system `PATH`.

## Installation

### Windows 10/11

- **Installer:** download `Miniger.msi` from the [Releases](../../releases) tab and run it.
- **Portable:** download `Miniger.exe` from the [Releases](../../releases) tab and run it directly — no installation required.

### macOS / Linux / Windows (build from source)

There are currently no pre-built binaries for macOS or Linux, so build from source using the steps in [Development](#development) below. Windows users can also build from source instead of using the installer/portable options above.

Minimum requirements:

- Rust **>= 1.82**
- Node **>= 20**

Recommended:

- Rust **>= 1.97**
- Node **>= 24**

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20 (>= 24 recommended)
- [Rust](https://www.rust-lang.org/tools/install) >= 1.82 (>= 1.97 recommended)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform
- FFmpeg + FFprobe on `PATH` *(optional if using the in-app download feature)*

### Setup

```bash
# clone the repo
git clone [https://github.com/cossieB/miniger.git](https://github.com/cossieB/miniger.git)
cd miniger

# install dependencies
npm install

# run in development mode
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## Roadmap

- [ ] Bundle FFmpeg or add an in-app download option
- [ ] Integration with an online movie database for automatic tagging
  - Requires users to supply their own API key
  - Keys are stored securely on-device using [`keyring-rs`](https://crates.io/crates/keyring) and never leave the user's machine
- [ ] Additional playlist format support

## Privacy

Miniger is designed to run entirely offline against your local collection. Any future integrations that require external services (such as movie database lookups) will be opt-in, and any credentials you provide — like API keys — are stored securely on your device via the OS-native credential store and are never transmitted anywhere by Miniger itself.

## License

Distributed under the GNU General Public License v3.0 (GPL-3.0). See [`LICENSE`](LICENSE) for details.

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue or pull request on the repository.