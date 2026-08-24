# Class Coursework Management System — Technical Stack

## 1. Technology Overview

The Class Coursework Management System will use a modern, lightweight full-stack architecture designed for simplicity, maintainability, security, and easy deployment.

The recommended stack is:

```text
Frontend
    ↓
Next.js + TypeScript
    ↓
Next.js Server Actions / API
    ↓
Prisma ORM
    ↓
PostgreSQL (Supabase)
    ↓
Supabase Storage

Authentication
    ↓
Supabase Auth

Hosting
    ↓
Vercel
```

The initial system should avoid unnecessary infrastructure such as microservices, Kubernetes, Redis, or a separate backend server.

---

# 2. Frontend

## 2.1 Next.js

The main application framework will be **Next.js**.

Next.js will handle both:

* Frontend pages.
* Server-side application logic.
* API endpoints where required.
* Server Actions.
* Authentication-aware routing.
* Dashboard rendering.

This avoids maintaining a separate frontend and backend application.

### Main application areas

```text
/app
    /login

    /admin
        /dashboard
        /lecturers
        /courses
        /groups
        /users
        /coursework
        /submissions
        /results

    /lecturer
        /dashboard
        /courses
        /coursework
        /groups
        /submissions
        /marking
        /results

    /leader
        /dashboard
        /group
        /coursework
        /submissions
        /results
```

---

# 3. Programming Language

## TypeScript

The application will use **TypeScript** rather than plain JavaScript.

TypeScript provides:

* Static type checking.
* Better IDE support.
* Safer database interactions.
* Easier refactoring.
* Better maintainability as the application grows.

The project should use strict TypeScript settings.

---

# 4. UI and Styling

## 4.1 Tailwind CSS

Tailwind CSS will be used for application styling.

It will provide:

* Responsive layouts.
* Consistent spacing.
* Responsive dashboards.
* Tables.
* Forms.
* Cards.
* Navigation.
* Modals.
* Status indicators.

The application should maintain a consistent design system rather than styling every page independently.

---

## 4.2 shadcn/ui

The system will use **shadcn/ui** for reusable interface components.

Potential components include:

* Button
* Input
* Select
* Dialog
* Dropdown Menu
* Tabs
* Table
* Card
* Badge
* Toast
* Alert
* Calendar
* Date Picker
* Sidebar
* Form

The components should be customized to match the application's design system.

---

# 5. Backend

## Next.js Server

A separate Express or Node.js backend is not required for the initial system.

Next.js will provide the application backend through:

* Server Actions.
* Route Handlers.
* Server Components.
* Server-side database operations.

The architecture will therefore be:

```text
Browser
   │
   ▼
Next.js
   │
   ├── Server Components
   ├── Server Actions
   └── Route Handlers
          │
          ▼
       Prisma
          │
          ▼
      PostgreSQL
```

---

# 6. Database

## PostgreSQL

The primary database will be **PostgreSQL**.

PostgreSQL is appropriate because the application contains many relationships.

For example:

```text
Lecturer
    ↓
Course
    ↓
Group
    ↓
Group Members

Course
    ↓
Coursework
    ↓
Submissions
    ↓
Marks
```

A relational database is therefore more suitable than a document database.

---

# 7. Database Platform

## Supabase

Supabase will provide the managed PostgreSQL database.

Supabase will be used for:

* PostgreSQL.
* Authentication.
* File storage.
* Database management.
* Database backups and infrastructure.

The application should treat Supabase primarily as infrastructure rather than putting all application logic directly into Supabase.

Business logic should remain clearly controlled by the application.

---

# 8. ORM

## Prisma

Prisma will be used as the application's ORM.

Prisma provides:

* Type-safe database queries.
* Database migrations.
* Schema management.
* Relationship handling.
* Better developer experience.

The core Prisma models will include:

```text
User
Course
Group
GroupMember
Coursework
CourseworkGroup
Submission
Mark
AuditLog
```

Additional models can be introduced as requirements grow.

---

# 9. Authentication

## Supabase Auth

Supabase Auth will handle authentication.

The system will support three account roles:

```text
ADMIN
LECTURER
GROUP_LEADER
```

Authentication responsibilities include:

* Login.
* Logout.
* Password management.
* Session management.
* Secure authentication tokens.
* Password reset.

The application should not implement password hashing or session management manually.

---

# 10. Authorization

