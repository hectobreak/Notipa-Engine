/*
  Engine class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Engine {
	constructor(window_width = 0, window_height = 0, framerate=1/60){
		if(Engine.singleton !== undefined){
			throw new Error("There is more than one engine running!");
		}
		new Component(this);
		Engine.singleton = this;
		this.deltaTime = framerate;
		this.screen = null;
		
		{
			let canvas = document.createElement("canvas");
			canvas.width = window_width;
			canvas.height = window_height;
			canvas.style.position = "absolute";
			canvas.style.top = "0px";
			canvas.style.left = "0px";
			this.screen = new Screen(canvas);
			document.body.appendChild(canvas);
		}

		this.input_intercept = new InputIntercept(this.screen);
		this.set_scene(new Scene());

		function make_step(elem){
			if(elem.step !== undefined) elem.step();
			for(let component of elem.component.components){
				make_step(component);
			}
		}

		let transparent_stack = [];

		function make_draw(elem){
			if(elem.on_draw !== undefined) {
				if(elem.is_transparent) transparent_stack.push(elem);
				else elem.on_draw(Engine.singleton.screen);
			}
			for(let component of elem.component.components){
				make_draw(component);
			}
		}

		function sort_by_depth(list){
			let key = function(object) {
				let pos = object.cascade_apply(new Vector3D(0, 0, 0));
				return Engine.singleton.screen.camera.camera_transform.apply(pos).z;
			}

			let cmp = function(a, b){
				return (key(a) - key(b));
			}
			list.sort(cmp);
		}

		function tick(){
			let t0 = Date.now();
			
			transparent_stack = [];
			Engine.singleton.instances.map(make_step);
			Engine.singleton.screen.clear();
			Engine.singleton.instances.map(make_draw);
			Engine.singleton.screen.enable_blending();
			sort_by_depth(transparent_stack);
			transparent_stack.map(x => x.on_draw(Engine.singleton.screen));
			Engine.singleton.screen.disable_blending();
	
			let dt = Date.now() - t0;
			if(dt < 1000 * framerate){
				Engine.singleton.deltaTime = framerate;
				setTimeout(tick, 1000 * framerate - dt);
			} else {
				Engine.singleton.deltaTime = (Date.now() - t0)/1000;
				tick();
			}
		}

		tick();
	}

	instantiate(instance){
		return this.scene.instantiate(instance);
	}

	set_scene(scene){
		assert(scene instanceof Scene, "The scene must be of class Scene!");
		this.scene = scene;
		this.input_intercept.listeners = scene.instances;
	}

	get mouseX(){
		return this.input_intercept.mouse.x;
	}

	get mouseY(){
		return this.input_intercept.mouse.y;
	}

	get instances(){
		return this.scene.instances;
	}
}
