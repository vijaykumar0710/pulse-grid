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

(Add screenshots here)

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
