package MRajaRaoReddy_java_training.session1.Basics;

import java.util.Scanner;

//5) Use loops to print patterns like a triangle or square.

public class Patterns {
     public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Choose a pattern to print:");
        System.out.println("1. Right-Angled Triangle");
        System.out.println("2. Square");
        System.out.print("Enter your choice [1 or 2]: ");
        int choice = sc.nextInt();

        System.out.print("Enter the size you want: ");
        int n = sc.nextInt();

        switch (choice) {
            case 1:
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= i; j++) {
                        System.out.print("* ");
                    }
                    System.out.println();
                }
                break;

            case 2:
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= n; j++) {
                        System.out.print("* ");
                    }
                    System.out.println();
                }
                break;

            default:
                System.out.println("Invalid choice! Please enter 1 or 2.");
        }

        sc.close();
    }
}
