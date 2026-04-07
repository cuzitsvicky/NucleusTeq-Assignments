// 1). Explain the difference between primitive and reference data types with examples.

// A. Primitive Data Types:-
//    1. Primitive types are fundamental, directly storing values.
//    2. Stored in stack.
//    3. It holds the actual value.
//    4. It's default value is 0, false, '\u0000'.
//    5. Performance wise it is faster than reference data types.
//    6. Example: int a = 10;

// B. Reference Data Types:-
//    1. Reference types store references (memory addresses) to objects. 
//    2. Stored in heap (actual object).
//    3. It holds the memory address, referenceto object.
//    4. Performance wise it is slower than primitive data types due to object
//    creation.
//    5. Example: String str = "M Raja Rao Reddy";  

package MRajaRaoReddy_java_training.session1.DataTypesAndOperators;

public class PrimitivevsReference {
     public static void main(String[] args) {
        // Primitive Data Types
        int num = 10; 
        double price = 99.99; 
        char letter = 'M'; 

        // Reference Data Types
        String name = "M Raja Rao Reddy";

        System.out.println("Primitive Data Types: " + num + ", " + price + ", " + letter);
        System.out.println("Reference Data Types: " + name);
    }
}
