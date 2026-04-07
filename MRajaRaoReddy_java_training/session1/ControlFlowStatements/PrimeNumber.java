package MRajaRaoReddy_java_training.session1.ControlFlowStatements;

import java.util.Scanner;

//1) Write a program to check if a given number is prime using an if-else statement.

public class PrimeNumber {
     public static boolean isPrimeNumber(int number) {
        if (number <= 1) {
            return false; // Because numbers less than 1 including 1 are not prime numbers.
        }

        for (int i = 2; i <= Math.sqrt(number); i++) {
            if (number % i == 0)
                return false; // Here we use sqrt because after square root we get only repeated numbers.
        }

        return true; // It returns true as the number is not divided by any number
    }

    public static void main(String args[]) {
        Scanner input = new Scanner(System.in);
        System.out.println("Enter the number: ");
        int number = input.nextInt();

        if (isPrimeNumber(number) == true) {
            System.out.println(number + " is a Prime number");
        } else {
            System.out.println(number + " is not a prime number");
        }
    }
}
