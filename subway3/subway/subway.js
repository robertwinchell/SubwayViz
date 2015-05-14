function Subway() {
}

(function($) {

var M = Subway; // subway module

M.Row = function(depth, isaux) {
	var my = this;
	my.par = null; // parent row, needed for row nesting
	my.isaux = (isaux? true: false); // is this an auxiliary (thin) row?
	my.depth = depth; // how this row is inside the tree
	my.circle = []; // array of circles
};

M.Circle = function(input_data) {
	var my = this;
	my.shape = {}; // Raphael shape associated with this circle
	my.line_color = "#fa0";
	my.fill_color = "#ddf";
	my.stroke_color = "#090";
	my.name = "";
	my.description = "";
	if(input_data) {
		my.name = input_data.name;
		my.description = input_data.description;
		if(input_data.line_color) my.line_color = input_data.line_color;
		if(input_data.fill_color) my.fill_color = input_data.fill_color;
		if(input_data.stroke_color) my.stroke_color = input_data
			.stroke_color;
	}
	my.ispoint = false;
	my.nextind = []; // following circles
	my.par = this; // parent circle
	my.depth = 0;
	// recursively initialize this circle, assigning row to it and depth:
	my.init = function(row, depth, par, ispoint) {
		my.ispoint = (ispoint? true: false);
		my.par = par;
		row.circle.push(this); // append ourselves to the given row
		my.depth = depth;
		if(!my.nextind.length) {
			return;
		} else if(my.nextind.length == 1) {
//		console.log(my.nextind.length);
			M.model.circle[
				my.nextind[0]].init(row, depth + 1, this);
			return;
		}
		// we have branching, for that we need to create intermediate
		// points:
		// first we create an extra row for line that goes right-left:
		var auxrow = new M.Row(depth + 1, true);
		M.model.row.push(auxrow);
		auxrow.par = row.par;
		var junction1 = new M.Circle(); // create first right-to-left
		junction1.init(auxrow, depth + 1, this, true); // point 1
		junction1.line_color = my.line_color;
//		M.point.push(junction1);
		// second right-to-left point:
		var junction2 = new M.Circle();
		junction2.init(auxrow, depth + 1, junction1, true); // point 2
		junction2.line_color = my.line_color;
//		M.point.push(junction2);
		var prevhead = junction2; // previous head junction
		for(var i = 0; i < my.nextind.length; ++i) {
			var newrow = new M.Row(depth + 1);
			M.model.row.push(newrow);
			newrow.par = auxrow;
			// create a "head" junction
			var head = new M.Circle();
			head.init(newrow, depth + 1, prevhead, true); // head
			head.line_color = my.line_color;
//			M.point.push(head);
			M.model.circle[my.nextind[i]]
				.init(newrow, depth + 1, head);
			prevhead = head;
		}
	}
};


// tooltip related:
M.tip = $("#tip").hide();
M.tiptext = "";
M.over = false; // is the mouse over a node?

// grab mouse movements so that tooltip follows the cursor
$(document).mousemove(function(e) {
	if(M.over) {
		M.tip.css({"left": e.clientX + 10, "top": e.clientY + 10});
		M.tip.text(M.tiptext);
	}
});

M.addshowcase = function(node, c) {
/*	$(node).click(function() {
		M.vbox_bup = [ M.mainview.x, M.mainview.y,
			M.mainview.w, M.mainview.h ];
		M.mainview.x = -c.x;
		M.mainview.y = -c.y;
		var ratio = M.mainview.w / M.mainview.h;
//		M.mainview.w = 120 * ratio;
//		M.mainview.h = 120;
		M.mainview.update();
		M.isshowcase = true;
	});
*/
};

// add tooltip
M.addtip = function(node, txt) {
	$(node).mouseenter(function() {
		M.tiptext = txt;
		M.tip.show();
		M.over = true;
	}).mouseleave(function() {
		M.tip.hide();
		M.over = false;
	});
}

// Model class loads the data and maintains tree structures
M.Model = function() {
	var my = this;
	my.input = {}; // input graph
	my.row = []; // array of rows in this model, contains circles
	my.circle = []; // array of pointers to circles in same order as input

	// initialize the data model by giving the input graph (array of nodes
	// and array of links):
	my.init = function(input_graph) {
		my.input = input_graph;
		my.circle = [];
		// assuming that firs element in the input graph is first one,
		// and the elements are sorted left-right top-bottom:
		for(var i = 0; i < my.input.nodes.length; ++i) {
			// for each node we create a circle and add links to it
			var c = new M.Circle(my.input.nodes[i]);
			my.circle[i] = c;
			for(var j = 0; j < my.input.links.length; ++j) {
				var link = my.input.links[j];
				if(link.target == i) {
					c.nextind.push(link.source);
				}
			}
		}
		// now, we traverse tree of circles,
		// and each time we have a split,
		// add a new row (assuming this is a tree for now):
		my.row = [];
		my.row[0] = new M.Row(0);
		my.circle[0].init(my.row[0], 0); // recursively init the circles
	}
}

M.model = new M.Model();

// View class controls the data display: be it main window or mini map
M.View = function() {
	var my = this;
	my.ismap = false; // is this a minimap?
	my.model = M.model; // data model
	my.id = "holder"; // div id to use as a canvas
	my.r; // Raphael object
	my.scale = 1; // scale used when zooming
	my.xoff = 100; // offset from left
	my.yoff = 100; // offset from top
	my.xstep = 70; // default distance between circles
	my.xpointstep = 40; // default distance between junctions
	my.ystep = 90; // default distance between rows
	my.yauxstep = 35; // vertical distance between auxillary rows
	my.radius = 20; // default radius of a circle
	my.linewidth = 3; // default line width
	my.xmax = 0; // used for fitting
	my.ymax = 0;
	my.x = 0; // viewbox axis
	my.y = 0;
	my.w = 0; // last known width of the containing div
	my.h = 0;
	my.minscale; // minimal scale determined by fitting. should be updated
			// after window resizing
	my.fit = function() {
		my.xoff = 100;
		my.yoff = 100;
		my.scale = my.minscale;
	//	my.r.setViewBox(0, 0, my.w, my.h);
//		console.log(my.vbox);
	}

	my.update = function() {
		my.r.setViewBox(my.x, my.y, my.w, my.h);
	}

	my.draw = function() {
		try {
			my.r.remove();
		}
			catch(error) {
		}
		my.xmax = 0; // reset fitting values
		my.ymax = 0;
		var div = $("#" + my.id);
		my.w = div.width();
		my.h = div.height();
		my.r = Raphael(my.id, my.w - 5, my.h - 5);
		my.update();
		var scale = my.scale;
		var x = my.xoff * scale, y = my.yoff * scale;
		for(var i = 0; i < my.model.row.length; ++i) {
			var row = my.model.row[i];
			y += (i? (row.isaux? my.yauxstep: my.ystep): 0);
			x = my.xoff * scale;
			if(row.par) {
				x = row.par.x;
			}
			if(row.isaux && row.par) {
				x = row.par.x + my.xpointstep;
			}
			row.x = x;
			row.y = y;
			for(j = 0; j < row.circle.length; ++j) {
				var c = row.circle[j];
				var p = c.par;
				if(row.isaux) {
					x = (j == 0)? c.par.x: row.x;
				} else {
					x += (j? (c.par.ispoint?
						my.xpointstep: my.xstep): 0);
				}
				if(!c.ispoint) {
					var set = my.r.set();
					var circ;
					set.push(
						my.r.circle(x * scale,
							y * scale,
							my.radius * scale)
						.attr({fill: c.fill_color,
							stroke: c.stroke_color,
							"stroke-width":
						my.linewidth * scale}),
						my.r.text(x * scale, y * scale,
							c.name)
						.scale(1.6 * scale,
							1.6 * scale),
						circ = my.r.circle(x * scale,
							y * scale,
							my.radius * scale)
						.attr({fill:
						"rgba(255,255,255,0.001)",
							stroke: null})
					);
					c.shape = set;
					if(!my.ismap) {
					M.addtip(circ.node, c.description);
					M.addshowcase(circ.node, c);
					}
				} else {
					set.push(my.r.circle(x * scale,
							y * scale,
						my.linewidth * 0.5 * scale)
						.attr({"fill": c.line_color,
						stroke: null}));
					c.shape = set;
				}
				c.x = x;
				c.y = y;
				my.xmax = ((x + my.radius * 2) > my.xmax?
					x + my.radius * 2: my.xmax);
				my.ymax = ((y + my.radius * 2) > my.ymax?
					y + my.radius * 2: my.ymax);
				if(p) {
					my.r.path("M" + x * scale + ' ' +
						y * scale + "L"
					+ p.x * scale + ' ' + p.y * scale)
					.attr({"stroke-width":
						my.linewidth * scale,
						stroke: p.line_color})
					.toBack();
				}
			}
		}
		// determine scale at which the contents will fit the div:
		var xsc = my.w / my.xmax;
		var ysc = my.h / my.ymax;
		my.minscale = (xsc < ysc? xsc: ysc);
	}
}

// prepare data model for visualizing:
M.model.init(input_graph);

// main window:
M.mainview = new M.View();

// mini map:
M.minimap = new M.View();
M.minimap.id = "minimap";
M.minimap.ismap = true;

M.resize = function() {
	M.mainview.draw();
	$("#minimap").width(M.mainview.w * 0.3);
	$("#minimap").height(M.mainview.h * 0.3);
		$("#minimap").show();
		M.minimap.draw();
		M.minimap.fit();
		M.minimap.draw();
};

$(window).resize(M.resize);

M.mousedown = false; // click drag detection
M.startx = 0; // initial drag mouse position
M.starty = 0;
M.dx = 0; // delta x
M.dy = 0;
M.vx = 0; // original view x
M.vy = 0;
M.vw = 0; // original view width
M.vh = 0; // original view height
M.updatetimer; // timer used for dragging
M.isshowcase = false; // are we in showcase mode?
M.vbox_bup; // backup of vbox before entering the showcase mode

$(window).mousedown(function(e) {
	if(M.isshowcase == true) {
		M.mainview.x = M.vbox_bup[0];
		M.mainview.y = M.vbox_bup[1];
		M.mainview.w = M.vbox_bup[2];
		M.mainview.h = M.vbox_bup[3];
		M.mainview.update();
		M.isshowcase = false;
	}
	M.startx = e.pageX;
	M.starty = e.pageY;
	M.vx = M.mainview.x;
	M.vy = M.mainview.y;
	M.mousedown = true;
	M.updatetimer = setInterval(M.mainview.update, 200);
});

$(window).mousemove(function(e) {
	if(M.mousedown) {
		M.dx = M.startx - e.pageX;
		M.dy = M.starty - e.pageY;
		M.mainview.x = M.vx + M.dx;
		M.mainview.y = M.vy + M.dy;
	}
});

$(window).mouseup(function(e) {
	M.mousedown = false;
	clearInterval(M.updatetimer);
});


M.resize();
M.mainview.fit();
M.resize();
$("#minimap").show();
$("#minimap").width(M.mainview.w * 0.3);
$("#minimap").height(M.mainview.h * 0.3);


})(jQuery);

