# Class Coursework Management System — Business Logic

## 1. System Overview

The Class Coursework Management System is a group-based academic coursework management platform designed for a class where students work in groups.

The system allows:

* Group leaders to manage their group information and submit coursework.
* Lecturers to create and publish coursework, receive submissions, mark them, and publish results.
* An administrator to manage lecturers, courses, groups, users, and the overall system.

The system intentionally does **not** require every student to create an account.

Only three types of users have system accounts:

1. **Administrator**
2. **Lecturer**
3. **Group Leader**

Other students are stored as group members under their respective group.

---

# 2. Core Business Model

The system is built around the following relationship:

```text
Course
   │
   ├── Lecturer
   │
   ├── Groups
   │     │
   │     ├── Group Leader
   │     │
   │     └── Group Members
   │
   └── Coursework
          │
          ├── Assigned Groups
          │
          └── Submissions
                 │
                 └── Marks & Feedback
```

A group is the primary academic unit for coursework submission.

A submission belongs to:

* One coursework
* One group
* One submission version

The mark belongs to the submitted work rather than directly to the group.

---

# 3. User Roles

## 3.1 Administrator

The administrator is the highest-level system user.

The administrator manages the structure of the platform but does not normally participate in day-to-day coursework marking.

### Administrator capabilities

The administrator can:

* Create lecturer accounts.
* Edit lecturer information.
* Disable or activate lecturer accounts.
* Create courses.
* Assign lecturers to courses.
* Create groups.
* Assign groups to courses.
* Assign group leaders.
* View all groups.
* View all group members.
* View all coursework.
* View all submissions.
* View results.
* View system activity.
* Correct administrative mistakes.
* Manage system-wide settings.

### Administrator restrictions

The administrator should not automatically modify academic marks unless the system explicitly provides an administrative override.

Any modification to marks by an administrator should be recorded in the audit log.

---

# 4. Lecturer

A lecturer is responsible for academic coursework.

A lecturer can only manage courses and groups assigned to them.

### Lecturer capabilities

The lecturer can:

* View assigned courses.
* View groups belonging to their courses.
* Create coursework.
* Edit unpublished coursework.
* Publish coursework.
* Assign coursework to selected groups.
* Set deadlines.
* Set maximum marks.
* View submissions.
* Open submitted documents.
* Mark submissions.
* Add feedback.
* Publish results.
* View submitted and unsubmitted groups.
* Identify late submissions.
* View previous coursework.
* View group performance.

### Lecturer restrictions

A lecturer cannot:

* Access another lecturer's courses unless explicitly authorized.
* Modify group membership without the appropriate permission.
* Access administrator functions.
* Modify another lecturer's coursework.
* Change published marks without an appropriate audit record.

---

# 5. Group Leader

The group leader is the only student who requires a login account.

The leader represents the entire group for coursework submission.

### Group leader capabilities

The group leader can:

* Log in.
* View their group.
* View group members.
* Add or edit permitted member information.
* View assigned coursework.
* View coursework instructions.
* Upload coursework.
* Replace a submission where permitted.
* View submission status.
* View published marks.
* View lecturer feedback.
* View previous results.

### Group leader restrictions

The group leader cannot:

* Create another user account.
* Create another group.
* Access another group.
* View another group's submissions.
* View another group's marks.
* Mark coursework.
* Modify lecturer feedback.
* Create coursework.
* Change deadlines.
* Access administrator or lecturer functions.

---

# 6. Group Structure

A group consists of:

* One group leader account.
* Zero or more group members.

Example:

```text
Group Alpha
│
├── John Doe
│   Registration: 23/U/001
│   Role: Group Leader
│
├── Sarah Jane
│   Registration: 23/U/014
│   Role: Member
│
├── David Mark
│   Registration: 23/U/027
│   Role: Member
│
└── Peter James
    Registration: 23/U/032
    Role: Member
```

Only John Doe requires an account.

The other students are stored as group member records.

---

# 7. Group Membership Rules

Each group must have:

* A unique group identifier.
* A group name.
* One designated group leader.
* A course association.
* Its members.

A group leader can manage permitted information about their group members.

However, membership changes should be controlled after coursework activity has started.

For example, after a group has submitted coursework, unrestricted deletion of members should not be allowed.

Changes to group membership should be recorded in the audit log.

---

# 8. Course

A course represents an academic subject handled by a lecturer.

A course contains:

* Course name.
* Course code.
* Lecturer.
* Groups belonging to the course.
* Coursework belonging to the course.

Example:

```text
Course:
Database Systems

Code:
CSC 204

Lecturer:
Dr. Example

Groups:
Group Alpha
Group Beta
Group Gamma
Group Delta
```

A lecturer should only see coursework and groups associated with their courses.

---

# 9. Coursework