Authentication and authorization must be treated as separate concepts.

### Authentication

Answers:

> Who is this user?

### Authorization

Answers:

> What is this user allowed to do?

The application must enforce authorization on the server.

Example:

```text
Group Leader
    ↓
Can access:
    Own group
    Own submissions
    Own results

Cannot access:
    Other groups
    Other submissions
    Other results
```

Similarly:

```text
Lecturer
    ↓
Can access:
    Assigned courses
    Assigned groups
    Coursework
    Submissions
    Marks

Cannot access:
    Unrelated lecturer data
```

Frontend restrictions alone are not sufficient.

---

# 11. File Storage

## Supabase Storage

Submitted coursework files should be stored in Supabase Storage.

Supported initial formats:

```text
.pdf
.docx
```

The database should not store the actual document binary.

Instead, the database stores metadata such as:

```text
file_name
file_path
file_size
mime_type
uploaded_at
```

The actual document remains in object storage.

---

# 12. Storage Organization

Files should be logically organized.

Example:

```text
submissions/
    course-001/
        coursework-001/
            group-001/
                submission-v1.pdf
                submission-v2.pdf

            group-002/
                submission-v1.docx
```

The exact storage implementation can use generated identifiers rather than relying solely on user-provided names.

---

# 13. File Security

Uploaded files should not automatically be publicly accessible.

The application should use controlled access to retrieve documents.

A lecturer should only receive access to documents belonging to coursework and groups they are authorized to access.

A group leader should only receive access to their own group's documents.

File validation should include:

* Extension validation.
* MIME type validation.
* File size validation.
* Secure storage paths.
* Authorization checks.

---

# 14. Document Viewing

## PDF

PDF documents should be displayed directly inside the lecturer interface using a browser-compatible PDF viewer.

The lecturer should be able to:

```text
Open Submission
      ↓
View PDF
      ↓
Mark
```

without manually downloading the document.

## DOCX

DOCX files require additional handling because browsers do not natively provide the same viewing experience as PDFs.

The application can use a DOCX rendering solution or convert DOCX documents into a browser-friendly format.

The goal is:

```text
DOCX submission
      ↓
Document processing
      ↓
Browser viewer
      ↓
Lecturer marking interface
```

The document-viewing implementation should be isolated so that it can be replaced later without changing the submission system.

---

# 15. Validation

## Zod

Zod will be used for application-level validation.

Examples:

### Coursework

```text
title
description
maximum_marks
deadline
course_id
```

### Group member

```text
name
registration_number
course
```

### Mark

```text
marks
feedback
submission_id
```

Validation must happen on the server even if client-side validation is also implemented.

---

# 16. Forms

## React Hook Form

React Hook Form will be used for complex forms.

Potential forms include:

```text
Create Lecturer
Create Course
Create Group
Add Group Member
Create Coursework
Upload Submission
Mark Submission
Edit Profile
```

React Hook Form can be combined with Zod to create consistent validation.

---

# 17. Date and Deadline Handling

All coursework deadlines must be stored consistently.

The application should:

* Store timestamps in UTC where appropriate.
* Convert timestamps to the institution's configured timezone for display.
* Use the same timezone for deadline calculations.

The system must avoid comparing dates using browser-local time without considering the configured timezone.

---

# 18. Submission Processing

The submission process should follow:

```text
Group Leader
     │
     ▼
Select File
     │
     ▼
Client Validation
     │
     ▼
Server Validation
     │
     ▼
Authorization Check
     │
     ▼
Upload to Storage
     │
     ▼
Create Submission Record
     │
     ▼
Determine Status
     │
     ▼
SUBMITTED / LATE
```

The database record and storage operation should be handled carefully so that an upload does not create an invalid submission record.

---

# 19. Marks and Results

Marks should be stored separately from coursework.

Recommended relationship:

```text
Coursework
    ↓
Submission
    ↓
Mark
```

This is preferable to:

```text
Coursework
    ↓
Group
    ↓
Mark
```

because a group can potentially submit multiple versions.

The system should preserve submission history and marking history.

---

# 20. API and Server Operations

Where API endpoints are required, they should follow resource-based patterns.

Examples:

```text
/api/coursework
/api/coursework/[id]
/api/coursework/[id]/submissions
/api/submissions/[id]
/api/submissions/[id]/mark
/api/groups
/api/groups/[id]
/api/results
```

