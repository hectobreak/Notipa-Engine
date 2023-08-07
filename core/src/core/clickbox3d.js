

class Clickbox3D {
    #triangles
    #projected_triangles

    constructor(polyhedron) {
        new Component(this);
        assert(polyhedron instanceof Array, "The polyhedron must be an array of vertices!");
        assert(polyhedron.length % 3 === 0, "The number of vertices must be a multiple of 3!");
        this.#triangles = [];

        for(let i = 0; i < polyhedron.length; i += 3){
            let p1 = polyhedron[i];
            let p2 = polyhedron[i + 1];
            let p3 = polyhedron[i + 2];
            assert(p1 instanceof Vector3D, "Element " + (i) + " is not a 3D Vector.");
            assert(p2 instanceof Vector3D, "Element " + (i+1) + " is not a 3D Vector.");
            assert(p3 instanceof Vector3D, "Element " + (i+2) + " is not a 3D Vector.");
            this.#triangles.push([p1, p2, p3]);
        }

        this.deep_copy = function(){
            return new Clickbox3D(polyhedron);
        }

        this.project();
    }

    // Projects the vertices to clip space
    project(projection=Engine.singleton.screen.camera.camera_transform){
        this.#projected_triangles = new Array(this.#triangles.length);
        for(let i = 0; i < this.#triangles.length; ++i){
            let [p1, p2, p3] = this.#triangles[i];
            let q1 = projection.apply(this.cascade_apply(p1)).projected;
            let q2 = projection.apply(this.cascade_apply(p2)).projected;
            let q3 = projection.apply(this.cascade_apply(p3)).projected;
            this.#projected_triangles[i] = [q1, q2, q3];
        }
    }

    is_clicking(x=Engine.singleton.mouseX, y=Engine.singleton.mouseY){
        let w = Engine.singleton.screen.canvas.width/2;
        let h = Engine.singleton.screen.canvas.height/2;
        for(let [p1, p2, p3] of this.#projected_triangles){
            // To screen space
            let q1 = p1.add(new Vector3D(1, -1, 0)).component_mult(new Vector3D(w, -h, 1));
            let q2 = p2.add(new Vector3D(1, -1, 0)).component_mult(new Vector3D(w, -h, 1));
            let q3 = p3.add(new Vector3D(1, -1, 0)).component_mult(new Vector3D(w, -h, 1));

            // Find the plane
            let normal = (q2.sub(q1)).cross(q3.sub(q1));
            let constant = - normal.dot(q1);

            // Detect if the point is outside the clip space
            let z = - (constant + normal.x * x + normal.y * y) / normal.z;
            if(z < 0 || z > 1) {
                continue;
            }

            // Detect if the point is inside the triangle
            let matrix = [q2.x - q1.x, q3.x - q1.x, q2.y - q1.y, q3.y - q1.y];
            let det = LinearTransform.det2v2(...matrix);
            if(det === 0) continue;

            let m = LinearTransform.rescale(LinearTransform.transpose_adjugate2v2(...matrix), 1 / det);
            let s = m[0] * (x - q1.x) + m[1] * (y - q1.y);
            let t = m[2] * (x - q1.x) + m[3] * (y - q1.y);

            if(s >= 0 && t >= 0 && s + t <= 1) {
                return true;
            }
        }
        return false;
    }
}

Clickbox3D.fromQuad = function (w, h, center=new Vector3D(0,0,0)){
    let p = center.scale(-1);
    return new Clickbox3D([
        new Vector3D(0,0,0), new Vector3D(w,0,0), new Vector3D(0, h,0),
        new Vector3D(w,0,0), new Vector3D(w,h,0), new Vector3D(0,h,0)
    ].map(x => x.add(p)));
}
