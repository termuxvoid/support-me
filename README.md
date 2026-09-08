# support-me

Open-source forever · Free for everyone · **TermuxVoid** is a free security tool repository for Termux, maintained by a solo developer. This is the landing page that tells the community why their support matters — and how to give it.

Live at **[termuxvoid.github.io/support-me](https://termuxvoid.github.io/support-me)**

## What this page does

- Proudly states that TermuxVoid is free and open source
- Shows **live** proof of scale — tools available, stars, and forks are fetched straight from the repository index and the GitHub API (nothing hard-coded)
- Explains what support pays for: build infrastructure, bandwidth, and dev time
- Offers three ways to support — **GitHub Sponsors** plus **USDT (TRC20)**, **Bitcoin**, and **BNB (BSC)** wallets, each with a scannable QR code and copy-to-clipboard
- No install commands, no tool list — pure support landing page

## Tech stack

- **Plain HTML / CSS / JS** — no frameworks, no build step, no npm
- **Vendored QR generator** — [`js/vendor/qrcode.js`](https://github.com/kazuhikoarase/qrcode-generator) (MIT) so QR codes render offline
- **Google Fonts** — Martian Mono (mono/labels) + Atkinson Hyperlegible (prose), matching the main site
- `prefers-reduced-motion` respected · mobile-first · zero dependencies

## Structure

```
.
├── index.html          # Landing page (hero, about, impact, why, support, FAQ)
├── css/
│   └── style.css       # Dark & sleek theme, components, responsive rules
└── js/
    ├── app.js          # Live stats, QR wiring, copy-to-clipboard, scroll chrome
    └── vendor/
        ├── qrcode.js   # MIT-licensed QR Code generator (Kazuhiko Arase)
        └── LICENSE.txt # Vendor license
```

## Local preview

Open `index.html` in any browser — no server required.

## Deploy

GitHub Pages → source: branch `main`, path `/`.

## Community

- Telegram: [@nullxvoid](https://t.me/nullxvoid)
- YouTube: [@alienkrishnorg](https://youtube.com/@alienkrishnorg)
- Issues: [GitHub Issues](https://github.com/TermuxVoid/repo/issues)
- Email: [termuxvoid@gmail.com](mailto:termuxvoid@gmail.com)

## License

Content & code: MIT (see [LICENSE](LICENSE)). Vendored QR library: MIT ([js/vendor/LICENSE.txt](js/vendor/LICENSE.txt).) Brand assets © TermuxVoid.