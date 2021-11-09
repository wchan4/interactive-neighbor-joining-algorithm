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

    d3.select("svg").remove();

    var matrix_dict = {};
    for (var i in Nodes) {
        for (let j = 0; j < i; j++) {
            var cur_id = Nodes[j] + ":" + Nodes[i];
            var cur_val = document.getElementById(cur_id).value;
            var d = parseInt(cur_val);
            if (isNaN(d)) {
                console.log("Not Integer Error");
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

    for (var m in D) {
        for (var n in D) {
            if (m != n) {
                if (!(m in T)) {
                    T[m] = {};
                }
                if (!(n in T)) {
                    T[n] = {};
                }
                T[m][n] = D[m][n];
                T[n][m] = D[n][m];
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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
        .style("fill", "#fff");

    nodeEnter.append("text")
        .attr("y", function(d) { 
            return d.children || d._children ? -18 : 18; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { 
            if (d.children == null) {
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

}
