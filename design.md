# Class Coursework Management System — UI/UX Design Specification

## 1. Design Overview

The Class Coursework Management System will use a **modern academic SaaS dashboard** design.

The system is an operational tool rather than a marketing website. The interface should prioritize:

* Speed.
* Clarity.
* Academic professionalism.
* Low visual clutter.
* Easy navigation.
* Fast coursework submission.
* Fast lecturer marking.
* Clear deadlines.
* Clear submission statuses.
* Responsive student experience.

The design should feel like a professional productivity application rather than a traditional school-management system.

---

# 2. Design Philosophy

The primary design principle is:

> Every screen should clearly communicate what the user needs to do next.

The interface should be designed around the responsibilities of each role.

### Lecturer

The primary question is:

> Which submissions require my attention?

The lecturer interface should therefore prioritize:

1. Items requiring action.
2. Upcoming deadlines.
3. Submissions.
4. Marking.
5. Results.
6. Historical coursework.

### Group Leader

The primary question is:

> What does my group need to submit?

The group leader interface should prioritize:

1. Coursework requiring submission.
2. Upcoming deadlines.
3. Submission status.
4. Results.
5. Group members.

### Administrator

The primary question is:

> Is the system and class structure configured correctly?

The administrator interface should prioritize:

1. System overview.
2. Users.
3. Courses.
4. Groups.
5. System activity.
6. Configuration.

---

# 3. Overall Visual Direction

The application should use:

```text
Modern Academic SaaS
        +
Professional Dashboard
        +
Productivity Workspace
```

The visual style should be:

* Clean.
* Minimal.
* Professional.
* Modern.
* Responsive.
* Information-focused.
* Consistent.

The interface should avoid unnecessary decorative elements.

---

# 4. Visual Elements to Avoid

The system should not rely on:

* Excessive gradients.
* Glowing effects.
* Large decorative illustrations.
* Excessive animations.
* Huge hero sections.
* Excessive shadows.
* Too many colors.
* Overly rounded components.
* Excessively large typography.
* Gamification.
* Unnecessary decorative charts.

The application should look like a tool people use for real academic work.

---

# 5. Color System

The initial color palette should be restrained.

Recommended colors:

```text
Background:
#F8FAFC

Surface:
#FFFFFF

Primary Text:
#0F172A

Secondary Text:
#64748B

Borders:
#E2E8F0

Primary Accent:
Deep Blue / Indigo

Success:
Green

Warning:
Amber

Danger:
Red
```

The exact primary accent can be finalized during implementation.

Only one primary brand/accent color should be used throughout the application.

---

# 6. Color Usage Rules

### Primary Accent

Use for:

* Primary buttons.
* Active navigation.
* Links.
* Selected states.
* Important interactive elements.

### Green

Use for:

* Submitted.
* Completed.
* Published.
* Successful operations.

### Amber

Use for:

* Late submissions.
* Approaching deadlines.
* Warnings.

### Red

Use for:

* Errors.
* Destructive actions.
* Failed uploads.
* Critical warnings.

### Gray

Use for:

* Disabled states.
* Neutral information.
* Not submitted.
* Secondary content.

Colors should communicate meaning consistently across the entire system.

---

# 7. Typography

Typography should be highly readable.

Recommended approach:

```text
Page Heading
24–32px

Section Heading
18–24px

Card Heading
16–18px

Body
14–16px

Secondary Text
13–14px

Table Text
13–14px
```

The system should avoid excessively large typography because the application contains significant amounts of operational information.

---

# 8. Spacing

Use a consistent spacing scale.

Recommended base spacing:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
```

Major page sections should generally use:

```text
24px–32px
```

between them.

---

# 9. Border Radius

Use moderate rounding.

Recommended:

```text
Buttons:
8px

Inputs:
8px

Cards:
10–12px

Dialogs:
12px

Large containers:
12–16px
```

Avoid excessive pill-shaped components except for status badges and similar compact elements.

---

# 10. Shadows

Use shadows sparingly.

Most cards should primarily be separated through:

* Background contrast.
* Borders.
* Spacing.

If shadows are used, they should be subtle.

Avoid:

```text
Large shadows
Colored shadows
Glow effects
```

---

# 11. Layout System

The primary desktop layout should use:

```text
┌───────────────┬──────────────────────────────────┐
│               │                                  │
│    SIDEBAR    │          MAIN CONTENT             │
│               │                                  │
│               │                                  │
│               │                                  │
└───────────────┴──────────────────────────────────┘
```

The sidebar remains fixed while the main content scrolls.

---

# 12. Desktop Sidebar

The sidebar should contain:

* Application logo/name.
* Primary navigation.
* Settings.
* User profile.
* Logout.

Example lecturer navigation:

```text
CLASSWORK

