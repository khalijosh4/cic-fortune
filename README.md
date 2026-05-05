Fortune Sacco V2 – Setup Guide

Prerequisites

Ensure you have the following installed:

- Node.js (latest LTS recommended)
- pnpm (package manager)

Install pnpm

npm install -g pnpm

---

Project Setup

Clone & Pull Latest Changes

git pull origin main
cd fortune-sacco-v2

---

Running the Frontend

cd client
pnpm install
pnpm run dev

---

Running the Backend

Open a new terminal, then:

cd fortune-sacco-v2
cd server
pnpm install

cd packages/db
pnpm run db:generate
pnpm run db:push
pnpm run db:seed

cd ../..
pnpm run start

---

Environment Variables Setup

You must configure environment variables for both frontend and backend.

Client

- Create a ".env" file in the client root directory (same level as "package.json")
- Use ".env.example" as a reference

Server

- Create a ".env" file inside:

server/app/api

- Use ".env.example" as a reference

---

Notes

- Ensure both frontend and backend are running concurrently
- Database setup commands must be executed before starting the backend
- If anything breaks, debug from logs first before escalating

---