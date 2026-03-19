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
function calculateaverageMarks(student) {
  const total = calculatetotalmarks(student);
  const numberOfSubjects = student.marks.length;
  return total / numberOfSubjects;
}

console.log("\nAverage Marks For Each Student: ");
for (let i = 0; i < students.length; i++) {
  const average = calculateaverageMarks(students[i]);
  console.log(`${students[i].name} Average: ${average.toFixed(2)}`);
}

// Function to find highest score in a subject
function findhighestinsubject(subjectName) {
  let highest = {
    name: "",
    score: -1
  };

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