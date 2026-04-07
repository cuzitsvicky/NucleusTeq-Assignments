package MRajaRaoReddy_java_training.session1.AdvancedTopics;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

// Implement a simple file I/O operation to read data from a text file. 

public class FileRead {
    public static void main(String[] args) {
        String filePath = "MRajaRaoReddy_java_training/session1/AdvancedTopics/sample.txt"; // Specifies the file path

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Error reading the file: " + e.getMessage());
        }
    }
}
