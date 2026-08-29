
# Sales & Delivery Management System (SAP-Inspired)

An enterprise-grade ERP prototype for managing the end-to-end Sales and Distribution (SD) business process. This application is inspired by standard SAP SD workflows but is a custom implementation built for modern web performance.

## 🚀 Overview
VolunteerBridge (transformed into Sales & Delivery System) coordinates the entire logistics chain from customer acquisition to final shipment tracking. It leverages AI (Genkit) for internal mission-matching (volunteer context) and robust Firestore persistence for ERP data.

## 💼 Business Workflow
1. **Customer Master**: Centralized relationship management.
2. **Sales Order (SO)**: Capture customer purchase requests with automated pricing.
3. **Delivery (DEL)**: Logistics fulfillment planning from active sales orders.
4. **Shipment (SHIP)**: Physical transport execution with tracking integration.
5. **Delivery Tracking**: Real-time visibility for end-customers and logistics teams.

## 🛠 Technology Stack
- **Next.js 15 (App Router)**: High-performance React framework.
- **Firebase Authentication**: Secure role-based access control (ADMIN, SALES, LOGISTICS).
- **Cloud Firestore**: Real-time NoSQL database for master and transactional data.
- **ShadCN UI & Tailwind CSS**: Professional enterprise-grade interface.
- **Lucide Icons**: Standardized ERP iconography.
- **Recharts**: Data visualization for executive reporting.
- **Genkit**: AI-powered matching explanations (retained from prototype foundations).

## 📊 Firestore Data Design
- `users`: Profile storage with role-based metadata.
- `customers`: ID-prefixed records (CUST1001+).
- `products`: Catalog items with automated reorder-level status (`LOW STOCK`).
- `salesOrders`: High-level transaction records (SO1001+).
- `deliveries`: Logistics documents with `DELAYED` detection logic.
- `shipments`: Carrier and tracking information (SHIP1001+).

## 🔐 Security & Roles
- **ADMIN**: Complete system access.
- **SALES_USER**: Focused on Customers, Products, and Order creation.
- **LOGISTICS_USER**: Focused on Fulfillment, Shipments, and Tracking.

## 🚧 Disclaimer
*This is NOT an official SAP product. It is an SAP-inspired prototype intended for demonstration purposes.*
