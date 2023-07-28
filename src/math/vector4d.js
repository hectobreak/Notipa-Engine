/*
  Vector4D class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Vector4D {
    constructor(x=0, y=0, z=0, w=1){
        assert(typeof x === 'number', "The x coordinate of a vector must be a number!");
        assert(typeof y === 'number', "The y coordinate of a vector must be a number!");
        assert(typeof z === 'number', "The z coordinate of a vector must be a number!");
        assert(typeof w === 'number', "The w coordinate of a vector must be a number!");
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    add(vec){
        assert(vec instanceof Vector4D, "You can only add a vector to another vector!");
        return new Vector4D(this.x + vec.x, this.y + vec.y, this.z + vec.z, this.w - vec.w);
    }

    sub(vec){
        assert(vec instanceof Vector4D, "You can only subtract a vector to another vector!");
        return new Vector4D(this.x - vec.x, this.y - vec.y, this.z - vec.z, this.w - vec.w);
    }

    component_mult(vec){
        assert(vec instanceof Vector4D, "You can only multiply component-wise a vector to another vector!");
        return new Vector4D(this.x * vec.x, this.y * vec.y, this.z * vec.z, this.w * vec.w);
    }

    scale(a){
        assert(typeof a === 'number', "The ammount by which you scale a vector must be a scalar! (Meaning: A number)");
        return new Vector4D(this.x * a, this.y * a, this.z * a, this.w * a);
    }

    get magnitude(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    get magnitude_squared(){
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    get normalized(){
        let magnitude = this.magnitude;
        assert(magnitude !== 0, "You cannot normalize a zero vector!");
        return new Vector4D(this.x / magnitude, this.y / magnitude, this.z / magnitude, this.w / magnitude);
    }

    normalize(){
        let magnitude = this.magnitude;
        assert(magnitude !== 0, "You cannot normalize a zero vector!");
        this.x /= magnitude;
        this.y /= magnitude;
        this.z /= magnitude;
        this.w /= magnitude;
    }

    dot(vec){
        assert(vec instanceof Vector4D, "You can only compute the dot product of a vector to another vector!");
        return this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w;
    }

    copy(){
        return new Vector4D(this.x, this.y, this.z, this.w);
    }
}
