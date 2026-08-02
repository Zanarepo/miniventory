BizTrack 
Sprint 1 Product Requirements Document (PRD)
Authentication & Business Registration
Sprint Duration: 2 Weeks
Sprint Number: 1
Priority: Critical
Dependencies: Sprint 0
Tech Stack
React 19
TypeScript
React Router
React Hook Form
Zod
Supabase Authentication
PostgreSQL
TailwindCSS
Shadcn UI
Progressive Web App (PWA)

Sprint Goal
Enable a business owner to:
Create an account
Log in securely
Register their business
Complete onboarding
Access their personalized dashboard
At the end of this sprint, every business has a unique identity in the system that all future modules can reference.

Sprint Objectives
The system must allow users to:
Register an account
Verify their email
Log in
Recover forgotten passwords
Create one business profile
Configure business settings
Persist authenticated sessions
Protect private business data with Row Level Security (RLS)

Sprint Scope
Included
Authentication
Email verification
Login
Logout
Password reset
Business registration
Business settings
User profile
Authentication middleware
Protected routes
RLS policies
Excluded
Inventory
Sales
Expenses
Reports
Dashboard analytics
Staff management

Epic 1: User Authentication
Description
Enable users to securely create and access their accounts.

User Story 1.1
As a new business owner
I want to register using my email
So that I can securely access my records.
Acceptance Criteria
Email is unique.
Password meets security requirements.
Verification email is sent.
User cannot log in until email is verified.
Profile is automatically created.

User Story 1.2
As a returning user
I want to log in
So that I can continue managing my business.
Acceptance Criteria
Valid credentials allow access.
Invalid credentials display appropriate errors.
Sessions persist after browser refresh.

User Story 1.3
As a user
I want to reset my password
So that I can recover my account.

Epic 2: User Profile
Each authenticated user owns a single profile.

Data Model
profiles
Field
Type
Required
id
UUID
Yes
email
TEXT
Yes
full_name
TEXT
Yes
phone
TEXT
No
avatar_url
TEXT
No
created_at
TIMESTAMP
Yes
updated_at
TIMESTAMP
Yes


SQL Migration
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

Policy
CREATE POLICY "Users can manage their own profile"

ON profiles

FOR ALL

USING (auth.uid() = id)

WITH CHECK (auth.uid() = id);

Epic 3: Business Registration
Every user owns one business during the MVP.
Future releases will support multiple businesses.

User Story
As a business owner
I want to register my business
So that every financial record belongs to my business.

Business Information
Required:
Business Name
Business Category
Country
Currency
Preferred Language
Optional:
Logo
Address
Phone Number
Email
Website

Database Schema
businesses
Column
Type
id
UUID
owner_id
UUID
business_name
TEXT
business_category
TEXT
phone
TEXT
email
TEXT
address
TEXT
country
TEXT
currency
TEXT
language
TEXT
logo_url
TEXT
created_at
TIMESTAMP
updated_at
TIMESTAMP


