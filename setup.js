

// main canvas
var canvas=document.getElementById("draw");
canvas.style.zIndex   = "0";
canvas.style.position = "absolute";
var conn = canvas.getContext('2d');
conn.scale(scale_x,scale_y);
draw_map(radius, sides);
generate_canvases(num_players);
init_game(num_players, num_level);

jQuery(document).ready(function () {
	

	// Creates canvas 320 × 200 at 10, 50
	var paper = Raphael(10, 50, 320, 200);

	// Creates circle at x = 50, y = 40, with radius 10
	var circle = paper.circle(50, 40, 10);
	// Sets the fill attribute of the circle to red (#f00)
	circle.attr("fill", "#f00");

	// Sets the stroke attribute of the circle to white
	circle.attr("stroke", "#fff");

	
	// $('#set').click(function() {
	// 	state = document.getElementById("spinner").value;
	// 	// if(can[state])can[state].style.display="none";
	// 	// can[state].toggle();
	// });
	can[num_players+2].addEventListener('mousemove', function(e) {
		pixel_to_hex((e.pageX - this.offsetLeft)/scale_x, (e.pageY - this.offsetTop)/scale_y);
	}, false);

	can[num_players+2].addEventListener('click', function(e) {
		play((e.pageX - this.offsetLeft)/scale_x, (e.pageY - this.offsetTop)/scale_y, state);
	}, false);
});

// canvasses
// 0 -> map
// 1 to num_players -> one foreach player
// +1 -> highlight
// +2 -> activity
// +3 -> blink_probables

function generate_canvases (num_players) {
	for (var i = 0; i <= num_players+3; i++) {
		can.push(document.createElement('canvas'));
		can[i].id     = "can_" + i.toString();
		can[i].width  = canvas_width;
		can[i].height = canvas_height;
		can[i].style.zIndex   = "2";
		can[i].style.position = "absolute";
		con.push(can[i].getContext('2d'));

		con[i].scale(scale_x,scale_y);
		document.body.appendChild(can[i]);
	}
	can[num_players+3].style.zIndex   = "3";
	can[num_players+2].style.zIndex   = "5";
	can[num_players+1].style.zIndex   = "4";
	can[0].style.zIndex   = "1";
	for (var i = 0; i <= num_players+3; i++) {
		cover[i] = [];
	}
}

function draw_map (radius, sides) {
	var x = 0, y = 0;
	while(x < canvas.width/scale_x + radius){
		while(y < canvas.height/scale_y + radius){
			draw_polygon(x, y, sides, 1, conn, 0);
			y += Math.sqrt(3)*radius;
		}
		x += 3 * radius;
		y = 0;
	}
	x = 3/2 * radius;
	y = Math.sqrt(3)/2*radius;
	while(x < canvas.width/scale_x + radius){
		while(y < canvas.height/scale_y + radius){
			draw_polygon(x, y, sides, 1, conn, 0);
			y += Math.sqrt(3)*radius;
		}
		x += 3 * radius;
		y = Math.sqrt(3)/2*radius;
	}
}

function init_game (players, level) {
	first_chance = true;
	var data = levels[players][level];
	for (var i = 0; i < data.length; i++) {
		var coord = {"xx": data[i].x,"yy": 0-data[i].y-data[i].x};
		toggle_map(coord);
		if (data[i].tag != 0) {
			document.getElementById("color").style.backgroundColor = color[data[i].tag + 2];
			add_hex(coord, data[i].tag);
		}
		render(data[i].tag);
	}
	state = 1;
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
}
