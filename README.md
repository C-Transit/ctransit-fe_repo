# C-Transit Frontend — Multi-Subdomain Architecture

> A campus bus transit Progressive Web App (PWA) for FUTMinna students, operations staff, agents, and drivers.

## Architecture Overview

This repository uses a clean **multi-application architecture in a single codebase**, allowing independent deployment of the main passenger app, admin control portal, and agent/driver portal across dedicated subdomains:

```text
https://ctransit.me        → Main / Passenger Application (PWA)
https://admin.ctransit.me  → Admin Control Portal
https://agent.ctransit.me  → Field Agent & Driver Portal
```

---

## Applications & Structure

```text
src/
├── apps/
│   ├── web/               # Main Passenger Application (ctransit.me)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── admin/             # Admin Control Portal (admin.ctransit.me)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── agent/             # Agent & Driver Portal (agent.ctransit.me)
│       ├── App.jsx
│       └── main.jsx
├── features/
│   ├── public/            # Landing, About, Contact, Terms, Disputes
│   ├── auth/              # Passenger Authentication
│   ├── dashboard/         # Passenger Wallet, Transfers, History, Settings
│   ├── admin/             # Admin Management, Role Control, Terminals, Analytics
│   ├── agent/             # Field Operations, KYC, NFC Card Linking, Terminals
│   └── driver/            # Driver Trips, Earnings, Vehicle Checks (Phase 2)
```

---

## Build & Development Commands

### Development

```bash
# Unified development (supports subdomains & path routing)
npm run dev

# Specific application development targets
npm run dev:web      # Run Main Passenger Web App
npm run dev:admin    # Run Admin Portal
npm run dev:agent    # Run Agent & Driver Portal
```

### Production Builds

```bash
# Build specific production bundles
npm run build:web    # Output Main Passenger App (for ctransit.me)
npm run build:admin  # Output Admin Portal (for admin.ctransit.me)
npm run build:agent  # Output Agent & Driver Portal (for agent.ctransit.me)

# Default build (aliases build:web)
npm run build
```

---

## Vercel Multi-Project Deployment Setup

To deploy the three subdomains from this single GitHub repository, create three projects in Vercel:

| Vercel Project Name | Domain / Subdomain | Build Command | Output Directory | Environment Variables |
| :--- | :--- | :--- | :--- | :--- |
| **`ctransit-web`** | `ctransit.me` | `npm run build:web` | `dist` | `VITE_API_URL=https://c-transit-pink.vercel.app` |
| **`ctransit-admin`** | `admin.ctransit.me` | `npm run build:admin` | `dist` | `VITE_API_URL=https://c-transit-pink.vercel.app` |
| **`ctransit-agent`** | `agent.ctransit.me` | `npm run build:agent` | `dist` | `VITE_API_URL=https://c-transit-pink.vercel.app` |

---

## Future Driver Portal (Phase 2)

The driver portal architecture is prepared under `src/features/driver/` and mounted under `agent.ctransit.me`. It establishes clean application boundaries and navigation placeholders for trips, vehicle checks, and driver earnings without introducing unverified backend logic or fake data.

---

## License

This project is licensed under the MIT License.

