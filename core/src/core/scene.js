/*
  Scene class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Scene {
    constructor(){
        new Component(this);
        this.instances = [];

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
