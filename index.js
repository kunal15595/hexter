
function play (x, y, stat) {

	var coord = pixel_to_hex(x, y);
	hover = coord;
	// console.log('clicked on', coord);
	if(stat == 0)
		toggle_map(coord);
	else{
		if(!in_map(coord))
			return;
		if(in_probables(coord)){
			var result = identify(x, y);
			if(result.length==0){
				add_hex(coord, stat);
				neighbour(coord, stat);
			}
			half_chance = false;
			state++;
			document.getElementById("color").style.backgroundColor = color[state + 2];
			// console.log('full_chance');
		}else{
			var result = identify(coord.xx, coord.yy);
			probables.length = 0;
			if(result.length){
				// console.log('1');
				if(result[0].tag == stat){
					add_to_probables(coord);
					half_chance = true;
					// console.log('half_chance');
				}
			}
		}
	}
	render(stat);
	highlight(hover);
}


function beautify_polygon (center_x, center_y, sides, color, cxt, size, border_width, border_color) {
	cxt.fillStyle = color;
		cxt.beginPath();

		for (var i = 0; i < sides; i++) {
			var angle = 2 * Math.PI / sides * i;
		    var x_i = center_x + size * Math.cos(angle);
		    var y_i = center_y + size * Math.sin(angle);
		    // console.log(x_i, y_i);
		    
		    if(i == 0)
		    	cxt.moveTo(x_i, y_i);
		    else
		    	cxt.lineTo(x_i, y_i);
		}
		cxt.closePath();
		cxt.lineWidth = border_width;
		cxt.strokeStyle = border_color;
		cxt.stroke();
		cxt.fill();
}

function draw_polygon (center_x, center_y, sides, id, cxt, tag) {
	// console.log(center_x, center_y, sides, id, cxt);
	beautify_polygon(center_x, center_y, sides, color[color.length - id - 1], cxt, radius, 2, "black");
	if(tag)beautify_polygon(center_x, center_y, sides, color[id], cxt, radius*0.6, 0.5, "white");
}

function highlight (point) {
	// return;
	console.log('0');	
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

	var high = 0;
	if(result.length!=0)
		high = result[0].tag;
	
	// console.log(center_x, center_y, sides, high+2, con[num_players+1], high);
	draw_polygon(center_x+1.5, center_y+1.5, sides, !in_map(point)?1:high+2, con[num_players+1], high);
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
			if(i-point.xx != j-point.yy && !identify(i, j)[0] && in_map({"xx": i, "yy": j})){
				probables.push(new point_2d(i, j));
				blink_probables(new point_2d(i, j), state, true);	
			}
		}
	}
	// console.log('probables', probables);
}


function add_hex (point, id) {
	// console.log('trying to add point');
	if (!in_map(point)) return;
	// console.log('adding point');
	var result = $.grep(cover[id], function(e, index){ return e.xx === point.xx && e.yy === point.yy; });
	
	if(result.length == 0)cover[id].push(point);

	var prop = identify(point.xx, point.yy);
	if(prop.length == 0){
		occupied.push(new occupied_point(point.xx, point.yy, id));
		// console.log('now occupied by ', id, ' occupied', occupied);
	}else{
		shift_occupied(point, prop[0].tag, id);
		// console.log('shifted from ', prop[0].tag, ' to ', id);
	}

	// console.log(occupied);
	render(id);
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


function render(id) {
	// console.log(id);
	// return;
	con[id].save();
	con[id].setTransform(1, 0, 0, 1, 0, 0);
	con[id].clearRect(0, 0, can[id].width, can[id].height);
	con[id].restore();
	for (var i = 0; i < cover[id].length; i++) {
		var center_x = cover[id][i].xx*(3/2)*radius, 
			center_y = 0 - Math.sqrt(3)*cover[id][i].yy/2*radius + Math.sqrt(3)*1/2*radius*(0 - cover[id][i].xx - cover[id][i].yy);
		
		draw_polygon(center_x, center_y, sides, id+2, con[id], id);
	}
}

function neighbour (point, id) {
	for (var i = point.xx-1; i <= point.xx+1; i++) {
		for (var j = point.yy-1; j <= point.yy+1; j++) {
			if(i-point.xx != j-point.yy){
				var result = identify(i, j);
				if(result.length){
					var temp = result[0].tag;
					if (temp!=id) {
						add_hex({"xx": i, "yy": j}, id);
						remove_hex({"xx": i, "yy": j}, temp);
						shift_occupied({"xx": i, "yy": j}, temp, id);
						render(temp);
						render(id);
						highlight(hover);
					}
				}
			}
		}
	}
}
