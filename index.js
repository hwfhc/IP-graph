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
  var LINKS = [];

  class Node{
      constructor(address){
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.radius = address*3;

        this.routingTable = [];
        this.links = [];
        this.address = address;

        NODES.push(this);
      }

      connect(node){
        this.routingTable.push({
          address: node.address,
          linkID: this.links.length,
          hops: 1
        });
        this.links.push(node);
      }

      resolve(packet){
        var index = PACKETS.indexOf(packet);
        PACKETS.splice(index, 1);
      }

      send(address){
        var item;

        for(var i=0;i<this.routingTable.length;i++){
          if(this.routingTable[i].address === address) item = this.routingTable[i];
        }
        new Packet(this,this.links[item.linkID],address);
      }

      sendAdvertisement(){
        this.links.forEach((node) => {
          node.getAdvertisement(this.routingTable,this);
        });
      }

      getAdvertisement(newTable,link){
        newTable.forEach((newItem,index) => {
          var check = this.routingTable.every((item,index) => {
            if(item.address !== newItem.address && this.address !== newItem.address) return true;
          });

          if(check){
            var obj = {
              address: newItem.address,
              linkID: 0,
              hops: 10000
            }
            this.routingTable.push(obj);
          }
        });

        for(var i=0;i<this.routingTable.length;i++){
          var obj = this.routingTable[i];
          var links = this.links;
          var item = getItem(this.routingTable[i].address,newTable);

          if(item){
            if(obj.hops > item.hops + 1){
              obj.hops = item.hops + 1;
              obj.linkID = getLinkID();
            }
          }
        }


        function getItem(index,arr){
          for(var i=0;i<arr.length;i++){
            if(arr[i].address == index) return arr[i];
          }
        }

        function getLinkID(){
          for(var i=0;i<links.length;i++){
            if(link === links[i]){
              return i;
            };
          }
        }

      }
  }

  class Packet extends EventEmitter{
      constructor(origin,destination,address){
        super();
        var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));

        this.origin = origin;
        this.destination = destination;
        this.sin = (destination.y - origin.y) / distance;
        this.cos = (destination.x - origin.x) / distance;
        this.address = address;

        this.x = origin.x;
        this.y = origin.y;

        this.addListener('arrive',function arriveListener(){
          this.removeListener('arrive',arriveListener);
          destination.resolve(this);
          if(destination.address != this.address) destination.send(this.address);
        });

        PACKETS.push(this);
      }

      arrive(){
        this.emitEvent('arrive');
      }
  }

  class Link{
      constructor(origin,destination,force){
        this.origin = origin;
        this.destination = destination;
        this.low = origin.address;
        this.high = destination.address;

        if(force || (this.high - this.low) > 1){
          LINKS.push(this);
          origin.connect(destination);
          destination.connect(origin);
        }
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

  function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    NODES.forEach(function (node) {
      ctx.fillStyle  = nodeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    LINKS.forEach(function(link){
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(link.origin.x,link.origin.y);
      ctx.lineTo(link.destination.x,link.destination.y);
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
    LINKS = [];
    PACKETS = [];

    for (var i = 0; i < 5; i++) {
      new Node(i);

      if(NODES[i-1]){
        new Link(NODES[i-1],NODES[i],true);
      }
    }

    NODES.forEach(function(node1){
      NODES.forEach(function(node2){
        if(Math.random() > 0.7) new Link(node1,node2);
      });
    });

    render();
  };

  window.onresize();
  window.requestAnimationFrame(calculus);

  NODES.forEach(function(item){
    item.sendAdvertisement();
  });

  NODES.forEach(function(item){
    item.sendAdvertisement();
  });

  NODES[0].send(4);
  console.log(NODES);
}).call(this);
