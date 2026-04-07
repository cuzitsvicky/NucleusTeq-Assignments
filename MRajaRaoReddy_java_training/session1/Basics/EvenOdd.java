package MRajaRaoReddy_java_training.session1.Basics;

import java.util.Scanner;

//2)  Create a program to check if a number is even or odd.

public class EvenOdd {
    public static void main(String args[]) {
        // Take input from the user
        Scanner input = new Scanner(System.in);
        System.out.print("Enter the number to check if it's even or odd: ");
        int number = input.nextInt();

        if (number % 2 == 0) {
            System.out.println("Number is even");
        } else {
            System.out.println("Number is odd");
        }
    }
}
