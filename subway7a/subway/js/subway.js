function Subway() {
}

(function ($) {

    var M = Subway; // subway module


    $.fn.toEm = function (settings) {
        settings = jQuery.extend({
            scope: 'body'
        }, settings);
        var that = parseInt(this[0], 10),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
        scopeTest.remove();
        return (that / scopeVal).toFixed(8);
    };

    $.fn.toPx = function (settings) {
        settings = jQuery.extend({
            scope: 'body'
        }, settings);
        var that = parseFloat(this[0]),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
        scopeTest.remove();
        return Math.round(that * scopeVal);
    };

    M.Row = function (depth, isaux) {
        var my = this;
        my.par = null; // parent row, needed for row nesting
        my.isaux = (isaux ? true : false); // is this an auxiliary (thin) row?
        my.depth = depth; // how this row is inside the tree
        my.circle = []; // array of circles
    };

    M.Circle = function (input_data) {
        var my = this;
        my.shape = {}; // Raphael shape associated with this circle
        my.line_color = "#fa0";
        my.fill_color = "#ddf";
        my.stroke_color = "#090";
        my.name = "";
        my.description = "";
        if (input_data) {
            my.name = input_data.name;
            my.description = input_data.description;
            if (input_data.line_color) my.line_color = input_data.line_color;
            if (input_data.fill_color) my.fill_color = input_data.fill_color;
            if (input_data.stroke_color) my.stroke_color = input_data
                .stroke_color;
        }
        my.ispoint = false;
        my.nextind = []; // following circles
        my.par = this; // parent circle
        my.depth = 0;
        // recursively initialize this circle, assigning row to it and depth:
        my.init = function (row, depth, par, ispoint) {
            my.ispoint = (ispoint ? true : false);
            my.par = par;
            row.circle.push(this); // append ourselves to the given row
            my.depth = depth;
            if (!my.nextind.length) {
                return;
            } else if (my.nextind.length == 1) {
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
            for (var i = 0; i < my.nextind.length; ++i) {
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
    $(document).mousemove(function (e) {
        if (M.over) {
            M.tip.text(M.tiptext);
            M.tip.css({
                "left": e.clientX - 10 - M.tip.width(),
                "top": e.clientY - 10 - M.tip.height()
            });
        }
    });

    M.addshowcase = function (node, c) {
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
    M.addtip = function (node, txt) {
        $(node).mouseenter(function () {
            M.tiptext = txt;
            M.tip.show();
            M.over = true;
        }).mouseleave(function () {
            M.tip.hide();
            M.over = false;
        });
    }

    // Model class loads the data and maintains tree structures
    M.Model = function () {
        var my = this;
        my.input = {}; // input graph
        my.row = []; // array of rows in this model, contains circles
        my.circle = []; // array of pointers to circles in same order as input

        // initialize the data model by giving the input graph (array of nodes
        // and array of links):
        my.init = function (input_graph) {
            my.input = input_graph;
            my.circle = [];
            // assuming that firs element in the input graph is first one,
            // and the elements are sorted left-right top-bottom:
            for (var i = 0; i < my.input.nodes.length; ++i) {
                // for each node we create a circle and add links to it
                var c = new M.Circle(my.input.nodes[i]);
                my.circle[i] = c;
                for (var j = 0; j < my.input.links.length; ++j) {
                    var link = my.input.links[j];
                    if (link.target == i) {
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
    M.View = function (div) {
        var my = this;
        my.ismap = false; // is this a minimap?
        my.model = M.model; // data model
        my.container = div; // container $(div)
        my.canvas = div.find(".canvas"); // div to use as a canvas
        my.scale = 1; // scale used when zooming
        my.xoff = 2; // offset from left
        my.yoff = 4; // offset from top
        my.xstep = 6; // default distance between circles
        my.xpointstep = 3; // default distance between junctions
        my.ystep = 7; // default distance between rows
        my.yauxstep = 3; // vertical distance between auxillary rows
        my.radius = 1.5; // default radius of a circle
        my.diam = my.radius * 2; // to reduce calculation steps later on
        my.descrw = 5; // width of description box
        my.descrh = 2;
        my.descryoff = 0.4; // vertical offset between top of circle and descr.
        my.linewidth = 0.3; // default line width
        my.xmax = 0; // used for fitting
        my.ymax = 0;
        my.minscale; // minimal scale determined by fitting. should be updated
        // after window resizing
        my.root; //pointer to root of tree of the DOM elements inside this view

	my.anim = function(circ) { // circ = circle div (starting from my.root)
		// recursively traverse dom tree to animate all the elements:
		var fn = function() {
			var c = circ;
			c.fadeIn(2000);
			if(c.descr) {
				c.descr.fadeIn(2000);
			}
		}
		circ.hide();
		if(circ.lineto) {
			// either width or height of the div is a line width,
			// so we want to keep it the same
			var w = 0; // initial width of div
			var h = 0;
			var x = circ.par.xem + my.radius;
			var targetx = circ.par.xem + my.radius;
			if(circ.lineto.targetw < circ.lineto.targeth) {
				w = circ.lineto.targetw;
			} else {
				h = circ.lineto.targeth;
			}
			if(circ.par.xem > circ.xem) {
				targetx = circ.xem + my.radius;
			}
			circ.lineto.css({width: w + "em", height: h + "em",
				left: x + "em"});
			circ.lineto.show();
			circ.lineto.animate({width: circ.lineto.targetw + "em",
					height: circ.lineto.targeth + "em",
					left: targetx + "em"},
				2000, "swing", fn);
		} else {
			circ.animate({left: circ.xem + "em"},
				2000, "swing", fn);
		}
		for(var i = 0; i < circ.next_circ.length; ++i) {
			my.anim(circ.next_circ[i]);
		}
	}

        my.draw = function () {
            my.xmax = 0; // reset fitting values
            my.ymax = 0;
            var div = $("#" + my.id);
            my.w = div.width();
            my.h = div.height();
            var scale = my.scale;
            var x = my.xoff * scale, y = my.yoff * scale;
            for (var i = 0; i < my.model.row.length; ++i) {
                var row = my.model.row[i];
                y += (i ? (row.isaux ? my.yauxstep : my.ystep) : 0);
                x = my.xoff * scale;
                if (row.par) {
                    x = row.par.x;
                }
                if (row.isaux && row.par) {
                    x = row.par.x + my.xpointstep;
                }
                row.x = x;
                row.y = y;
                for (j = 0; j < row.circle.length; ++j) {
                    var c = row.circle[j];
                    var p = c.par;
                    if (row.isaux) {
                        x = (j == 0) ? c.par.x : row.x;
                    } else {
                        x += (j ? (c.par.ispoint ?
                            my.xpointstep : my.xstep) : 0);
                    }
                    if (!c.ispoint) {
                        // add big circle:
                        var circ = $('<div>').addClass("circle")
                            .css({
                                left: x + 'em',
                                top: y + 'em',
                                width: my.diam + 'em',
                                height: my.diam + 'em',
                                "border-color":
                                c.stroke_color,
                                "background-color":
                                c.fill_color
                            })
                            .text(c.name);
                        my.canvas.append(circ); // add div to canvas
                        // add description box:
                        var descr = $('<div>')
                            .addClass("descr");
                        var dtext = $('<p>')
                            .text(c.description);
                        descr.append(dtext);
                        my.canvas.append(descr); // append descr div to canvas
			circ.descr = descr; // add link to the DOM tree for anim
                        descr.css({
                            height: my.descrh + 'em',
                            width: my.descrw + 'em'
                        });
                        // actual descr height:
                        var realh = $(descr.height()).toEm({
                            scope: descr
                        });
                        descr.css({
                            left: (x - (my.descrw *
                                    0.5) + my.radius)
                                            + 'em',
                            top: (y - realh -
								my.descryoff)
								+ 'em',
                            width: my.descrw + 'em'
                        });
                        if (my.ismap) {
                            M.addtip(circ, c.description);
                        }
			descr.hide();
                    } else {
			// if this is a point, we must still create an empty div
			var circ = $('<div>');
			circ.ispoint = true;
			circ.hide();
			my.canvas.append(circ);
                    }
                    c.x = x; // temporarily store coordinates
                    c.y = y;
			circ.par = (p? p.circ: null); // parent circle
			circ.xem = x; // coordinates in em units
			circ.yem = y;
			circ.next_circ = []; // array of links to next circ divs
			c.circ = circ; // bind this div temporarily
			if(!p) { // if this is a root of tree, set my.root to it
				my.root = circ;
			} else { // otherwise, add it to the parent div's array
				p.circ.next_circ.push(circ);
			}
			// update the bounding values:
                    my.xmax = ((x + my.diam * 2) > my.xmax ?
                        x + my.diam * 2 : my.xmax);
                    my.ymax = ((y + my.diam * 2) > my.ymax ?
                        y + my.diam * 2 : my.ymax);
			// add the reaching to this circle:
                    if (p) {
                        var l = x < p.x ? x : p.x; // left
                        var t = y < p.y ? y : p.y; // top
                        var w = x < p.x ? (p.x - x) : (x - p.x);
                        var h = y < p.y ? (p.y - y) : (y - p.y);
                        l += (my.diam + my.linewidth) * 0.5;
                        t += (my.diam + my.linewidth) * 0.5;
                        w = w ? my.linewidth + w : my.linewidth;
                        h = h ? my.linewidth + h : my.linewidth;
                        var line = $('<div>').addClass("line")
                            .css({
                                left: l + 'em',
                                top: t + 'em',
                                width: w + 'em',
                                height: h + 'em',
                                "background-color":
                                p.line_color
                            });
			line.targetw = w;
			line.targeth = h;
			line.hide();
                        my.canvas.append(line);
			circ.lineto = line; // line to this circle in DOM tree
                    }
                }
            }
            // determine scale at which the contents will fit the div:
            var xsc = my.w / my.xmax;
            var ysc = my.h / my.ymax;
            my.minscale = (xsc < ysc ? xsc : ysc);
            my.canvas.width(my.xmax + 'em');
            my.canvas.height(my.ymax + 'em');
            if (my.ismap) {
//                my.container.css({
//                    "right": (my.xmax + 1) + 'em',
//                    "top": 1 + 'em'
//                });
            }
        }
    }

    // prepare data model for visualizing:
    M.model.init(input_graph);

    // main window:
    M.mainview = new M.View($("#mainview"));
    M.v = $('#mainview'); // easy access to mainview container div
    M.c = $('#mainview .canvas'); // easy access to mainview canvas div

    // mini map:
	M.mapv = $("<div>").attr("id", "minimap"); // minimap container
	M.mapc = $("<div>").addClass("canvas"); // the minimap canvas
	M.navbox = $("<div>").addClass("navbox"); // box inside the minimap
	M.mapc.append(M.navbox);
	M.mapv.append(M.mapc);
	M.v.append(M.mapv);

    M.minimap = new M.View($("#minimap"));
    M.minimap.ismap = true;

    M.mousedown = false; // click drag detection
    M.startx = 0; // initial drag mouse position
    M.starty = 0;
    M.dx = 0; // delta x
    M.dy = 0;
    M.vx = 0; // original view x
    M.vy = 0;
    M.vw = 0; // original view width
    M.vh = 0; // original view height
    //M.updatetimer; // timer used for dragging
    M.isshowcase = false; // are we in showcase mode?
    M.vbox_bup; // backup of vbox before entering the showcase mode


    M.updatenavbox = function () {
        // determine ratio of width and height:
        var v = M.v;
        var c = M.c;
        var rw = v.width() / c.width();
        var rh = v.height() / c.height();
        var rx = v.scrollLeft() / c.width();
        var ry = v.scrollTop() / c.height();
        M.navbox.width(M.mapc.width() * rw);
        M.navbox.height(M.mapc.height() * rh);
        M.navbox.css({ left: M.mapc.width() * rx, top: M.mapc.height() * ry });
    };

    M.resize = function () {
	M.v.width($(window).width());
	M.v.height($(window).height());
        M.updatenavbox();
    };

    M.v.scroll(M.updatenavbox);

    $(window).resize(M.resize);

    M.v.mousedown(function (e) {
        if (M.isshowcase == true) {
            M.isshowcase = false;
        }
        M.startx = e.screenX;
        M.starty = e.screenY;
        M.vx = M.v.scrollLeft();
        M.vy = M.v.scrollTop();
        M.mousedown = true;
        //	M.updatetimer = setInterval(M.mainview.update, 200);
    });

    $(window).mousemove(function (e) {
        if (M.mousedown) {
            M.dx = M.startx - e.screenX;
            M.dy = M.starty - e.screenY;
            M.v.scrollLeft(M.vx + M.dx);
            M.v.scrollTop(M.vy + M.dy);
            //	M.updatenavbox();
        }
    });

    $(window).mouseup(function (e) {
        M.mousedown = false;
        //	clearInterval(M.updatetimer);
    });

    M.v.bind('mousewheel DOMMouseScroll', function (e) {
        var v = $('#mainview');
        var c = $('#mainview .canvas');
        if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
            // scroll up: zoom in
            v.css('font-size', parseInt(v.css('font-size'), 10) + 5);
        } else {
            // scroll down: zoom out
            var rw = v.width() / c.width();
            var rh = v.height() / c.height();
            if (rw < 1 || rh < 1) {
                v.css('font-size', parseInt(v.css('font-size'), 10) - 5);
            }
        }
        M.resize();
        return false;
    });

    M.navigate = function (e) {
        var mmx = e.pageX - M.mapv.offset().left; // minimap x
        var mmy = e.pageY - M.mapv.offset().top; // minimap y
        // center view according to mouse position inside of minimap:
        mmx -= M.navbox.width() * 0.5; // center offset
        mmy -= M.navbox.height() * 0.5;
        // now scroll to that position scaled
        M.v.scrollLeft(M.c.width() / M.mapc.width() * mmx);
        M.v.scrollTop(M.c.height() / M.mapc.height() * mmy);
        return false;
    }


    M.mainview.draw();
	M.mainview.anim(M.mainview.root);
    M.minimap.draw();
	M.minimap.anim(M.minimap.root);
    M.minimap.container.show().width(M.mainview.w * 0.25)
        .height(M.mainview.h * 0.25)
        .click(function (e) {
            return M.navigate(e);
        }).mousemove(function (e) {
            if (M.mousedown) {
                return M.navigate(e);
            }
        });

    M.resize();

})(jQuery);

