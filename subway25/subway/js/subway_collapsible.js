function Subway() {
}

(function ($) {

var M = Subway; // subway module


$.fn.toEm = function (settings) {
	settings = jQuery.extend({
		scope: 'body'
	}, settings);
	var that = parseInt(this[0], 10),
	scopeTest = jQuery('<div style="display: none; font-size: 1em; ' +
		'margin: 0; padding:0; height: auto; line-height: 1; ' +
		'border:0;">&nbsp;</div>').appendTo(settings.scope),
	scopeVal = scopeTest.height();
	scopeTest.remove();
	return(that / scopeVal).toFixed(8);
};

$.fn.toPx = function (settings) {
	settings = jQuery.extend({
		scope: 'body'
	}, settings);
	var that = parseFloat(this[0]),
	scopeTest = jQuery('<div style="display: none; font-size: 1em; ' +
		'margin: 0; padding:0; height: auto; line-height: 1; ' +
		'border:0;">&nbsp;</div>').appendTo(settings.scope),
	scopeVal = scopeTest.height();
	scopeTest.remove();
	return Math.round(that * scopeVal);
};

M.Row = function (depth, isaux) {
	var my = this;
	my.par = null; // parent row, needed for row nesting
	my.isaux = (isaux ? true : false); // is this an auxiliary (thin) row?
	my.depth = depth; // how this row is inside the tree
	my.nodes = []; // array of nodes belonging to this row
};

// tooltip related:
M.tip = $("#tip").hide();
M.tiptext = "";
M.over = false; // is the mouse over a node?

// update tooltip's position depending on mouse pointer's position:
M.update_tooltip = function(e) {
	if(M.over) {
		M.tip.text(M.tiptext);
		M.tip.css({
			"left": e.pageX - 10 - M.tip.width(),
			"top": e.pageY - 10 - M.tip.height()
		});
	}
}

// grab mouse movements so that tooltip follows the cursor
$(document).mousemove(M.update_tooltip);

// add tooltip
M.addtip = function (node, txt) {
	$(node).mouseenter(function (e) {
		M.tiptext = txt;
		M.tip.show();
		M.over = true;
		M.update_tooltip(e);
	}).mouseleave(function (e) {
		M.tip.hide();
		M.over = false;
	});
}

// new, improved node class:
M.Node = function(model, id) {
	var my = this;
	my.model = model;
	my.id = id;
	my.iscollapsible = false; // is this node collapsible with a plus in it?
	my.par_id = null; // parent's id
	my.chl_id = []; // children id's

	// get a node either by id or by array [grp, num, abc]
	my.get_node = my.model.get_node;

	my.traverse_nodes = function(fun) {
		if(fun) {
			fun();
		}
		for(var id in my.chl_id) {
			var node = my.get_node(id);
			if(node.num && !node.abc) {
				node.traverse_nodes(fun);
			}
		}
	}

	// get tail of collapsible group: an id of the last subnode or itself
	my.get_tail = function() {
		if(!my.model.tree[my.id + 'a']) {
			return my.id;
		}
		for(var i = 0; i < 24; ++i) {
			if(!my.model.tree[my.id + String.fromCharCode(98 + i)]){
				return my.id + String.fromCharCode(97 + i);
			}
		}
	}

	// returns an array of colors for this node: fill, stroke, line
	my.get_colors = function() {
		if(my.colors) { // check if colors is attached to this node:
			return my.colors;
		}
		if(my.abc) { // this is a subnode,
			// check if this subnode's node has colors:
			var col = M.model.get_node(my.grp + my.num).colors;
			if(col) {
				return col;
			}
		}
		// check if the group has colors:
		var col = M.model.get_node(my.grp).colors;
		if(col) {
			return col;
		}
		return ['white', 'gray', 'gray'];
	}

	// get a {grp, (num), (abc), (aux), (isline)} object out of id:
	// where grp = group id, num = number in group, abc - subid in group
	// aux# = nonzero if it's an aux. node/line, '_' if it's a line
	my.split_id = function(id) {
		var res = {}; // resulting object
		var arr; // regexp match array
		var split = id.match(/^_[0-9]*|^[0-9]|[A-Z]+[0-9]*[a-z]*/g);
		if(split.length == 2) {
			arr = split[1]
				.match(/^[A-Z]+|[0-9]+|[a-z]+/g);
			split = split[0].match(/^_|[0-9]+/g);
			if(split[0] == '_') {
				res.isline = 1;
				if(split[1]) {
					res.aux = 1 * split[1];
				}
			} else {
				res.aux = 1 * split[0];
			}
		} else {
			arr = split[0]
				.match(/^[A-Z]+|[0-9]+|[a-z]+/g);
		}
		res.grp = arr[0];
		res.num = 1 * arr[1];
		res.abc = arr[2];
		return res;
	}

	// three types of new lines: nl=ut - u-turn, nl=lf - step down
	// nl=cr - carriage return, meaning, step down and move to the left
	my.nl_cr = function(row, depth) {
		var auxrow = new M.Row(depth + 1, true);
		my.model.row.push(auxrow);
		auxrow.par = row.par;

		var junction1 = new M.Node(my.model, '1' + my.id);
		junction1.init();
		my.model.tree[junction1.id] = junction1;
		junction1.par_id = my.id;
		auxrow.nodes.push(junction1);

		var junction2 = new M.Node(my.model, '2' + my.id);
		junction2.init();
		my.model.tree[junction2.id] = junction2;
		junction2.par_id = junction1.id;
		auxrow.nodes.push(junction2);

		var prevhead = junction2;
		var jnum = 3; // number for next junction
		for(var i = 0; i < my.chl_id.length; ++i) {
			var newrow = new M.Row(depth + 1);
			my.model.row.push(newrow);
			newrow.par = auxrow;

			// create a "head" junction:
			var head = new M.Node(my.model, '' + jnum + my.id);
			head.init();
			head.ishead = true;
			my.model.tree[head.id] = head;
			head.par_id = prevhead.id;
			newrow.nodes.push(head);

			my.get_node(my.chl_id[i]).mkrows(newrow, depth + 1);
			my.get_node(my.chl_id[i]).par_id = head.id;
			prevhead = head;
			++jnum;
		}
	}

	my.nl_lf = function(row, depth) {
		my.get_node(my.chl_id[0]).mkrows(row, depth + 1);

		var prevhead = my;
		var jnum = 1;
		for(var i = 1; i < my.chl_id.length; ++i) {
			var newrow = new M.Row(depth + 1);
			my.model.row.push(newrow);
			newrow.par = row;
			newrow.xalign = my; // align row's x with this node

			// create a "head" junction:
			var head = new M.Node(my.model, '' + jnum + my.id);
			head.init();
			head.ishead = true;
			my.model.tree[head.id] = head;
			head.par_id = prevhead.id;
			newrow.nodes.push(head);

			my.get_node(my.chl_id[i]).mkrows(newrow, depth + 1);
			my.get_node(my.chl_id[i]).par_id = head.id;
			prevhead = head;
			++jnum;
		}
	}

	// recursively pass through every node, assign each to a row and
	// create all necessary auxiliary elements:
	my.mkrows = function(row, depth) {
		if(!my.par_id || my.par_id == my.model.root_id) { // we are at
					// root node: create zeroth row
			my.model.row = [];
			depth = 0;
			my.model.row[0] = new M.Row(my.depth);
			row = my.model.row[0];
		}
		row.nodes.push(my); // add this node to given row
		my.depth = depth;
		if(!my.chl_id.length) {
			return; // no children
		} else if(my.chl_id.length == 1) {
			// continue on same line and move on:
			my.get_node(my.chl_id[0]).mkrows(row, depth + 1);
			return;
		}
		// branching. gotta create auxiliary nodes and lines:
		switch(my.nl) {
		case 'ut': // u-turn
			break;
		case 'cr':
			my.nl_cr(row, depth); // carriage return
			break;
		case 'lf':
		default:
			my.nl_lf(row, depth); // new line, line feed
			break;
		}
		// my.nl_cr(row, depth); // new line, carriage return
	}

	my.init = function() {
		var orig = my.model.nodes[my.id];
		var res = my.split_id(my.id);
		my.grp = res.grp; // node's group
		my.num = res.num; // node's number inside group
		my.abc = res.abc; // node's subindex: a, b, c...
		my.isline = res.isline; // is this a line
		my.aux = res.aux; // nonzero if this is an auxillary node
		// parent id and child id's array:
		my.par_id =''; // parent id
		my.chl_id = []; // children id's
		my.sub_id = ''; // subnode's id if applicable
		// if this is an auxiliary node or a line, skip further inits:
		if(my.aux || my.isline) {
			return;
		}
		// assign description:
		my.descr = '';
		// original can be either a string or an array:
		if(orig.constructor === Array) {
			my.descr = orig[0];
			if(orig[1]) {
				var more = orig[1];
				if(more.colors) { // colors specified:
					my.colors = more.colors;
				}
				if(more.nl) { // new line type specified:
					my.nl = more.nl;
				}
				// check if node type if specified
				if(more.ntype) {
					my.ntype = more.ntype;
				}
			}
		} else if(orig.length) {
			my.descr = orig;
		}
		// update group's tail if needed:
		if(my.num && !my.abc && !my.model.root_id) {
			my.get_node(my.grp).tail_id = my.id;
		}
		if(orig.constructor === Array) {
			// check if a twin is specified:
			// Note that only the bottom node should have "twin"
			// option specified, not the top one!
			if(orig[1].twin) {
				my.upper_twin = orig[1].twin;
				var twin = my.get_node(orig[1].twin);
				if(twin) {
					twin.lower_twin = my.id;
					my.model.upper_twin.push(my.upper_twin);
				}
			}
		}
		// set parent and children node id's
		if(orig.constructor === Array && orig[1].par) {
			// a parent node id is specified explicitly
			if(!my.split_id(orig[1].par).num) {
				// num is not specified = tail of group implied
				my.par_id = my.get_node(orig[1].par).tail_id;
			} else {
//				console.log("Group: " + my.id + " : " +
//						orig[1].par);
				my.par_id = orig[1].par;
			}
		} else {
			// a parent is not specified explicitly.
			if(!my.num) { // this is a group node:
				// no assumptions for the groups: they must be
				// explicitly linked. assuming unconnected group
			} else { // this is a node or a subnode:
				if(my.num > 1 && !my.abc) { // not a subnode,
					// and not the first node in the group -
					// link to the previous node in group:
					if(my.model.recent) {
						my.par_id = my.model.recent.id;
					}
				} else if(my.num == 1 && !my.abc) {
					// first node's parent matches group's 1
					my.par_id = my.get_node(my.grp).par_id;
				}
				if(my.abc == 'a') { // first subnode in chain
					my.par_id = my.grp + my.num;
				} else if(my.abc) { // not first subnode:
					my.par_id = my.grp + my.num +
						String.fromCharCode(
							my.abc.charCodeAt(0)
							- 1); // previous letter
				}
			}
		}
		if(my.par_id) {
			// only add child if it is not a group:
			var par = my.get_node(my.par_id);
			if(par && my.num) {
				par.chl_id.push(my.id);
			}
		}
	}
	my.init();
};

// Model class loads the data and maintains tree structures
M.Model = function () {
	var my = this;
	my.nodes = {}; // input tree nodes data
	my.tree = {}; // modified tree
	my.root_gid = ''; // id of the group that is in the root of tree
	my.root = null; // link to the root node in my.tree
	my.row = []; // array of rows, objects of class M.Row
	my.recent; // recently processed node
	my.upper_twin = []; // array of upper twins

	// get a node either by id or by array [grp, num, abc]
	my.get_node = function(param) {
		var id = '';
		if(param.constructor === Array) {
			id = param[0] + param[1] + param[2];
		} else {
			id = param;
		}
		return my.tree[id];
	}

        // initialize the data model by giving the input graph (array of nodes
        // and array of links):
	my.init = function(input_tree, root_id) {
		my.nodes = $.extend({}, input_tree.nodes); // copy the input
								// data over
		var started = true; // if root_id is specified, we'll need
			// to skip to it, otherwise set it to true right away:
		if(root_id) {
			my.root_id = root_id; // means, this is a group view
			my.root_gid = root_id.match(/^[A-Z]+/)[0];
			started = false;
		} else {
			// assuming that first element in the input tree is root
			for(var id in my.nodes) {
				my.root_gid = id.match(/^[A-Z]+/)[0];
				break;
			}
		}
		// now, in the first pass we create nodes inside my.tree.nodes:
		for(var id in my.nodes) {
			if(!started) { // in a subtree, skip nodes before&after:
				if(id == my.root_id) {
					started = true;
				}
				continue;
			} else if(my.root_id) {
				// check if this id is a subnode:
				if(!id.match(/[a-z]+/)) {
					break; // done adding subnodes
				}
			}
			if(!my.root_id) { // if this is a subnode,
				if(id.match(/[a]+/)) { // but mark previous
					my.recent.iscollapsible = true;
				}
			}
			my.tree[id] = new M.Node(my, id); // create a M.Node obj
			my.recent = my.tree[id];
		}
		if(my.root_id) { // set root to the root node
			my.root = my.get_node(my.root_id + 'a');
		} else {
			my.root = my.get_node(my.root_gid + '1');
		}
		my.root.mkrows(); // create rows and add aux. nodes if needed
		return;
	}
}

// class shape is the base class for storing and drawing various shapes:
M.Shape = function(o) {
	var my = this;
	o = (o === undefined)? {}: o;
	my.ispoint = true; // a special type of object with an invisible div
	my.node = (o.node !== undefined)? o.node: {}; //corresponding model node
	my.par = (o.par !== undefined)? o.par: null; // parent shape in tree
	my.chl = (o.chl !== undefined)? o.chl: []; // an array of child shapes
	my.lineto = (o.lineto !== undefined)? o.lineto: null; // incoming line
	my.w = (o.w !== undefined)? 1 * o.w: 0; // width in em units
	my.h = (o.h !== undefined)? 1 * o.h: 0; // height in em units
	my.r = my.w * 0.5; // radius in em units
	my.x = (o.x !== undefined)? 1 * o.x: 0; // center's x coordinate
	my.y = (o.y !== undefined)? 1 * o.y: 0; // center's y coordinate in em
	my.xoff = (o.xoff !== undefined)? 1 * o.xoff: 0; // x-offset
	my.yoff = (o.yoff !== undefined)? 1 * o.yoff: 0;
	my.cont = (o.cont !== undefined)? o.cont: '';
	my.iscollapsible = (o.iscollapsible !== undefined)? o.iscollapsible:
			false;
	my.iscollapsed = (o.iscollapsed !== undefined)? o.iscollapsed: false;
	my.descrw = 5; // description box width in em units
	my.descrh = 1;
	my.descroff = 0.6; // description vertical offset from the shape
	my.descrxadj = 0; // adjust x on some types of shapes
	my.fill_color = (o.fill_color !== undefined)? o.fill_color: "#ffffff";
	my.stroke_color = (o.stroke_color !== undefined)?
		o.stroke_color: "rgb(100,100,100)";
	my.linew = (o.linew !== undefined)? o.linew: 0.4; // line width, em
	my.div; // outer div
	my.inner_div; // inner div, can be = div
	my.descr_div; // description div above the shape
	my.descr_text = undefined; // text of description
	my.draw = function(parent_div) { // creates the required divs
		my.div = $('<div>');
		my.inner_div = my.div;
		my.inner_text = $('<span>');
		my.inner_div.append(my.inner_text);
		parent_div.append(my.div);
		my.set_collapsed(my.iscollapsed);
		return my;
	};
	// update collapsed status, mark node with + or - accordingly
	// and ensure that all subnodes' lineto's are collapsed as well:
	my.set_collapsed = function(val) {
		if(!my.iscollapsible) {
			if(my.inner_text) {
				my.inner_text.text('');
			}
			return;
		}
		if(val) {
			my.iscollapsed = true;
			my.inner_text.text('+');
			var cur = my.chl[0];
			while(cur && cur.node.abc &&
					cur.node.grp == my.node.grp &&
					cur.node.num == my.node.num) {
				cur.lineto.w = cur.linew;
				cur.lineto.x = cur.x;
				cur.lineto.anim(1, "linear", null, {ltr: true});
				cur = cur.chl[0];
			}
		} else {
			my.iscollapsed = false;
			my.inner_text.text('-');
		}
	}
	// adds the description div above the shape:
	my.set_descr = function(text) {
		my.descr_text = text;
		var descr = $('<div>').addClass('descr');
		var dtext = $('<p>').text(text);
		descr.append(dtext);
		my.inner_div.append(descr);
		descr.css({
			height: my.descrh + 'em',
			width: my.descrw + 'em'
		});
		// now get the actual descr height:
		var realh = $(dtext.height()).toEm({scope: descr});
		descr.css({
			left: ((my.w - my.descrw) * 0.5 + my.descrxadj) + 'em',
			top: (-realh - my.linew - my.descroff) + 'em'
		});
		return my;
	};
	// set click callback for collapsible node on click:
	my.set_callback = function() {
		my.div.click(function() {
			if(my.iscollapsed) {
				M.expand_grp(my.node.id);
			} else {
				M.collapse_grp(my.node.id);
			}
//			M.expand_grp(id);
/*			alert("collapsing " + my.inner_div.text());
			if(my.inner_div.text() == '+') {
				my.inner_div.text('-');
			} else {
				my.inner_div.text('+');
			}
//			M.show_grp(id);
*/
		});
	};
	// initial animation of the shape, after that we use my.rmove
	my.anim = function(time, animtype, callafter) {
		my.div.fadeIn(time, callafter);
		if(my.descr_div) {
			my.descr_div.fadeIn(time);
		}
	}
	// if this group is collapsed, return visible node, or itself otherwise,
	// if group is half-collapsed (in the process) return the last visible:
	my.get_visible_node = function() {
		// if this is not a subnode, or if it is visible, return itself:
		if(!my.node.abc || !my.iscollapsed) {
			return my;
		}
		var cur_par = my.par; // we move up from parent to parent
		while(1) {
			// stop if this node has no parent or if it is not
			// a subnode:
			if(!cur_par || !cur_par.node.abc ||
							!cur_par.iscollapsed) {
				break;
			}
			cur_par = cur_par.par; // go up to parent of the parent
		}
		if(!cur_par) { // weird situation, should never happen
			return null;
		}
		if(cur_par.iscollapsed) {
			return cur_par;
		}
		return my;
	}
	// returns the nearest extended parent, meaning a node that has an
	// extended lineto:
	my.get_nearest_extended = function(xstep) {
		var cur = my;
		// make sure we stay in the same row:
		while(cur && cur.node.grp == my.node.grp) {
			if(xstep && cur.lineto.w >= (xstep * 2 + my.linew)) {
				return cur;
			}
			cur = cur.par; // go to parent
		}
		return null;
	}
	// get a subnode that has a twin:
	my.get_subnode_with_twin = function() {
		var cur = my;
		while(cur && cur.node.num == my.node.num &&
						cur.node.grp == my.node.grp) {
			if(cur.upper_twin) {
				return cur.upper_twin;
			}
			if(cur.lower_twin) {
				return cur.lower_twin;
			}
			cur = cur.chl[0];
		}
		return null;
	}
	// recursively move all following nodes in the row:
	my.rmove = function(time, dx, o, animtype, callafter, nonrec) {
		if(!o) {
			o = {};
		}
		// if moving left, check if there is space before this node:
		if(!callafter && dx < 0 && my.par && my.par.x > my.x + dx
				&& my.par.y == my.y) {
			// the my.par.y == my.y check is to exclude the
			// arcs which get stuck otherwise
			return;
		}

		// if moving left, check also that the twin (if any) can also
		// move left, otherwise return
		if(dx < 0 && !o.force) {
			var subnode = my.get_subnode_with_twin();
			if(subnode &&
				!subnode.get_nearest_extended(-dx) &&
							subnode.x == my.x) {
				// there is a subnode with a twin,
				// it does not have an extended line to the
				// anywhere to left of it and it hasn't moved
				my.lineto.w -= dx;
				my.lineto.x += dx;
				my.lineto.anim(1, animtype, null,
							{ltr: true});
				console.log("returning");
				return;
			}
		}

		my.x += dx;

		if(o.dy) {
			my.y += o.dy;
		}
		my.div.animate({
			left: (my.x - my.r + my.xoff) + 'em',
			top: (my.y - my.r + my.yoff) + 'em'},
			time, animtype, callafter);
		if(my.lineto) {
			if(!callafter) { // not the first line in the chain
				if(my.par.par.node.nl != 'cr') {
					// if newline without carriage return,
					// we move that entire row
					my.lineto.rmove(time, dx, 0,
						animtype, null, true);
				} else {
					// if a carriage return is imposed,
					// we don't need to move the row
					my.lineto.w += dx;
					my.lineto.anim(time, animtype, null,
						{ltr: true});
					return; // stop recursion
				}
			} else { // first line in the chain

		// special case when collapsing and the twin limits moving
		// to the left, the node has to stay in place, but its
		// lineto needs to be retracted:
				if(!dx) {
				} else {
					my.lineto.w += dx;
					my.lineto.anim(time, animtype, null,
						{ltr: true});
				}
			}
		}

		// move the horn if it exists:
		if(my.horn) {
			var horn = my.horn;
				horn.rmove(time, dx, 0, animtype, null, true);
		}
		if(nonrec) return; // non-recursive used for moving lines

		// if moving right,
		// check if there is space after this node.
		// if there is - adjust the line and stop recursion:
		if(dx > 0 && my.chl[0]
				&& my.chl[0].lineto.w >= (dx * 2 + my.linew)) {
			my.chl[0].lineto.w -= dx;
			my.chl[0].lineto.x += dx;
			my.chl[0].lineto.anim(
					1, animtype, null, {ltr: true});
			return; // no recursion after this
		}

		// check if there is a twin to this node, determine the
		// master, and if the other node is slave, move it too:
		if(my.upper_twin) {
			if((dx > 0 && my.upper_twin.x < my.x) ||
					(dx < 0 && my.upper_twin.x > my.x)) {
				my.upper_twin.get_visible_node()
				.rmove(time, dx, 0, animtype, function() {});
			}
		} else if(my.lower_twin) {
			if((dx > 0 && my.lower_twin.x < my.x) ||
					(dx < 0 && my.lower_twin.x > my.x)) {
				my.lower_twin.get_visible_node()
				.rmove(time, dx, 0, animtype, function() {});
			}
		}

		for(var i = 0; i < my.chl.length; ++i) {
			my.chl[i].rmove(time, dx, 0, animtype);
		}
	}
	my.find_word = function(word, str) {
		return RegExp('\\b'+ word +'\\b', 'i').test(str);
	};
	// recursive funciton to filter results by keywords listed in array:
	my.filter = function(keywords) {
		// traverse tree, hide those nodes
		// that don't contain keywords, and show those that contain:
		if(keywords === null) {
			my.div.show();
		} else if(my.descr_text !== undefined) {
			var match = false;
			for(var i = 0; i < keywords.length; ++i) {
				if(my.find_word(keywords[i], my.descr_text)) {
					match = true;
					my.div.show();
					break;
				}
			}
			if(!match) my.div.hide();
		}
		for(var i = 0; i < my.chl.length; ++i) {
			my.chl[i].filter(keywords);
		}
	}
	// make this shape selectable
	my.make_selectable = function() {
		my.div.click(function() {
/*			if(M.sel_head == -1) {
				M.sel_head = my.ind;
			} else if(M.sel_tail == -1) {
				M.sel_tail = my.ind;
			} else {
				M.sel_head = my.ind;
				M.sel_tail = -1;
			}
			M.display_sel();
*/
		});
	};
	// recursively select a shape:
	my.sel_ind = function(ind) {
/*		if(ind === my.ind) {
			my.select();
		} else {
			my.deselect();
			if(my.lineto) {
				my.lineto.deselect();
			}
		}
		for(var i = 0; i < my.chl.length; ++i) {
			my.chl[i].sel_ind(ind);
		}
*/
	};
	my.select = function() {
		my.repaint("#ff0");
	};
	my.deselect = function() {
		my.repaint();
	};
	// repaint this shape using these colors, keeping old colors saved:
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.fill_color);
		stroke = (stroke? stroke: my.stroke_color);
		if(my.innder_div) {
			my.inner_div.css({background: fill});
		}
	}
	// recursively find a shape with given index:
	my.find_ind = function(ind) {
/*		if(ind == my.ind) {
			return my;
		}
		for(var i = 0; i < my.chl.length; ++i) {
			var res = my.chl[i].find_ind(ind);
			if(res) return res;
		}
		return null;
*/
	}
	// select a path: M.sel_head and M.sel_tail must be set:
	my.sel_until = function(ind) {
/*		console.log(my.par);
		my.select();
		if(my.par && ind != my.ind) {
			if(my.lineto) {
				my.lineto.select();
			}
			my.par.sel_until(ind);
		}
*/
	}
	return my;
};

