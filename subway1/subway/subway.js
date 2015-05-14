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
	my.name = "";
	my.description = "";
	if(input_data) {
		my.name = input_data.name;
		my.description = input_data.description;
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
//		M.point.push(junction1);
		// second right-to-left point:
		var junction2 = new M.Circle();
		junction2.init(auxrow, depth + 1, junction1, true); // point 2
//		M.point.push(junction2);
		var prevhead = junction2; // previous head junction
		for(var i = 0; i < my.nextind.length; ++i) {
			var newrow = new M.Row(depth + 1);
			M.model.row.push(newrow);
			newrow.par = auxrow;
			// create a "head" junction
			var head = new M.Circle();
			head.init(newrow, depth + 1, prevhead, true); // head
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

// add tooltip
M.addtip = function(node, txt) {
	$(node).mouseenter(function() {
		M.tiptext = txt;
		M.tip.fadeIn();
		M.over = true;
	}).mouseleave(function() {
		M.tip.fadeOut(200);
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
	my.w = 0; // last known width of the containing div
	my.h = 0;
	my.minscale; // minimal scale determined by fitting. should be updated
			// after window resizing
	my.fit = function() {
		my.xoff = 100;
		my.yoff = 100;
		my.scale = my.minscale;
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
						.attr({fill: "#ddf",
							stroke: "#090",
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
					}
				} else {
					set.push(my.r.circle(x * scale,
							y * scale,
						my.linewidth * 0.5 * scale)
						.attr({"fill": "#fa0",
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
						stroke: "#fa0"})
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

M.resize = function() {
	M.mainview.draw();
	$("#minimap").width(M.mainview.w * 0.3);
	$("#minimap").height(M.mainview.h * 0.3);
	if(M.mainview.scale >= M.mainview.minscale) {
		M.minimap.draw();
		$("#minimap").show();
	} else {
		$("#minimap").hide();
	}
};

$(window).resize(M.resize);
$(window).bind('mousewheel DOMMouseScroll', function(e) {
	if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
		// scroll up
		M.mainview.scale += 0.2;
		M.mainview.xoff -= 0.2 * e.originalEvent.clientX;
		M.mainview.yoff -= 0.2 * e.originalEvent.clientY;
		M.mainview.xoff /= M.mainview.scale;
		M.mainview.yoff /= M.mainview.scale;

	} else {
		// scroll down
		M.mainview.scale -= 0.2;
		M.mainview.xoff += 0.2 * e.originalEvent.clientX;
		M.mainview.yoff += 0.2 * e.originalEvent.clientY;
		M.mainview.xoff /= M.mainview.scale;
		M.mainview.yoff /= M.mainview.scale;
		if(M.mainview.scale < M.mainview.minscale) {
			M.mainview.fit();
		}
	}
	M.resize();
});

M.resize();
M.mainview.fit();
M.resize();
$("#minimap").show();
$("#minimap").width(M.mainview.w * 0.3);
$("#minimap").height(M.mainview.h * 0.3);
M.minimap.draw();
M.minimap.fit();
M.minimap.draw();
$("#minimap").hide();


})(jQuery);

