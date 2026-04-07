package MRajaRaoReddy_java_training.session1.Arrays;

import java.util.Scanner;

//1) Write a program to find the average of elements in an array.

public class Average {
    public static void main(String args[]) {
        Scanner input = new Scanner(System.in);

        System.out.println("Enter the size of an array:");
        int size = input.nextInt();
        int sum = 0; 
        int arr[] = new int[size];

        System.out.println("Enter the elements of array:");
        for (int i = 0; i < size; i++) {
            arr[i] = input.nextInt();
            sum += arr[i];
        }

        // This prints the average of type double (typecasted to double)
        System.out.println("Average of elements of array is: " + (double) sum / arr.length);
    }
}