Server Actions can be used for internal application operations where an API endpoint is unnecessary.

The application should avoid creating APIs simply for the sake of having APIs.

---

# 21. Role-Based Routing

Routes should be protected according to role.

Example:

```text
/admin/*
    ADMIN only

/lecturer/*
    LECTURER only

/leader/*
    GROUP_LEADER only
```

Unauthorized users should be redirected or shown an appropriate authorization error.

---

# 22. Middleware and Session Protection

Authentication state should be checked before allowing access to protected areas.

The application should protect:

```text
/admin
/lecturer
/leader
```

However, middleware should not be the only authorization layer.

The server-side operation must also verify the user's role and resource ownership.

---

# 23. Caching

Caching should be introduced carefully.

Good candidates include:

* Course information.
* Published coursework.
* Static configuration.
* Public system information.

Highly dynamic information should not be incorrectly cached.

Examples:

```text
Submission status
Marks
Results
Deadlines
```

These should always reflect current database state where necessary.

---

# 24. Database Indexing

Important fields should be indexed.

Potential indexes include:

```text
User.email

Group.course_id
Group.leader_id

Coursework.course_id
Coursework.deadline

CourseworkGroup.coursework_id
CourseworkGroup.group_id

Submission.coursework_id
Submission.group_id
Submission.submitted_at

Mark.submission_id
```

Indexes should be added based on actual query patterns as the application develops.

---

# 25. Audit Logging

Important actions should create audit records.

Examples:

```text
LOGIN
CREATE_COURSEWORK
PUBLISH_COURSEWORK
SUBMIT_WORK
UPDATE_SUBMISSION
AWARD_MARK
UPDATE_MARK
PUBLISH_RESULT
UPDATE_GROUP_MEMBER
CREATE_LECTURER
```

An audit record should contain information such as:

```text
user_id
action
resource_type
resource_id
timestamp
metadata
```

Audit logs should be append-oriented and should not normally be edited by ordinary users.

---

# 26. Error Handling

The application should provide clear errors without exposing sensitive backend information.

Examples:

```text
Invalid file type
File too large
Coursework not found
Deadline passed
Unauthorized access
Submission not found
Invalid mark
```

The application should not expose:

* Database errors.
* Stack traces.
* Secrets.
* Internal file paths.
* Authentication tokens.

---

# 27. Security Requirements

The system should implement:

* Secure authentication.
* Server-side authorization.
* Role-based access control.
* Protected file storage.
* Input validation.
* File validation.
* SQL injection protection through Prisma.
* Secure session handling.
* Rate limiting where appropriate.
* Audit logging.
* Secure environment variables.
* HTTPS in production.

Sensitive configuration should never be committed to Git.

---

# 28. Environment Variables

Sensitive configuration should be stored using environment variables.

Examples:

```text
DATABASE_URL
DIRECT_URL

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must never be exposed to the browser.

Environment files containing secrets should not be committed to Git.

---

# 29. Version Control

## GitHub

GitHub will be used for source control.

Recommended workflow:

```text
main
 │
 ├── development
 │
 ├── feature/auth
 ├── feature/coursework
 ├── feature/submissions
 └── feature/marking
```

Features should be developed in separate branches and merged after testing.

---

# 30. Deployment

## Vercel

The Next.js application will be deployed to Vercel.

Deployment flow:

```text
Developer
    │
    ▼
GitHub
    │
    ▼
Vercel
    │
    ▼
Production
```

Each production deployment should be associated with a specific Git commit.

---

# 31. Database Deployment

Supabase will host the production PostgreSQL database.

Database schema changes should be managed through Prisma migrations.

Development:

```text
Local Database
      ↓
Prisma Migration
      ↓
Supabase
```

Production database changes should never be made manually unless there is a controlled administrative reason.

---

# 32. Development Environment

Recommended local environment:

```text
Node.js
npm / pnpm
Next.js
TypeScript
Prisma
Supabase
Git
VS Code
```

The project should use a consistent Node.js version.

---

# 33. Testing

The system should eventually include several levels of testing.

## Unit Tests

Test individual functions.

Examples:

```text
calculateMark()
isSubmissionLate()
canUserAccessGroup()
canUserMarkSubmission()
```

## Integration Tests

Test interactions between:

```text
Application
Database
Authentication
Storage
```

## End-to-End Tests

Test complete workflows.

Example:

```text
Group Leader Login
      ↓
