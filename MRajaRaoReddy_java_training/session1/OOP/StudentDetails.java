package MRajaRaoReddy_java_training.session1.OOP;

// Create a class to represent a student with attributes like name, roll number, and marks. 


// Defining the Student class
class Student {
    private String name;
    private int rollNumber;
    private double marks;

    // Constructor to initialize student details
    public Student(String name, int rollNumber, double marks) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.marks = marks;
    }

    // Getter methods
    public String getName() {
        return name;
    }

    public int getRollNumber() {
        return rollNumber;
    }

    public double getMarks() {
        return marks;
    }

    // Setter methods
    public void setName(String name) {
        this.name = name;
    }

    public void setRollNumber(int rollNumber) {
        this.rollNumber = rollNumber;
    }

    public void setMarks(double marks) {
        this.marks = marks;
    }

    // Method to display student details
    public void displayStudentInfo() {
        System.out.println("Student Name: " + name);
        System.out.println("Roll Number: " + rollNumber);
        System.out.println("Marks: " + marks);
    }
}

public class StudentDetails {
    public static void main(String[] args) {
        // Creating Student objects
        Student student1 = new Student("M Raja Rao Reddy", 101, 92.5);
        Student student2 = new Student("John Doe", 102, 85.0);

        // Displaying student details
        System.out.println("Student 1 Details:");
        student1.displayStudentInfo();

        System.out.println("\nStudent 2 Details:");
        student2.displayStudentInfo();
    }
}
