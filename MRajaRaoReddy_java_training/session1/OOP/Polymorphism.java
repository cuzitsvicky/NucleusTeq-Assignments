package MRajaRaoReddy_java_training.session1.OOP;

//Demonstrate polymorphism by creating methods with the same name but different parameters in a parent and child class.

class Animal{
	public void Sound(){
		System.out.println("Animals makes diffrent Sounds");
	}

	//method with String type parameter
	public void Sound(String type){
		System.out.println("Animal is: "+type+" type");
	}

}

//Child class dog
class Dog extends Animal{
	@Override
	public void Sound(){
		System.out.println("Dog barks");
	}

	//method with int type parameter
	//method overloading
	public void Sound(int time){
      System.out.println("Dog barks " +time+" times");
	}
	 // Call parent class overloaded method
    public void Sound(String type) {
        super.Sound(type); // Ensures parent method is called
    }
}

public class Polymorphism {
    public static void main(String[] args) {
		Dog dog = new Dog();
		dog.Sound();
		dog.Sound("Bull Dog"); //String type method called
		dog.Sound(20); //int type parameter called (different parameter)
	}
}
