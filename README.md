# Journi - NextJS - Supabase
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/pheymin/Journi-NextJS.git">
    <img src="https://github.com/pheymin/Journi-NextJS/blob/master/public/android-chrome-192x192.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Journi - Personalized Trip Planning Web App</h3>

  <p align="center">
    Personalized Trip Planning Web Application
  </p>
</p>

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Use Case Diagram](#use-case-diagram)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Scripts](#scripts)
- [Usage](#usage)
- [License](#license)
- [Authors](#authors)

---

## Project Overview
**Journi** is a tourism trip planning platform developed using Next.js, Supabase, K-Means, and Simulated Annealing algorithms, aimed at providing personalized itineraries for tourists. The platform centralizes trip planning processes and allows for real-time collaboration among users. It offers both pre-trip and on-trip planning phases, enabling users to define trip details, manage destinations, and optimize routes. Additionally, it facilitates collaboration with travel partners and allows budget tracking during trips.

## Features

### User Management
- **User Profiles**: Create and manage user profiles with options to log in, update profiles, and manage account settings.
  
### Trip Planning
- **Trip Details**: Define trip dates, travel preferences, and search for destinations.
- **Itinerary Creation**: Create custom itineraries with optimized routes using K-Means and Simulated Annealing algorithms.
  
### POI (Points of Interest) Management
- **POI Discovery**: Search, discover, and add Points of Interest (POIs) to itineraries.
- **POI Management**: Easily manage and customize POIs within an itinerary.

### Collaboration Features
- **Invite Travel Companions**: Share trip itineraries with travel companions and invite them to collaborate.
- **Real-Time Collaboration**: Plan trips collaboratively with features such as polls, broadcasts, and shared itineraries.
- **Broadcast Messages**: Send broadcasts to notify trip participants of important updates in real-time.
  
### Budget Tracking
- **Set a Budget**: Define a travel budget for the trip.
- **Monitor Expenses**: Track and manage expenses throughout the trip.

## Screenshots

- **Landing Page (Dashboard)**: Displays an overview of trips and events.
![Picture1](https://github.com/user-attachments/assets/e1268b6f-ea71-46f4-9c27-5bf0b46d7171)

- **Itinerary Plan Page**: Provides an interface for users to create and manage their itineraries.
![Picture1](https://github.com/user-attachments/assets/842a977a-eb20-4838-a9a0-87b0ffd8d086)

- **Polls**: Allows users to create polls and gather input from travel companions on trip-related decisions.
![Picture6](https://github.com/user-attachments/assets/153f2b70-fd60-4aef-820e-bb7eac253677)

- **Broadcasting**: Real-time communication with trip participants to share updates.
![Picture7](https://github.com/user-attachments/assets/9d2b5b1f-5aba-4ad3-9142-717a12277cf0)

- **Budgeting**: Enables users to set budgets and track their travel expenses throughout the trip.
![Picture8](https://github.com/user-attachments/assets/8a553729-ef4c-4c05-ae38-cba13d50fb17)


## Use Case Diagram
![Picture1](https://github.com/user-attachments/assets/aad1da0d-7fcf-4211-89b9-2d7473a98ef3)

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, ShadCN
- **Backend**: Supabase (for authentication and database management)
- **Cloud**: Supabase (for real-time data sync and storage)
- **Algorithms**: K-Means (clustering for POIs), Simulated Annealing (route optimization)
- **APIs**: Google Maps API (for mapping and route management)

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Supabase Project** (for real-time database and authentication)
- **Google Maps API Key** (for POI management and routing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/journi-trip-planning.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your environment variables:
   - Supabase credentials
   - Google Maps API Key
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
   NEXT_PUBLIC_BASE_API_URL=<your-app-api-url>
   NEXT_PUBLIC_MAPS_API_KEY=<your-google-maps-api-key>
   RESEND_API_KEY=<your-resend-api-key>
   NEXT_PUBLIC_MAP_ID=<your--google-map-id>
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the production server.

## Usage

A demo video showcasing Journi’s main features including trip planning, itinerary management, real-time collaboration, and budgeting will be available below:

[![Picture1](https://github.com/user-attachments/assets/c48b078a-5d41-4cd0-80cc-5326dcda47be)](https://youtu.be/kQv5LFzbhLM)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Authors

Pheymin - [pheymin1223@gmail.com](pheymin1223@gmail.com) - https://github.com/pheymin

---
