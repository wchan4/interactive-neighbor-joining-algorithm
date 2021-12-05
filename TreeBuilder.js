var show_labels = false;
var order = [];

function showOrdering() {
    if (!show_labels) {
        var order_text = document.getElementById("order_text");

        var ordering_text = "Format: (node1,node2: edge)\n";
        var n = order.length
        for (var i in order) {
            var cur = order[i];
            var cur_str = "(" + cur[0] + "," + cur[1] + ": " + cur[2] + ")";
            if (i != n-1) {
                cur_str = cur_str + " -> ";
            }
            ordering_text = ordering_text + cur_str;
        }
        order_text.innerText = ordering_text;
        show_labels = true;
        // generateTree();
    } else {
        var order_text = document.getElementById("order_text");
        order_text.innerText = "";

        show_labels = false;
        // generateTree();
    }
}

// https://stackoverflow.com/questions/4122268/using-settimeout-synchronously-in-javascript
function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function highlight(i) {
    var node1 = order[i][0];
    var node2 = order[i+1][0];
    var node3 = order[i][1];

    var node1_id = "circle:" + node1;
    var node2_id = "circle:" + node2;
    var node3_id = "circle:" + node3;

    var node1_obj = document.getElementById(node1_id);
    var node2_obj = document.getElementById(node2_id);
    var node3_obj = document.getElementById(node3_id);

    highlight_color = "yellow";

    node1_obj.setAttribute("stroke", highlight_color);
    node2_obj.setAttribute("stroke", highlight_color);
    node3_obj.setAttribute("stroke", highlight_color);
}

function unhighlight(new_i) {
    i = new_i - 2
    var node1 = order[i][0];
    var node2 = order[i+1][0];
    var node3 = order[i][1];

    var node1_id = "circle:" + node1;
    var node2_id = "circle:" + node2;
    var node3_id = "circle:" + node3;

    var node1_obj = document.getElementById(node1_id);
    var node2_obj = document.getElementById(node2_id);
    var node3_obj = document.getElementById(node3_id);

    internal_color = "forestgreen";
    leaf_color = "cornflowerblue";

    if (node1_id.includes("internal")) {
        node1_obj.setAttribute("stroke", internal_color);
    } else {
        node1_obj.setAttribute("stroke", leaf_color);
    }

    if (node2_id.includes("internal")) {
        node2_obj.setAttribute("stroke", internal_color);
    } else {
        node2_obj.setAttribute("stroke", leaf_color);
    }

    if (node3_id.includes("internal")) {
        node3_obj.setAttribute("stroke", internal_color);
    } else {
        node3_obj.setAttribute("stroke", leaf_color);
    }

}

function minihighlight(i) {
    var node1 = order[i][0];
    var node2 = order[i][1];

    var node1_id = "circle:" + node1;
    var node2_id = "circle:" + node2;

    var node1_obj = document.getElementById(node1_id);
    var node2_obj = document.getElementById(node2_id);

    highlight_color = "yellow";

    node1_obj.setAttribute("stroke", highlight_color);
    node2_obj.setAttribute("stroke", highlight_color);
}

function miniunhighlight(i) {
    var node1 = order[i][0];
    var node2 = order[i][1];

    var node1_id = "circle:" + node1;
    var node2_id = "circle:" + node2;

    var node1_obj = document.getElementById(node1_id);
    var node2_obj = document.getElementById(node2_id);

    internal_color = "forestgreen";
    leaf_color = "cornflowerblue";

    if (node1_id.includes("internal")) {
        node1_obj.setAttribute("stroke", internal_color);
    } else {
        node1_obj.setAttribute("stroke", leaf_color);

    }

    if (node2_id.includes("internal")) {
        node2_obj.setAttribute("stroke", internal_color);
    } else {
        node2_obj.setAttribute("stroke", leaf_color);

    }
}

// https://www.w3schools.com/js/js_htmldom_animate.asp
function showAnimation() {
    let id = null;
    let i = 0;
    clearInterval(id);
    id = setInterval(frame, 800);
    function frame() {
        console.log(i)
        if (i == 0) {
            highlight(i);
            i = i + 2;
        } else if (i < order.length - 1) {
            unhighlight(i);
            highlight(i);
            i = i + 2;
        } else if (i < order.length + 1) {
            unhighlight(order.length-1);
            minihighlight(i);
            i = i + 2;
        } else {
            miniunhighlight(order.length-1);
            clearInterval(id);
        }
    }
}

function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

