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
		this.instances = [];
		this.screen = null;
		
		{
			let canvas = document.createElement("canvas");
			canvas.width = window_width;
			canvas.height = window_height;
			this.screen = new Screen(canvas);
			document.body.appendChild(canvas);
		}

		this.input_intercept = new InputIntercept(this.screen);

		function make_step(elem){
			if(elem.step !== undefined) elem.step();
			for(let component of elem.component.components){
				make_step(component);
			}
		}

		function make_draw(elem){
			if(elem.on_draw !== undefined) {
				elem.on_draw(Engine.singleton.screen);
			}
			for(let component of elem.component.components){
				make_draw(component);
			}
		}

		function tick(){
			let t0 = Date.now();
			
			// Step stage
			Engine.singleton.instances.map(make_step);
			Engine.singleton.screen.clear();
			Engine.singleton.instances.map(make_draw);
	
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
		this.input_intercept.add_listener(inst);
		return inst;
	}

	get mouseX(){
		return this.input_intercept.mouse.x;
	}

	get mouseY(){
		return this.input_intercept.mouse.y;
	}
}
