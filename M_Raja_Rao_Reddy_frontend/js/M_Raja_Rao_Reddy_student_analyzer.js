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