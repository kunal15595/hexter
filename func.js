function point_2d(_x, _y) {
	this.xx = _x || 0;
	this.yy = _y || 0;
}

function point_3d(_x, _y, _z) {
	this.xx = _x || 0;
	this.yy = _y || 0;
	this.zz = _z || 0;
}

function occupied_point (_x, _y, _tag) {
	this.xx = _x || 0;
	this.yy = _y || 0;
	this.tag = _tag || 0;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random()*16);
}

function pixel_to_hex(x, y) {
	var size =  radius;
	var pt = new point_2d(2/3 * x / size,(1/3*Math.sqrt(3) * y - 1/3 * x) / size);
	var ret = cube_to_axial(hex_round(axial_to_cube(pt)));
	hover = ret;
	highlight(ret);
	return ret;
}

function hex_round (point) {
	var ret = new point_3d(Math.round(point.xx), Math.round(point.yy), Math.round(point.zz));
	
    var x_diff = Math.abs(ret.xx - point.xx);
    var y_diff = Math.abs(ret.yy - point.yy);
    var z_diff = Math.abs(ret.zz - point.zz);

    if (x_diff > y_diff && x_diff > z_diff)
        ret.xx = 0-ret.yy-ret.zz;
    else if (y_diff > z_diff)
        ret.yy = 0-ret.xx-ret.zz;
    else
        ret.zz = 0-ret.xx-ret.yy;

    return ret;
}

function axial_to_cube(point) {
	var temp = 0 - point.xx - point.yy;
	var ret = new point_3d(point.xx, temp, point.yy);
	return ret;
}

function cube_to_axial(point) {
	var ret = new point_2d(point.xx, point.yy);
	return ret;
}

function shift_occupied (point, from_id, to_id) {
	$.each(occupied, function(i){
	    if(occupied[i].xx === point.xx && occupied[i].yy === point.yy) {
	        occupied[i].tag = to_id;
	        return false;
	    }
	});
	render(from_id);
	render(to_id);
	
}

function in_probables (point) {
	var result = $.grep(probables, function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	return (result.length < 1)?false:true;
}

function in_map (point) {
	var result = $.grep(cover[0], function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	return (result.length < 1)?false:true;
}

function identify (x, y) {
	// console.log('occupied', occupied, x, y);
	var ret = jQuery.grep(occupied, function(e){ return e.xx === x && e.yy === y; });
	// console.log(ret);
	return ret;
}
