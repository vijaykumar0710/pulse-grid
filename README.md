## High Level Architecture

<img width="1213" height="514" alt="image" src="https://github.com/user-attachments/assets/0a316154-7798-4909-b85c-839f027d8914" />

### Data Flow

1. IoT Sensors continuously generate patient vitals.
2. Backend receives vitals through REST APIs.
3. Redis Pub/Sub broadcasts live vitals to connected dashboards.
4. BullMQ queues critical events for background processing.
5. AI Worker evaluates incoming vitals and generates alerts.
6. Critical alerts are pushed to Doctor and Nurse dashboards using Socket.IO.
7. MongoDB stores users, chat history and alert records.
8. Redis acts as a real-time messaging layer and caching layer.
Note:- Current deployment uses a single backend instance.
Architecture is designed to horizontally scale across multiple backend nodes.
# PulseGrid 🏥

Real-Time Hospital Monitoring Platform built using MERN Stack, Redis, Socket.IO and BullMQ.

## Live Demo

Frontend:
https://pulse-grid-three.vercel.app/

Backend:
https://pulse-grid.onrender.com/

---

## Overview

PulseGrid is a real-time healthcare monitoring platform designed for hospital environments.

The system continuously receives patient vital data from simulated IoT sensors and streams live updates to nurses and doctors.

Critical patient conditions are detected in real-time and immediately pushed to connected staff dashboards.

---

## Features

### Authentication

* JWT Authentication
* Role Based Access Control
* Doctor Login
* Nurse Login

### Real-Time Monitoring

* Live Heart Rate Monitoring
* Live SpO2 Monitoring
* Real-Time Dashboard Updates
* Socket.IO Based Communication

### Critical Alert System

* Detects abnormal SpO2 values
* Generates Critical Alerts
* Real-Time Alert Broadcasting
* Alert Persistence in MongoDB

### Doctor-Nurse Communication

* Ward Based Chat Rooms
* Real-Time Messaging
* Persistent Chat History
* Socket.IO Rooms

### Background Processing

* BullMQ Job Queue
* Redis Pub/Sub
* AI Worker Pipeline

### Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* MongoDB Atlas
* Redis Cloud

---

## System Architecture

IoT Sensors
↓
Express Backend
↓
Redis Pub/Sub
↓
Socket.IO
↓
Doctor Dashboard / Nurse Dashboard

Critical Alerts:
Vitals → BullMQ Queue → AI Worker → Redis Pub/Sub → Frontend

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Recharts
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* BullMQ

### Database

* MongoDB Atlas

### Cache & Messaging

* Redis Cloud
* Redis Pub/Sub

### Deployment

* Vercel
* Render

---

## Screenshots

### Login Page

### Doctor Command Center

### Nurse Monitoring Dashboard

### Critical Alert Detection
<img width="809" height="619" alt="image" src="https://github.com/user-attachments/assets/7fc63944-9807-4433-b0c7-c116e985736d" />

<img width="1194" height="897" alt="image" src="https://github.com/user-attachments/assets/2c486d9c-eac6-4e3c-b41e-7a84bc767183" />

<img width="1917" height="970" alt="image" src="https://github.com/user-attachments/assets/f1feaf62-0d41-49ee-aeff-73d6150821e0" />

---

## Future Improvements

### AI Risk Prediction

Predict patient deterioration before critical thresholds are reached.

Example:

"Patient in Bed-5 has 82% probability of respiratory distress within next 15 minutes."

### Historical Analytics

* Daily Reports
* Weekly Reports
* Trend Analysis
* Alert Statistics

### Admin Dashboard

* Manage Doctors
* Manage Nurses
* Manage Patients
* Ward Assignment

### Notification System

* Email Alerts
* WhatsApp Alerts
* Telegram Alerts
* Mobile Push Notifications

### Multi-Hospital Support

* Hospital Isolation
* Multi-Tenant Architecture
* Central Monitoring

---

## Author

Vijay Kumar
