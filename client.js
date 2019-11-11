// used for generating a new ID for each kind of textbox dropped onto the draw zone
const canvas_tb_counts = {
    "red": 0,
    "green": 0,
    "blue": 0
};

var tb_queue = [];

onDragOver = event => {
    event.preventDefault();
}

onTextboxDrag = event => {
    let tb_data = {}
    tb_data.id = event.target.id;
    tb_data.color = event.target.style.backgroundColor;
    tb_data.readOnly = event.target.readOnly;
    tb_data.content = event.target.value;

    let bounding_rect = event.target.getBoundingClientRect();
    tb_data.xOff = Math.abs(bounding_rect.x - event.x);
    tb_data.yOff = Math.abs(bounding_rect.y - event.y);

    tb_data.effect = event.target.readOnly ? "copy" : "move";

    tb_data.parentID = event.target.parentElement.id;

    event.dataTransfer.setData("tb_data", JSON.stringify(tb_data));
    // console.log(event.dataTransfer.getData("tb_data"));

    // event.stopPropagation();
}

onTextboxDragEnd = event => {
    // remove data from event.datatransfer
    event.dataTransfer.clearData("tb_data");
}

onSidebarDrop = event => {

    let data = JSON.parse(event.dataTransfer.getData("tb_data"));

    if (data.effect === "move") {
        let tb_node = document.getElementById(data.id);
        tb_node.parentNode.removeChild(tb_node);
        // remove this textbox information from the canvas data structure
        tb_queue = tb_queue.filter(el => el.id !== data.id);
    }
}

onCanvasDrop = event => {
    let data = JSON.parse(event.dataTransfer.getData("tb_data"));

    if (data.effect == "move") {
        let el = document.getElementById(data.id);
        el.style.left = (event.x - data.xOff) + 'px';
        el.style.top = (event.y - data.yOff) + 'px';
        insertInQueue(data.id, event.y);
    }
    else if (data.effect == "copy") {
        let newTB = createTB();
        newTB.setAttribute("id", data.id + canvas_tb_counts[data.color]++);
        newTB.setAttribute("draggable", true);
        newTB.addEventListener("dragstart", onTextboxDrag);
        newTB.addEventListener("dragend", onTextboxDragEnd);
        newTB.style.backgroundColor = data.color;
        newTB.style.position = "absolute";
        newTB.style.left = (event.x - data.xOff) + 'px';
        newTB.style.top = (event.y - data.yOff) + 'px';
        newTB.className += " tb_height";

        parentNode = document.getElementById(event.target.id);
        parentNode.appendChild(newTB);
        insertInQueue(newTB.id, event.y);
    }
}

createTB = () => {
    let newTB = document.createElement("input");
    newTB.setAttribute("type", "text");
    return newTB;
}

insertInQueue = (id, y) => {
    // remove if element already exists (moving element on canvas)
    existing_tb_data = tb_queue.find(el => el.id == id);
    if(existing_tb_data)
        existing_tb_data.y = y;
    else tb_queue.push({ "id": id, "y": y });
}

onSaveClick = (event) => {
    // prepare data
    tb_queue.map(el => {
        el.content = document.getElementById(el.id).value;
        return el;
    });
    // make ajax call
    postAJAX();
}

postAJAX = () => {
    $.ajax({
        url: 'http://localhost:5000/save',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(tb_queue),
        processData: false,
        success: (data, textStatus, jQxhr) => {
            processServerOutput(data);
        },
        error: (jqXhr, textStatus, errorThrown) => {
            console.log(errorThrown);
        }
    });
}

processServerOutput = (data) => {
    let canvas = document.getElementById("drop_canvas");
    canvas.style.backgroundColor = "#FFFFFF";
    canvas.style.textAlign = "center";
    let outputString = "Saved Data: <br/>";
    data.forEach(element => {
        Object.keys(element).forEach(el => {
            outputString += `${el}: ${element[el]}`;
            outputString += "<br/>"
        });
    });
    canvas.innerHTML = outputString;

    document.getElementById("save_button").style.visibility = "hidden";
    document.getElementById("sidebar_div").style.visibility = "hidden";

}