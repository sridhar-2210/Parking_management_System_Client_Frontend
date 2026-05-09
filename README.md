# 🚗 Parking Management System - Client Frontend

The user-facing side of the Parking Management System. This mobile-responsive web application allows drivers to find available parking spots in real-time, manage their vehicle bookings, and handle payments through a sleek, intuitive interface.

---
## 🚀 Live Demo
[**Click here to explore the live app**](https://parking-management-system-client-fr.vercel.app/)

---
## ✨ Key Features

- **Smart Slot Discovery:** Real-time search and visualization of available parking lots based on location.
- **Seamless Booking Experience:** A frictionless flow for selecting parking duration, vehicle type, and confirming slots.
- **Real-time Availability Status:** Live updates ensuring users only see spots that are currently vacant.
- **Personalized User Profile:** Access to booking history, active tickets, and stored vehicle details for quick checkouts.
- **Responsive "On-the-Go" Design:** Optimized specifically for mobile users who need to find parking while driving.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React.js (Functional Components & Hooks) |
| **State Management** | Context API / Redux Toolkit |
| **Styling** | Tailwind CSS / Framer Motion (for smooth transitions) |
| **API Handling** | Axios with centralized service layer |
| **Icons & UI** | Lucide React / HeroIcons |

---

## 🏗️ Technical Highlights

- **Dynamic Search & Filtering:** Implemented efficient client-side filtering to help users sort by price, distance, and slot type.
- **State-Driven Progress Tracking:** Used complex state logic to guide the user through a multi-step booking process without losing data on refresh.
- **Mobile-First UX:** Focused on touch-friendly elements, high-contrast buttons, and a clean layout for maximum usability on mobile devices.
- **API Error Handling:** Integrated global toast notifications and error boundaries to provide a smooth experience even during network interruptions.

---

## 🚦 Installation & Setup

To run the client application locally:

1. **Clone the repository:**
   git clone https://github.com/sridhar-2210/Parking_management_System_Client_Frontend.git
   cd Parking_management_System_Client_Frontend

2. **Install dependencies:**
   npm install

3. **Configure Environment Variables:**
   Create a .env file in the root directory:
   REACT_APP_API_BASE_URL=your_backend_api_url

4. **Start the development server:**
   npm start

---

## 💡 Challenges & Solutions

**The Challenge:** Designing a booking flow that feels "instant" while coordinating multiple API calls (checking availability, creating a user session, and confirming the spot).
**The Solution:** I implemented **Optimistic UI updates** and a robust loading state strategy. By providing immediate visual feedback to the user, the app feels significantly faster and more reliable, reducing the "bounce rate" during the checkout process.

---

## 👤 Author

**Sridhar**
* **GitHub:** [@sridhar-2210](https://github.com/sridhar-2210)
* **LinkedIn:** [/vangara-sridhar](https://www.linkedin.com/in/vangara-sridhar/)

---
*This project demonstrates my commitment to building user-centric solutions that solve real-world urban logistics problems.*
