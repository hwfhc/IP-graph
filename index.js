(function(){
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');

  var backgroundColor = '#000';
  var nodeColor = '#0a32c8';
  var edgeColor = '#0527af';
  var packetColor = '#2f5af0';
  var packetSpeed = 6;
  var radiusOfNode = 3;

  var numberOfNode = 80;

  var NODES = [];
  var PACKETS = [];
  var LINKS = [];

  class Node{
      constructor(x,y,address){
        this.x = x;
        this.y = y;
        this.radius = radiusOfNode;

        this.routingTable = [];
        this.links = [];
        this.address = address;

        this.graph = address;

        NODES.push(this);
      }

      connect(node){
        this.routingTable.push({
          address: node.address,
          linkID: this.links.length,
          hops: 1
        });
        if(this.graph < node.graph){
          node.graph = this.graph;
        }else{
          this.graph = node.graph;
        }
        this.links.push(node);
      }

      resolve(packet){
        var index = PACKETS.indexOf(packet);
        PACKETS.splice(index, 1);
      }

      send(address){
        var linkID = getLinkID.call(this);

        if(linkID != undefined){
          new Packet(this,this.links[linkID],address);
        }else{
          console.error('You cannot send packet to yourself!');
        }


        function getLinkID(){
          var item = this.routingTable.filter((item)=>{
            if(item.address === address) return true;
          })[0];

          if(item) return item.linkID;
          return undefined;
        }
      }

      sendAdvertisement(from){
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
          if(destination.address !== this.address) destination.send(this.address);
        });

        PACKETS.push(this);
      }

      arrive(){
        this.emitEvent('arrive');
      }
  }

  class Link{
      constructor(origin,destination){
        this.origin = origin;
        this.destination = destination;
        this.low = origin.address;
        this.high = destination.address;

        if((this.high - this.low) > 1){
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

      if(distance > radiusOfNode){
        packet.x += packetSpeed * packet.cos;
        packet.y += packetSpeed * packet.sin;
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

    for (var i = 0; i < numberOfNode; i++) {
      var x = Math.random() * canvasEl.width;
      var y = Math.random() * canvasEl.height;

      if((x < canvasEl.width/2-200 || x > canvasEl.width/2+200) ||
         (y < canvasEl.height/2-200 || y > canvasEl.height/2+200)){
           new Node(x,y,i);
         }else{
           i--;
         }
    }

    NODES.forEach(function(node1){
      console.log(node1.address);
      NODES.forEach(function(node2){
        var distance = Math.sqrt(Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2));
        if(distance < 150){
          new Link(node1,node2);
        }
      });
    });

    NODES.forEach(function(node1){
      NODES.forEach(function(node2){
        if(node1.graph != node2.graph){
          var distance = Math.sqrt(Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2));
          if(distance < 200){
            new Link(node1,node2);
          }
        }
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

  NODES.forEach(function(item){
    item.sendAdvertisement();
  });

  console.log(NODES);
  setInterval(function(){
    var origin = parseInt(Math.random()*numberOfNode);
    var destination = parseInt(Math.random()*numberOfNode);
    if(origin != destination){
      NODES[origin].send(destination);
    }
  },250);
}).call(this);
