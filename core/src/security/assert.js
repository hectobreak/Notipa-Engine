/*
  Assert function
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

function assert(truth_value, error){
	if(!truth_value) throw new Error(error);
}