Dashboard
Courses
Coursework
Submissions
Marking
Results
Groups

──────────────

Settings

──────────────

Profile
Logout
```

The navigation should remain short and focused.

---

# 13. Sidebar Rules

The sidebar should:

* Clearly show the active page.
* Use consistent icons.
* Avoid unnecessary nested navigation.
* Remain visually quiet.
* Not dominate the screen.

The active item should use the primary accent color and a subtle background.

---

# 14. Mobile Navigation

On mobile, the sidebar should become a drawer.

Example:

```text
┌─────────────────────────┐
│ ☰   CLASSWORK      🔔   │
└─────────────────────────┘
```

Tapping the menu opens:

```text
Dashboard
Courses
Coursework
Submissions
Marking
Results
Groups

Settings
Profile
Logout
```

The mobile navigation should not permanently consume screen space.

---

# 15. Lecturer Dashboard

The lecturer dashboard is one of the most important screens.

Its primary purpose is to answer:

> What requires my attention?

The layout should contain:

1. Welcome/header.
2. Summary statistics.
3. Active coursework.
4. Recent submissions.
5. Items requiring attention.

---

# 16. Lecturer Dashboard Header

Example:

```text
Good morning, Sarah

Here's what's happening with your coursework.

                              🔔   Profile
```

The header should be compact.

Avoid using a large hero section.

---

# 17. Lecturer Dashboard Statistics

Use four compact summary cards.

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
│ Coursework │ │ Submitted  │ │ To Mark    │ │ Not Submitted│
│            │ │            │ │            │ │              │
│     6      │ │     42     │ │     14     │ │      8       │
└────────────┘ └────────────┘ └────────────┘ └──────────────┘
```

Recommended statistics:

* Active Coursework.
* Submitted Work.
* Awaiting Marking.
* Not Submitted.

These should be immediately visible.

---

# 18. Active Coursework

Use cards or compact list items for active coursework.

Example:

```text
Database Normalization
Database Systems • Due Aug 30

███████████████████░░░
16 / 20 groups submitted

[View Coursework]
```

The progress indicator should communicate submission progress.

---

# 19. Recent Submissions

Use a table.

```text
┌─────────────────────────────────────────────────────────────┐
│ Group       Coursework              Status                  │
├─────────────────────────────────────────────────────────────┤
│ Alpha       Database Normalization   Submitted               │
│ Beta        Java Inheritance         Awaiting Marking        │
│ Gamma       Database Normalization   Not Submitted           │
└─────────────────────────────────────────────────────────────┘
```

Tables are preferable for this type of information because they allow the lecturer to scan many records quickly.

---

# 20. Coursework Management Page

Coursework management should use a table.

```text
Coursework

[ + Create Coursework ]

┌──────────────────────────────────────────────────────────────┐
│ Coursework              Course       Deadline       Status   │
├──────────────────────────────────────────────────────────────┤
│ Database Normalization  Database     Aug 30         Active   │
│ Java Inheritance        OOP          Sep 05         Active   │
│ OS Processes            Operating    Sep 12         Draft    │
│ Networking Assignment   Networks     Aug 20         Closed   │
└──────────────────────────────────────────────────────────────┘
```

The table should support:

* Search.
* Filtering.
* Sorting.
* Status filtering.
* Course filtering.
* Deadline sorting.

---

# 21. Coursework Detail Page

The coursework detail page should provide a complete overview.

Example:

```text
Database Normalization

Database Systems
Deadline: 30 Aug 2026
Maximum Marks: 20

[Edit] [Publish] [More]

────────────────────────────────────

Instructions

Explain first, second and third normal forms...

────────────────────────────────────

Submission Overview

Submitted       16
Awaiting Mark    4
Late             2
Not Submitted    3

────────────────────────────────────

Groups
```

---

# 22. Submission Overview

