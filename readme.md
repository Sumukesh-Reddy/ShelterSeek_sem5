# 🏠 ShelterSeek

## Group ID
Group_32

## Project Title
ShelterSeek — A Secure and Transparent Accommodation Platform

---

## SPOC (Single Point of Contact)
Name: M.Sumukesh Reddy 
Email: sumukesh.m23@iiits.in 
Roll No: S20230010150

---

## Team Members and Roles

M. Sumukesh Reddy (Roll No: S20230010150)  
He developed the Traveler Page and Booking Interface. His responsibilities included designing the traveler UI for viewing and booking rooms, integrating backend APIs to fetch approved listings, and supporting the Admin Dashboard by linking booking and revenue data.

G. Jhansi (Roll No: S20230010097)  
She implemented the Host Page and designed the Host Dashboard. Her work included creating forms for room submission, validation of data, handling image uploads using GridFS, and managing CRUD operations for room listings. She also connected host functionalities with MongoDB Atlas and ensured dynamic room updates.

C. Prudhvi Natha Reddy (Roll No: S20230010056)  
He developed the Admin Dashboard and implemented the verification, approval, and rejection workflows for host listings. He was responsible for integrating booking and revenue tracking, developing monthly reports, and ensuring synchronization between Admin, Host, and Traveler databases.

M. Jaswanth (Roll No: S20230010145)  
He handled backend integration using Node.js and Express.js. He worked on server routes, middleware setup, deployment configuration, and ensured communication between all modules. He also implemented error handling and backend debugging.

A. Venkata Sai Reddy (Roll No: S20230010018)  
He focused on Authentication and Security. He developed the Login and Registration modules, implemented OTP-based authentication, session management, and secure role-based access control for Admin, Host, and Traveler users. He integrated user credentials with MongoDB and ensured secure navigation.

---

## Project Overview

ShelterSeek is a full-stack web application that connects travelers looking for short-term accommodations with hosts offering rooms. It includes a powerful Admin Dashboard for approval and monitoring, ensuring verified listings and safety for users.

The platform supports three distinct user roles:
- Traveler: Can search, filter, and book approved rooms.
- Host: Can submit, update, and manage room listings.
- Admin: Can approve or reject listings, monitor platform activity, and track revenue and bookings.

ShelterSeek promotes transparency, safety, and efficiency in temporary accommodation management while automating host verification and data synchronization between databases.

---

## Objectives

1. To provide a safe and reliable room-booking experience for travelers and hosts.  
2. To ensure listing authenticity through admin verification and activity tracking.  
3. To maintain a transparent, user-friendly, and real-time booking system.  
4. To automate listing management by rejecting outdated rooms after three months.  
5. To enable Admins to analyze booking data and revenue trends efficiently.

---

## Tech Stack

Frontend: HTML, CSS, JavaScript, and EJS Templates  
Backend: Node.js and Express.js  
Database: MongoDB Atlas (Cloud-based NoSQL database)  
Security: Helmet, Express Rate Limiting, XSS-Clean, Mongo Sanitize, and CORS  
Utilities: Multer (File uploads), GridFS (Image storage), dotenv (Environment management), Moment.js (Date handling)

---

## Project Structure

ShelterSeek/
│
├── app.js                  # Main Express server file
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables for DB URIs and PORT
│
├── controller/             # Controllers for handling business logic
│   ├── usercontroller.js
│   ├── hostController.js
│   └── adminController.js
│
├── model/                  # Mongoose models for MongoDB collections
│   ├── usermodel.js
│   ├── Room.js
│   └── booking.js...
│    
├── views/                  # Frontend EJS templates for dynamic pages
│   ├── home.ejs
│   ├── loginweb.ejs
│   ├── host_index.ejs
│   ├── dashboard.ejs
│   ├── admin_index.ejs
│   ├── profile.ejs
│   ├── payment.ejs
│   └── other pages...
│
├── public/                 # Static assets (frontend resources)
│   ├── css/
│   ├── js/
│   └── images/
│
└── README.md               # Project documentation

---

## Database Details

