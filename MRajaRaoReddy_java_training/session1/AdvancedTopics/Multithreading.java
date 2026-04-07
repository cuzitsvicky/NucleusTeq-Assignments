// Q4 Explore multithreading in Java to perform multiple tasks concurrently.

//  Multithreading is the ability of a program to execute multiple threads concurrently to improve performance.
//  Each thread runs independently, allowing multiple tasks to execute simultaneously.

// Key Benefits:

// Better CPU utilization (efficient execution of multiple tasks).
// Faster execution (tasks run in parallel).
// Responsive applications (e.g., UI remains active while processing data).
// Efficient resource sharing (threads share memory and data).

// Example of Multithreading using Thread Class 

package MRajaRaoReddy_java_training.session1.AdvancedTopics;


class Task1 extends Thread {
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Task 1 - Count: " + i);
            try {
                Thread.sleep(500); // Simulating time delay
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}

class Task2 extends Thread {
    public void run() {
        for (char ch = 'A'; ch <= 'E'; ch++) {
            System.out.println("Task 2 - Letter: " + ch);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}


public class Multithreading {
    public static void main(String[] args) {
        Task1 t1 = new Task1();
        Task2 t2 = new Task2();

        t1.start(); 
        t2.start(); 
    }
}
