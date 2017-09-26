(function(){
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');

  var backgroundColor = '#000';
  var nodeColor = '#0a32c8';
  var edgeColor = '#0527af';
  var packetColor = '#2f5af0';
  var packetSpeed = 6;
  var radiusOfNode = 3;

  var numberOfNode = 50;

  var NODES = [];
  var PACKETS = [];
  var LINKS = [];

  class Node{
      constructor(x,y,address){
        this.x = x;
        this.y = y;
        this.radius = radiusOfNode;
        this.color = nodeColor;

        this.routingTable = [];
        this.links = [];
        this.address = address;

        this.graph = address;

        NODES.push(this);
      }

      connect(node){
        var index;
        var notDuplicate = this.routingTable.every((item,i) => {
          if(item.address !== node.address){
            return true;
          }else{
            index = i;
            return false;
          }
        });

        if(notDuplicate){
          var newItem = {
            address: node.address,
            linkID: this.links.length,
            hops: 1,
          }
          this.routingTable.push(newItem);
        }else{
          this.routingTable[index].linkID = this.links.length;
          this.routingTable[index].hops = 1;
        }

        if(this.graph < node.graph){
          node.graph = this.graph;
        }else{
          this.graph = node.graph;
        }
        this.links.push(node);
      }

      receive(packet){
        var index = PACKETS.indexOf(packet);
        PACKETS.splice(index, 1);
        if(this.address !== packet.address) this.send(packet.address);
      }

      send(address){
        var linkID = getLinkID.call(this);

        if(linkID != undefined){
          new Packet(this,this.links[linkID],address);
        }else{
          console.error('You cannot send packet to yourself!');
        }


        function getLinkID(){
          var link = this.routingTable.filter((item)=>{
            if(item.address === address) return true;
          })[0];

          if(link) return link.linkID;
          return undefined;
        }
      }

      sendAdvertisement(source,from){
        this.links.forEach((node) => {
          if(node != from) node.getAdvertisement(this.routingTable,this,source);
        });
      }

      getAdvertisement(newTable,from,source){
        addNewItemToRoutingTable.call(this);
        updateItemInformationInRoutingTable.call(this);
        broadcost.call(this);

        function addNewItemToRoutingTable(){
          newTable.forEach((newItem,index) => {
            var isNotHaveItem = this.routingTable.every((item,index) => {
              if(item.address !== newItem.address) return true;
            });

            if(isNotHaveItem){
              var obj = {
                address: newItem.address,
                linkID: undefined,
                hops: 10000,
              }
              this.routingTable.push(obj);
            }
          });

        }

        function updateItemInformationInRoutingTable(){
          var links = this.links;

          this.routingTable.forEach((item,index) => {
            var newItem = getItemWithAddress(this.routingTable[index].address,newTable);

            if(newItem && item.hops > (newItem.hops + 1)){
              item.hops = newItem.hops + 1;
              item.linkID = getLinkIdOfFrom();
            }
          });


          function getItemWithAddress(address,table){
            for(var i=0;i<table.length;i++){
              if(table[i].address == address) return table[i];
            }
          }

          function getLinkIdOfFrom(){
            for(var i=0;i<links.length;i++){
              if(from === links[i]){
                return i;
              };
            }
          }

        }

        function broadcost(){
          var isSend;
          for(var i=0;i<this.routingTable.length;i++){
            if(this.routingTable[i].address === source){
              for(var j=0;j<this.links.length;j++){
                if(this.links[j] === from && this.routingTable[i].linkID === j) isSend = true;
              }
            }}


          if(isSend){
            this.sendAdvertisement(source,from);
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
          destination.receive(this);
        });

        PACKETS.push(this);
      }

      arrive(){
        this.emitEvent('arrive');
      }

      move(){
        var distance = Math.sqrt(Math.pow((this.x - this.destination.x), 2) + Math.pow((this.y - this.destination.y), 2));

        if(distance > radiusOfNode){
          this.x += packetSpeed * this.cos;
          this.y += packetSpeed * this.sin;
        }else{
          this.arrive();
        }
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
      packet.move();
    });

    render();

    window.requestAnimationFrame(calculus);
  }

  function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    NODES.forEach(function (node) {
      ctx.fillStyle  = node.color;
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
          if(distance < 250){
            new Link(node1,node2);
          }
        }
      });
    });

    NODES.forEach(function(node){
      node.sendAdvertisement(node.address);
    });
    render();
  };

  window.onresize();
  window.requestAnimationFrame(calculus);

  setInterval(function(){
    var origin = parseInt(Math.random()*numberOfNode);
    var destination = parseInt(Math.random()*numberOfNode);
    if(origin != destination){
      NODES[origin].send(destination);
    }
  },250);
  console.log(NODES);

})();
