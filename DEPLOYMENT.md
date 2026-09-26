# VetVap Test - Deployment & Hosting Guide

This guide details how to host **VetVap Test** on **GitHub Pages** (free, offline PWA ready) and how to deploy it to any **Virtual Machine** (Ubuntu, Debian, Rocky Linux, AWS, DigitalOcean, etc.) via automated scripts or Docker.

---

## 1. Hosting on GitHub Pages (Recommended Free Hosting)

VetVap Test is built as a static Progressive Web App (PWA) with zero backend runtime dependencies. It runs 100% in the user's browser, can be installed offline on iPads, Android tablets, iPhones, and laptops, and generates certificates client-side.

### Automated GitHub Actions Deployment (Zero Configuration)

1. **Create a GitHub Repository**:
   ```bash
   cd /home/nick/Projects/vet-anaesthesia-tester
   git init
   git add .
   git commit -m "Initial commit of VetVap Test PWA"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** -> **Pages** (in the left sidebar).
   - Under **Build and deployment**:
     - Source: Select **GitHub Actions**.
   - Push any commit to `main`, and the included `.github/workflows/deploy.yml` workflow will automatically build and publish your app!
   - Your app will be live at `https://<your-username>.github.io/<your-repo-name>/`.

### Manual GitHub Pages Deployment

If you prefer to deploy manually to a `gh-pages` branch without GitHub Actions:
```bash
./scripts/deploy-github.sh
```

---

## 2. Deploying to a Virtual Machine (VM)

You can deploy to any Linux VM (AWS EC2, DigitalOcean Droplet, Linode, Hetzner, Proxmox, or local server) using either **Docker** or **Native Nginx**.

### Method A: One-Command VM Deploy Script

Copy the repository to your VM and run:

```bash
# Automatically detects Docker or Nginx and deploys
./scripts/deploy-vm.sh

# Or force Docker mode:
./scripts/deploy-vm.sh --docker

# Or force native Nginx mode:
./scripts/deploy-vm.sh --native
```

### Method B: Docker & Docker Compose (Containerized)

Requirements: Docker and Docker Compose installed.

1. **Start the Container**:
   ```bash
   docker compose up -d --build
   ```

2. **Check Status**:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

3. **Stop or Restart**:
   ```bash
   docker compose down
   docker compose restart
   ```

The app will be available on port `80` (or whichever port you set in `docker-compose.yml`).

---

## 3. Configuring SSL / HTTPS (Let's Encrypt) on VM

PWAs require HTTPS to enable offline installation and service workers. Once your VM has a domain pointing to its IP address:

```bash
# On Ubuntu / Debian:
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate automatically:
sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically configure SSL renewal and HTTPS redirection.

---

## 4. Progressive Web App (PWA) Installation

Once hosted (on GitHub Pages or your VM over HTTPS):
- **iPad / iPhone**: Open in Safari, tap the **Share** button, and tap **Add to Home Screen**.
- **Android / Tablet**: Open in Chrome, tap the banner or menu and tap **Install App**.
- **Desktop (Mac / Windows / Linux)**: Click the **Install App** button in the header or the install icon in the browser address bar.
- Once installed, the app works completely offline without internet connectivity.