// draws a circle given coordinates of the center:
M.Circle = function(o) {
	M.Shape.call(this, o);
	var my = this;
	o = (o === undefined)? {}: o;
	my.ispoint = false;
	my.linew = (o.linew === undefined? 0.2: o.linew);
	my.descrxadj = -my.linew; // adjust description's x for circles
	if(o.r !== undefined) {
		my.w = o.r * 2;
		my.h = o.r * 2;
	} else {
		my.w = (o.w !== undefined)? 1 * o.w: 2; // width of 5 em
		my.h = (o.h !== undefined)? 1 * o.h: 2; // height of 5 em
		my.r = my.w * 0.5;
	}
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.fill_color);
		stroke = (stroke? stroke: my.stroke_color);
		my.inner_div.css({background: fill,
				"border-color": stroke});
	}
	my.draw = function(parent_div) {
		my.descrxadj = -my.linew;
		my.div = $('<div>').addClass("circle").
			css({
				left: (my.x - my.r) + 'em',
				top: (my.y - my.r) + 'em',
				width: my.w + 'em',
				height: my.h + 'em',
				"line-height": (my.h - my.linew * 2) + 'em',
				"border-color": my.stroke_color,
				background: my.fill_color,
				"border-width": my.linew + 'em'
			});
		my.inner_div = my.div;
		my.inner_text = $('<span>');
		my.inner_div.append(my.inner_text);
		parent_div.append(my.div);
		my.set_collapsed(my.iscollapsed);
		return my;
	}
	return my;
};
M.Circle.prototype = Object.create(M.Shape.prototype);
M.Circle.prototype.constructor = M.Circle;

