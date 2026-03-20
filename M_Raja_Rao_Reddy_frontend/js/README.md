# Student Performance Analyzer - JavaScript Assignment

## 📊 Console Output Screenshots & Explanations
 
### Screenshot 1: Add Multiple Students
 
#### Code:
![Code for student data structure](screenshots/Screenshot%202026-03-19%20212015.png)
 
**What This Shows:**
- Initial student data structure with arrays of students
- Each student object contains: name, marks array, and attendance
- Shows 3 different students across multiple categories
 
#### Output:
![Student data initialization output](screenshots/Screenshot%202026-03-19%20212137.png)
 
---
 
### Screenshot 2: Calculate Total Marks
 
**What This Demonstrates:**
- `calculatetotalmarks()` function adds all subject scores
- Loops through each subject in the marks array
- Returns complete total for each student
- Shows accurate sum calculation
 
#### Output:
![Total marks calculation output](screenshots/Screenshot%202026-03-19%20214642.png)
 
**Calculations Shown:**
- Lalit: 78 + 82 + 74 + 69 + 88 = 391 ✓
- Rahul: 90 + 85 + 80 + 76 + 92 = 423 ✓
- Priya: 88 + 90 + 85 + 88 + 87 = 438 ✓
 
**Code Logic Used:**
```javascript
// Initialize total to 0
let total = 0;
 
// Loop through each subject score
for (let i = 0; i < student.marks.length; i++) {
    total += student.marks[i].score;
}
 
// Return the total
return total;
```
---
 
### Screenshot 3: Calculate Average Marks
 
**What This Demonstrates:**
- `calculateaveragemarks()` function divides total by number of subjects
- Displays 2 decimal places for precision
 
#### Output:
![Average marks calculation output](screenshots/Screenshot%202026-03-19%20215536.png)
 
**Calculations Shown:**
- Lalit: 391 ÷ 5 = 78.20 ✓
- Rahul: 423 ÷ 5 = 84.60 ✓
- Priya: 438 ÷ 5 = 87.60 ✓
 
**Code Logic Used:**
```javascript
// Calculate total first
const total = calculatetotalmarks(student);
 
// Get number of subjects
const numberOfSubjects = student.marks.length;
 
// Return average
return total / numberOfSubjects;
```

---
 
### Screenshot 4: Subject-Wise Highest Score
 
**What This Demonstrates:**
- `findhighestinsubject()` uses nested loops effectively
- Searches across all students for each subject
- Correctly identifies highest scorer per subject
- Shows both name and score
 
#### Output:
![Subject-wise highest scores output](screenshots/Screenshot%202026-03-19%20220009.png)
 
**Results Shown:**
- Highest in Math: Rahul (90)
- Highest in English: Priya (90)
- Highest in Science: Priya (85)
- Highest in History: Priya (88)
- Highest in Computer: Rahul (92)
 
**Nested Loop Logic:**
```
For each subject (Math, English, Science, History, Computer):
    └─ Loop through all students (Lalit, Rahul, Priya):
        ├─ Check if student has this subject
        ├─ Compare score with current highest
        ├─ If higher, update highest
        └─ Continue to next student
    └─ Display the highest scorer
```
 
**Code Structure:**
```javascript
function findhighestinsubject(subjectName) {
    let highest = { name: "", score: -1 };
    
    // Outer loop: all students
    for (let i = 0; i < students.length; i++) {
        for (let j = 0; j < students[i].marks.length; j++) {
            if (students[i].marks[j].subject === subjectName) {
                if (students[i].marks[j].score > highest.score) {
                    highest.name = students[i].name;
                    highest.score = students[i].marks[j].score;
                }
            }
        }
    }
    
    return highest;
}
```
 
**Why Nested Loops Matter:**
- Outer loop: Iterates through all 5 students
- Inner loop: Checks each student's 5 subjects
- Comparison: Finds the maximum in each subject
- This demonstrates understanding of multi-dimensional data
 
---
 
### Screenshot 5: Subject-Wise Average Score
 
**What This Demonstrates:**
- `calculateSubjectAverage()` function across all students
- Shows class-level performance by subject

#### Output:
![Subject-wise average scores output](screenshots/Screenshot%202026-03-19%20220723.png)
 
**Calculations Shown:**
```
Math Average: (78 + 90 + 88) ÷ 3 = 85.33 ✓
English Average: (82 + 85 + 90) ÷ 3 = 85.67 ✓
Science Average: (74 + 80 + 85) ÷ 3 = 79.67 ✓
History Average: (69 + 76 + 88) ÷ 3 = 77.67 ✓
Computer Average: (88 + 92 + 87) ÷ 3 = 89.00 ✓
```
 
**Code Logic Used:**
```javascript
function calculateSubjectAverage(subjectName) {
    let total = 0;
    let count = 0;
    
    // Find all scores for this subject
    for (let i = 0; i < students.length; i++) {
        for (let j = 0; j < students[i].marks.length; j++) {
            if (students[i].marks[j].subject === subjectName) {
                total += students[i].marks[j].score;
                count++;
            }
        }
    }
    
    return total / count;
}
```
---
 
### Screenshot 6: Class Topper Identification
 
**What This Demonstrates:**
- `findClassTopper()` identifies student with highest total marks
- Correctly identifies overall best performer
- Shows comparison logic across all students
- Priya is the clear class leader
 
#### Output:
![Class topper identification output](screenshots/Screenshot%202026-03-19%20221502.png)
 
**Result Shown:**
```
Class Topper: Priya with 438 marks
```
 
**How It Works:**
```
Compare all totals:
- Lalit: 391
- Rahul: 423
- Priya: 438 ← HIGHEST
 
Winner: Priya with 438 marks
```
 
**Code Logic Used:**
```javascript
function findClassTopper() {
    let topper = { name: "", totalMarks: -1 };
    
    // Loop through all students
    for (let i = 0; i < students.length; i++) {
        const total = calculatetotalmarks(students[i]);
        
        // Update if this student has higher total
        if (total > topper.totalMarks) {
            topper.name = students[i].name;
            topper.totalMarks = total;
        }
    }
    
    return topper;
}
```
 
---
 
### Screenshot 7: Grade Assignment Logic
 
**What This Demonstrates:**
- `assignGrade()` function with complete conditional logic
- Implements grade scale: A (85+), B (70-84), C (50-69), Fail (<50)
- Handles multiple fail conditions
- Prioritizes fail conditions over grade scale
- Shows complex decision-making
 
#### Code:
![Grade assignment logic code](screenshots/Screenshot%202026-03-19%20222958.png)

 
#### Output:
![Grade assignment output](screenshots/Screenshot%202026-03-19%20222541.png)