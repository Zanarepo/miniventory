SPRINT 0 PRD
Foundation & System Architecture

Sprint Goal
Build the technical foundation that every future sprint will rely on.
At the end of Sprint 0, developers should be able to clone the repository, authenticate with Supabase, run the project locally, and deploy a working Progressive Web App.

Sprint Objective
Establish:
Project architecture
Authentication framework
Design system
Routing
State management
Offline infrastructure
Database connection
CI/CD pipeline
Development standards
No business functionality is implemented in this sprint.

Sprint Scope
Included
Project setup
Supabase integration
Authentication framework
React routing
PWA configuration
Theme
Offline storage
Environment configuration
Deployment

Excluded
Inventory
Sales
Expenses
Reports
Profit
Dashboard
Notifications

Epic 1
Project Initialization

User Story
As a developer
I want a clean React architecture
So that new features can be added consistently.

Acceptance Criteria
Repository cloned
Dependencies installed
Runs locally
Production build successful
Lint passes
Formatting passes

Implementation Tasks
Create React project
Configure TypeScript
Configure ESLint
Configure Prettier
Configure Husky
Configure Commitlint
Configure GitHub Actions

Folder Structure
src/

components/

pages/

layouts/

hooks/

contexts/

providers/

lib/

services/

types/

features/

utils/

constants/

assets/

styles/

routes/

Epic 2
Supabase Integration

User Story
As a developer
I want secure Supabase connectivity
So every module can use the same backend.

Functional Requirements
Initialize Supabase client
Load environment variables
Session persistence
Automatic token refresh
Error handling

Environment Variables
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

TypeScript
createClient()

supabase.ts

Deliverables
Supabase client
Session provider
Connection testing

Epic 3
Authentication Framework

User Story
As a business owner
I want to securely sign in
So only I can access my business.

Authentication methods
Email
Password
Magic Link
Forgot Password
Logout
Refresh Token
Protected Routes
Session Persistence

Not included
Social Login
MFA

Database Schema
users
Supabase Auth manages authentication.
Create profile table.
profiles

id UUID

email

full_name

phone

created_at

updated_at

SQL Migration
create table profiles (

id uuid primary key references auth.users(id),

email text not null,

full_name text,

phone text,

created_at timestamptz default now(),

updated_at timestamptz default now()

);

RLS
alter table profiles

enable row level security;
Policy
create policy

"Users manage own profile"

on profiles

for all

using (

auth.uid() = id

)

with check (

auth.uid() = id

);

Epic 4
Application Layout

Pages
Landing
Login
Register
Forgot Password
Dashboard Placeholder
404

Layout
Header
Sidebar
Content
Footer

Components
Button
Input
Card
Table
Modal
Toast
Loading Spinner

Epic 5
Routing

Public Routes
/
login
register
forgot-password

Protected
/dashboard
/settings
/profile

Logic
User authenticated
↓
Yes
↓
Dashboard
No
↓
Login

Epic 6
Theme System

Support
Light
Dark
System

Stored
Browser local storage

Epic 7
PWA Foundation

User Story
As a business owner
I want the application to continue working without internet
So I can record business transactions anywhere.

Requirements
Installable
Offline shell
Manifest
Service Worker
Background Sync
Cache Strategy

Files
manifest.json
service-worker.ts
offline.html

Epic 8
IndexedDB

Purpose
Temporary storage
Offline transactions
Cached API data
Sync Queue

Suggested Library
Dexie.js

Tables
syncQueue

cachedProducts

cachedSales

cachedExpenses

No business logic yet.
Only framework.

Epic 9
State Management

React Context
TanStack Query

Contexts
Auth
Theme
Network
Sync

Epic 10
Developer Experience

Configure
GitHub Actions
Testing
ESLint
Prettier
Type Checking
Husky
Commit Hooks

Pipeline
Push
↓
Lint
↓
Build
↓
Tests
↓
Deploy Preview

Functional Requirements
Authentication
Protected routes
Session persistence
Offline shell
Theme switching
Environment variables
Supabase connectivity

Non-functional Requirements
Page load
Under 2 seconds
Accessibility
WCAG AA
Responsive
320px+
Offline support
Yes
Security
HTTPS
Performance
Lighthouse > 90

Deliverables
✅ React Application
✅ Supabase Connected
✅ Authentication
✅ Routing
✅ Theme
✅ PWA
✅ Service Worker
✅ IndexedDB
✅ GitHub Actions
✅ Deployment Pipeline

Definition of Done
All acceptance criteria met
Code reviewed
Lint passes
Tests pass
Deployment successful
PWA installable
Offline shell functional

Open Questions
Will the initial release support multiple businesses under one user account, or only one business per account?
Should users register with email only, or should phone number authentication be available from the first release?
Which currencies should be supported at launch? Will users be able to define their own default currency?
Will localization (English, Pidgin, Igbo, Yoruba, Hausa) be included in the MVP, or should English ship first with additional languages added later?
Will the application support only single-owner businesses in the MVP, with staff roles introduced in a later sprint?
What is the maximum offline data retention period before synchronization is required?
Should the application support browser-only installation (PWA), or should we also package it later using Capacitor for desktop and mobile distribution?

The next document, Sprint 1: Authentication & Business Registration, will be substantially more detailed. It will include complete database design for business entities, Supabase authentication flows, SQL migrations, RLS policies, React component architecture, TypeScript interfaces, API contracts, validation rules, sequence diagrams, and implementation tasks at a level suitable for direct engineering execution.

