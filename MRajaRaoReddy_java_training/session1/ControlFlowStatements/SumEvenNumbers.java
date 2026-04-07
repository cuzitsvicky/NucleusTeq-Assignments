package MRajaRaoReddy_java_training.session1.ControlFlowStatements;

//4) Create a program to calculate the sum of even numbers from 1 to 10 using a while loop.


public class SumEvenNumbers {
    public static void main(String[] args) {
        int sum = 0;
        int i = 2;

        while (i <= 10) {
            sum += i;
            i += 2;
        }
        System.out.println("Sum of even numbers from 1 to 10 is: " + sum);
    }
}
