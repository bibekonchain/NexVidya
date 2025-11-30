graph TD

StudentObj["Student
---------------
name: Bibek
email: bibek@example.com
purchasedCourses: [Course1]"]

InstructorObj["Instructor
---------------
name: Raman
status: Approved
createdCourses: [Course1]"]

AdminObj["Admin
---------------
name: SystemAdmin
permissions: All"]

CourseObj["Course
---------------
title: MERN Mastery
price: $40
lectures: 20"]

CertificateObj["Certificate
---------------
student: Bibek
course: MERN Mastery
issuedDate: 2025-11-20"]

StudentObj -->|purchased| CourseObj
InstructorObj -->|created| CourseObj
AdminObj -->|manages| InstructorObj
StudentObj -->|receives| CertificateObj