The submission overview should use clear statistics.

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
│ Submitted  │ │ Awaiting   │ │ Late       │ │ Not Submitted│
│     16     │ │     4      │ │     2      │ │      3       │
└────────────┘ └────────────┘ └────────────┘ └──────────────┘
```

The lecturer should be able to click a statistic to filter the groups.

---

# 23. Groups Submission Table

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ Group       Status                Marks       Action         │
├──────────────────────────────────────────────────────────────┤
│ Alpha       Result Published      18/20       View           │
│ Beta        Awaiting Mark         —           Mark           │
│ Gamma       Not Submitted         —           —              │
│ Delta       Late                  —           View            │
└──────────────────────────────────────────────────────────────┘
```

The action should change based on the status.

---

# 24. Marking Workspace

The marking interface should have a dedicated layout.

This screen should prioritize the document rather than the application's normal navigation.

Recommended structure:

```text
┌──────────────────────────────────────────────────────────────────┐
│ ← Back   Group Alpha • Database Normalization          18/20    │
├──────────────────────────────────────────┬───────────────────────┤
│                                          │                       │
│                                          │ MARKING               │
│             DOCUMENT                     │                       │
│                                          │ Group Alpha            │
│                                          │                       │
│                                          │ Marks                  │
│                                          │ [ 18 ] / 20            │
│                                          │                       │
│                                          │ Feedback               │
│                                          │ ┌───────────────────┐ │
│                                          │ │                   │ │
│                                          │ │                   │ │
│                                          │ └───────────────────┘ │
│                                          │                       │
│                                          │ [Save Mark]            │
│                                          │ [Publish Result]       │
│                                          │                       │
└──────────────────────────────────────────┴───────────────────────┘
```

---

# 25. Marking Workspace Proportions

The document should receive approximately:

```text
65–75%
```

of the available width.

The marking panel should receive:

```text
25–35%
```

The document is the primary content.

The marking controls should remain visible while the lecturer reviews the document.

---

# 26. Marking Panel

The marking panel should contain:

```text
Group Name

Marks
[ 18 ] / 20

Feedback
[ Text area ]

[Save Mark]
[Publish Result]
```

The lecturer should not have to leave the document viewer to enter marks.

---

# 27. Marking Interaction

The lecturer's workflow should be:

```text
Open Submission
      ↓
Read Document
      ↓
Enter Mark
      ↓
Add Feedback
      ↓
Save
      ↓
Review
      ↓
Publish Result
```

This should be achievable without navigating through multiple pages.

---

# 28. PDF Viewer

PDF documents should be displayed directly in the browser.

The viewer should provide:

* Page navigation.
* Zoom.
* Search if supported.
* Fullscreen.
* Page count.

The viewer should not force the lecturer to download the document for normal review.

---

# 29. DOCX Viewer

DOCX documents should be rendered inside the application or converted into a browser-friendly viewing format.

The interface should maintain the same marking workflow regardless of whether the original file is:

```text
PDF
```

or:

```text
DOCX
```

The lecturer should not need to understand the underlying document-processing mechanism.

---

# 30. Create Coursework Interface

Creating coursework should be quick.

Example:

```text
Create Coursework

Course
[ Database Systems ▼ ]

Title
[ Database Normalization ]

Instructions
┌───────────────────────────────────────────┐
│ Explain 1NF, 2NF and 3NF...               │
│                                           │
└───────────────────────────────────────────┘

Maximum Marks
[ 20 ]

Deadline
[ 30 Aug 2026 ] [ 11:59 PM ]

Assign Groups

☑ Group Alpha
☑ Group Beta
☑ Group Gamma
☐ Group Delta

[Save Draft]                     [Publish]
```

---

# 31. Coursework Form Principles

The form should:

* Use clear labels.
* Use sensible defaults.
* Validate immediately.
* Display useful errors.
* Avoid unnecessary fields.
* Clearly distinguish Save Draft from Publish.

Publishing should require confirmation if the action cannot easily be undone.

---

# 32. Group Leader Dashboard

The group leader dashboard should be much simpler than the lecturer dashboard.

The main focus is coursework.

Example:

```text
CLASSWORK

Group Alpha
5 Members

────────────────────────────────

Coursework

┌────────────────────────────────┐
│ Database Normalization         │
│ Due Aug 30                     │
│                                │
│ ● Not Submitted                │
│                                │
│ [Submit Work]                  │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Java Inheritance               │
│ Due Sep 05                     │
│                                │
│ ✓ Result: 18/20                │
│                                │
│ [View Result]                  │
└────────────────────────────────┘
```

---

# 33. Group Leader Navigation

Recommended navigation:

```text
Dashboard
My Group
Coursework
Results
```

The leader should not see administrative functionality.

The navigation should remain intentionally small.

---

# 34. Group Page

