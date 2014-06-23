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

var half_chance = false, first_chance;
var state = 0;
var canvas_height = 800, canvas_width = 800;
var num_players = 3;
var radius = 20;
var sides = 6;
var scale_x = 1, scale_y = 0.6;
var can = [], con = [], cover = [], occupied = [], probables = [];
var color = [  "#333", "#777", "#0ff","#ff0","#f0f","#00f","#0f0","#f00","#a00","#0a0","#00a","#a0a","#aa0","#0aa", "#333","#777"];
var canvas=document.getElementById("draw");
canvas.style.zIndex   = "0";
canvas.style.position = "absolute";
var conn = canvas.getContext('2d');
conn.scale(scale_x,scale_y);
draw_map(radius, sides);
generate_canvases(num_players);



jQuery(document).ready(function () {
	$(function() {
		$( "#slider-vertical" ).slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: num_players,
		value: 0,
		slide: function( event, ui ) {
			$( "#amount" ).val( ui.value );
			state = ui.value;
			// alert('state');
		}
	});
	$( "#amount" ).val( $( "#slider-vertical" ).slider( "value" ) );
	});
	can[num_players+2].addEventListener('mousemove', function(e) {
		update((e.pageX - this.offsetLeft)/scale_x, (e.pageY - this.offsetTop)/scale_y);
	}, false);

	can[num_players+2].addEventListener('click', function(e) {
		play((e.pageX - this.offsetLeft)/scale_x, (e.pageY - this.offsetTop)/scale_y);
	}, false);
	$( "#slider" ).slider();
});

function beautify_polygon (center_x, center_y, sides, color, cxt, size, border_width, border_color) {
	cxt.fillStyle = color;
		cxt.beginPath();

		for (var i = 0; i < sides; i++) {
			var angle = 2 * Math.PI / sides * i;
		    var x_i = center_x + size * Math.cos(angle);
		    var y_i = center_y + size * Math.sin(angle);
		    // console.log(x_i, y_i);
		    
		    if(i == 0){
		        cxt.moveTo(x_i, y_i);
		    }
		    else{
		        cxt.lineTo(x_i, y_i);
		    }
		}
		cxt.closePath();
		cxt.lineWidth = border_width;
		cxt.strokeStyle = border_color;
		cxt.stroke();
		cxt.fill();
}

function draw_polygon (center_x, center_y, sides, id, cxt) {
	beautify_polygon(center_x, center_y, sides, color[color.length - id - 1], cxt, radius, 2, "black");
	if(state)beautify_polygon(center_x, center_y, sides, color[id], cxt, radius*.6, 0.5, "white");
}

function draw_map (radius, sides) {
	var x = 0, y = 0;
	while(x < canvas.width/scale_x + radius){
		while(y < canvas.height/scale_y + radius){
			draw_polygon(x, y, sides, 1, conn);
			y += Math.sqrt(3)*radius;
		}
		x += 3 * radius;
		y = 0;
	}
	x = 3/2 * radius;
	y = Math.sqrt(3)/2*radius;
	while(x < canvas.width/scale_x + radius){
		while(y < canvas.height/scale_y + radius){
			draw_polygon(x, y, sides, 1, conn);
			y += Math.sqrt(3)*radius;
		}
		x += 3 * radius;
		y = Math.sqrt(3)/2*radius;
	}
}

