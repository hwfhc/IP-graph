/*
 * dependency modules
 */

const nodeManager = require('./nodeManager');
const EventEmitter = require('wolfy87-eventemitter');
const Node = require('./node');
const Link = require('./link');

/*
 * constant configuration
 */
const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');

const backgroundColor = '#000';
const edgeColor = '#0527af';
const packetColor = '#2f5af0';
const packetSpeed = 6;
const lengthOfLink = 250;
const numberOfNode = 60;

const locationRuleOfNode = function(x,y){
    return true;
    /*if((x < canvasEl.width/2-200 || x > canvasEl.width/2+200) ||
       (y < canvasEl.height/2-200 || y > canvasEl.height/2+200)){
         return true;
       }else{
         return false
       }*/
}

var NETWORKS = [];

/*
 * init and loop function
 */
function calculus(){
    LINKS.forEach(link => {
        link.transfer();
    });

    render();

    window.requestAnimationFrame(calculus);
}

function render() {
    var NODES = nodeManager.getAllNode();
    var LINKS = nodeManager.getAllLink();

    renderBackground();
    renderNodes();
    renderLinks();
    renderPackets();

    function renderBackground(){
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    }

    function renderNodes(){
        for(var i=0;i<NODES.length;i++){
            ctx.fillStyle  = '#ffffff';
            ctx.fillText(`${NODES[i].network}.${NODES[i].host}`,NODES[i].x,NODES[i].y,20)
            ctx.fillStyle  = NODES[i].color;
            ctx.beginPath();
            ctx.arc(NODES[i].x, NODES[i].y, NODES[i].radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function renderLinks(){
        for(var i=0;i<LINKS.length;i++){
            var lside = getNodeByID(LINKS[i].lside);
            var rside = getNodeByID(LINKS[i].rside);

            ctx.strokeStyle = LINKS[i].color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lside.x,lside.y);
            ctx.lineTo(rside.x,rside.y);
            ctx.stroke();
        }
    }

    function renderPackets(){
        ctx.fillStyle  = packetColor;

        for(var i=0;i<LINKS.length;i++){
            LINKS[i].getPackets().forEach(item => {
                ctx.beginPath();
                ctx.arc(item.x, item.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }
}

window.onresize = function init() {
    canvasEl.width = document.body.clientWidth;
    canvasEl.height = canvasEl.clientHeight;

    NODES = [];
    LINKS = [];
    PACKETS = [];

    generateNode();
    generateNetwork();
    generateGateway();
    connectNetwork();
    generateRoutingTable();


    function generateNode(){
        for (var i = 0; i < numberOfNode; i++) {
            var x = Math.random() * canvasEl.width;
            var y = Math.random() * canvasEl.height;

            if(locationRuleOfNode(x,y)){
                nodeManager.addNode(new Node(x,y,i));
            }else{
                i--;
            }
        }
    }

    function generateNetwork(){
        createLinkOfNodes();
        createNetwork();

        function createLinkOfNodes(){
            for(var i=0;i<NODES.length;i++){
                for(var j=i+1;j<NODES.length;j++){
                    var node1 = NODES[i];
                    var node2 = NODES[j];

                    var distance = Math.sqrt(Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2));

                    if(distance < lengthOfLink && node2.links.length === 0){
                        nodeManager.addLink(new Link(node1,node2,{
                            color: edgeColor
                        }));
                    }
                }
            }
        }

        function createNetwork(){
            for(var i=0;i<NODES.length;i++){
                let tem = [];
                for(var j=0;j<NODES.length;j++){
                    if(NODES[j].network == i) tem.push(NODES[j]);
                }

                if(tem.length !== 0) NETWORKS.push({
                    nodes : tem,
                    network : i
                });
            }
        }
    }

    function generateGateway(){
        for(var i=0;i<NETWORKS.length;i++){
            NETWORKS[i].gateway = NETWORKS[i].nodes[0];
            NETWORKS[i].gateway.color = '#ffffff';
            NETWORKS[i].gateway.isGateway = true;
        }
    }

    function connectNetwork(){
        for(var i=0;i<NETWORKS.length-1;i++)
            nodeManager.addLink(new Link(NETWORKS[i].gateway,NETWORKS[i+1].gateway,{
                isCrossNetwork: true,
                color: '#f90403'
            }));
    }

    function generateRoutingTable(){
        //为何要循环三次？？？这里似乎有个bug(只循环一次路由表项目缺失)，我还没有修复

        var NODES = nodeManager.getAllNode();
        NODES.forEach(function(node){
            node.sendAdvertisement();
        });
        NODES.forEach(function(node){
            node.sendAdvertisement();
        });
        NODES.forEach(function(node){
            node.sendAdvertisement();
        });
        NODES.forEach(function(node){
            node.sendAdvertisement();
        });
        NODES.forEach(function(node){
            node.sendAdvertisement();
        });
    }

    render();
};

window.onresize();
window.requestAnimationFrame(calculus);

/*  setInterval(function(){
    var origin = parseInt(Math.random()*numberOfNode);
    var destination = parseInt(Math.random()*numberOfNode);
    if(origin != destination){
      NODES[origin].send(destination);
    }
  },250);*/
nodeManager.getNodeByID(0).send(1);
console.log(NODES);
console.log(LINKS);
console.log(NETWORKS);

