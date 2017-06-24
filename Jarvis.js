window.onload = function () {

    // Colors
    var WHITE_COLOR = "#ffffff",
        BLACK_COLOR = "#000",
        CURRENT_NODE_COLOR = "#ff3300",
        EXTRA_EDGE_COLOR = "#ffff00",
        FIRST_NODE_COLOR = "#00ff00",
        DEFAULT_NODE_COLOR = "#000",
        DEFAULT_EDGE_COLOR = "#000";

    // Canvas variables
    var canvas,
        ctx,
        nodes,
        draw,
        dragNode,
        dragPoint;

    var NODE_RANGE = 3;


    var info_field,
        setTextToInfo;

    // Welcome Info
    info_field = document.getElementById("info_field");
    setTextToInfo = function (info) {
        info_field.innerHTML = info;
    };

    /*
     BUTTONS
     */
    var currentBtn,
        btnCreateNode,
        btnWork,
        btnStop,
        btnView,
        btnClearCanvas,
        btnCreateRandomNodes,
        btnNextStep;

    btnCreateNode = document.getElementById('btn_create_node');
    btnCreateNode.addEventListener("click", function (event) {
        changeCurrentButton(btnCreateNode);
    }, false);

    btnView = document.getElementById('btn_view');
    btnView.addEventListener("click", function (event) {
        changeCurrentButton(btnView);
    }, false);

    btnClearCanvas = document.getElementById('btn_clear_canvas');
    btnClearCanvas.addEventListener("click", function (event) {
        clearNodes();
        draw();
    }, false);

    btnCreateRandomNodes = document.getElementById("btn_create_random_nodes");
    btnCreateRandomNodes.addEventListener("click", function (event) {
        createRandomNodes();
    }, false);

    btnWork = document.getElementById("btn_work");
    btnWork.disabled = true;
    btnWork.addEventListener("click", function (event) {
        if (btnWork.disabled) return;
        if (isPaused || isStopped) {
            if (isFirstStart) {
                currentStep = startAlgorithm;
                btnStop.disabled = false;
                btnStop.src = "imgs/stop_red.png";
                isStopped = false;
                isFirstStart = false;
            }

            btnNextStep.disabled = true;
            btnNextStep.src = "imgs/next_black.png";
            btnWork.src = "imgs/pause_yellow.png";
            isPaused = false;
            nextStep(currentStep);
        } else {
            isPaused = true;
            btnWork.src = "imgs/start_green.png";
            btnNextStep.disabled = false;
            btnNextStep.src = "imgs/next_blue.png";
            clearTimeout(nextTimer);
        }
    }, false);

    btnStop = document.getElementById("btn_stop");
    btnStop.disabled = true;
    btnStop.src = "imgs/stop_black.png";
    btnStop.addEventListener("click", function (event) {
        if (btnStop.disabled) return;
        clearTimeout(nextTimer);
        isStopped = true;
        btnStop.disabled = true;
        btnStop.src = "imgs/stop_black.png";
        isPaused = false;
        btnWork.disabled = false;
        btnWork.src = "imgs/start_green.png";
        btnNextStep.disabled = true;
        btnNextStep.src = "imgs/next_black.png";
        isFirstStart = true;
        clearAlgorithmInfo();
    }, false);

    btnNextStep = document.getElementById("btn_next_step");
    btnNextStep.disabled = true;
    btnNextStep.src = "imgs/next_black.png";
    btnNextStep.addEventListener("click", function (event) {
        if (btnNextStep.disabled) return;
        isSkipped = true;
        nextStep(currentStep);
    }, false);


    // Return back default settings
    var clearAlgorithmInfo = function () {
        setTextToInfo("Clean and fresh,all settings are default");
        nodes.forEach(function (node) {
            node.setNodeColor(DEFAULT_NODE_COLOR);
            node.edge = undefined;
            node.extraEdge = undefined;
        });
    };

    var SRC_VIEW_CURRENT = "imgs/view_current.png",
        SRC_VIEW_BLACK = "imgs/view_black.png",
        SRC_CREATE_CURRENT = "imgs/create_current.png",
        SRC_CREATE_BLACK = "imgs/create_black.png";


    var changeCurrentButton = function (button) {
        switch (button.id) {
            case btnView.id:
                btnView.src = SRC_VIEW_CURRENT;
                btnCreateNode.src = SRC_CREATE_BLACK;
                break;
            case btnCreateNode.id:
                btnCreateNode.src = SRC_CREATE_CURRENT;
                btnView.src = SRC_VIEW_BLACK;
                break;
        }
        currentBtn = button;
    };

    // At first we in view module
    changeCurrentButton(btnView);


    /*
     Nodes
     */
    var clearNodes = function () {
        nodes = [];
        btnWork.disabled = true;
    };

    var Node = function (id, pos) {
        return {
            id: id,
            edge: undefined,
            extraEdge: undefined,
            x: pos.x,
            y: pos.y,
            color: DEFAULT_NODE_COLOR,

            setNodeColor: function (color) {
                this.color = color;
                draw();
            },

            createEdge: function (to) {
                this.edge = {
                    color: DEFAULT_EDGE_COLOR,
                    to: Number(to),

                    setEdgeColor: function (color) {
                        this.color = color;
                        draw();
                    }
                };
                draw();
            },

            createExtraEdge: function (to) {
                this.extraEdge = {
                    color: EXTRA_EDGE_COLOR,
                    to: Number(to)
                };
                draw();
            }
        };
    };

    var getNode = function (id) {
        return nodes[id];
    };

    nodes = [];

    /*
     Canvas + Draw
     */
    canvas = document.getElementById('canvas');

    ctx = canvas.getContext('2d');

    // Redraw canvas and his elements
    draw = function () {
        ctx.fillStyle = WHITE_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        nodes.forEach(function (node) {
            [node.edge, node.extraEdge].forEach(function (edge) {
                if (edge === undefined) return;
                var from = node,
                    to = getNode(edge.to);
                ctx.fillStyle = BLACK_COLOR;
                ctx.strokeStyle = edge.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            });
        });

        // Draw vertices
        nodes.forEach(function (node) {
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.strokeStyle = BLACK_COLOR;
            ctx.arc(node.x, node.y, NODE_RANGE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = BLACK_COLOR;
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        });
    };

    /*
     Random
     */
    var createRandomNodes = function () {
        clearNodes();
        btnWork.disabled = false;

        var nodesCount = Number(document.getElementById("nodes_count").value);
        if(nodesCount > 100) {
            randomException();
            return;
        } // if nodeCount >100, The work time will be long


        var nodesPos = [];

        var getRandomValue = function (limit) {
            return Math.floor(Math.random()*1000) % limit;
        };

        var compareCoordinateForCompatibility = function (pos1, pos2, withWhat) {
            return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) > withWhat * withWhat;
        };

        var checkBorders = function (pos) {
            var range = NODE_RANGE * 4;

            if(pos.x < range){
                pos.x += range;
            }
            if(canvas.width - pos.x < range){
                pos.x -= range;
            }
            if(pos.y < range){
                pos.y += range;
            }
            if(canvas.height - pos.y < range){
                pos.y -= range;
            }
            return pos;
        };

        var getRandomPos = function() {
            return checkBorders({
                x: getRandomValue(canvas.width),
                y: getRandomValue(canvas.height)
            });
        };

        var checkPosCompatibility = function (pos) {
            var check = true;
            nodesPos.forEach(function(nodePos) {
                check = check && compareCoordinateForCompatibility(pos, nodePos, NODE_RANGE);
            });
            return check;
        };

        // Generate vertices
        for(var i = 0; i < nodesCount; i++){
            var pos = getRandomPos();
            while(!checkPosCompatibility(pos)){
                pos = getRandomPos();
            }
            nodesPos.push(pos);
            createNode(pos);
        }

        draw();
        endRandom()
    };

    /*
     Node movement by mouse
     */

    // Get from mouse event coordinates relatively left-top corner of canvas
    var getMousePosFromEvent = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    // Find node by coordinates
    var getNodeByPos = function (pos) {
        var result = undefined;
        nodes.forEach(function (node) {
            if ((node.x - pos.x) * (node.x - pos.x) + (node.y - pos.y) * (node.y - pos.y)
                <= NODE_RANGE * NODE_RANGE) {
                result = node;
            }
        });
        return result;
    };

    // Find node and remember that in dragNode
    canvas.addEventListener('mouseDown', function (event) {
        if (currentBtn !== btnView) {
            return;
        }
        var pos = getMousePosFromEvent(event);
        dragNode = getNodeByPos(pos);
        // Find dragPoint
        if (dragNode !== undefined) {
            dragPoint = {
                x: pos.x - dragNode.x,
                y: pos.y - dragNode.y
            }
        }
    }, false);

    // Forgot current dragNode
    canvas.addEventListener('mouseUp', function () {
        dragNode = undefined;
    }, false);

    // Change node coordinate and redraw
    canvas.addEventListener('mouseMove', function (event) {
        var pos;
        if (dragNode !== undefined) {
            pos = getMousePosFromEvent(event);
            dragNode.x = pos.x - dragPoint.x;
            dragNode.y = pos.y - dragPoint.y;
            draw();
        }
    }, false);

    /*
    Create
     */

    // Create node if now create mode
    canvas.addEventListener('click', function (event) {
        var pos = getMousePosFromEvent(event);
        switch (currentBtn.id) {
            case "btn_create_node":
                createNode(pos);
                break;
            default:
                return;
        }
        draw();
    }, false);

    var createNode = function (pos) {
        nodes.push(Node(nodes.length, pos));
        btnWork.disabled = false;
    };




    /*
    Algorithm
    */
    var STEP_TIME = Number(2),
        nextStep,
        nextTimer,
        currentStep,
        isFirstStart = true,
        isStopped = true,
        isPaused = false,
        isSkipped = false,
        isPauseOrStop,
        firstNode,
        currentNode,
        nextNode,
        index,
        nextIndex;

    nextStep = function (func,n) {
        if(isSkipped){
            isSkipped = false;
            func();
            return;
        } else if(isPauseOrStop(func)) return;

        nextTimer = setTimeout(func, STEP_TIME*n);
    };

    isPauseOrStop = function (func) {
        currentStep = func;
        return isStopped || isPaused;
    };

    nextIndex = function (currInd) {
        index = (currInd + 1) % nodes.length;
    };

    var startAlgorithm = function () {
        setTextToInfo("Find the downiest node and start gift wrapping");
        nextStep(findFirstNodeStep,300);
    };

    var findFirstNodeStep = function () {
        firstNode = getNode(0);
        nodes.forEach(function (node) {
            if(node.y > firstNode.y) firstNode = node;
        });

        firstNode.setNodeColor(FIRST_NODE_COLOR);
        currentNode = firstNode;
        if (isPaused){setTextToInfo("Find next node");};
        nextStep(findNextNodeStep,50);
    };

    var findNextNodeStep = function () {
        nextIndex(currentNode.id);
        currentNode.createEdge(index);
        nextNode = getNode(index);
        nextIndex(index);
        if (isPaused){setTextToInfo("Take next node<br>Check this node with other nodes for rotation");};
        nextStep(findMinNodeStep,50);
    };

    var findMinNodeStep = function () {
        if(index === currentNode.id){
            setTextToInfo("For more information lets try pause mode");
            nextStep(setNextNodeStep,10);
            return;
        }

        currentNode.createExtraEdge(index);
        if (isPaused){setTextToInfo("Check rotation with this node");};
        nextStep(checkRotateStep,50);
    };

    var checkRotateStep = function () {
        var node = getNode(index);
        var rotate = (nextNode.x - currentNode.x)*(node.y - nextNode.y)
            - (nextNode.y - currentNode.y)*(node.x - nextNode.x);

        if(rotate > 0){
            nextNode = node;
            currentNode.createEdge(currentNode.extraEdge.to);
            if (isPaused){setTextToInfo("This node more righter than current. Change the node");};
        } else {
            if (isPaused) {setTextToInfo("This node less righter than current. Don't change the node");};
        }

        currentNode.extraEdge = undefined;
        draw();

        nextIndex(index);
        nextStep(findMinNodeStep,10);
    };

    var setNextNodeStep = function () {
        currentNode = nextNode;
        currentNode.setNodeColor(CURRENT_NODE_COLOR);
        if(currentNode.id === firstNode.id){
            if (isPaused){setTextToInfo("The algorithm returned in first node");};
            nextStep(endAlgorithm,10);
        }
        else {
            nextStep(findNextNodeStep,10);
            if (isPaused){setTextToInfo("Find next node");};
        }
    };

    /*
    Messeges
     */
    var endAlgorithm = function () {
        setTextToInfo("The ancient Aztecs called the resulting figure a polygon, the algorithm works");
    };
    var randomException = function () {
        setTextToInfo("Sorry, For your parameters, the visualization will take too long, we advise you to select an amount less than 100  ");
    };
    var endRandom = function () {
        setTextToInfo("vertices are generated");
    };

    draw();

};