function additiveCheck(d) {
    var history = []
    for (var i in d) {
        for (var j in d) {
            for (var k in d) {
                for (var l in d) {
                    if ((i!=j) && (i!=k) && (i!=l) && (j!=k) && (j!=l) && (k!=l)) {
                        var d1 = d[i][j] + d[k][l],
                            d2 = d[i][k] + d[j][l],
                            d3 = d[i][l] + d[j][k];
                        if ((d1 <= d2) && (d2 == d3)) {
                            var cur = new Set([i,j,k,l]);
                            history.push(cur);
                        }

                    }
                }
            }
        }
    }

    for (var i in d) {
        for (var j in d) {
            for (var k in d) {
                for (var l in d) {
                    if ((i!=j) && (i!=k) && (i!=l) && (j!=k) && (j!=l) && (k!=l)) {
                        var check = false;
                        for (var x in history) {
                            var cur = history[x];
                            var temp = new Set([i,j,k,l]);
                            var cur_check = eqSet(cur, temp);
                            if (cur_check) {
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;

}

function dict_to_tree(d) {
    var ret = [],
        node_dict = {},
        seen_nodes = new Set(),
        check = true,
        internal_counter = 0;

    while (check) {
        var internal_node = "internal" + internal_counter.toString(),
            children = [],
            node = null;
        if (internal_node in d) {
            for (var k in d[internal_node]) {
                if (k.includes("internal")) {
                    continue;
                }
                cur = {"name":k, "edge":d[internal_node][k].toFixed(2).toString()};
                children.push(cur);
                seen_nodes.add(k);
            }
            node = {"name": internal_node, "children": children};
            if (Object.keys(d[internal_node]).length == 0) {
                delete d[internal_node];
            }

        }
        if (Object.keys(d).length == seen_nodes.size) {
            check = false;
        } else {
            for (var cur_child in d[internal_node]) {
                if (cur_child in node_dict) {
                    node_dict[cur_child]["edge"] = d[internal_node][cur_child];
                    node.children.push(node_dict[cur_child]);
                    delete node_dict[cur_child];
                } 
            }
        }
        node_dict[internal_node] = node;
        seen_nodes.add(internal_node);
        internal_counter += 1;
        if (internal_counter > 100) {
            break;
        }
    }
    for (var k in node_dict) {
        ret.push(node_dict[k]);
    }
    return ret;
}


function generateTree() {
    // var treeDict = {"internal0": {"a":2,"b":0,"c":2}, "a":{"internal0":2}, "b":{"internal0":0}, "c":{"internal0":2}};
    // var treeDict0 = {"internal0": {"a":1,"b":1,"internal1":2}, "a":{"internal0":1}, "b":{"internal0":1}, "internal1":{"c":1,"d":1,"internal0":2}, "c":{"internal1":1}, "d":{"internal1":1}};

    order = [];

    var error_msg = document.getElementById("error_msg");
    error_msg.innerText = "";

    d3.select("svg").remove();

    var matrix_dict = {};
    for (var i in Nodes) {
        for (let j = 0; j < i; j++) {
            var cur_id = Nodes[j] + ":" + Nodes[i];
            var cur_val = document.getElementById(cur_id).value;
            var d = parseInt(cur_val);
            if (isNaN(d)) {
                var error_msg = document.getElementById("error_msg");
                error_msg.innerText = "PLEASE INPUT VALID INTEGERS INTO TABLE.";
                
                var outputlabel = document.getElementById("outputlabel");
                outputlabel.innerHTML = "";

                var order_button = document.getElementById("order_button");
                order_button.setAttribute("style", "display:none");

                var animate_button = document.getElementById("animate_button");
                animate_button.setAttribute("style", "display:none");

                return;
            }
            i_key = Nodes[i];
            j_key = Nodes[j];
            if (!(i_key in matrix_dict)) {
                matrix_dict[i_key] = {};
            }
            if (!(j_key in matrix_dict)) {
                matrix_dict[j_key] = {};
            }
            matrix_dict[i_key][j_key] = d;
            matrix_dict[j_key][i_key] = d;
            matrix_dict[i_key][i_key] = 0;
            matrix_dict[j_key][j_key] = 0;
        }
    }

    var add_check = additiveCheck(matrix_dict);
    if (!add_check) {
        var error_msg = document.getElementById("error_msg");
        error_msg.innerText = "PLEASE INPUT VALID ADDITIVE MATRIX.";

        var outputlabel = document.getElementById("outputlabel");
        outputlabel.innerHTML = "";

        var order_button = document.getElementById("order_button");
        order_button.setAttribute("style", "display:none");

        var animate_button = document.getElementById("animate_button");
        animate_button.setAttribute("style", "display:none");

        return;
    }

    var treeDict = neighborJoin(matrix_dict);

    ret = dict_to_tree(treeDict);

    drawTree(ret[0]);
}

function neighborJoin(D) {
    var T = {};
    var r_count = 0;
    while (Object.keys(D).length > 2) {
        var u = {};
        for (var k in D) {
            var cur_sum = 0;
            for (var j in D[k]) {
                cur_sum = cur_sum + D[k][j];
            }
            u[k] = cur_sum;
        }

        var min_tup = min_S_value(D, u);
        var i = min_tup[0],
            j = min_tup[1],
            len_D = Object.keys(D).length;

        var r = "internal" + r_count.toString();

        if (!(r in T)) {
            T[r] = {};
        }
        if (!(i in T)) {
            T[i] = {};
        }
        if (!(j in T)) {
            T[j] = {};
        }


        T[r][i] = 0.5*(D[i][j] + (u[i] - u[j])/(len_D-2));
        T[i][r] = 0.5*(D[i][j] + (u[i] - u[j])/(len_D-2));
        T[r][j] = 0.5*(D[i][j] + (u[j] - u[i])/(len_D-2));
        T[j][r] = 0.5*(D[i][j] + (u[j] - u[i])/(len_D-2));

        var tup0 = [i,r,T[r][i]];
        var tup1 = [j,r,T[r][j]];
        order.push(tup0);
        order.push(tup1);

        D[r] = {};
        for (var m in D) {
            if ((m != i) && (m != j) && (m != r)) {
                D[r][m] = 0.5*(D[i][m] + D[j][m] - D[i][j]);
                D[m][r] = 0.5*(D[i][m] + D[j][m] - D[i][j]);
            }
        }

        delete D[i];
        delete D[j];
        for (var m in D) {
            if (m != r) {
                delete D[m][i];
                delete D[m][j];
            }
        }
        r_count = r_count + 1;
    }

    var check2 = false;
    for (var m in D) {
        for (var n in D) {
            if ((m != n) && !check2) {
                if (!(m in T)) {
                    T[m] = {};
                }
                if (!(n in T)) {
                    T[n] = {};
                }
                T[m][n] = D[m][n];
                T[n][m] = D[n][m];

                var tup = [n,m,T[n][m]];
                order.push(tup);
                check2 = true;
            }
        }
    }
    return T;
}

function min_S_value(D, u) {
    var m = Object.keys(D).length;
    var min_S = Infinity,
        min_i = -1,
        min_j = -1;
    for (var k in D) {
        for (var l in D) {
            if (k != l) {
                crit = (m-2)*D[k][l] - u[k] -u[l];
                if (crit < min_S) {
                    min_S = crit;
                    min_i = k;
                    min_j = l;
                }
            }
        }
    }
    ret = [min_i, min_j];
    return ret;
}

function drawTree(source) {
    var outputlabel = document.getElementById("outputlabel");
    outputlabel.innerHTML = "Output Phylogeny Tree:";
    outputlabel.setAttribute("style", "margin-left:3em;");

    var order_button = document.getElementById("order_button");
    order_button.setAttribute("style", "display:inline-block;margin-left:5.5em;");

    var animate_button = document.getElementById("animate_button");
    animate_button.setAttribute("style", "display:inline-block;");

    // ************** Generate the tree diagram	 *****************
    var margin = {top: 40, right: 120, bottom: 20, left: 120},
            width = 960 - margin.right - margin.left,
            height = 500 - margin.top - margin.bottom;
            
    var i = 0;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });

    var svg = d3.select("#rightdiv").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "tree")
        .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");

    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Declare the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; });

    nodeEnter.append("circle")
        .attr("r", 10)
        .attr("stroke", function(d) {
            if (d.children == null) {
                return "cornflowerblue";
            } else {
                return "forestgreen";
            }
        })
        .attr("id", function(d){
            return "circle:" + d.name;
        })
        .style("fill", "#fff");

    nodeEnter.append("text")
        .attr("y", function(d) { 
            return d.children || d._children ? -18 : 18; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { 
            if ((d.children == null) || (show_labels)) {
                return d.name; 
            } else {
                return "";
            }
        })
        .style("fill-opacity", 1);

    // Declare the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter the links.
    var linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);

    // Link Labels
    var labelPositions = [];

    d3.selectAll("path.link")
        .each(function(d, i){
            var bounds = this.getBBox();
            labelPositions[i] = {
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2,
                val: d.target.edge
            };
        });

    var label = d3.select("svg g")
        .selectAll("text.linklabel")
        .data(labelPositions);

    label.exit().remove();

    label.enter()
        .append("text")
        .classed("linklabel", true)
        .style({fill: "black"});

    label.text(function(d, i){ return d.val; })
        .attr("text-anchor", "middle")
        .attr({
            x: function(d){return d.x;},
            y: function(d){return d.y;}
        });

    // Draw Box Around SVG
    // Citation: https://stackoverflow.com/questions/17218108/rectangle-border-around-svg-text
    var svgcanvas = d3.select('svg');

    var svg_var = document.getElementById("tree");

    var selection = d3.select(svg_var);
    var rect = svg_var.getBBox();
    var offset = 10; // enlarge rect box 2 px on left & right side
    var yoffset = 10;
    selection.classed("mute", (selection.classed("mute") ? false : true));

    pathinfo = [
        {x: rect.x-offset, y: rect.y-yoffset },
        {x: rect.x+offset + rect.width, y: rect.y-yoffset},
        {x: rect.x+offset + rect.width, y: rect.y + rect.height },
        {x: rect.x-offset, y: rect.y + rect.height},
        {x: rect.x-offset, y: rect.y-yoffset},
    ];

    // Specify the function for generating path data
    var d3line = d3.svg.line()
        .x(function(d){return d.x;})
        .y(function(d){return d.y;})
        .interpolate("linear");
    // Draw the line
    svgcanvas.append("svg:path")
        .attr("d", d3line(pathinfo))
        .style("stroke-width", 3)
        .style("stroke", "lightcoral")
        .style("fill", "none");
}
