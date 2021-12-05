var N = 4,
    Nodes = ["a", "b", "c", "d"];


function parseArray(str) {
    arr = str.split(",")
    for (var cur in arr) {
        cur = cur.trim();
    }
    return arr

}

function redrawMatrix() {
    var error_msg = document.getElementById("error_msg");
    error_msg.innerText = ""; 

    var new_N = $('#node_num').val();
    var new_Nodes = $('#nodes').val();

    var temp_N= parseInt(new_N)
    if (isNaN(temp_N)) {
        var error_msg = document.getElementById("error_msg");
        error_msg.innerText = "PLEASE GIVE VALID INTEGER FOR \"NUMBER OF NODES\".";

        return;
    } else {
        N = temp_N;
    }
    Nodes = parseArray(new_Nodes)

    if (N == Nodes.length) {
        $("#matrix tr").remove();
        constructMatrix();
    } else {
        var error_msg = document.getElementById("error_msg");
        error_msg.innerText = "\"NUMBER OF NODES\" MUST EQUAL LENGTH OF \"NODES\".";
        return;
    }
    console.log(N);
    console.log(Nodes);
}

function constructMatrix() {
    var tbl = document.getElementById("matrix")
    tbl.style.width = '100px';
    tbl.style.border = '1px solid black';
    
    const tr = tbl.insertRow()
    for (let j = 0; j < N+1; j++) {
        if (j != 0) {
            const td = tr.insertCell();
            var header_str = Nodes[j-1]
            td.appendChild(document.createTextNode(header_str));
            td.className = 'datalabel';
        } else {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(``));
            td.className = 'datalabel';
        }
    }

    for (let i = 0; i < N; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < N+1; j++) {
            if (j == 0) {
                const td = tr.insertCell();
                var header_str = Nodes[i]
                td.appendChild(document.createTextNode(header_str));
                td.className = 'datalabel';
            } else if (i+1 > j) {
                const td = tr.insertCell();
                td.appendChild(document.createTextNode('_'));
                td.className = 'data';
            } else if (i+1 == j) {
                const td = tr.insertCell();
                td.appendChild(document.createTextNode('0'));
                td.className = 'data';
            } else {
                const td = tr.insertCell();
                var input = document.createElement("input");
                input.type="text";
                input.id = Nodes[i] + ":" + Nodes[j-1];
                input.value = "";
                td.appendChild(input);
                td.className = 'data';
            }
        }
    }

}

