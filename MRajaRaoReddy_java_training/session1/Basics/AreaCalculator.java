package MRajaRaoReddy_java_training.session1.Basics;

import java.util.Scanner;

// 1)  Write a program to calculate the area of a circle, rectangle, or triangle based on user input.

public class AreaCalculator {
     public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter the Digit for Area Calculation: ");
        System.out.println("1. Circle");
        System.out.println("2. Rectangle");
        System.out.println("3. Triangle");
        int choice = scanner.nextInt();

        switch (choice) {
            case 1:
                System.out.print("Enter the radius of the circle: ");
                double radius = scanner.nextDouble();
                System.out.println("Area of the circle: " + (Math.PI * radius * radius));
                break;
            case 2:
                System.out.print("Enter the length of the rectangle: ");
                double length = scanner.nextDouble();
                System.out.print("Enter the width of the rectangle: ");
                double width = scanner.nextDouble();
                System.out.println("Area of the rectangle: " + (length * width));
                break;
            case 3:
                System.out.print("Enter the base of the triangle: ");
                double base = scanner.nextDouble();
                System.out.print("Enter the height of the triangle: ");
                double height = scanner.nextDouble();
                System.out.println("Area of the triangle: " + (0.5 * base * height));
                break;
            default:
                System.out.println("Please select a valid option");
        }
        scanner.close();
    }
}
