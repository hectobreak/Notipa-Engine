/*
  Scene class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Scene {
    #active_camera
    constructor(){
        new Component(this);
        this.instances = [];
        let camera = new Camera(CameraTypes.Orthographic);
        this.instantiate(camera);
        this.#active_camera = camera;
    }

    get active_camera(){
        return this.#active_camera;
    }

    set active_camera(cam){
        assert(cam instanceof Camera, "Camera must be of Camera class");
        let tmp = cam;
        while(tmp !== this){
            console.log(tmp);
            if(tmp.parent === null)
                throw new Error("The active camera must be instantiated as an object in the scene");
            tmp = tmp.parent.subobject;
        }
        this.#active_camera = cam;
    }

    make_create(elem){
        if(elem.create !== undefined) elem.create();
        for(let component of elem.component.components){
            this.make_create(component);
        }
    }

    instantiate(instance){
        let inst = instance.deep_copy();
        this.instances.push(inst);
        this.add_component(inst);
        this.make_create(inst);
        return inst;
    }
}