// draws an octagon given coordinates of the center:
M.Octagon = function(o) {
	M.Shape.call(this, o);
	var my = this;
	o = (o === undefined)? {}: o;
	my.ispoint = false;
	my.descroff = 0;
	if(o.r !== undefined) {
		my.w = o.r * 2;
		my.h = o.r * 2;
	} else {
		my.w = (o.w !== undefined)? 1 * o.w: 5; // width of 5 em
		my.h = (o.h !== undefined)? 1 * o.h: 5; // height of 5 em
		my.r = my.w * 0.5;
	}
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.fill_color);
		stroke = (stroke? stroke: my.stroke_color);
		my.div.css({
				left: (my.x - my.r) + 'em',
				top: (my.y - my.r) + 'em',
				width: my.w + 'em',
				height: my.w + 'em',
				"padding-left": my.linew + 'em',
				"padding-top": my.linew + 'em',
				background:
				"linear-gradient(45deg, " + stroke +
				',' + stroke +
				" 37.5%, transparent 37.5%, transparent 62.5%, "
				+ stroke + " 62.5%, " +
				stroke +
				" 100%),linear-gradient(-45deg,"
				+ stroke + ',' + stroke +
				" 37.5%, transparent 37.5%, transparent 62.5%, "
				+ stroke + " 62.5%, " +
				stroke + " 100%)",
				"background-position": my.r + 'em ' +
					(my.r * 1) + 'em'
		});
		var innerw = my.w - (my.linew * 2);
		my.inner_div.css({
				background:
				"linear-gradient(45deg, " + fill + ','
				+ fill +
				" 37.5%, transparent 37.5%, transparent 62.5%, "
				+ fill + " 62.5%, " +
				fill + " 100%),linear-gradient(-45deg,"
				+ fill + ',' + fill +
				" 37.5%, transparent 37.5%, transparent 62.5%, "
				+ fill + " 62.5%, " +
				fill + " 100%)",
				"background-position": (innerw * 0.5) + 'em ' +
					(innerw * 0.5 * 1) + 'em',
				width: innerw + 'em',
				height: innerw + 'em'
		});
	}
	my.draw = function(parent_div) {
		my.div = $('<div>').addClass("octagon");
		my.inner_div = $('<div>').addClass("octagon_inner");
		my.inner_text = $('<span>');
		my.inner_div.append(my.inner_text);
		my.repaint();
		my.div.append(my.inner_div);
		parent_div.append(my.div);
		my.set_collapsed(my.iscollapsed);
		return my;
	}
	return my;
};
M.Octagon.prototype = Object.create(M.Shape.prototype);
M.Octagon.prototype.constructor = M.Octagon;

