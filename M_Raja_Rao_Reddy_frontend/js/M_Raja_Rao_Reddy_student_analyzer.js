const students = [
  {
    name: "Lalit",
    marks: [
      { subject: "Math", score: 78 },
      { subject: "English", score: 82 },
      { subject: "Science", score: 74 },
      { subject: "History", score: 69 },
      { subject: "Computer", score: 88 }
    ],
    attendance: 82
  },
  {
    name: "Rahul",
    marks: [
      { subject: "Math", score: 90 },
      { subject: "English", score: 85 },
      { subject: "Science", score: 80 },
      { subject: "History", score: 76 },
      { subject: "Computer", score: 92 }
    ],
    attendance: 91
  },
  {
    name: "Priya",
    marks: [
      { subject: "Math", score: 88 },
      { subject: "English", score: 90 },
      { subject: "Science", score: 85 },
      { subject: "History", score: 88 },
      { subject: "Computer", score: 87 }
    ],
    attendance: 95
  }
];
console.log(students);

// 2.2 Required Calculations

// Function to calculate total marks for a student
function calculatetotalmarks(student) {
  let total = 0;
  // Loop through each subject and keep adding scores
  for (let i = 0; i < student.marks.length; i++) {
    total += student.marks[i].score;
  }
  
  return total;
}

console.log("\nTotal Marks For Each Student: ");
for (let i = 0; i < students.length; i++) {
  const total = calculatetotalmarks(students[i]);
  console.log(`${students[i].name} Total Marks: ${total}`);
}

// Function to calculate average marks for a student
function calculateaveragemarks(student) {
  const total = calculatetotalmarks(student);
  const numberOfSubjects = student.marks.length;
  return total / numberOfSubjects;
}

console.log("\nAverage Marks For Each Student: ");
for (let i = 0; i < students.length; i++) {
  const average = calculateaveragemarks(students[i]);
  console.log(`${students[i].name} Average: ${average.toFixed(2)}`);
}

// Function to find highest score in a subject
function findhighestinsubject(subjectName) {
  let highest = {
    name: "",
    score: -1 // start with lowest possible value
  };

  // Loop through all students
  for (let i = 0; i < students.length; i++) {
    // Loop through each subject of a student
    for (let j = 0; j < students[i].marks.length; j++) {
      // Check if subject matches
      if (students[i].marks[j].subject === subjectName) {
        // Update if current score is higher
        if (students[i].marks[j].score > highest.score) {
          highest.name = students[i].name;
          highest.score = students[i].marks[j].score;
        }
      }
    }
  }
  
  return highest;
}

console.log("\nSubject-Wise Highest Scores:");
const subjects = ["Math", "English", "Science", "History", "Computer"];

for (let i = 0; i < subjects.length; i++) {
  const highest = findhighestinsubject(subjects[i]);
  console.log(`Highest in ${subjects[i]}: ${highest.name} (${highest.score})`);
}


// Function to calculate average score for a subject
function calculateSubjectAverage(subjectName) {
  let total = 0;
  let count = 0;
  
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

console.log("\nSubject-Wise Average Scores:");

for (let i = 0; i < subjects.length; i++) {
  const average = calculateSubjectAverage(subjects[i]);
  console.log(`Average ${subjects[i]} Score: ${average.toFixed(2)}`);
}

// Function to find class topper
function findClassTopper() {
  let topper = {
    name: "",
    totalMarks: -1
  };
  
  for (let i = 0; i < students.length; i++) {
    const total = calculatetotalmarks(students[i]);
    
    if (total > topper.totalMarks) {
      topper.name = students[i].name;
      topper.totalMarks = total;
    }
  }
  
  return topper;
}

const topper = findClassTopper();
console.log(`Class Topper: ${topper.name} with ${topper.totalMarks} marks`);

//2.3 Grade Logic 

// Function to assign grade to a student
function assignGrade(student) {
  const average = calculateaveragemarks(student);
  // First check fail conditions
  for (let i = 0; i < student.marks.length; i++) {
    if (student.marks[i].score <= 40) {
      return {
        grade: "Fail",
        reason: `Failed in ${student.marks[i].subject}`
      };
    }
  }
  if (student.attendance < 75) {
    return {
      grade: "Fail",
      reason: "Low Attendance"
    };
  }
  if (average >= 85) {
    return {
      grade: "A",
      reason: ""
    };
  } else if (average >= 70) {
    return {
      grade: "B",
      reason: ""
    };
  } else if (average >= 50) {
    return {
      grade: "C",
      reason: ""
    };
  } else {
    return {
      grade: "Fail",
      reason: "Low Average"
    };
  }
}

console.log("\nGrades:");
for (let i = 0; i < students.length; i++) {
  const gradeInfo = assignGrade(students[i]);
  
  // Show reason only if there is one
  if (gradeInfo.reason) {
    console.log(`${students[i].name} Grade: ${gradeInfo.grade} (${gradeInfo.reason})`);
  } else {
    console.log(`${students[i].name} Grade: ${gradeInfo.grade}`);
  }
}