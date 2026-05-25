
# kscf-mpc
Laravel for Katipunan Coop
# Katipunan Small Coconut Farmers Multipurpose Cooperative Management System

A web-based cooperative management system developed for **Katipunan Small Coconut Farmers Multipurpose Cooperative (KSCF-MPC)**. The system helps digitize cooperative operations such as member management, loan processing, savings and capital share tracking, attendance/seminar monitoring, dividend records, reports, and administrative approvals.

This project was built to reduce manual paperwork, improve data accuracy, speed up record retrieval, and provide members and cooperative staff with a more organized way to manage cooperative transactions.

---

## Project Overview

The Katipunan Cooperative Management System is designed to support the daily operations of the cooperative by providing a centralized system for managing members, loans, savings, capital shares, seminars, reports, and administrative workflows.

The system includes role-based access for members, admins, staff, and superadmins. Members can access their own records through the member portal, while staff and administrators can manage cooperative data, monitor transactions, and handle approval processes.

---

## Main Objectives

- Digitize member registration and member record management.
- Provide a centralized database for cooperative member information.
- Support loan application, approval, tracking, and payment monitoring.
- Track savings deposits, withdrawals, and capital share contributions.
- Use MIGS and Non-MIGS classification as the cooperative's creditworthiness basis.
- Track attendance and seminar participation.
- Support dividend, patronage, and financial reporting.
- Provide role-based access for members, admins, staff, and superadmins.
- Improve report generation and transaction monitoring.
- Reduce repetitive manual encoding and paper-based processes.

---

## Technology Stack

### Backend

- Laravel
- PHP
- MySQL / MariaDB
- Laravel Fortify
- Inertia.js
- Spatie Activity Log

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI

### Development Tools

- Composer
- Node.js / npm
- Laravel Pint
- ESLint
- Pest PHP

---

## Core System Modules

### 1. Member Management

The member management module handles the registration, approval, updating, archiving, and restoration of cooperative members.

Features include:

- Member registration
- Member approval and rejection
- Member profile management
- Member status tracking
- Active and inactive member monitoring
- Member archiving request
- Archived member retrieval request
- Member portal access
- MIGS / Non-MIGS classification
- Member participation and standing records

---

### 2. MIGS / Non-MIGS Creditworthiness

The system uses **MIGS** and **Non-MIGS** classification as the cooperative's credit score or member creditworthiness basis.

MIGS classification is connected to:

- Member standing
- Attendance or seminar participation
- Capital share contribution
- Loan eligibility
- Member compliance

Important cooperative rule:

- Minimum capital share requirement for loan eligibility: **₱20,000**

Members who do not meet the cooperative requirements may be classified as Non-MIGS or not eligible for certain loan privileges.

---

### 3. Attendance and Seminar Tracking

The system includes attendance and seminar tracking to monitor member participation.

Features include:

- Seminar record management
- Attendance monitoring
- Participant tracking
- Support for member standing evaluation
- Support for MIGS / Non-MIGS classification

---

### 4. Loan Management

The loan management module supports the cooperative's loan application and monitoring process.

Features include:

- Loan request submission
- Loan eligibility checking
- Loan approval and rejection
- Board of Directors approval workflow
- Co-maker / guarantor management
- Loan amortization schedule
- Loan payment tracking
- Loan balance monitoring
- Loan reports and receipts
- Member loan history

Note: Automated penalty computation for overdue loans is not yet implemented.

---

### 5. Savings and Capital Share Management

This module records and monitors member savings and capital share contributions.

Features include:

- Savings deposit records
- Savings withdrawal records
- Savings balance monitoring
- Capital share contribution tracking
- Capital share transaction history
- Member savings reports
- Member capital share reports

---

### 6. Copra Sales and Patronage

The system supports tracking copra sales and patronage-related transactions.

Features include:

- Copra sales recording
- Copra transaction history
- Member contribution monitoring
- Patronage records
- Patronage-related reports

---

### 7. Dividend Management

The dividend module supports recording and monitoring dividend allocations and distributions.

Features include:

- Dividend records
- Member dividend history
- Dividend allocation monitoring
- Dividend reports
- Member dividend viewing

Dividend computation rules should be verified with the cooperative before final deployment.

---

### 8. Reports and Monitoring

The system provides report generation for cooperative operations.

Reports may include:

- Member reports
- Loan reports
- Savings reports
- Capital share reports
- Dividend reports
- Financial reports
- Annual reports
- Activity logs

---

### 9. Admin and Superadmin Management

The system includes administrative controls for managing users, approvals, reports, and system settings.

Admin / Superadmin features include:

- Staff account management
- Member approval queue
- Loan approval monitoring
- Member archive and restoration approval
- System settings
- Financial reports
- Member account updates
- Audit logs
- Role-based access control

---

### 10. Audit Logs

The system uses activity logging to track important system actions.

Tracked activities may include:

- Member updates
- Approval actions
- Loan changes
- Payment records
- Staff actions
- System changes

---

## User Roles

### Member

Members can:

- Log in to the member portal
- View personal profile
- View loan records
- Monitor loan payment history
- View savings balance
- View capital share contributions
- View dividend records
- Monitor cooperative-related records assigned to them

### Admin / Staff

Admins and staff can:

- Register and manage members
- View member information
- Manage member records
- Monitor attendance and seminars
- Manage loan records
- Record savings and capital share transactions
- Generate reports
- Submit archive and restoration requests

### Superadmin

Superadmin can:

- Manage staff accounts
- Review member registration requests
- Approve or reject member requests
- Review archive and restoration requests
- Oversee loan transactions
- Manage system settings
- Access reports
- Monitor system activities

### Board of Directors

The Board of Directors may be involved in:

- Loan approval workflow
- Financial oversight
- Dividend review
- Cooperative decision-making reports

---

## System Requirements

Before running the project, make sure the following are installed:

- PHP
- Composer
- Node.js
- npm
- MySQL or MariaDB
- Laravel-supported local server environment such as Laragon, XAMPP, WAMP, or a manual PHP setup

---

## Installation Guide

Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

Install PHP dependencies:

```bash
composer install
```

Install JavaScript dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

For Windows Command Prompt:

```bash
copy .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Configure the database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=katipunan_db
DB_USERNAME=root
DB_PASSWORD=
```

Run database migrations:

```bash
php artisan migrate
```

Optional: Run seeders if available:

```bash
php artisan db:seed
```

Create storage link:

```bash
php artisan storage:link
```

Run the development server:

```bash
php artisan serve
```

Run the frontend development server:

```bash
npm run dev
```

Open the system in the browser:

```text
http://127.0.0.1:8000
```

---

## Local Network Deployment for Client Testing

To allow other devices on the same Wi-Fi network to access the system, use one computer as the server.

### Step 1: Find the server PC IP address

On Windows, run:

```bash
ipconfig
```

Look for the IPv4 address, for example:

```text
192.168.1.10
```

### Step 2: Update `.env`

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://192.168.1.10:8000
```

Replace `192.168.1.10` with the actual IP address of the server PC.

### Step 3: Build frontend assets

```bash
npm run build
```

### Step 4: Optimize Laravel

```bash
php artisan optimize
```

### Step 5: Run Laravel on the network

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Other devices connected to the same Wi-Fi can access:

```text
http://192.168.1.10:8000
```

Replace the IP address with the server PC's actual IPv4 address.

---

## Production Build

For production or client demonstration, build the frontend assets:

```bash
npm run build
```

Then optimize Laravel:

```bash
php artisan optimize
```

If changes are made and cache needs to be cleared:

```bash
php artisan optimize:clear
```

---

## Important Cooperative Rules Implemented

- MIGS and Non-MIGS classification is used as the creditworthiness basis.
- Minimum capital share requirement for loan eligibility is **₱20,000**.
- Attendance and seminar tracking is implemented.
- Member registration, approval, archiving, and restoration workflows are supported.
- Loan requests, payments, and amortization records are supported.
- Savings and capital share tracking are supported.
- Dividend and patronage-related records are supported.

---

## Known Limitations / Pending Features

The following features may still need further implementation or client confirmation:

- Automated penalty computation for overdue loans is not yet implemented.
- Exact diminishing balance interest formula should be verified with the cooperative.
- Dividend computation formula should be confirmed with the client.
- Board of Directors and General Manager role visibility may need further refinement.
- Mortuary benefit processing is not yet clearly implemented.
- SEC / CDA compliance label and branding details should be confirmed in the UI.
- Rejection reason visibility for members should be checked and finalized.

---

## Suggested Testing Checklist

Before presenting to the client, test the following:

- Member login
- Admin login
- Superadmin login
- Member registration
- Member approval and rejection
- Member archiving and restoration
- Attendance and seminar tracking
- MIGS / Non-MIGS classification
- ₱20,000 capital share eligibility rule
- Loan request submission
- Loan approval and rejection
- Co-maker / guarantor handling
- Amortization schedule display
- Loan payment recording
- Savings deposit and withdrawal
- Capital share transaction
- Copra sales transaction
- Dividend record viewing
- Report generation
- Activity logs
- Role-based access restrictions

---

## Recommended Git Ignore

Make sure the following files and folders are not committed:

```gitignore
/vendor
/node_modules
/public/build
.env
.env.backup
.phpunit.result.cache
/storage/*.key
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
```

---

## Team Members

| Name | Role |
|---|---|
| Magaso Adrian Roge | Front-End Developer / Documentation |
| Tadena Julio Caesar | Back-End Developer |
| Gimarino Althia Grace | Full-Stack Developer / Project Manager |
| Morante Leonly Jan | Documentation / Project Manager |

---

## Project Context

This system was developed for the Katipunan Small Coconut Farmers Multipurpose Cooperative to help modernize its manual cooperative processes. It aims to improve the management of member records, loans, savings, capital shares, attendance, reports, and cooperative financial monitoring.

---

## License

This project is for academic and cooperative client testing purposes. Update this section if the repository will use a formal open-source license.
