/*
  Camera class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const CameraTypes = {
    Orthographic: 0,
    Perspective: 1
}

class Camera {
    #camera_transform;
    constructor(
        type=CameraTypes.Orthographic,
        params={corner: new Vector3D(), size: new Vector3D(800, 600, 1000)},
        position, scale, parent_object) {
        new Component(this, position, scale, parent_object);
        if(type === CameraTypes.Orthographic){
            let sx = params.size.x/2, sy = -params.size.y/2, sz = params.size.z/2;
            let tx = params.corner.x, ty = params.corner.y, tz = params.corner.z;
            this.#camera_transform = new LinearTransform(
                new Vector3D(-tx - sx, -ty + sy, -tz),
                new Vector3D(1/sx, 1/sy, 1/sz),
                null,
                LinearTransformType.ST
            );
        } else if(type === CameraTypes.Perspective){
            let l = params.corner.x, b = params.corner.y, n = params.corner.z;
            let r = l + params.size.x, t = params.size.y, f = n + params.size.z;
            this.#camera_transform = new LinearTransform([
                2*n/(r-l),         0, (r+l)/(r-l),            0,
                        0, 2*n/(t-b), (t+b)/(t-b),            0,
                        0,         0, (f+n)/(n-f), -2*f*n/(f-n),
                        0,         0,          -1,            0
            ]);
        } else {
            throw new Error("Unknown camera type!")
        }
    }

    get camera_transform(){
        return this.#camera_transform.mult(this.transform.inverse)  ;
    }
}
