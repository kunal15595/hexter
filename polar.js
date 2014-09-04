window.onload = function () {
    var t = document.getElementById('time');
    var col = [  "#333", "#777", "#0ff","#ff0","#f0f","#00f","#0f0","#f00","#5af","#5fa","#fa5","#f5a","#a5f","#af5","#7a1","#71a","#a17","#a71","#1a7","#17a","#a00","#0a0","#00a","#a0a","#aa0","#0aa", "#333","#777"];

    var num_players = 6;
    for (var i = 0; i < num_players; i++) {
        var span = document.createElement('span');
        span.setAttribute("id", 'span_'+i.toString());
        t.appendChild(span);
    }
    var r = Raphael("holder", 600, 600),
        R = 50,
        init = true,
        param = {stroke: "#fff", "stroke-width": 5},
        hash = document.location.hash,
        marksAttr = {fill: hash || "#444", stroke: "none"},
        html = [];
        for (var i = 0; i < num_players; i++) {
            html.push(document.getElementById('span_'+i));
        }
    // Custom Attribute
    r.customAttributes.arc = function (value, total, R, id) {
        var alpha = 360 / total * value,
            a = (90 - alpha) * Math.PI / 180,
            x = 300 + R * Math.cos(a),
            y = 300 - R * Math.sin(a),
            color = col[id],
            path;
        if (total == value) {
            path = [["M", 300, 300 - R], ["A", R, R, 0, 1, 1, 299.99, 300 - R]];
        } else {
            path = [["M", 300, 300 - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
            // console.log(alpha, +(alpha > 180));
        }
        return {path: path, stroke: color};
    };
    var arcs = [];
    for (var i = 0; i < num_players; i++) {
        arcs.push(r.path().attr(param).attr({arc: [0, 6000, R]}));
        R -= 10;
    }
    
    function updateVal(value, total, R, hand, id) {
        
        var color = col[id];
        if (init) {
            hand.animate({arc: [value, total, R, id]}, 900, ">");
        } else {
            if (!value || value == total) {
                value = total;
                hand.animate({arc: [value, total, R, id]}, 750, "bounce", function () {
                    hand.attr({arc: [0, total, R, id]});
                });
            } else {
                hand.animate({arc: [value, total, R, id]}, 750, "elastic");
            }
        }
       
    }

    (function () {
        var d = new Date,
            h = d.getHours() % 12 || 12;
        updateVal(1500, 6000, Math.floor(Math.random()*50), arcs[0], 2);
        updateVal(4000, 6000, Math.floor(Math.random()*50), arcs[1], 1);
        updateVal(5000, 6000, Math.floor(Math.random()*50), arcs[2], 0);
        updateVal(Math.floor(Math.random()*5000), 6000, Math.floor(Math.random()*50), arcs[3], 3);
        updateVal(500, 6000, Math.floor(Math.random()*50), arcs[4], 4);
        
        setTimeout(arguments.callee, 10000);
        init = false;
    })();
};