Coursework is created by a lecturer and assigned to one or more groups.

A coursework item contains:

* Title.
* Instructions/task description.
* Course.
* Lecturer.
* Maximum marks.
* Deadline.
* Assigned groups.
* Publication status.
* Creation date.
* Publication date.

Example:

```text
Title:
Database Normalization

Course:
Database Systems

Instructions:
Explain 1NF, 2NF and 3NF with suitable examples.

Maximum Marks:
20

Deadline:
30 August 2026, 11:59 PM

Assigned Groups:
Group Alpha
Group Beta
Group Gamma
```

---

# 10. Coursework Lifecycle

Coursework follows a defined lifecycle.

```text
DRAFT
  │
  ▼
PUBLISHED
  │
  ▼
DEADLINE REACHED
  │
  ▼
MARKING
  │
  ▼
RESULTS PUBLISHED
  │
  ▼
COMPLETED
```

## Draft

The lecturer is preparing the coursework.

Groups cannot see it until it is published.

## Published

The selected groups can see the coursework and submit their work.

## Deadline Reached

The deadline has passed.

Depending on the lecturer's settings, late submissions may either be accepted or rejected.

## Marking

The lecturer is reviewing submissions and awarding marks.

## Results Published

Marks and feedback become visible to the relevant group leader.

## Completed

The coursework is retained as historical academic data.

---

# 11. Assigning Coursework to Groups

A lecturer does not necessarily have to assign coursework to every group.

The lecturer can select specific groups.

Example:

```text
Coursework:
Java Inheritance

Assigned Groups:

☑ Group Alpha
☑ Group Beta
☐ Group Gamma
☑ Group Delta
☐ Group Echo
```

Only selected groups receive the coursework.

This allows lecturers to give different coursework to different groups where necessary.

---

# 12. Coursework Submission

A group submits coursework through its group leader account.

The system should support:

* PDF
* Microsoft Word documents (`.docx`)

The submission must be associated with:

* Coursework.
* Group.
* Uploaded file.
* Submission date/time.
* Submission status.
* Submission version.

Example:

```text
Group:
Group Alpha

Coursework:
Database Normalization

File:
Database_Normalization.docx

Submitted:
28 August 2026, 14:32

Status:
SUBMITTED
```

---

# 13. Submission Rules

A group can normally have one active submission for a coursework item.

If the lecturer allows resubmission, the group leader can replace the existing submission.

The system should preserve submission history.

Example:

```text
Submission Version 1
        │
        ▼
Submission Version 2
        │
        ▼
Submission Version 3
```

The latest valid submission becomes the active submission.

Previous versions should remain available to authorized users for auditing.

---

# 14. Submission Status

Every coursework/group combination should have a submission status.

Recommended statuses:

```text
NOT_SUBMITTED
SUBMITTED
LATE
MARKED
RESULT_PUBLISHED
```

### NOT_SUBMITTED

The group has not uploaded work before the current time.

### SUBMITTED

The group submitted before the deadline.

### LATE

The group submitted after the deadline and late submissions are allowed.

### MARKED

The lecturer has awarded marks, but the result has not necessarily been released to the group.

### RESULT_PUBLISHED

The lecturer has released the mark and feedback to the group leader.

---

# 15. Deadline Logic

The deadline is stored with the coursework.

The system compares the current time against the coursework deadline.

Example:

```text
Deadline:
30 August 2026 23:59

Current time:
30 August 2026 20:00

Result:
Submission is ON TIME
```

If:

```text
Current time:
31 August 2026 08:00
```

then:

```text
Result:
Deadline has passed
```

The system should use one consistent timezone configured for the academic institution/class.

---

# 16. Late Submission Rules

Late submission behavior should be configurable.

Possible settings:

```text
Allow late submissions:
YES / NO
```

If late submissions are disabled:

```text
Deadline passed
        │
        ▼
Upload rejected
```

If late submissions are enabled:

```text
Deadline passed
        │
        ▼
Upload accepted
        │
        ▼
Status = LATE
```

The lecturer should be able to identify late submissions easily.

---

# 17. Document Viewing

The lecturer should be able to open submitted work from the browser without unnecessary downloading.

The desired workflow is:

```text
Submissions
     │
     ▼
Select Group
     │
     ▼
Open Submission
     │
     ├── Document Viewer
     │
     └── Marking Panel
```

PDF files should be viewable directly in the browser.

Word documents should be rendered or converted into a browser-friendly viewing format.

The lecturer should not have to repeatedly download files to mark normal coursework.

---

# 18. Marking

Each submission can receive a mark.

Example:

```text
Group Alpha

Maximum Marks:
20

Awarded:
18

Feedback:
Good understanding of normalization.
Examples could be improved.
```

The mark must satisfy:

```text
0 <= awarded_marks <= maximum_marks
```

For example:

```text
Maximum = 20

Valid:
0
10
18
20

Invalid:
-1
21
25
```

---

# 19. Marking Schemes

The system can support two marking methods.

## Simple Marking

The lecturer enters a single mark:

```text
Marks:
[ 18 ] / 20

Feedback:
[............................]

[Save]
```

## Rubric Marking

The lecturer can divide the marks into criteria.

Example:

```text
1NF Understanding       5 marks
2NF Understanding       5 marks
3NF Understanding       5 marks
Examples                3 marks
Presentation             2 marks
                         ───────
                         20 marks
```

The system calculates the total automatically.

Rubric marking should be optional so that simple coursework remains fast to mark.

---

# 20. Marking States

A submission should distinguish between:

```text
MARK NOT ENTERED
MARK SAVED
RESULT PUBLISHED
```

The lecturer can save a mark without immediately exposing it to the student.

Example:

```text
Lecturer marks:
18/20

Status:
MARKED

Student:
Cannot see result yet
```

After the lecturer publishes the result:

```text
Status:
RESULT_PUBLISHED

Student:
Can see 18/20
```

This prevents students from seeing incomplete marking.

---

# 21. Feedback

The lecturer can provide feedback for a submission.

Feedback should be stored together with the mark.

Example:

```text
Marks:
18/20

Feedback:
Strong explanation and good examples.
Improve the discussion of 3NF.
```

The group leader can view feedback after the result is published.

---

# 22. Results

Results are associated with the group's submission.

The group leader dashboard should show:

```text
MY RESULTS

Database Normalization
18 / 20

Java Inheritance
16 / 20

Operating Systems
19 / 20
```

The group leader should only see their own group's results.

---

# 23. Lecturer Submission Monitoring

For every coursework item, the lecturer should be able to see the submission state of every assigned group.

Example:

```text
Database Normalization

Group          Status             Marks
------------------------------------------------
Alpha          Result Published   18/20
Beta           Marked             15/20
Gamma          Submitted          —
Delta          Not Submitted      —
Echo           Late               —
```

This allows the lecturer to immediately identify groups that require attention.

---

# 24. Missing Submission Logic

The system should automatically identify groups that have not submitted.

For example:

```text
Coursework:
Database Normalization

Assigned Groups:
20

Submitted:
15

Late:
2

Not Submitted:
3
```

The lecturer can then open:

```text
Not Submitted

Group Gamma
Group Delta
Group Omega
```

The system should calculate this dynamically rather than relying on the lecturer to manually maintain a list.

---

# 25. Lecturer Dashboard

The lecturer dashboard should provide an overview of academic activity.

Example:

```text
COURSES
4

ACTIVE COURSEWORK
3

AWAITING MARKING
8

NOT SUBMITTED
5

LATE SUBMISSIONS
2
```

The lecturer should also see recent coursework and its current submission status.

---

# 26. Group Leader Dashboard

The group leader dashboard should prioritize the group's immediate tasks.

Example:

```text
GROUP ALPHA

Members:
5

COURSEWORK TO SUBMIT:
2

SUBMITTED:
3

RESULTS AVAILABLE:
4
```

The dashboard should show upcoming deadlines.

Example:

```text
Database Normalization
Due in 2 days

Status:
NOT SUBMITTED

[Submit Work]
```

---

# 27. Upcoming Coursework

Lecturers can publish future coursework.

Group leaders should see upcoming coursework after publication.

Example:

```text
UPCOMING

Java Inheritance
Deadline: 5 September

Operating Systems
Deadline: 12 September
```

This allows students to plan their work.

---

# 28. Access Control

Access control is a critical business rule.

The backend must verify ownership and permissions for every protected operation.

### Group Leader

Can access:

```text
Their own user account
Their own group
Their group's members
Their group's coursework
Their group's submissions
Their group's published results
```

Cannot access:

```text
Another group
Another group's submission
Another group's marks
Another lecturer's coursework
Admin functions
```

### Lecturer

Can access:

```text
Their courses
Their groups
Their coursework
Submissions belonging to their coursework
Marks for their coursework
```

Cannot access unrelated lecturer data.

### Administrator

Can access all system data subject to system policies.

---

# 29. Audit Logging

Important actions should be recorded.

Examples:

```text
Admin created lecturer account.

Lecturer created coursework.

Lecturer published coursework.

Group Alpha submitted Database Normalization.

Lecturer awarded Group Alpha 18/20.

Lecturer published Group Alpha's result.

Group Leader edited member information.
```

Audit records should contain:

* User.
* Action.
* Resource affected.
* Date/time.
* Relevant details.

Marks and membership changes are particularly important to audit.

---

# 30. Data Integrity Rules

The system should enforce important constraints.

### Groups

