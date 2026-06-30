# Cashless Campus Platform

> A full-stack, team-driven cashless campus platform integrating React frontend, backend services, and IoT hardware for seamless bus payments.

## Overview

This repository contains the **frontend code** for the Cashless Campus Platform. The project is a collaborative effort, connecting frontend, backend, and hardware components to enable students to pay for bus rides digitally.

- **Frontend:** Built with **React** and **CSS Modules** for modular, maintainable styling. Additional packages are used to enhance functionality and UI.  
- **Backend:** Developed with **Node.js**, **Express**, and **MongoDB** to handle API requests, data storage, and business logic.

## Features

- Browse available buses in real-time  
- Digital payments for bus rides  
- Transaction history for users  
- Responsive design for desktop and mobile  
- Modular architecture for easy maintenance  

## Tech Stack

**Frontend:**  
- React  
- CSS Modules  
- Additional npm packages (e.g., `axios`, `react-router-dom`)  

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  

**Collaboration:**  
- Git/GitHub for version control  
- API integration between frontend and backend  

## Installation & Setup

1. **Clone the repo**  

```bash
git clone https://github.com/your-username/cashless-campus.git
cd cashless-campus
```

**Install frontend dependencies**

```bash
cd frontend
npm install
```

**Set frontend API URL**

Create `frontend/.env` and set:

```bash
VITE_API_URL=https://c-transit.onrender.com
```

**Start frontend server**

```bash
npm run dev
```

**Backend setup (done by backend dev)**

- Navigate to the backend folder
- Run `npm install` to install dependencies
- Start server: `npm run dev`

**Connect frontend to backend**

- Ensure `VITE_API_URL` points to the active backend instance
  
**Contributing**

This is a team project. Contributions include:

- Frontend components and styling

- API integration and testing

- Backend services and database schema

- Hardware integration modules (if applicable)

Please follow GitFlow or your agreed team workflow for branches and commits.

**License**

This project is licensed under the MIT License.

# ctransit-fe_repo
