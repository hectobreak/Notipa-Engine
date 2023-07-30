/*
  Quaternion Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Quaternion {
    #values = [];
    constructor(x = 1, i = 0, j = 0, k = 0) {
        this.#values = [x, i, j, k];
    }

    add(other){
        assert(other instanceof Quaternion, "You can only add one quaternion to another");
        let tmp = new Array(4);
        for(let i = 0; i < 4; ++i) tmp[i] = this.#values[i] + other.#values[i];
        return new Quaternion(...tmp);
    }

    sub(other){
        assert(other instanceof Quaternion, "You can only subtract one quaternion to another");
        let tmp = new Array(4);
        for(let i = 0; i < 4; ++i) tmp[i] = this.#values[i] - other.#values[i];
        return new Quaternion(...tmp);
    }

    mult(other){
        assert(other instanceof Quaternion, "You can only multiply one quaternion to another");
        let x = this.#values[0] * other.#values[0]
            - this.#values[1] * other.#values[1]
            - this.#values[2] * other.#values[2]
            - this.#values[3] * other.#values[3];
        let i = this.#values[0] * other.#values[1]
            + this.#values[1] * other.#values[0]
            + this.#values[2] * other.#values[3]
            - this.#values[3] * other.#values[2];
        let j = this.#values[0] * other.#values[2]
            + this.#values[2] * other.#values[0]
            + this.#values[3] * other.#values[1]
            - this.#values[1] * other.#values[3];
        let k = this.#values[0] * other.#values[3]
            + this.#values[3] * other.#values[0]
            + this.#values[1] * other.#values[2]
            - this.#values[2] * other.#values[1];
        return new Quaternion(x, i, j, k);
    }

    get inverse(){
        let mul = 1 / (this.#values[0] * this.#values[0] +
            this.#values[1] * this.#values[1] +
            this.#values[2] * this.#values[2] +
            this.#values[3] * this.#values[3]);
        return new Quaternion(this.#values[0] * mul,
            - this.#values[1] * mul,
            - this.#values[2] * mul,
            - this.#values[3] * mul);
    }

    get conjugate(){
        return new Quaternion(this.#values[0], - this.#values[1], - this.#values[2], - this.#values[3]);
    }

    get elements(){
        return this.#values.slice();
    }

    rotate(vec3){
        let p = new Quaternion(0, vec3.x, vec3.y, vec3.z);
        let r = this.mult(p.mult(this.conjugate));
        return new Vector3D(r.#values[1], r.#values[2], r.#values[3]);
    }

    get rotation_matrix(){
        let col1 = this.rotate(new Vector3D(1,0,0));
        let col2 = this.rotate(new Vector3D(0,1,0));
        let col3 = this.rotate(new Vector3D(0,0,1));
        return [col1.x, col2.x, col3.x, col1.y, col2.y, col3.y, col1.z, col2.z, col3.z];
    }

    copy(){
        return new Quaternion(...this.#values);
    }

}

Quaternion.fromAxisAndAngle = function(vec3, angle){
    let norm = vec3.normalized;
    let x = Math.cos(angle/2);
    let sin = Math.sin(angle / 2);
    let i = norm.x * sin;
    let j = norm.y * sin;
    let k = norm.z * sin;
    return new Quaternion(x, i, j, k);
}

Quaternion.fromEulerAngles = function(theta, psi, phi){
    let q1 = new Quaternion(Math.cos(phi/2), Math.sin(phi/2), 0, 0);
    let q2 = new Quaternion(Math.cos(psi/2), 0, Math.sin(psi/2), 0);
    let q3 = new Quaternion(Math.cos(theta/2), 0, 0, Math.sin(theta/2));
    return q3.mult(q2.mult(q1));
}
