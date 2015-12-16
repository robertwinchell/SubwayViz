function Subway() {
}

(function($) {

var M = Subway; // subway module (this module)

M.max_line_len = 5; // how many nodes allowed before newline
M.diagram_url = "http://lextestrcp.azurewebsites.net/api/lexdiagrams/";
M.detail_url = "http://lextestrcp.azurewebsites.net/api/diagramnodedetailpage/";
M.meta_url = "http://lextestrcp.azurewebsites.net/api/lexmetadata";

M.framerate = 1 / 25; // in seconds
M.framedelay = M.framerate * 1000; // in milliseconds
M.framecnt = 0; // frame count
M.tree = []; // array of trees
M.curtree = null; // tree, currently being traversed
M.root_x = function() { return 40; }; // root node's x coordinate
M.root_y = function() { return 160; };
M.lw = 6; // line width
M.hlw = M.lw * 0.5; // half line width
M._eid = 0; // physics element id
M._prio = 0; // priority counter, those elemens with higher priority above
M.diagram_name = ''; // name that will be shown on top of diagram
M.diagram_descr = '';

// get next available elementid
M.mk_id = function() {
	return 'el_' + (M._eid++);
};

M.mk_prio = function() {
	return M._prio++;
};

M.disp = []; // array of display objects which are {div, scale}

// a single tree contains information about its bounding box, root and so on:
M.Tree = function(o) {
	var my = this;
	o = (o === undefined)? {}: o;
	my.root = (o.root === undefined? null: o.root);
	my.pos = (o.pos === undefined? [40, 80]: o.pos);
	my.byid = {}; // reference of nodes by their id's
	my.nx = 40; // right bound, volatile value
	my.ny = 80; // y coordinate for next tree, volatile value
	my.next_x = function() {
		return my.nx;
	};
	my.next_y = function() {
		return my.ny;
	};
};

// physical object: mass, bounding box, x and y attachment and offset etc
M.Pobj = function(o) {
	var my = this;
	o = (o === undefined)? {}: o;
	// physics object type: o = object, n = node, s = spring, c = corner
	my.pobjtype = (my.pobjtype? my.pobjtype: 'o');
	my.id = (o.id === undefined? null: o.id); // unique element id
	my.pid = (o.pid === undefined? null: o.pid); // parent node's id
	// what is this object's x attached to?
	my.x_att = (o.x_att === undefined? null: o.x_att);
	my.y_att = (o.y_att === undefined? null: o.y_att);
	my.iln = (o.iln === undefined? null: o.iln); // incoming link
	my.oln = (o.oln === undefined? null: o.oln); // outgoing link
	my.bln = (o.bln === undefined? null: o.bln); // branch link
	my.stroke_color = (o.stroke_color === undefined?'#ff0': o.stroke_color);
	if(o.line_color) {
		my.line_color = o.line_color;
	} else if(my.iln && my.iln.line_color) {
		my.line_color = my.iln.line_color;
	} else if(my.iln && my.iln.iln && my.iln.iln.line_color) {
		console.log("?????");
		my.line_color = my.iln.iln.line_color;
	} else {
		console.log(my.id, my.iln.line_color);
		my.line_color = '#ff0';
	}
//	my.line_color = (o.line_color === undefined? '#0f0': o.line_color);
	my.pos = [0, 0]; // volatile position, will be updated during simulation
	my.ppos = [0, 0]; // previous position
	my.acc = [0, 0]; // acceleration
	// bbox: left, top, right, bottom:
	my.bbox = [-5, -5, 5, 5]; // volatile bounding box relative to position
	my.diva = []; // array of div
	my.disp = (o.disp === undefined? M.disp: o.disp);
	my.mass = 0.00001; // mass of this physical object, kg
	my.brlvl = 0; // branching level is passed from parent, ++ if branched
	my.prio = 0; // priority: elements with lower priority will be above

	// hinge position of connected object, especially important for corners:
	my.hpos = function(obj) {
		return my.pos;
	}

	// make DOM divs:
	my.mk_divs = function() {
		for(i = 0; i < my.disp.length; ++i) {
			var sc = my.disp[i].scale;
			my.diva[i] = $('<div>').css({position: 'absolute',
				left: (my.pos[0] + my.bbox[0]) * sc,
				top: (my.pos[1] + my.bbox[1]) * sc,
				width: (my.bbox[2] - my.bbox[0]) * sc,
				height: (my.bbox[3] - my.bbox[1]) * sc,
				background: my.line_color});
			my.disp[i].div.append(my.diva[i]);
		}
	}

	// move DOM divs according to this object's current position and bbox:
	my.move_divs = function() {
		// mark bounding box:
		if(M.curtree) {
			var right = my.pos[0] + my.bbox[2] + 40;
			M.curtree.nx = (right > M.curtree.nx? right:
				M.curtree.nx);
			var bottom = my.pos[1] + my.bbox[3] + 40;
			M.curtree.ny = (bottom > M.curtree.ny? bottom:
				M.curtree.ny);
		}
		// move (and resize) each div:
		for(var i = 0; i < my.diva.length; ++i) {
			var sc = my.disp[i].scale;
			my.diva[i].css({
				left: (my.pos[0] + my.bbox[0]) * sc,
				top: (my.pos[1] + my.bbox[1]) * sc,
				width: (my.bbox[2] - my.bbox[0]) * sc,
				height: (my.bbox[3] - my.bbox[1]) * sc});
		}
	};
	// do simulation: dt = delta time in seconds
	my.sim = function(dt) {
		my.prio = M.mk_prio();
		// do simulation
		var pos = my.pos;
		if(my.x_att) {
			pos[0] = my.x_att();
		} else {
		//	my.acc *= dt * dt;
			pos[0] += (my.pos[0] - my.ppos[0]) * dt +
				my.acc[0] * dt * dt;
		}
		if(my.y_att) {
			pos[1] = my.y_att();
		} else {
			pos[1] += (my.pos[1] - my.ppos[1]) * dt +
				my.acc[1] * dt * dt;
		}
		if(my.oln) {
			my.oln.brlvl = my.brlvl;
			my.oln.sim(dt);
		}
		if(my.bln) {
			if(my.pobjtype == 'n') {
				my.bln.brlvl = my.brlvl + 1;
			} else {
				my.bln.brlvl = my.brlvl;
			}
			my.bln.sim(dt);
		}
		// apply positions:
		my.ppos = my.pos;
		my.pos = pos;
		my.move_divs();
	};
	if(my.pobjtype == 'o') {
		my.mk_divs();
	}
};

// physical node of the tree
// for nodes, eid matches the DiagramNodeId passed from the json
M.Pnode = function(o) {
	this.pobjtype = 'n';
	M.Pobj.call(this, o);
	var my = this;
	my.title = (o.title === undefined? '': o.title); // node title text
	my.isbadge = (o.pid === undefined? null: o.isbadge); // is this a badge?
	my.pos = [40, 80];
	my.bbox = [-20, -20, 20, 20];
	my.fill_color = 'white';
	my.mass = 0.4;

	my.mk_title = function(div) {
		var title = $('<div>').addClass('descr');
		var ttext = $('<p>').text(my.title);
		title.append(ttext);
		div.append(title);
		title.css({
			height: 60,
			width: 75
		});
		var th = ttext.height();
		title.css({
			left: -25,
			top: -th + 5
		});
	}

	my.mk_divs = function() {
		for(i = 0; i < my.disp.length; ++i) {
			var sc = my.disp[i].scale;
			my.diva[i] = $('<div>').addClass('circle')
				.css({
				left: (my.pos[0] + my.bbox[0]) * sc,
				top: (my.pos[1] + my.bbox[1]) * sc,
				width: (my.bbox[2] - my.bbox[0]) * sc,
				height: (my.bbox[3] - my.bbox[1]) * sc,
				"border-color": my.stroke_color,
				background: my.fill_color});
			my.disp[i].div.append(my.diva[i]);
			my.mk_title(my.diva[i]);
		}
	}

	if(my.pobjtype == 'n') {
		my.mk_divs();
	}
};
M.Pnode.prototype = Object.create(M.Pobj.prototype);
M.Pnode.prototype.constructor = M.Pnode;

// physical corner
M.Pcorner = function(o) {
	this.pobjtype = 'c';
	M.Pobj.call(this, o);
	var my = this;
	my.pos = [40, 80];
	my.ctype = (o.ctype === undefined? 'a': o.ctype);
	my.r = 20; // corner radius
	my.bbox = [0, 0, my.r, my.r];
	my.mass = 0.4;
	switch(my.ctype) {
	case 'a': my.bbox = [-M.hlw, -M.hlw, my.r, my.r]; break;
	case 'b': my.bbox = [-M.hlw, -M.hlw, my.r, my.r]; break;
	case 'c': my.bbox = [-my.r, -M.hlw, -M.hlw, my.r]; break;
	case 'd': my.bbox = [-M.hlw, -my.r, my.r, -M.hlw]; break;
	case 'e': my.bbox = [-my.r, -M.hlw, -M.hlw, my.r]; break;
	}

	my.hpos = function(obj) {
		if(obj === my.oln || obj === my.iln) {
			return my.pos;
		} else { // my.bln
			switch(my.ctype) {
			case 'a':
				return [my.pos[0] + my.bbox[2] + M.lw,
					my.pos[1] + my.bbox[3] + M.hlw];
			case 'b':
				return [my.pos[0] + my.bbox[2] + M.hlw,
					my.pos[1] + my.bbox[3] + M.hlw];
			case 'c':
				return [my.pos[0] - my.r,
					my.pos[1] + my.bbox[3] + M.hlw];
			case 'd':
				return [my.pos[0] + my.r + M.hlw,
					my.pos[1] - my.r - M.hlw];
			case 'e':
				return [my.pos[0] - my.r + M.hlw,
					my.pos[1] + my.bbox[3] + M.hlw];
			}
		}
	}

	my.mk_divs = function() {
		for(i = 0; i < my.disp.length; ++i) {
			var sc = my.disp[i].scale;
			my.diva[i] = $('<div>').addClass('corn_' + my.ctype)
				.css({
				left: (my.pos[0] + my.bbox[0]) * sc,
				top: (my.pos[1] + my.bbox[1]) * sc,
				width: (my.bbox[2] - my.bbox[0]) * sc,
				height: (my.bbox[3] - my.bbox[1]) * sc,
				"font-size": M.lw * sc,
				'border-color': my.line_color});
			my.disp[i].div.append(my.diva[i]);
		}
	}

	my.sim = function(dt) {
		my.prio = M.mk_prio();
		// do simulation
		var pos = my.pos;
		if(my.x_att) {
			pos[0] = my.x_att();
		} else {
		//	my.acc *= dt * dt;
			pos[0] += (my.pos[0] - my.ppos[0]) * dt +
				my.acc[0] * dt * dt;
		}
		if(my.y_att) {
			pos[1] = my.y_att();
		} else {
			pos[1] += (my.pos[1] - my.ppos[1]) * dt +
				my.acc[1] * dt * dt;
		}
		if(my.iln.pobjtype != 's') {
			pos = my.iln.hpos();
		}
		// check collisions:
		for(var id in M.curtree.byid) {
			el = M.curtree.byid[id];
			// make sure that inner loops are on the right:
			if(my.ctype == 'e' &&
				el.pobjtype == 'c' && el.ctype == 'a' &&
				my.brlvl > el.brlvl &&
				my.pos[0] < el.pos[0] + 80) {
				pos[0] += 1; // gravitate to the right of it
			}
			// make sure higher priority lines are above:
			if(my.ctype == 'a' &&
				el.pobjtype == 'c' && el.ctype == 'a' &&
				my.prio > el.prio &&
				my.pos[1] < el.pos[1] + 80) {
				my.pos[1] = (el.pos[1] + 80);
			}
		}
		if(my.bln) {
			my.bln.brlvl = my.brlvl;
			my.bln.sim(dt);
		}
		if(my.oln) {
			my.oln.brlvl = my.brlvl;
			my.oln.sim(dt);
		}
		// apply positions:
		my.ppos = my.pos;
		my.pos = pos;
		my.move_divs();
	};
	if(my.pobjtype == 'c') {
		my.mk_divs();
	}
};
M.Pcorner.prototype = Object.create(M.Pobj.prototype);
M.Pcorner.prototype.constructor = M.Pcorner;

// physical spring
M.Pspring = function(o) {
	this.pobjtype = 's';
	M.Pobj.call(this, o);
	var my = this;
	my.kx = 20; // spring const. in kg/s^2
	my.lx = 100; // spring length, m
	my.ky = 200; // spring const. in kg/s^2
	my.ly = 0; // spring height, m
	my.stype = (o.stype === undefined? 'ha': o.stype); // type

	switch(my.stype) {
	// horizontal type a: normal horizontal spring:
	case 'ha': my.kx = 100;  my.lx = 100; my.ky = 200; my.ly = 0;   break;
	// horizontal type b: shorter version, usually after a-corner:
	case 'hb': my.kx = 100;  my.lx = 20; my.ky = 200; my.ly = 0;   break;
	// horizontal s - stretchable type
	case 'hs': my.kx = 0;    my.lx = 0; my.ky = 200; my.ly = 0; break;
	// vertical type a: normal length branch
	case 'va': my.kx = 200; my.lx = 0;   my.ky = 100;  my.ly = 50; break;
	// vertical type b: shorter length branch
	case 'vb': my.kx = 200; my.lx = 0;   my.ky = 100;  my.ly = 20; break;
	// vertical type s: stretchable
	case 'vs': my.kx = 200; my.lx = 0;   my.ky = 0; my.ly = 0; break;
	default: break;
	}

	my.sim = function(dt) {
		my.prio = M.mk_prio();
		if(!my.iln || !my.oln) return; // not linked to anything
		var ihpos = my.iln.hpos(my); // get my input's hinge position
		var ohpos = my.oln.hpos(my); // get my output's hinge position
		var f_sprx = -my.kx * ((ohpos[0] - ihpos[0]) -my.lx);
		if(!my.iln.x_att) { // only if in-object's x is not attached
			my.iln.acc[0] = -f_sprx / my.iln.mass;
		}
		if(!my.oln.x_att) {
			my.oln.acc[0] = f_sprx / my.oln.mass;
		}

		var f_spry = -my.ky * ((ohpos[1] - ihpos[1]) -my.ly);
		if(!my.iln.y_att) {
			my.iln.acc[1] = -f_spry / my.iln.mass;
		}
		if(!my.oln.y_att) {
			my.oln.acc[1] = f_spry / my.oln.mass;
//			my.oln.vel[1] = aoy * dt;
//			my.oln.pos[1] += my.oln.vel[1] * dt;
		}

//		my.iln.move_divs();
//		my.oln.move_divs();
		if(my.oln && my.oln.iln === my) {
			my.oln.brlvl = my.brlvl;
			my.oln.sim(dt);
		}

		// set position to the position of leftmost node (assuming node)
		ihpos = my.iln.hpos(my);
		ohpos = my.oln.hpos(my);

		my.pos[0] = (ihpos[0] < ohpos[0])?
				ihpos[0]: ohpos[0];
		my.pos[1] = (ihpos[1] < ohpos[1])?
				ihpos[1]: ohpos[1];
		my.bbox[0] = -M.hlw;
		my.bbox[1] = -M.hlw;
		my.bbox[2] = M.hlw + (my.stype[0] == 'h'?
			Math.abs(ihpos[0] - ohpos[0]): 0);
		my.bbox[3] = M.hlw + (my.stype[0] == 'v'?
			Math.abs(ihpos[1] - ohpos[1]): 0);
		//console.log("Hi " + my.oln.vel[0] + ' ' + my.oln.pos[0]);
		my.move_divs();
	};
	if(my.pobjtype == 's') {
		my.mk_divs();
	}
};
M.Pspring.prototype = Object.create(M.Pobj.prototype);
M.Pspring.prototype.constructor = M.Pspring;

M.sim = function() {
	// recursively traverse all the trees:
	M._prio = 0; // reset priority counter
	for(var i = 0; i < M.tree.length; ++i) {
		M.curtree = M.tree[i];
		M.tree[i].root.sim(M.framerate);
	}
};

M.loop = function() {
//	if(M.framecnt > 10) return;
	M.sim();
	++M.framecnt;
	return;
};

// add a node to the tree's byid reference
M.add = function(tree, node) {
	if(tree && node) {
		var id = node.id;
		if(!node.id) {
			id = M.mk_id();
			node.id = id;
		}
		tree.byid[id] = node;
	}
};

// add a node to a tree given all the required parameters:
// o.id, o.pid if not the root node
M.add_node = function(o, tree_num) {
	var node; // = new M.Pnode(o);
	// connect this node to its parent node
	var tree = M.tree[tree_num]; // get the tree
	if(!tree) { // if tree does not exist, create one
		tree = M.tree[tree_num] = new M.Tree();
	}
	if(!tree.root) { // no root in the tree - make this one the root, return
		node = new M.Pnode(o);
		tree.root = node;
		M.add(tree, node);
		node.x_att = M.root_x;
		node.y_att = M.root_y;
		return;
	}
	// not the root node, attach it to its parent node by a spring:
	var par = tree.byid[o.pid];
	if(!par) {
		console.log("Error: parent node is not in the tree");
		console.log(tree.byid);
		return;
	}
	if(!par.oln && !par.isbadge) {
		var spr1 = new M.Pspring({iln: par, stype:'ha'});
		par.oln = spr1;
		M.add(tree, spr1);
		o.iln = spr1;
		node = new M.Pnode(o);
		M.add(tree, node);
		spr1.oln = node;
		return;
	}
	// if the parent is a bage, create the required newline pipeline:
	if(par.isbadge && !par.bln) {
		var spr1 = new M.Pspring({iln: par, stype: 'vb'});
		M.add(tree, spr1);
		par.bln = spr1;
		var corn1 = new M.Pcorner({ctype: 'c', iln: spr1});
		M.add(tree, corn1);
		spr1.oln = corn1;

		var spr2 = new M.Pspring({iln: corn1, stype: 'hs'});
		corn1.bln = spr2;
		M.add(tree, spr2);
		var corn2 = new M.Pcorner({ctype: 'e', iln: spr2});
		spr2.oln = corn2;
		M.add(tree, corn2);
		var spr3 = new M.Pspring({stype: 'va', iln: corn2});
		corn2.bln = spr3;
		M.add(tree, spr3);
		var corn3 = new M.Pcorner({ctype: 'a', iln: spr3});
		spr3.oln = corn3;
		M.add(tree, corn3);

		var spr4 = new M.Pspring({stype: 'hb', iln: corn3});
		corn3.bln = spr4;
		M.add(tree, spr4);
		o.iln = spr4;
		node = new M.Pnode(o);
		M.add(tree, node);
		spr4.oln = node;
		return;
	}
	// parent's oln is already used, so we use parent's bln:
	if(!par.bln) {
		console.log("Creating vertical spring");
		var spr1 = new M.Pspring({iln: par, stype: 'va'});
		par.bln = spr1;
		M.add(tree, spr1);
		var corn1 = new M.Pcorner({ctype: 'a', iln: spr1});
		spr1.oln = corn1;
		M.add(tree, corn1);
		var spr2 = new M.Pspring({iln: corn1, stype: 'hb'});
		corn1.bln = spr2;
		M.add(tree, spr2);
		o.iln = spr2;
		node = new M.Pnode(o);
		M.add(tree, node);
		spr2.oln = node;
		return;
	}
	// we can't attach to parent's bln, so trace to the next a-type corner
	// which has a free oln:
	var curn = par.bln; // current node is whatever is attached to parent
	while(curn) {
		if(curn.pobjtype == 's') {
			curn = curn.oln;
			continue;
		}
		if(curn.pobjtype == 'c') {
			if(curn.ctype != 'a') {
				curn = curn.bln;
				continue;
			}
			// corner of type a detected, attach to its oln if free:
			if(curn.oln) {
				curn = curn.oln;
				continue;
			}
			var spr1 = new M.Pspring({iln: curn, stype: 'vs'});
			curn.oln = spr1;
			M.add(tree, spr1);
			var corn1 = new M.Pcorner({ctype: 'a', iln: spr1});
			spr1.oln = corn1;
			M.add(tree, corn1);
			var spr2 = new M.Pspring({iln: corn1, stype: 'hb'});
			corn1.bln = spr2;
			M.add(tree, spr2);
			o.iln = spr2;
			node = new M.Pnode(o);
			M.add(tree, node);
			spr2.oln = node;
			return;
		}
	}
};

M.convert_raw = function(input) {
	M.diagram_name = input.DiagramName;
	M.diagram_desc = input.DiagramDescription;
	M.disp[0].div.html("<h1>" + M.diagram_name + "</h1>");
	M.disp[1].div.text(M.diagram_name);

	var rownodecounter = 0; // count number of nodes in current row
	var prev_id = null; // previous node's id
	for(var i = 0; i < input.DiagramNodes.length; ++i) {
		++rownodecounter;
		var in_node = input.DiagramNodes[i];
		// create a set of node options:
		var o = {id: in_node.DiagramNodeId, // element id
			title: in_node.NodeTitle,
			pid: (in_node.ParentDiagramNodeId?
				in_node.ParentDiagramNodeId: null) // parent id
		}

		if(in_node.DiagramNodeType.indexOf("Badge") > -1) {
			// this is a badge
			o.isbadge = true;
		};

		// set colors:
		o.stroke_color = in_node.NodeHexColor;
		if(in_node.DiagramConnectorDtos[0]) {
			o.line_color =
			in_node.DiagramConnectorDtos[0].ConnectorHexColor;
		}

		M.add_node(o, 0); // add node to 0th tree

		prev_id = in_node.DiagramNodeId;
	}
};

M.init = function() {
	console.log("LCID: " + indata.LCID);
	M.disp[0] = {div: $('#testboard').css({width: 600, height: 400,
		position: 'absolute', background: "#ddd"}), scale: 1.0};
	M.disp[1] = {div: $('#minimap').css({width: 120, height: 80,
		position: 'absolute', background: "#ddf",
		right: 0, top: 0}), scale: 0.2};

	M.convert_raw(indata);

	setInterval(M.loop, M.framedelay);
	return;
};

$(document).ready(M.init);

})(jQuery);
