package MRajaRaoReddy_java_training.session1.OOP;

// Implement inheritance to create a "GraduateStudent" class that extends the "Student" class with additional features.

//Parent class: Student
class Student {
    private String name;
    private int studentId;

    // Constructor
    public Student(String name, int studentId) {
        this.name = name;
        this.studentId = studentId;
    }

    // Getter methods
    public String getName() {
        return name;
    }

    public int getStudentId() {
        return studentId;
    }

    // Display student details
    public void displayInfo() {
        System.out.println("Student Name: " + name);
        System.out.println("Student ID: " + studentId);
    }
}

// Child class: GraduateStudent (inherits from Student)
class GraduateStudent extends Student {
    private String researchTopic;
    private String advisorName;

    // Constructor (using super to call parent constructor)
    public GraduateStudent(String name, int studentId, String researchTopic, String advisorName) {
        super(name, studentId); // Calls parent class constructor
        this.researchTopic = researchTopic;
        this.advisorName = advisorName;
    }

    public void displayResearchDetails() {
        displayInfo(); // Calling parent method
        System.out.println("Research Topic: " + researchTopic);
        System.out.println("Advisor: " + advisorName);
    }
}

public class Inheritance {
    public static void main(String[] args) {
        // Creating a GraduateStudent object
        GraduateStudent gradStudent = new GraduateStudent("M Raja Rao Reddy", 100, "Java Programming",
                "Dr. Smith");

        // Displaying details
        gradStudent.displayResearchDetails();
    }
}