The group page should show members in a simple table.

```text
Group Alpha

Group Leader
John Doe
23/U/001

Members

┌─────────────────────────────────────────────┐
│ Name              Reg No.        Course     │
├─────────────────────────────────────────────┤
│ John Doe          23/U/001       BSc CS     │
│ Sarah Jane        23/U/014       BSc CS     │
│ David Mark        23/U/027       BSc CS     │
│ Peter James       23/U/032       BSc CS     │
└─────────────────────────────────────────────┘

[Edit Members]
```

---

# 35. Member Editing

The group leader should be able to edit permitted information.

Editing should use a modal or dedicated form.

Example:

```text
Edit Member

Name
[ Sarah Jane ]

Registration Number
[ 23/U/014 ]

Course
[ BSc Computer Science ]

[Cancel] [Save Changes]
```

Changes should be validated and recorded in the audit log.

---

# 36. Submission Upload

The upload experience should be simple.

```text
Database Normalization

Deadline
30 August 2026 • 11:59 PM

┌─────────────────────────────────────────────┐
│                                             │
│              Upload your work               │
│                                             │
│          PDF or Word document               │
│                                             │
│              [ Choose File ]                │
│                                             │
└─────────────────────────────────────────────┘
```

The upload interface should clearly display:

* Supported file types.
* Maximum file size.
* Deadline.
* Current submission status.

---

# 37. Upload Success

After a successful upload:

```text
✓ Submission uploaded

Database_Normalization.pdf

Submitted:
28 Aug 2026 • 14:32

[View Submission]
[Replace Submission]
```

The user should receive immediate confirmation.

---

# 38. Upload Errors

Examples:

```text
Unsupported file type.

Maximum file size exceeded.

The coursework deadline has passed.

You are not authorized to submit for this group.

Upload failed. Please try again.
```

Errors should be displayed close to the relevant action.

---

# 39. Results Page

The results page should be clear and academic.

Example:

```text
Database Normalization

                         18 / 20
                           90%

────────────────────────────────────

Feedback

Good understanding of normalization.
Examples were well presented.

────────────────────────────────────

Submitted
28 Aug 2026

Marked
30 Aug 2026
```

The result should not be unnecessarily gamified.

---

# 40. Rubric Results

If rubric marking is enabled:

```text
1NF Understanding       5/5
2NF Understanding       4/5
3NF Understanding       5/5
Examples                3/3
Presentation             2/2
                         ───
                        19/20
```

The rubric should be easy to scan.

---

# 41. Status Badges

Statuses should have consistent visual treatment.

Recommended:

```text
Submitted
    Green

Not Submitted
    Gray

Late
    Amber

Awaiting Marking
    Blue

Marked
    Blue

Result Published
    Green
```

Use both text and visual distinction.

Do not rely solely on color to communicate status.

---

# 42. Deadline Indicators

Deadlines should become increasingly prominent as they approach.

Example:

```text
Due in 7 days
```

Normal styling.

```text
Due tomorrow
```

Warning styling.

```text
Due today
```

Stronger warning styling.

```text
Late
```

Danger/warning styling.

The exact threshold can be configured later.

---

# 43. Notifications

Use a notification bell in the application header.

Examples:

```text
New Coursework

Database Normalization has been assigned.
```

```text
Result Released

Your group received 18/20 for Database Normalization.
```

```text
Deadline Reminder

Java Inheritance is due tomorrow.
```

Notifications should be concise and actionable.

---

# 44. Admin Dashboard

The admin dashboard should focus on system management.

Example:

```text
ADMIN DASHBOARD

Users
────────────────────
Lecturers          6
Group Leaders     24
Groups            24

Academic
────────────────────
Courses             8
Coursework         31
Submissions       412

System
────────────────────
Active Users
Recent Activity
Audit Logs
```

The admin does not need the same coursework-focused interface as the lecturer.

---

# 45. Admin Navigation

Recommended:

```text
Dashboard
Lecturers
Courses
Groups
Users
Coursework
Submissions
Results
Audit Logs
Settings
```

The admin navigation can be more extensive because the administrator manages the entire system.

---

# 46. Tables

Tables should be the primary component for displaying large amounts of structured information.

Use tables for:

* Groups.
* Coursework.
* Submissions.
* Results.
* Users.
* Audit logs.
* Group members.

Tables should support:

* Sorting.
* Filtering.
* Pagination where necessary.
* Search.
* Row actions.

---

# 47. Cards

Cards should be used selectively.

