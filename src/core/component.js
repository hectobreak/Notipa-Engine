/*
  Component Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

let global_var;

class Component {
	#position;
	#scale;
	#transform;
	constructor(subobject, position=new Vector3D(), scale=new Vector3D(1, 1, 1), parent_object = null){
		assert(typeof subobject === 'object', "The subobject of a component must be an object!");
		assert(position instanceof Vector3D, "The position must be a Vector3D object!");
		assert(scale instanceof Vector3D, "The scale must be a Vector3D object!");
		assert(parent_object === null || parent_object instanceof Component, "The parent object must be a Component!");

		this.#transform = new LinearTransform(position, scale);
		this.#position = position;
		this.#scale = scale;
		
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
			if(subobject.position !== null)
				tmp.set_position_and_scale(subobject.position, subobject.scale);
			return tmp;
		}
		Object.defineProperty(subobject, "parent", {
			get: function parent() {
				return subobject.component.parent;
			}
		});
		Object.defineProperty(subobject, "position", {
			get: function position() {
				return subobject.component.position;
			},
			set: function position(vec) {
				assert(vec instanceof Vector3D, "The input vector must be a Vector3D object!");
				subobject.component.position = vec;
			}
		});
		Object.defineProperty(subobject, "scale", {
			get: function scale() {
				return subobject.component.scale;
			},
			set: function scale(vec) {
				assert(vec instanceof Vector3D, "The input vector must be a Vector3D object!");
				subobject.component.scale = vec;
			}
		});
		Object.defineProperty(subobject, "transform", {
			get: function transform() {
				return subobject.component.transform;
			},
			set: function transform(vec) {
				assert(vec instanceof LinearTransform, "The transform must be a LinearTransform!");
				subobject.component.transform = vec;
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

	}

	get transform(){
		if(this.parent !== null) return this.#transform.mult(this.parent.transform);
		return this.#transform;
	}

	get position(){
		let p = this.#position;
		if(p === null) throw new Error("This component has no position!");
		p = new Vector4D(p.x, p.y, p.z, 1);
		if(this.parent !== null) {
			global_var = this;
			p = this.parent.transform.apply(p);
		}
		return new Vector3D(p.x, p.y, p.z);
	}

	get scale(){
		let p = this.#scale;
		if(p === null) throw new Error("This component has no scale!");
		p = new Vector4D(p.x, p.y, p.z, 0);
		if(this.parent !== null) p = this.parent.transform.apply(p);
		return new Vector3D(p.x, p.y, p.z);
	}

	set position(p){
		assert(p instanceof Vector3D, "Position must be a 3D vector!");
		assert(this.#scale !== null, "This element does not have a scale!")
		this.#position = p.copy();
		this.#transform = new LinearTransform(this.#position, this.#scale)
	}

	set scale(p){
		assert(p instanceof Vector3D, "Scale must be a 3D vector!");
		assert(this.#position !== null, "This element does not have a position!")
		this.#scale = p.copy();
		this.#transform = new LinearTransform(this.#position, this.#scale)
	}

	set transform(m){
		assert(m instanceof LinearTransform, "The transform must be a linear transform!")
		this.#transform = m.copy();
		this.#position = null;
		this.#scale = null;
	}

	set_position_and_scale(pos, scale){
		assert(pos instanceof Vector3D, "Position must be a 3D vector!");
		assert(scale instanceof Vector3D, "Scale must be a 3D vector!");
		this.#position = pos.copy();
		this.#scale = scale.copy();
		this.#transform = new LinearTransform(this.#position, this.#scale);
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