* A group must belong to a course.
* A group should have one group leader.
* A group member should belong to a valid group.

### Coursework

* Coursework must belong to a course.
* Coursework must have a title.
* Coursework must have instructions.
* Coursework must have a deadline.
* Maximum marks must be greater than zero.

### Submissions

* A submission must belong to an assigned group.
* A submission must belong to existing coursework.
* Unsupported file types must be rejected.
* File size limits must be enforced.

### Marks

* Marks cannot exceed maximum marks.
* Marks cannot be negative.
* Only authorized lecturers can create or modify marks.
* Published results should maintain an audit history.

---

# 31. File Rules

The initial system supports:

```text
.pdf
.docx
```

Unsupported files should be rejected.

Examples of unsupported files:

```text
.exe
.zip
.apk
.js
.html
```

File uploads should have:

* Maximum file size.
* Valid MIME type checking.
* Secure storage.
* Non-public storage where appropriate.
* Access controlled through the application.

The original filename should be preserved for display, while the internal storage filename/path should be generated securely.

---

# 32. Result Visibility

Marks should not automatically become visible immediately after the lecturer enters them.

Recommended process:

```text
Lecturer enters mark
       │
       ▼
MARKED
       │
       ▼
Lecturer reviews
       │
       ▼
Publish Result
       │
       ▼
RESULT_PUBLISHED
       │
       ▼
Group Leader sees result
```

This gives the lecturer control over when results become visible.

---

# 33. Historical Records

Completed coursework should remain available.

The system should not delete academic records simply because the deadline has passed.

A lecturer should be able to view:

```text
Current Coursework
Past Coursework
Previous Submissions
Previous Results
```

This creates a historical academic record for the class.

---

# 34. Recommended Core Entities

The initial business domain consists of:

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

Relationships:

```text
User
 ├── Lecturer
 └── Group Leader

Lecturer
 └── Courses

Course
 ├── Groups
 └── Coursework

Group
 ├── Group Leader
 ├── Group Members
 └── Submissions

Coursework
 ├── Assigned Groups
 └── Submissions

Submission
 └── Mark

User
 └── Audit Logs
```

---

# 35. Complete Business Workflow

The complete normal workflow should be:

```text
1. Administrator creates lecturer.

2. Administrator creates course.

3. Administrator creates groups.

4. Administrator assigns group leaders.

5. Group leader adds/updates group members.

6. Lecturer opens their course.

7. Lecturer creates coursework.

8. Lecturer enters:
   - Title
   - Instructions
   - Maximum marks
   - Deadline

9. Lecturer selects groups.

10. Lecturer publishes coursework.

11. Assigned group leaders receive coursework.

12. Group leader opens coursework.

13. Group leader uploads PDF/DOCX.

14. System validates the submission.

15. System records submission date/time.

16. System determines whether submission is on time or late.

17. Lecturer sees the submission on their dashboard.

18. Lecturer opens the document.

19. Lecturer awards marks.

20. Lecturer adds feedback.

21. System validates the mark.

22. Lecturer saves the result.

23. Lecturer publishes the result.

24. Group leader sees the result.

25. Coursework remains available as historical data.
```

---

# 36. MVP Business Rules

The first version should focus on the following:

* [ ] Three roles: Admin, Lecturer, Group Leader.
* [ ] Only group leaders require student accounts.
* [ ] Group members are stored as records.
* [ ] Groups belong to courses.
* [ ] Lecturers manage their assigned courses.
* [ ] Lecturers create coursework.
* [ ] Coursework can be assigned to selected groups.
* [ ] Coursework has a deadline.
* [ ] Group leaders can upload PDF/DOCX files.
* [ ] The system records submission time.
* [ ] The system identifies late submissions.
* [ ] Lecturers can view submissions.
* [ ] Lecturers can mark submissions.
* [ ] Lecturers can provide feedback.
* [ ] Lecturers can publish results.
* [ ] Group leaders can view published results.
* [ ] Lecturers can see submitted and unsubmitted groups.
* [ ] Access is restricted according to user role.
* [ ] Important actions are logged.
* [ ] Previous coursework and results remain accessible.

---

# 37. Future Business Features

After the core system is stable, the following can be added:

* Email notifications.
* WhatsApp notifications.
* Automatic submission reminders.
* Lecturer announcements.
* Rubric templates.
* Excel result export.
* PDF result reports.
* Class performance analytics.
* Individual student performance tracking.
* Coursework extensions.
* Resubmission rules.
* Plagiarism-check integration.
* Multiple lecturers per course.
* Multiple courses per group.
* Academic semesters.
* Archived academic years.
* Student accounts for individual tracking.
* Parent/student notifications where appropriate.

These should remain outside the initial MVP so that the core coursework workflow stays simple and reliable.
