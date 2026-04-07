package MRajaRaoReddy_java_training.session1.StringManipulation;

import java.util.Arrays;
import java.util.Scanner;

// Create a program to check if two strings are anagrams.

public class AnagramCheck {
    // Method to check if two strings are anagrams
    public static boolean areAnagrams(String str1, String str2) {
        // Convert to lowercase to ignore case sensitivity
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();

        // If lengths are different, they cannot be anagrams
        if (str1.length() != str2.length()) {
            return false;
        }

        // Convert strings to character arrays and sort them
        char[] charArray1 = str1.toCharArray();
        char[] charArray2 = str2.toCharArray();
        Arrays.sort(charArray1);
        Arrays.sort(charArray2);

        // Compare sorted character arrays
        return Arrays.equals(charArray1, charArray2);
    }

    // Main method to test the program
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Input two strings
        System.out.print("Enter first string: ");
        String str1 = scanner.nextLine();
        System.out.print("Enter second string: ");
        String str2 = scanner.nextLine();

        // Check if they are anagrams
        if (areAnagrams(str1, str2)) {
            System.out.println("The strings are anagrams.");
        } else {
            System.out.println("The strings are NOT anagrams.");
        }

        scanner.close();
    }
}