Open Coursework
      ↓
Upload PDF
      ↓
Lecturer Login
      ↓
Open Submission
      ↓
Award Mark
      ↓
Publish Result
      ↓
Group Leader Views Result
```

---

# 34. Performance

The system should remain lightweight.

Initial performance priorities:

* Fast dashboard loading.
* Paginated submission lists.
* Efficient database queries.
* Optimized document loading.
* Lazy loading where appropriate.
* Avoid unnecessary client-side rendering.
* Avoid loading large files before they are requested.

Large documents should not be loaded into the application unnecessarily.

---

# 35. Recommended Project Structure

A possible structure:

```text
classwork-system/
│
├── app/
│   ├── login/
│   │
│   ├── admin/
│   ├── lecturer/
│   ├── leader/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── coursework/
│   ├── submissions/
│   ├── marking/
│   └── groups/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── storage/
│   ├── validation/
│   └── permissions/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── types/
│
├── tests/
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

The exact structure can evolve as the application grows.

---

# 36. Core Dependencies

The initial dependency set should remain relatively small.

Recommended:

```text
next
react
typescript

@supabase/supabase-js
@supabase/ssr

prisma
@prisma/client

zod
react-hook-form
@hookform/resolvers

tailwindcss

shadcn/ui components
```

Additional dependencies should only be introduced when there is a clear requirement.

---

# 37. Architecture Principles

The project should follow these principles:

### 1. Keep the architecture simple

Avoid unnecessary services.

### 2. Server-side authorization

Never rely on frontend restrictions for security.

### 3. Database integrity

Important academic rules should be enforced at the application and database levels.

### 4. Secure document handling

Student submissions should not be publicly accessible by default.

### 5. Preserve history

Submission, marking, and important administrative changes should be auditable.

### 6. Type safety

Use TypeScript and Prisma to reduce runtime errors.

### 7. Reusable components

Common UI and business logic should not be duplicated.

### 8. Mobile responsiveness

The leader dashboard should work well on phones because students may submit from mobile devices.

The lecturer dashboard should be optimized primarily for desktop/tablet document marking.

---

# 38. Final Recommended Stack

```text
┌─────────────────────────────────────┐
│             FRONTEND                │
│                                     │
│ Next.js                             │
│ TypeScript                          │
│ Tailwind CSS                        │
│ shadcn/ui                           │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│              BACKEND                │
│                                     │
│ Next.js Server Actions              │
│ Next.js Route Handlers              │
│ Zod Validation                      │
│ React Hook Form                     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             DATA LAYER              │
│                                     │
│ Prisma ORM                          │
│ PostgreSQL                          │
│ Supabase                            │
└──────────────┬──────────────┬───────┘
               │              │
               ▼              ▼
        Supabase Auth    Supabase Storage
               │              │
               │              ├── PDF
               │              └── DOCX
               │
               ▼
          User Sessions
```

---

# 39. Technology Decision Summary

| Requirement          | Technology                              |
| -------------------- | --------------------------------------- |
| Web framework        | Next.js                                 |
| Programming language | TypeScript                              |
| UI styling           | Tailwind CSS                            |
| UI components        | shadcn/ui                               |
| Backend              | Next.js Server Actions / Route Handlers |
| Database             | PostgreSQL                              |
| Database platform    | Supabase                                |
| ORM                  | Prisma                                  |
| Authentication       | Supabase Auth                           |
| File storage         | Supabase Storage                        |
| Validation           | Zod                                     |
| Forms                | React Hook Form                         |
| Source control       | GitHub                                  |
| Hosting              | Vercel                                  |
| PDF viewing          | Browser PDF viewer                      |
| DOCX viewing         | DOCX renderer/conversion                |
| Testing              | Unit + Integration + E2E                |

---

# 40. Initial Architecture Decision

The first production version should use:

```text
Next.js
+
TypeScript
+
Tailwind CSS
+
shadcn/ui
+
Supabase
+
PostgreSQL
+
Prisma
+
Supabase Auth
+
Supabase Storage
+
Vercel
```

This stack provides everything required for the initial system without introducing unnecessary infrastructure.

The architecture should remain modular enough that services such as email, WhatsApp notifications, plagiarism detection, analytics, or external document processing can be added later without redesigning the core application.
