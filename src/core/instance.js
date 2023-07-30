/*
  Instance class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Instance {
	constructor(position=new Vector3D(), scale=new Vector3D(1, 1, 1), parent_object = null){
		new Component(this, new LinearTransform(position, scale), parent_object);
	}

}