// draws an octagon given coordinates of the center:
M.Hexagon = function(o) {
	M.Shape.call(this, o);
	var my = this;
	o = (o === undefined)? {}: o;
	my.ispoint = false;
	my.descroff = 0;
	if(o.r !== undefined) {
		my.w = o.r * 2;
		my.h = o.r * 2;
	} else {
		my.w = (o.w !== undefined)? 1 * o.w: 5; // width of 5 em
		my.h = (o.h !== undefined)? 1 * o.h: 5; // height of 5 em
		my.r = my.w * 0.5;
	}
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.fill_color);
		stroke = (stroke? stroke: my.stroke_color);
		my.div.css({
				left: (my.x - my.r) + 'em',
				top: (my.y - my.r) + 'em',
				width: my.w + 'em',
				height: my.w + 'em',
				"padding-left": my.linew + 'em',
				"padding-top": my.linew + 'em',
				background:
				"linear-gradient(30deg, " + my.stroke_color +
				',' + my.stroke_color +
				" 31%, transparent 31%, transparent 69%, "
				+ my.stroke_color + " 69%, " +
				my.stroke_color +
				" 100%),linear-gradient(-30deg,"
				+ my.stroke_color + ',' + my.stroke_color +
				" 31%, transparent 31%, transparent 69%, "
				+ my.stroke_color + " 69%, " +
				my.stroke_color + " 100%)",
				"background-position": my.r + 'em ' +
					(my.r * 1) + 'em'
		});
		var innerw = my.w - (my.linew * 2);
		my.inner_div.css({
				background:
				"linear-gradient(30deg, " + my.fill_color + ','
				+ my.fill_color +
				" 31%, transparent 31%, transparent 69%, "
				+ my.fill_color + " 69%, " +
				my.fill_color + " 100%),linear-gradient(-30deg,"
				+ my.fill_color + ',' + my.fill_color +
				" 31%, transparent 31%, transparent 69%, "
				+ my.fill_color + " 69%, " +
				my.fill_color + " 100%)",
				"background-position": (innerw * 0.5) + 'em ' +
					(innerw * 0.5 * 1) + 'em',
				width: innerw + 'em',
				height: innerw + 'em'
		});
	}
	my.draw = function(parent_div) {
		my.div = $('<div>').addClass("hexagon");
		var innerw = my.w - (my.linew * 2);
		my.inner_div = $('<div>').addClass("hexagon_inner");
		my.repaint();
		my.div.append(my.inner_div);
		parent_div.append(my.div);
		my.set_collapsed(my.iscollapsed);
		my.inner_text = $('<span>');
		my.inner_div.append(my.inner_text);
		return my;
	}
	return my;
};
M.Hexagon.prototype = Object.create(M.Shape.prototype);
M.Hexagon.prototype.constructor = M.Hexagon;