SQL Migration
CREATE TABLE businesses (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

owner_id UUID NOT NULL REFERENCES profiles(id),

business_name TEXT NOT NULL,

business_category TEXT NOT NULL,

phone TEXT,

email TEXT,

address TEXT,

country TEXT NOT NULL,

currency TEXT NOT NULL,

language TEXT NOT NULL,

logo_url TEXT,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

Index
CREATE INDEX idx_business_owner

ON businesses(owner_id);

Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

Policy
CREATE POLICY "Owners manage their businesses"

ON businesses

FOR ALL

USING (

owner_id = auth.uid()

)

WITH CHECK (

owner_id = auth.uid()

);

Business Categories
Seed data:
Retail

Wholesale

Restaurant

Pharmacy

Provision Store

Fashion

Agriculture

Manufacturing

Salon

Transport

Electronics

Services

Others

Epic 4: Business Settings
Users can update:
Business Name
Logo
Address
Currency
Language

Epic 5: Authentication Flow
Landing Page

↓

Register

↓

Verify Email

↓

Create Profile

↓

Register Business

↓

Redirect Dashboard
Returning users:
Login

↓

Session Exists?

↓

Yes

↓

Dashboard

↓

No

↓

Login Page

Frontend Pages
/

login

register

forgot-password

verify-email

onboarding

business-registration

dashboard

React Component Structure
pages/

LoginPage.tsx

RegisterPage.tsx

ForgotPasswordPage.tsx

BusinessRegistrationPage.tsx

DashboardPage.tsx

components/

LoginForm

RegisterForm

BusinessForm

CurrencySelect

LanguageSelect

BusinessCategorySelect

AvatarUploader

TypeScript Interfaces
Profile
export interface Profile {

id: string;

email: string;

full_name: string;

phone?: string;

avatar_url?: string;

}

Business
export interface Business {

id: string;

owner_id: string;

business_name: string;

business_category: string;

phone?: string;

email?: string;

address?: string;

country: string;

currency: string;

language: string;

logo_url?: string;

}

Form Validation (Zod)
Registration
Valid email
Password ≥ 8 characters
One uppercase letter
One lowercase letter
One number

Business Registration
Required:
Business Name
Category
Country
Currency
Language

API Service Layer
AuthService

register()

login()

logout()

forgotPassword()

updatePassword()

BusinessService

createBusiness()

updateBusiness()

getBusiness()

ProfileService

getProfile()

updateProfile()

Functional Requirements
Authentication
Register
Login
Logout
Password Reset
Email Verification
Session Persistence
Business
Create Business
Update Business
View Business
Business belongs to owner

Non-Functional Requirements
Performance
Login < 2 seconds
Registration < 3 seconds
Business creation < 2 seconds

Security
HTTPS only
JWT authentication
Row Level Security
Password hashing by Supabase Auth
No client-side secrets

Accessibility
WCAG 2.2 AA
Keyboard navigation
Screen reader labels
High contrast support

Offline Behaviour (PWA)
Because authentication requires a network connection, offline support in this sprint is limited to the following:
Existing authenticated sessions remain available while offline.
Business profile data is cached locally using IndexedDB after the first successful synchronization.
Users can view their business profile offline.
Editing business details while offline places changes into a synchronization queue that is submitted automatically when connectivity returns.
New account registration, login, password reset, and email verification require an internet connection.

Business Rules
One user can own only one business in the MVP.
Every business belongs to exactly one authenticated user.
Business names do not need to be globally unique.
A verified email is required before creating a business.
Every future record (inventory, sales, expenses, reports) must reference business_id.
Users cannot access another business's data under any circumstance.

Implementation Task Breakdown
Backend
Configure Supabase Auth
Create profiles table
Create businesses table
Create indexes
Configure RLS policies
Create database triggers to maintain updated_at
Seed business categories
Configure Supabase Storage bucket for logos
Frontend
Build registration page
Build login page
Build password recovery flow
Build onboarding flow
Build business registration form
Build business settings page
Implement protected routes
Implement authentication context
Cache profile and business data for offline viewing
QA
Registration tests
Login tests
Password reset tests
Business creation tests
RLS security tests
Offline session tests
Accessibility audit

Sprint Deliverables
✅ User registration and authentication
✅ Email verification flow
✅ Password recovery
✅ User profile management
✅ Business registration and onboarding
✅ Business settings management
✅ Protected application routes
✅ Supabase RLS configured and verified
✅ Offline caching of authenticated user and business profile
✅ Production-ready database schema for future sprints

Definition of Done
All user stories accepted by the Product Owner.
Database migrations execute without errors.
RLS policies prevent unauthorized access.
Authentication flows pass end-to-end testing.
Business registration completes successfully after email verification.
Offline viewing of business profile works after initial synchronization.
Code is reviewed, tested, documented, and merged into the main branch.

Open Questions
Should users be allowed to change their business category after registration, or only through an administrator?
Will the MVP support only English, with additional languages enabled later?
Should a business logo be optional or required for onboarding?
Do we need to capture business registration numbers (CAC, RC, VAT, TIN) in a future sprint for loan-readiness features?
Should onboarding include an optional "opening cash balance" and "business start date," or should these be introduced in the Profit Engine sprint?

This authentication and business onboarding sprint provides a stable, secure foundation for all subsequent modules. The next sprint, Sprint 2: Inventory Management, will introduce the first operational module and define inventory entities, stock movement logic, inventory transaction history, automatic stock valuation, offline synchronization rules, and all related database schemas, APIs, and React components.