function pixel_to_hex(x, y) {
	// console.log(x, y);
	var size =  radius;
	var pt = new point_2d(2/3 * x / size,(1/3*Math.sqrt(3) * y - 1/3 * x) / size);
	// console.log(pt);

	var ret = cube_to_axial(hex_round(axial_to_cube(pt)));
	// console.log(ret);
	// var pass = {xx: x, yy: y};
	highlight(ret);
	// console.log(pass);
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

function highlight (point) {
	// console.log('0');
	var q = point.xx, r = point.yy;
	// console.log('0.1');
	var center_x = q*(3/2)*radius, center_y = 0 - Math.sqrt(3)*r/2*radius + Math.sqrt(3)*1/2*radius*(0 - point.xx - point.yy);
	// console.log(center_x, center_y);
	
	con[num_players+1].save();
	con[num_players+1].setTransform(1, 0, 0, 1, 0, 0);
	con[num_players+1].clearRect(0, 0, can[num_players+1].width, can[num_players+1].height);
	con[num_players+1].restore();
	// console.log('3');
	// return;
	var result = identify(q, r);
	var high;
	if(result.length!=0){
		high = result[0].tag;
	}else{
		high = 0;
	}
	console.log('high', high)
	draw_polygon(center_x, center_y, sides, high, con[num_players+1]);
}

function generate_canvases (num_players) {
	// console.log(window.can);
	for (var i = 0; i <= num_players+3; i++) {
		can.push(document.createElement('canvas'));
		can[i].id     = "can_" + i.toString();
		// console.log("can_" + i.toString());
		can[i].width  = canvas_width;
		can[i].height = canvas_height;
		can[i].style.zIndex   = "0";
		can[i].style.position = "absolute";
		// canvas.style.border   = "1px solid";
		con.push(can[i].getContext('2d'));

		con[i].scale(scale_x,scale_y);
		document.body.appendChild(can[i]);
	}
	initialize_canvases();
}

function initialize_canvases () {
	can[num_players+2].style.zIndex   = "2";
	for (var i = 0; i <= num_players+3; i++) {
		cover[i] = [];
		// console.log(cover, cover[i]);
		// color[i] = '#'+getRandomInt().toString(16)+getRandomInt().toString(16)+getRandomInt().toString(16);
	}
	
}

function getRandomInt(min, max) {
  return Math.floor(Math.random()*16);
}

function blink_probables (point, id, show) {
	if(!half_chance){
		con[num_players+3].globalAlpha=0;
		return;
	}else if(show){
		con[num_players+3].globalAlpha=0.9;
	}else{
		con[num_players+3].globalAlpha=0.1;
	}
	render(num_players+3);
	setTimeout(function(){
		if(probables.length)blink_probables (point, id, !show)}
			, 300);
	
}

function add_to_probables (point) {
	for (var i = point.xx-1; i <= point.xx+1; i++) {
		for (var j = point.yy-1; j <= point.yy+1; j++) {
			if(i-point.xx != j-point.yy){
				if (identify(point.xx, point.yy).length == 0) {
						probables.push(new point_2d(i, j));
						blink_probables(new point_2d(i, j), state, true);	
				}
			}
		}
	}
	console.log('probables', probables);
}

function play (x, y) {

	var coord = update(x, y);

	console.log('clicked on', coord);
	if(state == 0){

		toggle_map(coord);
	}else{
		if(!in_map(coord)){
			return;
		}
		if (half_chance) {
			if(in_probables(coord)){
				var result = identify(x, y);
				if(result.length==0){
					add_hex(coord, state);
					neighbour(coord, state);
				}
				half_chance = false;
				probables.length = 0;
				console.log('full_chance');
			}
		}else{
			var result = identify(x, y);
			if(result.length){
				if(result[0].tag == state){
					add_to_probables(coord);
					half_chance = true;
					console.log('half_chance');
				}
			}
		}
		
		// console.log(result);
		var active_con = state==0?conn : document.getElementById("can_"+state).getContext('2d');
		// cover[state].push(coord);
	}
	render(state);
}

function identify (x, y) {
	return jQuery.grep(occupied, function(e){ return e.xx === x && e.yy === y; });
}

function update (x, y) {
	return pixel_to_hex(x, y);
}

function add_hex (point, id) {
	console.log('trying to add point');
	if (!in_map(point)) return;
	console.log('adding point');
	var result = $.grep(cover[id], function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	
	if(result.length == 0)cover[id].push(point);

	var prop = identify(point.xx, point.yy);
	if(prop.length == 0){
		occupied.push(new occupied_point(point.xx, point.yy, id));
		console.log('occupied by ', id);
	}else{
		shift_occupied(point, prop[0].tag, id);
		console.log('shifted from ', prop[0].tag, ' to ', id);
	}


	render(state);
}

function remove_hex (point, id) {
	if (!in_map(point)) return;
	$.each(cover[id], function(i){
	    if(cover[id][i].xx == point.xx && cover[id][i].yy == point.yy) {
	        cover[id].splice(i,1);
	        return false;
	    }
	});
	render(state);
}

function in_probables (point) {
	var result = $.grep(probables, function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	console.log('in_probables', result);
	return (result.length < 1)?false:true;
}

function in_map (point) {
	var result = $.grep(cover[0], function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	console.log('in_map', result);
	return (result.length < 1)?false:true;
}

function toggle_map (point) {
	if (in_map(point)) {
		$.each(cover[0], function(i){
		    if(cover[0][i].xx === point.xx && cover[0][i].yy === point.yy) {
		        cover[0].splice(i,1);
		        return false;
		    }
		});
	}else{
		cover[0].push(point);
	}
	// console.log('map', cover[0]);
	// render(state);
}

function render(id) {
	con[id].save();
	con[id].setTransform(1, 0, 0, 1, 0, 0);
	con[id].clearRect(0, 0, can[id].width, can[id].height);
	con[id].restore();
	for (var i = 0; i < cover[id].length; i++) {
		var center_x = cover[id][i].xx*(3/2)*radius, center_y = 0 - Math.sqrt(3)*cover[id][i].yy/2*radius + Math.sqrt(3)*1/2*radius*(0 - cover[id][i].xx - cover[id][i].yy);
		// console.log(center_x, center_y);
		
		
		// console.log('3');
		// return;
		draw_polygon(center_x, center_y, sides, id+2, con[id]);
	}
}

function neighbour (point, id) {
	for (var i = point.xx-1; i <= point.xx+1; i++) {
		for (var j = point.yy-1; j <= point.yy+1; j++) {
			if(i-point.xx != j-point.yy){
				var result = identify(point.xx, point.yy);
				if(result.length){
					var temp = result[0].tag;
					if (temp!=id) {
						add_hex(point, id);
						remove_hex(point, temp);
						shift_occupied(point, temp, id);
					}
				}
			}
		}
	}
}

function shift_occupied (point, from_id, to_id) {
	$.each(occupied, function(i){
	    if(occupied[i].xx === point.xx && occupied[i].yy === point.yy) {
	        occupied[i].tag = to_id;
	        return false;
	    }
	});
	render(state);
}
