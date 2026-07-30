<div align="center">

# 🖥️ eDEX-UI 2.0

### *Your terminal just called. It wants to look cooler.* 😎

[![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)](https://github.com/AntoneBrewer/edex-ui-2.0/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#-download)
[![License](https://img.shields.io/badge/license-GPL--3.0-green?style=flat-square)](LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-Electron-47848f?style=flat-square)](https://www.electronjs.org/)
[![Maintained by](https://img.shields.io/badge/maintained%20by-AntoneBrewer-orange?style=flat-square)](https://github.com/AntoneBrewer)

<br/>

![eDEX-UI Preview](https://user-images.githubusercontent.com/24496417/53307513-197af200-3899-11e9-9a0f-9e0e737fe5c0.png)

> **A fullscreen, cross-platform sci-fi terminal emulator** that makes you feel like you just hacked into the mainframe of a TRON movie 🎬⚡

<br/>

[📥 Download](#-download) · [✨ Features](#-features) · [🖼️ Screenshots](#️-screenshots) · [🚀 Getting Started](#-getting-started) · [🎨 Themes](#-themes) · [❓ FAQ](#-faq) · [📝 Changelog](CHANGELOG.md)

</div>

---

## 🤔 What even IS this?

Okay so picture this: you open your terminal and instead of a boring black box... you get **a full-blown sci-fi command center** straight out of a blockbuster movie. 🎥

**eDEX-UI 2.0** is a fork and continuation of the legendary [GitSquared/edex-ui](https://github.com/GitSquared/edex-ui) project — brought back to life, updated, and loaded with more download options so literally everyone can use it. 🙌

It's a real, fully functional terminal. It runs your actual shell. It monitors your actual system. It just happens to look absolutely **insane** while doing it. 🤯

> *"It might or might not be a joke taken too seriously."* — the original creator, probably smiling

---

## ✨ Features

> Everything you love about a terminal, wrapped in a sci-fi fever dream 🛸

| Feature | What it does | Vibe |
|---------|-------------|------|
| 🖥️ **Fullscreen UI** | Takes over your whole screen like a boss | Cinematic |
| 📟 **Multi-tab terminal** | Run multiple shells at once | Productive |
| 📊 **Live system monitor** | CPU, RAM, temps, network — all in real time | Hacker |
| 🌐 **Network globe** | A literal spinning 3D globe showing your network peers | Overkill (in a good way) |
| 📁 **File browser** | Follows your terminal's current directory automatically | Smooth |
| ⌨️ **On-screen keyboard** | Touch-friendly, lights up when you type | Fancy |
| 🎨 **Themes** | Swap looks on the fly with JSON theme files | Stylish |
| 🔊 **Sound effects** | Sci-fi audio on keystrokes (yes, really) | Extra |
| 📦 **More download options** | Windows, macOS, Linux — every flavor covered | Accessible |
| 🛡️ **Security patched** | WebSocket origin validation so rogue sites can't hijack your terminal | Safe |

---

## 🖼️ Screenshots

> Because words can't do it justice 📸

**Default "Tron" theme**
![Tron Theme](https://user-images.githubusercontent.com/24496417/53307513-197af200-3899-11e9-9a0f-9e0e737fe5c0.png)

**"Blade" theme with htop**
![Blade Theme](https://user-images.githubusercontent.com/24496417/39483365-e9a72474-4d69-11e8-8ab4-dd46e6de0fb9.png)

**"Tron-disrupted" experimental theme**
![Tron Disrupted](https://user-images.githubusercontent.com/24496417/51054912-5b098080-15d2-11e9-90c2-efc5698df1f4.png)

> 💡 **Pro tip:** Post your setup on [r/unixporn](https://reddit.com/r/unixporn) and watch the upvotes roll in. You're welcome.

---

## 📥 Download

> Pick your flavor. We got 'em all now. 🎉

### Android
| Package | Architecture |
|---------|-------------|
| [eDEX-UI-Android-arm64.apk](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | ARM64 |
| [eDEX-UI-Android-x64.apk](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | x64 |

> Android uses a Capacitor interface. Electron-only terminal and hardware telemetry features remain available in the desktop packages.

### Fedora
| Package | Architecture |
|---------|-------------|
| [eDEX-UI-Fedora-arm64.rpm](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | ARM64 |
| [eDEX-UI-Fedora-x64.rpm](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | x64 |

### macOS
| Package | Architecture |
|---------|-------------|
| [eDEX-UI-macOS-arm64.pkg](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | Apple Silicon ARM64 |
| [eDEX-UI-macOS-x64.pkg](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | Intel x64 |

### Ubuntu
| Package | Format | Architecture |
|---------|--------|-------------|
| [eDEX-UI-Ubuntu-arm64.AppImage](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | AppImage | ARM64 |
| [eDEX-UI-Ubuntu-arm64.deb](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | DEB | ARM64 |
| [eDEX-UI-Ubuntu-x64.AppImage](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | AppImage | x64 |
| [eDEX-UI-Ubuntu-x64.deb](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | DEB | x64 |

> Ubuntu AppImages must be executable: `chmod +x eDEX-UI-Ubuntu-*.AppImage`.

### Windows
| Package | Architecture |
|---------|-------------|
| [eDEX-UI-Windows-arm64-Setup.exe](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | ARM64 |
| [eDEX-UI-Windows-x64-Setup.exe](https://github.com/AntoneBrewer/edex-ui-2.0/releases/latest) | x64 |

---

## 🚀 Getting Started

### Option 1 — Just download and run 🏃
Grab a binary from the [Releases page](https://github.com/AntoneBrewer/edex-ui-2.0/releases) and you're done. No config needed. It just works. ✅

### Option 2 — Build from source 🛠️

> For the brave souls who like to compile things themselves 💪

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v22+)
- npm

```bash
# 1. Clone the repo
git clone https://github.com/AntoneBrewer/edex-ui-2.0.git
cd edex-ui-2.0

# 2. Install dependencies
npm install

# 3. Run in dev mode
npm start

# 4. Or build a binary for your platform
npm run build-linux    # 🐧 Linux
npm run build-windows  # 🪟 Windows
npm run build-darwin   # 🍎 macOS
npm run android:sync   # Android (then build from android/)
cd android && ./gradlew assembleDebug
```

Binaries will land in the `dist/` folder. Ship it! 🚢

---

## 🎨 Themes

eDEX-UI ships with a bunch of built-in themes, and you can make your own with a simple JSON file.

| Theme | Vibe |
|-------|------|
| `tron` | The OG. Blue neon. Classic. 💙 |
| `blade` | Dark and moody. Very hacker. 🖤 |
| `tron-disrupted` | Glitchy chaos. Experimental. ⚡ |
| `cyborg` | Green tones. Very Matrix. 🟩 |
| `navy` | Deep blue. Professional cool. 🌊 |

> 🎨 **Want to make your own?** Check the [Wiki](https://github.com/GitSquared/edex-ui/wiki) for the full theme spec.

To switch themes, navigate to the **themes folder** from the filesystem panel and double-click any `.json` theme file. Done. Instant vibe change. 🔄

---

## ⚙️ Configuration

Your config lives at:

| OS | Path |
|----|------|
| 🐧 Linux | `~/.config/eDEX-UI/config.json` |
| 🍎 macOS | `~/Library/Preferences/eDEX-UI/config.json` |
| 🪟 Windows | `%APPDATA%\eDEX-UI\config.json` |

Some fun things you can tweak:

```json
{
  "shell": "/bin/zsh",
  "theme": "tron",
  "termFontSize": 14,
  "excludeSelfFromToplist": true,
  "audioManager": true
}
```

> 🔇 **Sound effects too loud?** Set `"audioManager": false` and restore the peace. 😅

---

## ❓ FAQ

**Q: Is this a real terminal?** 🤔
> A: Yes! 100%. It runs your actual shell (bash, zsh, PowerShell — your choice). You can do real work in it. It just looks ridiculously cool while you do.

**Q: Will it make me look like a hacker?** 😏
> A: Absolutely. Results may include: coworkers asking "what IS that?", unsolicited Instagram photos of your screen, and an unshakeable sense of power.

**Q: Does it work on my Raspberry Pi?** 🥧
> A: YES! We now ship ARMv7 and ARM64 builds specifically for Pi and other ARM boards. Go wild.

**Q: It's using a lot of CPU...** 😬
> A: Yeah, Electron apps are not exactly featherweights. It's the price you pay for looking this good. Close Chrome first. 😂

**Q: Can I use it as my daily driver?** 💼
> A: People do! It's a fully functional terminal. Whether you *should* is between you and your CPU usage.

**Q: Is the spinning globe actually useful?** 🌍
> A: Absolutely not. Is it incredibly cool? Absolutely yes.

---

## 🛡️ Security

This fork includes a **WebSocket origin validation fix** from the community. The original eDEX-UI had a vulnerability where malicious websites could connect to the internal terminal WebSocket and execute shell commands. That's patched here. 🔒

- ✅ Only accepts connections from the local Electron app (`file://` protocol)
- ✅ Rejects all external web-based connection attempts
- ✅ Logs rejected attempts so you know if something tried to be sneaky

---

## 🗺️ Roadmap

Here's what's cooking 👨‍🍳

- [x] 📦 More download options (v2.0.0) ✅
- [ ] 🔄 Auto-updater
- [ ] 🌙 New themes
- [ ] 📱 Better touchscreen support
- [ ] 🌐 Remote monitoring
- [ ] ⚡ Performance improvements

Got an idea? [Open an issue!](https://github.com/AntoneBrewer/edex-ui-2.0/issues) 💡

---

## 🤝 Contributing

PRs are welcome! If you made a cool theme, fixed a bug, or added a feature — open a pull request. Let's make this thing legendary together. 🏆

1. 🍴 Fork it
2. 🌿 Create your branch (`git checkout -b feature/my-cool-thing`)
3. 💾 Commit your changes (`git commit -m 'feat: add my cool thing'`)
4. 📤 Push to the branch (`git push origin feature/my-cool-thing`)
5. 🔁 Open a Pull Request

---

## 🙏 Credits

This project stands on the shoulders of giants 🫡

- 🏗️ **Original eDEX-UI** by [GitSquared (Gabriel Saillard)](https://github.com/GitSquared) — the madlad who started it all
- 🔊 **Sound effects** by [IceWolf](https://soundcloud.com/icesounddesign) — genuinely slaps
- 🌍 **ENCOM Globe** by [Rob "Arscan" Scanlon](https://github.com/arscan) — the spinning beauty you love
- 💻 **xterm.js** — powering the actual terminal magic
- 📊 **systeminformation** — all those live stats
- 📈 **SmoothieCharts** — making graphs look smooth
- 🔧 **This fork** maintained by [@AntoneBrewer](https://github.com/AntoneBrewer) 👋

---

## 📜 License

GPL-3.0 — same as the original. Open source forever. 🔓

---

<div align="center">

**Made with ❤️ by [@AntoneBrewer](https://github.com/AntoneBrewer)**

*If this made your terminal look cool, drop a ⭐ on the repo. It means a lot!*

[![Star this repo](https://img.shields.io/github/stars/AntoneBrewer/edex-ui-2.0?style=social)](https://github.com/AntoneBrewer/edex-ui-2.0)

</div>
