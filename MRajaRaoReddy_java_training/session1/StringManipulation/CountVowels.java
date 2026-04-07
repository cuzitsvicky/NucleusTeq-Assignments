package MRajaRaoReddy_java_training.session1.StringManipulation;

import java.util.Scanner;

//Implement a function to count the number of vowels in a string.

public class CountVowels {
    public static void countVowel(String string){
		int count= 0;
		string = string.toLowerCase(); //it convert string in lower case
		//iterate to each element and comapares
         for(int i = 0;i<string.length();i++){
			if(string.charAt(i) == 'a' || string.charAt(i) == 'e'||string.charAt(i) == 'i'||string.charAt(i) == 'o'||string.charAt(i) == 'u'){
				count++;
			}
		 }
		 System.out.println("There are "+count+" vowels in String.");
	}
	public static void main(String[] args) {
		Scanner input = new Scanner(System.in);
		System.out.println("Enter the string: ");
		String string = input.nextLine();
		countVowel(string);
	}
}
