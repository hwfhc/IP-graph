(function test(){
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');

  var backgroundColor = '#333';
  var nodeColor = '#fff';
  var edgeColor = '#fff';
  var packetColor = '#16e5e3';
  var radiusOfNode = 3;

  var NODES = [];
  var PACKETS = [];
  var LINES = [];

  class Node{
      constructor(address){
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.radius = radiusOfNode;

        this.routingTable = [];
        this.address = address;

        if(NODES[address-1]){
          this.routingTable.push(NODES[address-1]);
          new Line(NODES[address-1],this);
        }
        NODES.push(this);
      }

      resolve(packet){
        var index = PACKETS.indexOf(packet);
        PACKETS.splice(index, 1);
      }

      send(destination){
        new Packet(this,destination);
      }
  }

  class Packet extends EventEmitter{
      constructor(origin,destination){
        super();
        var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));

        this.origin = origin;
        this.destination = destination;
        this.sin = (destination.y - origin.y) / distance;
        this.cos = (destination.x - origin.x) / distance;

        this.x = origin.x;
        this.y = origin.y;

        this.addListener('arrive',function arriveListener(){
          this.removeListener('arrive',arriveListener);
          destination.resolve(this);
          destination.send(destination.routingTable[1]);
        });

        PACKETS.push(this);
      }

      arrive(){
        this.emitEvent('arrive');
      }
  }

  class Line{
      constructor(origin,destination){
        this.origin = origin;
        this.destination = destination;

        var check = LINES.every(function(line){
          if(line.origin != origin && line.destination != destination) return true;
        });

        if(check) LINES.push(this);
      }
  }

  function calculus(){
    PACKETS.forEach(function(packet){
      var origin = packet.origin;
      var destination = packet.destination;
      var distance = Math.sqrt(Math.pow((packet.x - destination.x), 2) + Math.pow((packet.y - destination.y), 2));

      if(distance > radiusOfNode / 3){
        packet.x += 1 * packet.cos;
        packet.y += 1 * packet.sin;
      }else{
        packet.arrive();
      }
    });

    render();

    window.requestAnimationFrame(calculus);
  }

  function refreshRoutingTable(){
    NODES.forEach(function(node){
      node.routingTable.forEach(function(neighbor){
        if(!isInArray(neighbor.routingTable,node)) neighbor.routingTable.push(node);
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
    });

    LINES.forEach(function(line){
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(line.origin.x,line.origin.y);
      ctx.lineTo(line.destination.x,line.destination.y);
      ctx.stroke();
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

    NODES = [];
    LINES = [];
    PACKETS = [];

    for (var i = 0; i < 50; i++) {
      new Node(i);
    }

    refreshRoutingTable();
    render();
  };

  window.onresize();
  window.requestAnimationFrame(calculus);

  NODES[5].send(NODES[6]);
  NODES[3].send(NODES[4]);
  NODES[15].send(NODES[16]);
}).call(this);
