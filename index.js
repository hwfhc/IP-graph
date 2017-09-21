(function test(){
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');

  var backgroundColor = '#333';
  var nodeColor = '#fff';
  var edgeColor = '#fff';
  var lanBorderColor = '#fff';
  var packetColor = '#16e5e3';
  var paddingOfLan = 15;
  var radiusOfNode = 3;

  var demo;

  var NODES = [];
  var PACKETS = [];

  class Node{
      constructor(){
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;

        this.radius = radiusOfNode;
        this.neighbors = [];
      }
  }

  class Packet{
      constructor(origin,destination){
        var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));

        this.origin = origin;
        this.destination = destination;
        this.sin = (destination.y - origin.y) / distance;
        this.cos = (destination.x - origin.x) / distance;

        this.x = origin.x;
        this.y = origin.y;

        PACKETS.push(this);
      }

      throw(){
        var index = PACKETS.indexOf(this);
        PACKETS.splice(index, 1);
      }
  }

  function step(){
    PACKETS.forEach(function(packet){
      var origin = packet.origin;
      var destination = packet.destination;
      var distance = Math.sqrt(Math.pow((packet.x - destination.x), 2) + Math.pow((packet.y - destination.y), 2));

      if(distance > radiusOfNode / 3){
        packet.x += 1 * packet.cos;
        packet.y += 1 * packet.sin;
      }else{
        packet.throw();
      }
    });

    render();

    window.requestAnimationFrame(step);
  }

  function refreshRoutingTable(){
    NODES.forEach(function(node){
      node.neighbors.forEach(function(neighbor){
        if(!isInArray(neighbor.neighbors,node)) neighbor.neighbors.push(node);
      })
    });

    function isInArray(arr,value){
        for(var i = 0; i < arr.length; i++){
            if(value === arr[i]){
                return true;
            }
        }
        return false;
    }
  }

  function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    NODES.forEach(function (node) {
      ctx.fillStyle  = nodeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();

      node.neighbors.forEach(function(objNode){
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x,node.y);
        ctx.lineTo(objNode.x,objNode.y);
        ctx.stroke();
      });
    });

    PACKETS.forEach(function(packet){
      ctx.fillStyle  = packetColor;
      ctx.beginPath();
      ctx.arc(packet.x, packet.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  window.onresize = function () {
    canvasEl.width = document.body.clientWidth;
    canvasEl.height = canvasEl.clientHeight;


    for (var i = 0; i < 50; i++) {
      var node = new Node();
      if(NODES[i-1]) node.neighbors.push(NODES[i-1]);
      NODES.push(node);
    }

    refreshRoutingTable();
    render();

    demo = new Packet(NODES[0],NODES[1]);
    demo = new Packet(NODES[39],NODES[40]);
  };

  window.onresize();
  window.requestAnimationFrame(step);

  console.log(demo);
  console.log(NODES);
}).call(this);