// draws a horizontal or vertical line given the coordinates of top/left point:
M.Line = function(o) {
	M.Shape.call(this, o);
	var my = this;
	o = (o === undefined)? {}: o;
	my.ispoint = false;
	my.r = my.linew * 0.5; // radius of line is equal to its border width
	my.w += my.linew;
	my.h += my.linew;
	my.xoff = (o.xoff? o.xoff: 0);
	my.yoff = (o.yoff? o.yoff: 0);
	my.draw = function(parent_div) {
		my.div = $('<div>').addClass('line')
			.css({	left: (my.x - my.r + my.xoff) + 'em',
				top:  (my.y - my.r + my.yoff) + 'em',
				width: my.w + 'em',
				height: my.h + 'em',
				background: my.stroke_color,
			});
		my.inner_div = my.div;
		parent_div.append(my.div);
		return my;
	}
	// params: o.ltr = force left-to-right when expanding/collapsing
	// o.reduce = start from current size and reduce to zero
	my.anim = function(time, animtype, callafter, o) {
		if(!o) {
			var o = {};
		}
		if(o.btt) {
		} else if(o.ltr) {
			my.div.css({
				left: (my.x + my.xoff - my.r) + 'em',
				top: (my.y + my.yoff - my.r) + 'em'
			});
		} else {
			my.div.css({	left: ((my.par.x > my.x?
						my.par.x - my.xoff + my.r:
						my.x + my.xoff - my.r)) + 'em',
				top: ((my.par.y > my.y? my.par.y: my.y)
						+ my.yoff - my.r) + 'em',
				width: (my.w == my.linew? my.w: 0) + 'em',
				height: (my.h == my.linew? my.h: 0) + 'em'
			});
		}
		//my.div.show();
		my.div.animate({
			width: (my.w) + 'em',
			height: (my.h) + 'em',
			left: (my.x - my.r + my.xoff) + 'em',
			top: (my.y - my.r + my.yoff) + 'em'
		}, time, animtype, callafter);
	}
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.stroke_color);
		my.inner_div.css({background: fill});
	}
	return my;
};
M.Line.prototype = Object.create(M.Shape.prototype);
M.Line.prototype.constructor = M.Line;

// draws an arc with given start and end angles:
M.Arc = function(o) {
	M.Shape.call(this, o);
	var my = this;
	o = (o === undefined)? {}: o;
	my.ccw = (o.ccw? true: false);
	my.xoff = (o.xoff? o.xoff: 0);
	my.yoff = (o.yoff? o.yoff: 0);
	my.ispoint = false;
	my.x -= my.linew * 0.5;
	my.y -= my.linew * 0.5;
	my.w += my.linew * 1.5;
	my.h += my.linew * 1.5;
	my.arcrot = (o.arcrot === undefined)? 0: o.arcrot; // rotate arc
	my.arcspan = (o.arcspan === undefined)? 90: o.arcspan; // degrees of arc
	my.center = my.r + my.linew * 0.5;
	my.startY = my.center - my.r;
	my.repaint = function(fill, stroke) {
		fill = (fill? fill: my.stroke_color);
		my.arc.attr({ stroke: fill });
	}
	my.anim = function(time, animtype, callafter) {
		//my.div.show();
		Snap.animate(0, my.arcspan, function(val) {
			my.arc.remove();
			var d = val;
			if(my.ccw) {
				d = -d;
			}
			var dr = d - 90;
			var radians = Math.PI * (dr / 180);
			var endx = my.center + my.r * Math.cos(radians),
				endy = my.center + my.r * Math.sin(radians),
				largeArc = d > 180? 1: 0;
			var path = "M" + my.center + ', ' + my.startY + ' A' +
				my.r + ', ' + my.r + ', ' + ' 0 ' +
				largeArc + ', ' + (my.ccw? 0: 1) + '  ' +
				endx + ', ' + endy + '';
			my.arc = my.s.path(path);
			my.arc.transform("r" + my.arcrot + "," + my.center +
						"," + my.center);
			my.arc.attr({
				stroke: my.stroke_color,
				strokeWidth: my.linew,
				fill: 'none'
			});
		}, time, mina.easeinout, callafter);
	};
	my.draw = function(parent_div) {
		my.s = Snap(my.w + 'em', my.h + 'em');
		var path = "";
		my.s.attr({viewBox: "0 0 " + my.w + " " + my.h});
		my.arc = my.s.path(path);
		my.div = $(my.s.node);
		parent_div.append(my.div);
		my.div.addClass('arc')
			.css({	position: 'absolute',
				'z-index': 6,
				left: (my.x - my.r + my.xoff) + 'em',
				top: (my.y - my.r + my.yoff) + 'em',
				width: my.w + 'em',
				height: my.h + 'em',
				stroke: my.stroke_color,
				strokeWidth: my.linew + 'em'
			});
		return my;
	}
	return my;
};
M.Arc.prototype = Object.create(M.Shape.prototype);
M.Arc.prototype.constructor = M.Arc;

