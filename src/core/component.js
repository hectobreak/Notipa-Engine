/*
  Component Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

let global_var;

class Component {
	#transform;
	constructor(
		subobject,
		transform = new LinearTransform(),
		parent_object = null
	){
		assert(typeof subobject === 'object', "The subobject of a component must be an object!");
		assert(transform instanceof LinearTransform, "The transform must be a linear transform!");
		assert(parent_object === null || parent_object instanceof Component, "The parent object must be a Component!");

		this.#transform = transform.copy();
		
		this.parent = parent_object;
		this.subobject = subobject;
		this.components = [];

		this.subobject.component = this;

		function copy_func(obj, skip_component=false){
			let tmp = new obj.constructor();
			for(let key of Object.keys(obj)){
				if(key === "component" && skip_component) continue;
				let val = obj[key];
				if(val === undefined) continue;
				else if(val.copy !== undefined) tmp[key] = val.copy();
				else if(val.deep_copy !== undefined) tmp[key] = val.deep_copy();
				else if(val instanceof Array) tmp[key] = val.map(copy_func);
				else tmp[key] = val;
			}
			return tmp;
		}

		subobject.add_component = function(...args){ return this.component.add_component(...args); }
		subobject.set_position_and_scale = function(...args){ return this.component.set_position_and_scale(...args); }
		subobject.deep_copy = function(){
			let tmp = copy_func(this, true);
			for(let child of subobject.children){
				tmp.add_component(child.deep_copy());
			}
			tmp.transform = subobject.transform.copy();
			return tmp;
		}
		Object.defineProperty(subobject, "parent", {
			get: function parent() {
				return subobject.component.parent;
			}
		});
		Object.defineProperty(subobject, "position", {
			get: function position() {
				return subobject.component.#transform.position;
			},
			set: function position(vec) {
				assert(vec instanceof Vector3D, "The input vector must be a Vector3D object!");
				subobject.component.#transform.position = vec;
			}
		});
		Object.defineProperty(subobject, "scale", {
			get: function scale() {
				return subobject.component.#transform.scale;
			},
			set: function scale(vec) {
				assert(vec instanceof Vector3D, "The input vector must be a Vector3D object!");
				subobject.component.#transform.scale = vec;
			}
		});
		Object.defineProperty(subobject, "rotation", {
			get: function rotation() {
				return subobject.component.#transform.rotation;
			},
			set: function rotation(quat) {
				assert(quat instanceof Quaternion, "The input rotation must be a Quaternion object!");
				subobject.component.#transform.rotation = quat;
			}
		});
		Object.defineProperty(subobject, "transform", {
			get: function transform() {
				return subobject.component.#transform;
			},
			set: function transform(vec) {
				assert(vec instanceof LinearTransform, "The transform must be a LinearTransform!");
				subobject.component.#transform = vec;
			}
		});
		Object.defineProperty(subobject, "get_component", {
			get: function get_component() {
				return (...args) => subobject.component.get_component(...args);
			}
		});
		Object.defineProperty(subobject, "children", {
			get: function children() {
				return subobject.component.children;
			}
		});
		Object.defineProperty(subobject, "cascade_transform", {
			get: function cascade_transform(){
				return subobject.component.cascade_transform;
			}
		})

	}

	get transform(){
		return this.#transform;
	}

	get position(){
		let p = this.#transform.position;
		if(p === null) throw new Error("This component has no position!");
		return p;
	}

	get scale(){
		let p = this.#transform.scale;
		if(p === null) throw new Error("This component has no scale!");
		return new p;
	}

	get rotation(){
		let p = this.#transform.rotation;
		if(p === null) throw new Error("This component has no rotation!");
		return p;
	}

	get cascade_transform(){
		let p = this.parent === null ? new LinearTransform() : this.parent.cascade_transform;
		return p.mult(this.transform);
	}

	set position(p){
		this.#transform.position = p.copy();
	}

	set scale(p){
		this.#transform.scale = p;
	}

	set rotation(p){
		this.#transform.rotation = p;
	}

	set transform(m){
		assert(m instanceof LinearTransform, "The transform must be a linear transform!")
		this.#transform = m.copy();
	}

	set_position_and_scale(pos, scale){
		this.#transform.position = pos;
		this.#transform.position = scale;
	}

	add_component(subcomponent){
		assert(typeof subcomponent === 'object', "The component must be an object!");
		assert(subcomponent.component instanceof Component, "The object passed is not a component!");
		assert(subcomponent.component.parent === null, "Component already has a parent!");
		this.components.push(subcomponent);
		subcomponent.component.parent = this;
	}

	get_component(component){
		for(let c of this.components){
			if(c instanceof component) return c;
		}
		return null;
	}
	
	get children(){
		return this.components.slice();
	}
}
