module.exports = {
    getAllNode,
    getNodeByID,
    addNode,
    getAllLink,
    addLink
}

const NODES = [];
const LINKS = [];

function getNodeByID(ID){
    return NODES[ID];
}

function addNode(node){
    NODES.push(node);
}

function getAllNode(){
    return NODES;
}

function addLink(link){
    LINKS.push(link);
}

function getAllLink(){
    return LINKS;
}
