/*
  Vector2D class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Vector2D {
	constructor(x=0, y=0){
		assert(typeof x === 'number', "The x coordinate of a vector must be a number!");
		assert(typeof y === 'number', "The y coordinate of a vector must be a number!");
		this.x = x;
		this.y = y;
	}

	add(vec){
		assert(vec instanceof Vector2D, "You can only add a vector to another vector!");
		return new Vector2D(this.x + vec.x, this.y + vec.y);
	}

	sub(vec){
		assert(vec instanceof Vector2D, "You can only subtract a vector to another vector!");
		return new Vector2D(this.x - vec.x, this.y - vec.y);
	}

	component_mult(vec){
		assert(vec instanceof Vector2D, "You can only multiply component-wise a vector to another vector!");
		return new Vector2D(this.x * vec.x, this.y * vec.y);
	}

	scale(a){
		assert(typeof a === 'number', "The ammount by which you scale a vector must be a scalar! (Meaning: A number)");
		return new Vector2D(this.x * a, this.y * a);
	}

	get magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	get magnitude_squared(){
		return this.x * this.x + this.y * this.y;
	}

	get normalized(){
		let magnitude = this.magnitude;
		assert(magnitude !== 0, "You cannot normalize a zero vector!");
		return new Vector2D(this.x / magnitude, this.y / magnitude);
	}
	
	normalize(){
		let magnitude = this.magnitude;
		assert(magnitude !== 0, "You cannot normalize a zero vector!");
		this.x /= magnitude;
		this.y /= magnitude;
	}

	cross(vec){
		assert(vec instanceof Vector2D, "You can only subtract a vector to another vector!");
		return this.x * vec.y + this.y * vec.x;
	}

	dot(vec){
		assert(vec instanceof Vector2D, "You can only compute the dot product of a vector to another vector!");
		return this.x * vec.x + this.y * vec.y;
	}

	copy(){
		return new Vector2D(this.x, this.y);
	}
}
