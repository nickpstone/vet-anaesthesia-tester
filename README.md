# VetVap Test 🩺💨
### Veterinary Anaesthesia Machine & Vaporiser Calibration Testing PWA

**VetVap Test** is a Progressive Web App (PWA) built specifically for veterinary biomedical engineers, field service technicians, and clinic managers to test, verify, and output calibration certificates for veterinary anaesthesia machines and vaporisers.

---

## ✨ Features

- **Progressive Web App (PWA)**:
  - 100% offline-ready with Service Worker caching.
  - Installable on iPad, Android tablets, iPhones, and desktop.
  - No internet connection required during field testing.
- **Comprehensive Equipment Configuration**:
  - **Anaesthetic Agents**: Isoflurane, Sevoflurane, Halothane, Desflurane, and Enflurane with official medical color coding.
  - **Mounting Systems**: Direct toggle between **Selectatec** (interlock quick-release) and **Cagemount** (23mm taper).
  - **Vaporiser Models**: Datex-Ohmeda Tec 3, Tec 4, Tec 5, Tec 7, Dräger Vapor 19.n / 2000, Penlon Sigma Delta / Elite, Blease Datum, Vetland VIP 3000, and custom models.
  - **Carrier Flowrates**: Quick presets (0.5, 1.0, 2.0, 4.0, 5.0, 8.0 L/min) or custom flowrates with Oxygen, Medical Air, or N2O mixes.
  - **Multi-Flowrate Runs**: Test multiple flow rates (e.g. 1 L/min and 4 L/min) on the same machine certificate.
- **Dial Output Concentrations**:
  - Pre-configured standard dial points: **0.2%, 0.6%, 1.0%, 2.0%, 3.0%, 4.0%, and 5.0%** (with option to add custom dial settings like 6.0% or 8.0% for Sevoflurane).
  - Fast touch-stepper buttons (`-0.1`, `+0.1`, `=dial`) for quick field data entry.
- **Automated ISO 8835-4 Pass / Fail Analysis**:
  - Automatically calculates deviation %: `((Measured - Set) / Set) * 100%`.
  - Applies ISO standard allowable limits: **±15% of dial setting** with an **absolute floor of ±0.15%** for lower settings (0.2% and 0.6%).
  - Configurable custom tolerance thresholds.
- **Prominent Failure Indicator**:
  - **Critical User Specification**: When any dial setting fails tolerance, a bold red alert banner and a prominent **`FAILED`** stamp with a **thick red underline spanning across the entire page** is placed on both the screen and the exported PDF certificate.
  - Diagnostic breakdown highlighting the specific points that failed and clinical advisory notes.
- **Testing Company Branding & Logo Upload**:
  - Upload testing company logo (PNG, JPG, SVG, WebP) directly from device.
  - Saved in browser storage (`localStorage`) so it persists permanently.
  - Rendered cleanly on all exported PDF calibration certificates.
- **Email & PDF Export**:
  - **Email Report Button**: Uses the Web Share API to attach the generated PDF directly into your device's native Mail / Gmail / Outlook client on mobile/tablets.
  - Automatic download fallback and `mailto:` pre-filled draft generation.
  - In-app PDF Preview modal with print and direct download options.
- **Autosave & Local History**:
  - Draft state automatically saved to prevent data loss.
  - Save completed reports to local history to review or re-export later.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production PWA
npm run build
```

---

## 🌐 Hosting & Deployment

### 1. GitHub Pages (Free Hosting)
This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. Push code to your GitHub repository.
2. In GitHub, go to **Settings** -> **Pages** -> Source: **GitHub Actions**.
3. It will automatically build and publish to your GitHub Pages URL!

### 2. Virtual Machine Deployment (Docker or Nginx)
Run the automated deployment script on your Linux server:
```bash
# Automatically detects Docker or Nginx and deploys:
./scripts/deploy-vm.sh

# Or run with Docker Compose manually:
docker compose up -d --build
```
See [DEPLOYMENT.md](file:///home/nick/Projects/vet-anaesthesia-tester/DEPLOYMENT.md) for full instructions.

---

## 📋 ISO Standards Reference

- **ISO 8835-4**: Inhalation anaesthesia systems - Anaesthetic vapour delivery devices.
- **ASTM F1161**: Standard specification for minimum performance and safety requirements for components and systems of anaesthesia machines.
- **Standard Tolerance**: ±15% of setting (or ±0.15% absolute at concentrations below 1.0%).