// View class controls the data display: be it main window or mini map
M.View = function(div, model) {
	var my = this;
	my.ismap = false; // is this a minimap?
	my.model = (model? model: M.model); // data model
	my.container = div; // container $(div)
	my.canvas = div.find(".canvas"); // div to use as a canvas
	my.xoff = 4; // offset from left
	my.yoff = 6; // offset from top
	my.xstep = 6; // default distance between shapes
	my.xpointstep = 3; // default distance between junctions
	my.ystep = 6; // default distance between rows
	my.yauxstep = 3; // vertical distance between auxillary rows
	my.crad = 3; // all curves have this radius
	my.xmax = 0; // used for fitting
	my.ymax = 0;
	my.minscale; // minimal scale determined by fitting. should be updated
	// after window resizing
	my.root = {}; // pointer to root of tree of shapes inside this view
	my.tree = {}; // tree of node shapes referenced by id
	// only for animating the horn:
	my.fnhorn = function(horn) {
		if(!horn) {
			return;
		}
		horn.div.show();
		horn.anim(1000, "linear", function() {
			my.fnhorn(horn.horn);
		}, {btt: true});
	}

	my.anim = function(shape) { // shape from my.root
		if(!shape) {
			return;
		}
		// recursively traverse dom tree to animate all the elements:
		var fn = function() {
			if(!shape.node.abc ||
				!my.tree[shape.node.grp + shape.node.num]
								.iscollapsed) {
				shape.anim(100);
			}
			for(var i = 0; i < shape.chl.length; ++i) {
				my.anim(shape.chl[i]);
			}
		}
		shape.div.hide();
		if(shape.lineto) {
			//shape.lineto.div.hide();
			// animate line only if it is not a hidden node:
			if(!shape.node.abc ||
				!my.tree[shape.node.grp + shape.node.num]
						.iscollapsed) {
				shape.lineto.div.show();
				shape.lineto.anim(250, "linear", fn);
			} else {
				shape.lineto.div.show();
				shape.lineto.anim(1, "linear", fn);
			}
			// animate the horn if any:
			if(shape.horn) {
				my.fnhorn(shape.horn);
			}
		} else {
			shape.anim(100, "linear", fn);
//			shape.div.animate({opacity: 1},
//				1000, "linear", fn);
		}
	}
/*
	// recursively add shapes to the view given root node in the model:
	my.add_shape = function(node, pshape) {
		// calculate coordinates:
		var x = my.xoff, y = my.yoff;
	}

	// initialize the view:
	my.init = function() {
		my.xmax = 0; // reset fitting values
		my.ymax = 0;
		var div = $("#" + my.id);
		my.w = div.width();
		my.h = div.height();
		var x = my.xoff, y = my.yoff;
		my.add_shape(my.model.root, my.root); // recursively add shapes
	}
*/

	// expand a collapsible group:
	my.expand = function(id) {
		// first, check if we have extra space to the left:
		var extended = my.tree[id].get_nearest_extended(my.xstep);
		if(extended) {
			// we found an extended node, so, before proceeding,
			// we should reduce it:
			//extended.lineto.w -= my.xstep;
			//extended.lineto.anim(250, "linear", null, {ltr: true});
			extended.rmove(250, -my.xstep, {force: 1}, "linear",
					function() {});
		}
		my.tree[id].chl[0].rmove(250, my.xstep, 0, "linear", function() {
			my.tree[id].chl[0].anim(100); // make the shape appear
			// mark this shape as not collapsed:
			my.tree[id].chl[0].iscollapsed = false;
			my.fit();
			// if a child exists, and it is of same group:
			if(my.tree[id].chl[0].chl[0] &&
				my.tree[id].chl[0].chl[0].node.num ==
				my.tree[id].node.num) {
				my.expand(my.tree[id].chl[0].node.id);
			} else {
				my.fit();
				M.expand_done(id);
			}
		});
	}

	my.collapse = function(id) {
		if(my.tree[id].node.abc) { // only hide subnodes:
			my.tree[id].div.fadeOut(100);
		}
		var dir = -my.xstep;
		var o = {};
		var norec = false;
		// we cannot always move left: if the tween cannot move left
		// we must stay or move right:
		var subnode = my.tree[id].get_subnode_with_twin();
		if(subnode && !subnode.get_nearest_extended(my.xstep)) {
			// we need to bring this (sub)node to the level of twin:
			dir = subnode.x - my.tree[id].x;
			o.force = true;
			norec = true;
			console.log("hi! " + id);
		}
		my.tree[id].rmove(250, dir, o, "linear", function() {
			my.tree[id].iscollapsed = true;
			my.fit();
			// if a parent subnode exists, and it is of same group,
			// or it's a special case when the twin node has reached
			// its leftmost limit, and our parent node is still to
			// the left of it - we need to move par to the right
			if(my.tree[id].par &&
				my.tree[id].par.node.num ==
				my.tree[id].node.num &&
				(my.tree[id].par.node.abc
					|| (my.tree[id].get_subnode_with_twin()
					&& my.tree[id].par.x < my.tree[id].x)
				)) {
				my.collapse(my.tree[id].par.node.id);
			} else {
				my.fit();
				console.log("collapse done");
				M.collapse_done(id);
			}
		}, norec);
	}

	my.draw = function () {
		my.xmax = 0; // reset fitting values
		my.ymax = 0;
		var div = $("#" + my.id);
		my.canvas.empty(); // erase canvas
		my.w = div.width();
		my.h = div.height();
		var x = my.xoff, y = my.yoff;
		for(var i = 0; i < my.model.row.length; ++i) {
			var row = my.model.row[i];
			y += (i ? (row.isaux ? my.yauxstep : my.ystep) : 0);
			x = my.xoff;
			if(row.xalign) {
				x = row.xalign.shape.x;
			} else if(row.par) {
				x = row.par.x;
			}
			if(row.isaux && row.par) {
				x = row.par.x + my.xpointstep;
			}
			row.x = x;
			row.y = y;
			for(j = 0; j < row.nodes.length; ++j) {
				var c = row.nodes[j];
				var p = c.get_node(c.par_id); // get parent
				if(row.isaux) {
					// in auxilliary row we align x to
					// parent node or to row's left coord.
					x = (j == 0) ? p.x : row.x;
				} else if(!c.abc) {
					// otherwise we add a full step if it
					// is a circle, or a small step if it
					// is a junction, but we add nothing if
					// it is a subnode!
					x += (j ? (p.aux ?
					my.xpointstep : my.xstep) : 0);
				}
				var shape; // this can be any shape
				if(!c.aux) { // not a junction
					var colors = c.get_colors();
					var options = {
						node: c,
						x: x,
						y: y,
						stroke_color: colors[1],
						fill_color: colors[0],
						par: p,
						iscollapsible: c.iscollapsible
					};
					// in the beginning, all collapsible
					// groups are collapsed:
					if(c.iscollapsible) {
						options.iscollapsed = true;
					}
					// we also mark each subnode:
					if(c.abc) {
						options.iscollapsed = true;
					}
					// decide on the shape:
					if(c.ntype == 'Badge') {
						shape = new M.Hexagon(options)
						.draw(my.canvas)
						.set_descr(c.descr);
					} else {
						shape = new M.Circle(options)
						.draw(my.canvas)
						.set_descr(c.descr);
					}
					// if this is minimap, add a tooltip:
					if(my.ismap) {
						M.addtip(
						shape.div, c.descr);
					} else {
				//		shape.make_selectable();
					}
					// now we add this shape to our tree
					// for easy access:
					my.tree[c.id] = shape;
				} else {
					// if this is a point, we must still
					// create an empty shape:
					shape = new M.Shape({
						x: x,
						y: y}).draw(my.canvas);
				}
				if(c.iscollapsible && !my.ismap) {
					// if this node is collapsible and
					// this is not a minimap, set a callback
					shape.set_callback();
				}
				shape.div.hide();
				c.x = x; // temporarily store coordinates
				c.y = y;
				shape.par = (p? p.shape: null); // parent shape
				shape.chl = []; // array of links to next
					// stop divs
				c.shape = shape; // bind this div temporarily
				if(!p) { // if this is a root of tree,
						// set my.root to it:
					my.root = shape;
				} else { // otherwise, add it to the parent
					// shape's children array:
					p.shape.chl.push(shape);
				}
				// add the line reaching to this shape:
				if(p) {
					var colors = p.get_colors();
					var l = x < p.x ? x : p.x; // left
					var t = y < p.y ? y : p.y; // top
					var w = x < p.x ? (p.x - x) : (x - p.x);
					var h = y < p.y ? (p.y - y) : (y - p.y);
					if((row.isaux && !j) ||
						(!c.aux && p.ishead) ||
					(c.ishead && p.aux && !p.ishead)) {
						// first node in a row: need
						// a round corner here
						w = my.crad * 2;
						h = my.crad * 2;
						var opt = {
							par: p.shape,
							chl: [c.shape],
							x: l,
							y: t,
							w: w,
							h: h,
							xoff: my.crad,
							yoff: -my.crad,
							arcrot: -90,
							ccw: true,
							stroke_color: colors[2]
						};
						if(row.isaux && !j) {
							// first curve aux row
							opt.arcrot = 90;
							opt.ccw = false;
							opt.xoff = -my.crad;
							opt.yoff = 0;
						} else if(c.ishead && p.aux) {
							// second curve aux row
							opt.ccw = true;
							opt.arcrot = 0;
							opt.yoff = my.crad;
						}
						var arc = new M.Arc(opt)
							.draw(my.canvas);
						arc.div.hide();
//						my.canvas.append(arc);
						shape.lineto = arc;
					} else {
						var yoff = 0;
						if(c.ishead && p.ishead) {
							yoff -= my.crad;
						}
						if(c.ishead && !p.ishead) {
							h -= my.crad;
						}
						var opt = {
							par: p.shape,
							chl: [c.shape],
							x: l,
							y: t,
							w: w,
							h: h,
							yoff: yoff,
							stroke_color: colors[2]
						};
						if(row.isaux) {
							opt.w -= my.crad * 2;
							opt.xoff = my.crad;
						}
						var line = new M.Line(opt)
							.draw(my.canvas);
						line.div.hide();
						//line.hide();
//						my.canvas.append(line);
						shape.lineto = line; // line to
						// this stop in the shapes tree
					}
				}
			}
		}
		// now, after all the nodes have been placed, we need to do
		// a second pass to adjust positions of twins:
		for(var i = 0; i < my.model.upper_twin.length; ++i) {
//			console.log(my.model.upper_twin[i]);
			// get the shapes associated with the two twins:
			var twin1 = my.tree[my.model.upper_twin[i]];
			var twin2 = my.tree[twin1.node.lower_twin];
			var real_twin2 = twin2;
			twin1.lower_twin = twin2;
			twin2.upper_twin = twin1;
			console.log("TWIN1: " + twin1.node.id);
			// if a node is a member of a collapsed group,
			// we must move the group node instead:
			if(twin1.node.abc) {
				// the group node has to know if it has a twin
				// in it, and which node that is:
				my.tree[twin1.node.grp + twin1.node.num].twin
					= twin1;
				// since all groups are now collapsed, we will
				// now move the group node instead of the actual
				// node that has a twin:
				twin1 =
				my.tree[twin1.node.grp + twin1.node.num];
			}
			if(twin2.node.abc) {
				my.tree[twin2.node.grp + twin2.node.num].twin
					= twin2;
				twin2 =
				my.tree[twin2.node.grp + twin2.node.num];
			}
			// determine master and slave shape, depending on x
			var master = (twin1.x < twin2.x? twin2: twin1);
			var slave = (twin1.x > twin2.x? twin2: twin1);
			slave.rmove(1, master.x - slave.x, 0, "linear",
				function() {});
			// add arc pointing up to the lower twin:
			var opt = {
				par: twin2,
				chl: [],
				x: twin2.x,
				y: twin2.y,
				w: my.crad * 2,
				h: my.crad * 2,
				yoff: -my.crad,
				arcrot: 180,
				ccw: true,
				stroke_color: twin2.lineto.stroke_color
			};

			console.log("Hello: " + twin2.node.id + " " +
						twin1.node.id);
			real_twin2.horn = new M.Arc(opt).draw(my.canvas);

			opt.y -= my.crad * 2;
			opt.x += my.crad;
			opt.w = 0;
			opt.h = my.crad;
			opt.yoff += my.crad;
			var line = new M.Line(opt).draw(my.canvas);
			line.div.hide();
			real_twin2.horn.horn = line;
		}

		my.fit();
	}
	my.fit = function() {
		// calculate bounds of the map:
		my.xmax = 0;
		my.ymax = 0;
		for(var id in my.tree) {
			var shape = my.tree[id];
			// update the bounding values:
			my.xmax = ((shape.x + shape.w * 0.5 + my.xoff)
				> my.xmax ?
				shape.x + shape.w * 0.5 + my.xoff: my.xmax);
			my.ymax = ((shape.y + shape.h + my.yoff) > my.ymax ?
				shape.y + shape.h * 0.5 + my.yoff: my.ymax);
		}
		// determine scale at which the contents will fit the container:
		var xsc = my.w / my.xmax;
		var ysc = my.h / my.ymax;
		my.minscale = (xsc < ysc ? xsc : ysc);
		my.canvas.width(my.xmax + 'em');
		my.canvas.height(my.ymax + 'em');

		if(my.ismap) {
			var scalex = $($(window).width() * 0.4)
				.toEm({scope: my.container}) / my.xmax;
			var scaley = $($(window).height() * 0.4)
				.toEm({scope: my.container}) / my.ymax;
			var scale = scalex < scaley? scalex: scaley;
			my.canvas.css({"font-size": scale + 'em'});
		}
		M.updatenavbox();
	}
}

