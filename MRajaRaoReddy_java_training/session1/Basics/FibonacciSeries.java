package MRajaRaoReddy_java_training.session1.Basics;

import java.util.Scanner;

//4) Write a program to print the Fibonacci sequence up to a specified number.

public class FibonacciSeries {
    public static void FibonacciMethod(int end) {
        int firstNum = 0, secondNum = 1;

        while (firstNum <= end) {
            System.out.print(firstNum + " ");

            int nextNum = firstNum + secondNum; //Next number is the sum of first and second numbers

            // Swapping of the numbers
            firstNum = secondNum;
            secondNum = nextNum;
        }
    }

    public static void main(String args[]) {
        Scanner input = new Scanner(System.in);

        // Take limit from user
        System.out.println("Enter the limit of sequence:");
        int end = input.nextInt();

        FibonacciMethod(end); // Function calling

    }
}
