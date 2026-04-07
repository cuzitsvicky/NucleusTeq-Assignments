package MRajaRaoReddy_java_training.session1.Arrays;

import java.util.Scanner;

//2) Implement a function to sort an array in ascending order using bubble sort or selection sort.

public class SortArray {
        // Bubble Sort
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    // Selection Sort
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            // Swap arr[i] and arr[minIndex]
            int temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }


    public static void printArray(int[] arr) {
        for (int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Input array size
        System.out.print("Enter the number of elements: ");
        int n = sc.nextInt();
        int[] arr = new int[n];

        // Input array elements
        System.out.println("Enter " + n + " elements:");
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // Choose the sorting method
        System.out.print("Choose sorting method (1: Bubble Sort, 2: Selection Sort): ");
        int choice = sc.nextInt();

        // Sorting based on the user choice
        if (choice == 1) {
            bubbleSort(arr);
            System.out.println("Sorted array using Bubble Sort:");
        } else if (choice == 2) {
            selectionSort(arr);
            System.out.println("Sorted array using Selection Sort:");
        } else {
            System.out.println("Invalid choice.");
            sc.close();
            return;
        }

        // Print sorted array
        printArray(arr);
        sc.close();
    }
}