function next_char(c) {
	return String.fromCharCode(c.charCodeAt(0) + 1);
}

M.convert_raw = function(input) {
	var output = {nodes: {}};
	var cur_grp = 'A';
	var cur_num = 1;
	output.nodes[cur_grp] = ["", {}];
	var oid2id = {}; // convert oid to id
	var oid2ind = {}; // convert oid to index
	var prev_id = null; // previous id
	var prev_oid = null; // previous original id = DiagramNodeId
	for(var i = 0; i < input.DiagramNodes.length; ++i) {
		var in_node = input.DiagramNodes[i];
		var o = {oid: in_node.DiagramNodeId}; // options
		// if this is a branch, we are maybe starting a new supergroup:
		// if the parent node is a group,
		// we must chain this node the last
		// element of that group, not to the node itself:
		if(in_node.ParentDiagramNodeId) {
			// get the child group:
			var cg = input.DiagramNodes[oid2ind[
				in_node.ParentDiagramNodeId]].ChildGroup;
			// get the last node in the child group:
			console.log(cg);
			if(cg && cg.ChildDiagramNodeDtos) {
				o.par = oid2id[cg.ChildDiagramNodeDtos[
					cg.ChildDiagramNodeDtos.length - 1]
					.DiagramNodeId];
			} else {
				o.par = oid2id[in_node.ParentDiagramNodeId];
			}
		}
		if(o.par && o.par != prev_id) {
			cur_grp = next_char(cur_grp);
			output.nodes[cur_grp] = ["", {}];
			cur_num = 1;
		}
		var id = cur_grp + cur_num;
		oid2id[o.oid] = id; // set oid to id lookup for easy access
		oid2ind[o.oid] = i;
		var fill_color = "white";
		var stroke_color = "gray";
		var line_color = "gray";
		if(in_node.NodeHexColor) {
			stroke_color = in_node.NodeHexColor;
		}
		if(in_node.DiagramConnectorDtos[0] &&
			in_node.DiagramConnectorDtos[0].ConnectorHexColor) {
			line_color =
			in_node.DiagramConnectorDtos[0].ConnectorHexColor;
		}
		if(cur_num == 1) {
			output.nodes[cur_grp][1].colors =
				[fill_color, stroke_color , line_color];
		} else {
			// if at least one color is specified:
			if(fill_color != "white" || stroke_color != "gray"
						|| line_color != "gray") {
				if(fill_color == "white") {
					fill_color = output.nodes[cur_grp][1]
						.colors[0];
				}
				if(stroke_color == "gray") {
					stroke_color = output.nodes[cur_grp][1]
						.colors[1];
				}
				if(line_color == "gray") {
					line_color = output.nodes[cur_grp][1]
						.colors[2];
				}
				o.colors = [fill_color, stroke_color,
								line_color];
			}
		}
		if(in_node.DiagramNodeType &&
					in_node.DiagramNodeType != 'Basic') {
			o.ntype = in_node.DiagramNodeType;
		}
		output.nodes[id] = [in_node.NodeTitle +
			(in_node.DurationInHours? " (" +
			in_node.DurationInHours + "h)": ""), o];

		// load subnodes if any
		if(in_node.ChildGroup) {
		for(var j = 0; j <
			in_node.ChildGroup.ChildDiagramNodeDtos.length; ++j) {
			var abc = String.fromCharCode(97 + j);
			var in_chl = in_node.ChildGroup.ChildDiagramNodeDtos[j];
			id = cur_grp + cur_num + abc;
			o = {oid: in_chl.DiagramNodeId}; // options
			oid2id[o.oid] = id; // set lookup oid to id
			output.nodes[id] = [in_chl.NodeTitle, o];
		}
		}

		++cur_num;
		prev_id = id;
		prev_oid = o.oid;
	}
	console.log(output);
	return output;
}