Good uses:

* Dashboard statistics.
* Coursework summaries.
* Upcoming deadlines.
* Important actions.
* Result summaries.

Avoid turning every database record into a large card.

---

# 48. Dialogs and Modals

Use dialogs for short operations:

* Confirm publishing.
* Delete confirmation.
* Edit member.
* Quick mark entry.
* Create simple records.

Use full pages for complex operations:

* Coursework creation.
* Document marking.
* Group management.
* Detailed results.

---

# 49. Buttons

Use a clear hierarchy.

### Primary

Used for the most important action.

Examples:

```text
Publish Coursework
Submit Work
Save Mark
```

### Secondary

Used for supporting actions.

Examples:

```text
Edit
View
Save Draft
```

### Destructive

Used for:

```text
Delete
Disable
Remove
```

Destructive actions should require confirmation where appropriate.

---

# 50. Empty States

Every major list should have a useful empty state.

Example:

```text
No coursework yet.

Create your first coursework assignment to get started.

[Create Coursework]
```

Another:

```text
No submissions yet.

Groups have not submitted work for this coursework.
```

Empty states should explain what happened and what the user can do next.

---

# 51. Loading States

The system should use skeleton loaders for major content areas.

Avoid blank screens during loading.

Examples:

```text
Dashboard
[████████████]
[████████████]
[████████████]
```

Buttons performing actions should display loading states.

Example:

```text
Uploading...
```

rather than allowing duplicate submissions.

---

# 52. Success Feedback

After successful actions, display concise confirmation.

Examples:

```text
Coursework published successfully.
```

```text
Submission uploaded successfully.
```

```text
Mark saved successfully.
```

```text
Result published successfully.
```

Toast notifications are appropriate for these operations.

---

# 53. Error Design

Errors should be understandable.

Avoid technical messages such as:

```text
PrismaClientKnownRequestError
```

Instead:

```text
Unable to save the mark.

Please check the value and try again.
```

Technical details should remain in server logs.

---

# 54. Responsive Design

The application must be responsive across:

```text
Desktop
Laptop
Tablet
Mobile
```

However, the priority differs by role.

### Group Leader

Mobile-first.

The student should be able to:

* Log in.
* View coursework.
* Upload documents.
* View results.
* Manage members.

from a phone.

### Lecturer

Desktop-first but responsive.

Document marking should be optimized for:

* Large screens.
* Laptop screens.
* Tablets where practical.

### Admin

Desktop-first.

Administrative tables require larger screens.

---

# 55. Mobile Coursework Cards

On mobile, coursework tables should transform into cards.

Example:

```text
┌─────────────────────────────┐
│ Database Normalization      │
│ Database Systems            │
│                             │
│ Due Aug 30                  │
│                             │
│ ● Not Submitted             │
│                             │
│ [Submit Work]               │
└─────────────────────────────┘
```

This prevents horizontal scrolling where possible.

---

# 56. Accessibility

The UI should follow basic accessibility principles.

Requirements include:

* Proper labels for form fields.
* Keyboard navigation.
* Visible focus states.
* Sufficient color contrast.
* Semantic HTML.
* Accessible buttons.
* Accessible dialogs.
* Text alternatives for icons.
* Do not rely on color alone.

For example:

Do not communicate:

```text
Green = submitted
Red = not submitted
```

without also displaying the actual status text.

---

# 57. Iconography

Use one consistent icon library.

Icons should support navigation and actions rather than becoming decorative elements.

Examples:

```text
Dashboard       Home
Courses         Book
Coursework      FileText
Submissions     Upload
Marking         CheckSquare
Results         Award
Groups          Users
Settings        Settings
Notifications   Bell
```

Icons should not replace important text labels on desktop navigation unless the meaning is universally clear.

---

# 58. Animation

Animations should be subtle.

Use animation for:

* Dialog opening.
* Sidebar opening.
* Toast appearance.
* Button loading.
* Small state transitions.

Avoid:

* Large page transitions.
* Excessive motion.
* Constant animated elements.
* Decorative animations.

The application should feel fast.

---

# 59. Lecturer Workflow Optimization

The lecturer workflow is the most important desktop workflow.

The system should minimize clicks.

Ideal process:

```text
Dashboard
   ↓
Coursework
   ↓
Select Coursework
   ↓
Select Group
   ↓
Open Submission
   ↓
Read Document
   ↓
Enter Mark
   ↓
Add Feedback
   ↓
Publish Result
```