1. loginDataBase: Stores user login and registration details for all account types.  
2. Host_Admin: Contains host-submitted room listings awaiting admin approval.  
3. Admin_Traveler: Stores admin-approved listings visible to travelers.  
4. payment: Records bookings, revenue data, and transaction history.

Each database is independently connected via Mongoose, allowing isolation and stability between host, traveler, and payment systems. Images are stored securely using GridFS buckets.

---

## Core Features

### Host Features
- Add, edit, and delete room listings.  
- Upload and manage multiple images securely via GridFS.  
- Listings automatically move to a rejected state if not updated for 3 months.  
- Manage listings and status updates through the Host Dashboard.

### Traveler Features
- Browse available rooms directly within the app (no external map dependency).  
- Apply filters for price, room type, amenities, and location.  
- Book approved rooms instantly and view booking history.

### Admin Features
- Approve or reject host submissions.  
- View analytics of bookings, revenue, and monthly trends.  
- Track new users and host activities.  
- View host locations and detailed reports.

### Security Features
- Helmet and CORS for request protection.  
- Rate limiting and sanitization for safe API usage.  
- OTP and password-based authentication for all roles.  
- Role-based access control to ensure secure navigation.

---

## Data Flow

1. The host submits room data, which is stored in the Host_Admin database as a pending listing.  
2. The admin verifies and updates the listing status to "Approved" or "Rejected".  
3. Approved listings are automatically moved to the Admin_Traveler database for traveler access.  
4. Travelers can search and book from the approved listings.  
5. Booking details and payments are recorded in the payment database.  
6. Admin dashboard displays updated booking counts, total revenue, and trends.  
7. Listings not updated for three months are automatically marked as rejected.

---

## How to Run the Project Locally

### Prerequisites
- Node.js (v16 or later)  
- npm (Node Package Manager)  
- MongoDB Atlas account or local MongoDB installation

### Steps
1. Clone the repository using  
   git clone https://github.com/Sumukesh-Reddy/ShelterSeek_sem5.git
2. Navigate to the project folder  
   cd ShelterSeek
3. Install dependencies  
   npm install
4. Create a .env file in the root directory with the following variables:

PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster/loginDataBase
HOST_ADMIN_URI=mongodb+srv://<username>:<password>@cluster/Host_Admin
ADMIN_TRAVELER_URI=mongodb+srv://<username>:<password>@cluster/Admin_Traveler
PAYMENT_DB_URI=mongodb+srv://<username>:<password>@cluster/payment

5. Start the server  
   node app.js or npm start
6. Open your browser and visit  
   http://localhost:3000

---

## Key Files and Functionalities

- app.js: Main server file that connects all databases, initializes Express, and defines routes for APIs and pages.  
- controller/usercontroller.js: Handles authentication (signup, login, password change).  
- controller/hostController.js: Manages room submissions, updates, and deletions for hosts.  
- controller/adminController.js: Handles admin operations, approvals, and dashboard data analytics.  
- model/booking.js: Defines schema for bookings and revenue data.  
- views/: Contains all EJS templates for traveler, host, and admin pages.  
- public/: Holds CSS, JS, and image files used in frontend rendering.

---

## Demo and Timestamps

Demo Video Link: [Insert your project demo video link here]  

Feature-wise demonstration timestamps:  
00:00 — Introduction and Project Overview  
00:45 — Host Login and Room Submission  
02:00 — Admin Approval Process and Dashboard  
03:30 — Traveler Booking Flow  
04:30 — Revenue and Analytics Visualization  

---

## Future Enhancements

1. Integration of a secure payment gateway.  
2. Calendar-based availability system for rooms.  
3. Traveler ratings and host review system.  
4. JWT-based authentication for improved session management.  
5. Automated booking receipts and email notifications.

---

## Conclusion

ShelterSeek is a complete full-stack accommodation management system that ensures safe and verified housing options for travelers.  
It combines an intuitive interface, robust backend architecture, and strong database design to deliver a secure and reliable booking experience.  
The system efficiently integrates role-based functionalities, automated approval workflows, and real-time analytics for effective management.  

Developed collaboratively, ShelterSeek demonstrates strong technical and teamwork skills, meeting the requirements of a modern web-based accommodation platform.