// prepare data model for visualizing:
M.model = new M.Model();
if(!input_tree) {
	input_tree = M.convert_raw(input_raw);
}
M.model.init(input_tree);

// main window:
M.mainview = new M.View($("#mainview"));
M.v = $('#mainview'); // easy access to mainview container div
M.c = $('#mainview .canvas'); // easy access to mainview canvas div

// mini map:
M.mapv = $("<div>").attr("id", "minimap"); // minimap container
M.mapc = $("<div>").addClass("canvas"); // the minimap canvas
M.navbox = $("<div>").addClass("navbox"); // box inside the minimap
M.mapv.append(M.navbox);
M.mapv.append(M.mapc);
M.v.append(M.mapv);

M.minimap = new M.View($("#minimap"));
M.minimap.ismap = true;

M.grpv = $("<div>").attr("id", "grpview"); // group view
M.grpc = $("<div>").addClass("canvas"); // group canvas
M.grpv.append(M.grpc);
M.v.append(M.grpv);
M.grpv.hide();

M.expand_grp = function(id) {
	if(!M.mainview.tree[id].iscollapsible) return;
	M.mainview.tree[id].iscollapsible = false;
	M.mainview.tree[id].set_collapsed(false);
	M.minimap.tree[id].iscollapsible = false;
	M.minimap.tree[id].set_collapsed(false);
	M.mainview.expand(id);
	M.minimap.expand(id);
};

M.expand_done = function(id) {
	id = M.model.tree[id].grp + M.model.tree[id].num;
	M.mainview.tree[id].iscollapsible = true;
	M.mainview.tree[id].set_collapsed(false);
	M.minimap.tree[id].iscollapsible = false;
	M.minimap.tree[id].set_collapsed(false);
};

M.collapse_grp = function(id) {
	if(!M.mainview.tree[id].iscollapsible) return;
	M.mainview.tree[id].iscollapsible = false;
	M.mainview.tree[id].set_collapsed(true);
	M.minimap.tree[id].iscollapsible = false;
	M.minimap.tree[id].set_collapsed(true);
	var tail = M.model.tree[id].get_tail();
	M.mainview.collapse(tail);
	M.minimap.collapse(tail);
};

M.collapse_done = function(id) {
	id = M.model.tree[id].grp + M.model.tree[id].num;
	M.mainview.tree[id].iscollapsible = true;
	M.mainview.tree[id].set_collapsed(true);
	M.minimap.tree[id].iscollapsible = true;
	M.minimap.tree[id].set_collapsed(true);
};


M.show_grp = function(id) {
	console.log(id);
	var model = new M.Model();
	model.init(input_tree, id); // create a group model
	console.log(model.tree);
	var grpview = new M.View($("#grpview"), model);
	M.grpv.show().click(function() {M.grpv.hide()});
	grpview.draw();
	grpview.anim(grpview.root);
	console.log(grpview.root);
};

M.mousedown = false; // click drag detection
M.mouseinmini = false; // mouse was clicked inside the minimap
M.startx = 0; // initial drag mouse position
M.starty = 0;
M.dx = 0; // delta x
M.dy = 0;
M.vx = 0; // original view x
M.vy = 0;
M.vw = 0; // original view width
M.vh = 0; // original view height
M.isshowcase = false; // are we in showcase mode?
M.vbox_bup; // backup of vbox before entering the showcase mode

M.updatenavbox = function () {
	// determine ratio of width and height:
	var v = M.v; // main view
	var c = M.c; // main canvas
	var rw = v.width() / c.width(); // ratio of view width / canvas width
	var rh = v.height() / c.height();
	var rx = v.scrollLeft() / c.width(); // ratio of offset
	var ry = v.scrollTop() / c.height();
	var w = M.mapc.width() * rw; // scaled width, but not trimmed to fit
	var h = M.mapc.height() * rh;
	var x = M.mapc.width() * rx; // scaled offset
	var y = M.mapc.height() * ry;
	// now we need to trim the box so that it fits the minimap
	var maxw = M.mapc.width() - x;
	var maxh = M.mapc.height() - y;
	w = (w > maxw)? maxw * 0.99: w; // trim width
	h = (h > maxh)? maxh * 0.99: h;
	M.navbox.width(w);
	M.navbox.height(h);
	M.navbox.css({ left: x, top: y });
};

M.resize = function () {
	M.v.width($(window).width());
	M.v.height($(window).height());
	M.updatenavbox();
};

M.v.scroll(M.updatenavbox);

$(window).resize(M.resize);

M.v.mousedown(function (e) {
	M.startx = e.screenX;
	M.starty = e.screenY;
	M.vx = M.v.scrollLeft();
	M.vy = M.v.scrollTop();
	if(!M.mousedown) {
		M.mousedown = true;
		M.mouseinmini = false;
	}
}).mouseup(function (e) {
	M.mousedown = false;
});

$(window).mousemove(function (e) {
	if(M.mousedown) {
		M.dx = M.startx - e.screenX;
		M.dy = M.starty - e.screenY;
		M.v.scrollLeft(M.vx + M.dx);
		M.v.scrollTop(M.vy + M.dy);
	}
});

$(window).mouseup(function (e) {
	M.mousedown = false;
});

M.v.bind('mousewheel DOMMouseScroll', function (e) {
	if(e.originalEvent.pageX > $(window).width() * 0.6) {
		return true;
	}
	var v = $('#mainview');
	var c = $('#mainview .canvas');
	if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
		// scroll up: zoom in
		v.css('font-size', parseInt(v.css('font-size'), 10) + 5);
	} else {
		// scroll down: zoom out
		var rw = v.width() / c.width();
		var rh = v.height() / c.height();
		if(rw < 1 || rh < 1) {
			v.css(
			'font-size', parseInt(v.css('font-size'), 10) - 5);
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
M.mapv.show().width(M.mainview.w * 0.25)
	.height(M.mainview.h * 0.25)
	.click(function (e) {
		M.mousedown = false;
		return M.navigate(e);
	}).mousemove(function (e) {
		if(M.mousedown && M.mouseinmini) {
			return M.navigate(e);
		}
	}).mouseup(function (e) {
		M.mousedown = false;
	}).mousedown(function (e) {
		M.mousedown = true;
		M.mouseinmini = true;
	});

M.resize();

M.isminimap_hidden = false;

$("#minimap_btn").click(function() {
	if(M.isminimap_hidden) {
		M.mapv.show();
		M.isminimap_hidden = false;
	} else {
		M.mapv.hide();
		M.isminimap_hidden = true;
	}
});

$("#filter_btn").click(function() {
	var re = /[a-z\-\_]+/gi;
	var text = $("#filter_in").val();
	var keywords = text.match(re);
	M.mainview.root.filter(keywords);
	M.minimap.root.filter(keywords);
});

M.sel_head = -1; // when selection is active, it contains an index in
		 // M.model.mnode array, identifying the node
M.sel_tail = -1;

M.display_sel = function() {
/*	if(M.sel_head == -1) {
		// nothing selected - deselect all
		M.mainview.root.sel_ind(-5);
		M.minimap.root.sel_ind(-5);
	} else if(M.sel_tail == -1) {
		// only one item selected: select it
		M.mainview.root.sel_ind(M.sel_head);
		M.minimap.root.sel_ind(M.sel_head);
	} else {
		// two points are selected. select range:
		var tail = (M.sel_head < M.sel_tail)? M.sel_tail: M.sel_head;
		var head = (M.sel_head < M.sel_tail)? M.sel_head: M.sel_tail;
		var start = M.mainview.root.find_ind(tail);
		if(start) {
			start.sel_until(head);
		}
		var start = M.minimap.root.find_ind(tail);
		if(start) {
			start.sel_until(head);
		}
	}
*/
}

})(jQuery);

