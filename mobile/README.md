# 📱 SmartAlloc Mobile App

The official mobile companion for the SmartAlloc resource management system. Built with **React Native (Expo)** to provide an on-the-go experience for both Admins and regular Users.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based login with persistent storage.
- **🎨 Modern Design**: Beautiful animated gradient background (`Deep Blue` <-> `Indigo`) and glassmorphism cards.

- **📊 Interactive Dashboard**:
    - **Admins**: View pending requests and user stats.
    - **Users**: Quick access to "My Requests" and schedule.
- **👥 Admin Power Tools**:
    - **User Management**: Block/Unblock or Delete users.
    - **Add Users**: Create new employee accounts directly from mobile.
    - **Approvals**: One-tap Approve/Reject for resource requests.
- **📅 Smart Schedule**:
    - View all resources and their availability.
    - Make new allocation requests with ease.
    - **My Requests**: Track the status of your own bookings (Pending/Approved/Rejected).

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Expo Go** app installed on your physical mobile device (Android/iOS) OR an Emulator.
- The **SmartAlloc Backend** must be running locally.

### 2. Installation
Navigate to the mobile directory and install dependencies:

```bash
cd mobile
npm install
```

### 3. Configuration
The app connects to your local backend. You may need to update the IP address if you are testing on a physical device.

Open `src/config.js` and set your machine's local IP:
```javascript
// Replace 192.168.x.x with your actual local IP address
export const API_URL = 'http://192.168.1.5:5000/api'; 
```
*Note: `localhost` works on emulators but NOT on physical devices.*

### 4. Run the App
Start the Expo development server:

```bash
npx expo start
```

- **Scan the QR Code** with your phone (using Expo Go).
- **Press 'a'** for Android Emulator.
- **Press 'i'** for iOS Simulator.

## 📱 Screen Overview

| Screen | Description |
|--------|-------------|
| **Login** | Secure entry point with error handling. |
| **Dashboard** | Dynamic hub showing relevant stats based on User Role. |
| **My Requests** | (User) Personal list of bookings with status badges. |
| **Pending Requests** | (Admin) Queue of requests awaiting approval. |
| **User List** | (Admin) Directory of all users with Block/Delete actions. |
| **Assign Resource** | Form to request a resource (Room/Equipment). |

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 50+)
- **Navigation**: React Navigation (Stack)
- **Styling**: `StyleSheet` + `expo-linear-gradient` + `react-native-safe-area-context`
- **State Management**: React Context API (`AuthContext`)
- **Storage**: `@react-native-async-storage/async-storage`

---

<div align="center">
<b>Part of the SmartAlloc Ecosystem</b>
</div>