The lecturer should never have to navigate through unrelated pages to perform these operations.

---

# 60. Group Leader Workflow Optimization

The leader workflow should be even simpler.

Ideal process:

```text
Dashboard
   ↓
See Coursework
   ↓
Open Coursework
   ↓
Upload File
   ↓
Confirmation
```

To check results:

```text
Dashboard
   ↓
Results
   ↓
Open Result
```

---

# 61. Navigation Principle

The application should use **progressive disclosure**.

Show users what they need first.

Do not expose every possible action at once.

For example, on the coursework page:

```text
Primary:
View Submissions

Secondary:
Edit
Duplicate
Archive
```

Advanced actions can live inside a "More" menu.

---

# 62. Design Consistency

The following should remain consistent throughout the system:

* Buttons.
* Status badges.
* Form controls.
* Tables.
* Spacing.
* Typography.
* Icons.
* Colors.
* Dialogs.
* Notifications.
* Error messages.
* Loading states.

A user should immediately recognize that every page belongs to the same application.

---

# 63. Design Tokens

The application should maintain centralized design tokens for:

```text
Colors
Typography
Spacing
Border radius
Shadows
Breakpoints
Transitions
```

Components should consume these tokens instead of independently defining styles.

---

# 64. Recommended Page Structure

Most pages should follow:

```text
┌────────────────────────────────────────────┐
│ Page Title                    Primary Action│
│ Short description                          │
├────────────────────────────────────────────┤
│                                            │
│ Filters / Search                           │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│ Main Content                               │
│                                            │
└────────────────────────────────────────────┘
```

This creates a predictable interface.

---

# 65. Recommended Design by Role

## Administrator

```text
Style:
Management dashboard

Primary UI:
Tables + statistics

Main concern:
System administration
```

## Lecturer

```text
Style:
Academic productivity workspace

Primary UI:
Tables + submission tracking + document viewer

Main concern:
Coursework and marking
```

## Group Leader

```text
Style:
Simple student workspace

Primary UI:
Coursework cards + upload interface + results

Main concern:
Submission and results
```

---

# 66. Final Design Direction

The final design should be:

```text
Modern Academic SaaS
        │
        ├── Clean light interface
        │
        ├── Slate/white foundation
        │
        ├── Deep blue/indigo accent
        │
        ├── Desktop sidebar
        │
        ├── Responsive mobile drawer
        │
        ├── Tables for management
        │
        ├── Cards for summaries
        │
        ├── Dedicated marking workspace
        │
        ├── Minimal animations
        │
        └── Strong information hierarchy
```

---

# 67. Final UX Priorities

The implementation should prioritize these experiences in order:

### Priority 1 — Lecturer Marking

The lecturer must be able to open a submission, read it, mark it, add feedback, and publish the result with minimal friction.

### Priority 2 — Coursework Tracking

The lecturer must immediately know:

* Who submitted.
* Who has not submitted.
* Who submitted late.
* Who still needs marking.

### Priority 3 — Student Submission

The group leader must be able to submit coursework quickly from desktop or mobile.

### Priority 4 — Results

Group leaders must be able to immediately understand:

* Their mark.
* Maximum mark.
* Feedback.
* Submission date.
* Marking date.

### Priority 5 — Administration

The administrator must be able to maintain the class structure without interfering with normal academic workflows.

---

# 68. Final Design Specification

```text
Design Style:
Modern Academic SaaS

Theme:
Light-first

Layout:
Desktop sidebar + responsive mobile navigation

Primary Color:
Deep Blue / Indigo

Background:
Light Slate

Surfaces:
White

Typography:
Clean, readable, moderate sizing

Components:
shadcn/ui

Styling:
Tailwind CSS

Tables:
Primary data-management interface

Cards:
Dashboard summaries and actionable information

Marking:
Split-screen document viewer + marking panel

Student UI:
Simple and mobile-friendly

Lecturer UI:
Desktop-focused productivity workspace

Admin UI:
Management-focused dashboard

Animation:
Minimal and functional

Shadows:
Subtle

Gradients:
Avoid

Glows:
Avoid

Visual clutter:
Avoid
```

---

# 69. Core Design Principle

The entire interface should ultimately follow one principle:

> **Make the next important action obvious.**

The lecturer should immediately see which work needs marking.

The group leader should immediately see which coursework needs submission.

The administrator should immediately see what needs to be configured or managed.

The system should feel **professional, fast, and calm**, with the interface getting out of the user's way rather than competing for attention.

