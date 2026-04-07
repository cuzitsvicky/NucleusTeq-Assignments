package MRajaRaoReddy_java_training.session1.StringManipulation;

import java.util.Scanner;

//Write a program to reverse a given string.

public class ReverseString {
     public static String reverseString(String str) {
        String reversed = "";
        for (int i = str.length() - 1; i >= 0; i--) {
            reversed += str.charAt(i); // append characters in reverse order
        }
        return reversed;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Input string from user
        System.out.print("Enter a string: ");
        String inputString = scanner.nextLine();

        // Reverse the string and Display the result
        String reversed = reverseString(inputString);
        System.out.println("Reversed String: " + reversed);

        scanner.close();
    }
}
