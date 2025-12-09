# Full-Stack Vercel Clone Deployment Platform

## About the Project

A full-stack deployment platform inspired by Vercel, designed to enable lightning-fast deployments with isolated container builds, real-time logs, and dynamic subdomain routing.

Deploy projects in seconds by just providing a Git repository URL — the platform clones, builds, and serves your application automatically using AWS ECS, S3, and a custom reverse proxy layer.

> Say it. Deploy it. Host it. All with your own Vercel alternative.

## ✨ Features

* **Ultra-Fast Deployments** — Reduce deployment time from minutes to seconds with optimized ECS container builds.
* **Isolated Build Environments** — Each deployment runs in its own secure AWS ECS container using Docker.
* **Real-Time Logs** — Live build and deployment logs powered by Kafka + ClickHouse.
* **Dynamic Subdomain Routing** — Every deployment gets its own subdomain, routed through a custom reverse proxy with S3-backed static hosting.
* **Git-Based Deployments** — Just paste your repository URL; the platform auto-clones and builds your project.
* **Scalable Architecture** — Tested with 100+ concurrent deployments with minimal latency.
* **High Reliability** — Achieves 99.9% build success rate with efficient container orchestration.
* **Interactive Dashboard** — Manage deployments, view logs, and monitor build status in real time.

## 🏗 Tech Stack

### Frontend

* Next.js — React framework for dashboard
* Tailwind CSS — Utility-first styling

### Backend

* Node.js / Express — Core API services
* Kafka + ClickHouse — Real-time log streaming and storage
* PostgreSQL (Neon DB) — Persistent metadata and deployment history

### Infrastructure & Deployment

* AWS ECS — Containerized isolated build environments
* Docker — Container orchestration runtime
* AWS S3 — Static asset hosting and artifact storage
* Custom Reverse Proxy — Dynamic subdomain routing for deployed apps
* Aiven — Managed Kafka and ClickHouse services

---

## 🔧 Installation & Setup

> **Note:** You need an AWS account with ECS and S3 access configured. Kafka and ClickHouse are hosted on Aiven. PostgreSQL is hosted on NeonDB — your **Neon PostgreSQL connection string** should be added to `.env`.

### 1. Clone the Repository

```bash
git clone https://github.com/Krishh20/vercel
cd vercel
```

### 2. Backend Services

This project contains **two backend services**:

* `/api_server` — Handles deployments, container triggers, DB, Kafka logs
* `/s3-reverse_proxy` — Serves deployed apps from S3 and manages dynamic subdomains

Setup both individually:

#### API Server Setup

```bash
cd api_server
cp .env.example .env
# Fill .env with Neon DB connection URL, AWS, Kafka, ClickHouse credentials
npm install
npm run dev
```

#### Reverse Proxy Setup

```bash
cd ../s3-reverse_proxy
cp .env.example .env
# Fill .env with AWS credentials, ECS cluster/task details
npm install
npm run dev
```

### 3. Frontend Setup (Next.js Dashboard)

```bash
cd /frontend 
npm install
npm run dev
```

### 4. Optional: Local PostgreSQL Setup

If you don't want to use NeonDB, you can run PostgreSQL locally. In that case, update the `DATABASE_URL` in `.env` accordingly.

### 5. AWS & Aiven Service Connections

* Create an **ECS Cluster** for isolated deployments
* Create a **Task Definition** in ECS for your build container
* Configure **S3 bucket** for artifact storage
* Connect **Aiven Kafka & ClickHouse** and update `.env`

### 6. Trigger Your First Deployment

* Open the dashboard
* Paste a Git repository URL
* Watch ECS build logs live powered by Kafka + ClickHouse
* Access at: Local: http://<subdomain>.localhost:8000

---

## 🎥 Demo Video

Click below to watch the demo:

https://github.com/Krishh20/vercel/blob/main/VERCEL_DEMO.mp4](https://github.com/user-attachments/assets/a1295b96-65e2-4907-b3a7-1952a8e56a08


## 📜 Disclaimer

This project is a custom-built deployment platform for learning and scaling full-stack infrastructure systems. It is **not affiliated with Vercel**.
