(function(){
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');

  const backgroundColor = '#000';
  const nodeColor = '#0a32c8';
  const edgeColor = '#0527af';
  const packetColor = '#2f5af0';
  const packetSpeed = 6;
  const radiusOfNode = 3;

  const numberOfNode = 75;

  const locationRuleOfNode = function(x,y){
    return true;
    /*if((x < canvasEl.width/2-200 || x > canvasEl.width/2+200) ||
       (y < canvasEl.height/2-200 || y > canvasEl.height/2+200)){
         return true;
       }else{
         return false
       }*/
  }

  var NODES = [];
  var PACKETS = [];
  var LINKS = []
  var AS = [];


  class Node extends EventEmitter{
      constructor(x,y,address){
        super();
        this.x = x;
        this.y = y;
        this.radius = radiusOfNode;
        this.color = nodeColor;

        this.routingTable = [];
        this.links = [];

        this.address = address;
        this.graph = address;

        this.isGateway;

        NODES.push(this);

        this.addListener('receive_advertisement',(newTable,from,source) => {
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

          function isGateway(node){
            return node.isGateway;
          }

        });

        this.addListener('receive_packet',packet => {
          var index = PACKETS.indexOf(packet);
          PACKETS.splice(index, 1);
          if(this.address !== packet.address) this.send(packet.address);
        });

      }

      connect(node,isIntraAS,link){
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

        if(isIntraAS){
          if(this.graph < node.graph){
            node.graph = this.graph;
          }else{
            this.graph = node.graph;
          }
        }

        this.links.push(link);
      }

      send(address){
        var linkID = getLinkID.call(this);

        if(linkID != undefined){
          var data = {origin:this,
            destination:this.links[linkID],
            address};
          this.links[linkID].emitEvent('receive',[data,this.links[linkID]]);

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
          if(node.getOtherSide(this) != from) node.getOtherSide(this).emitEvent('receive_advertisement',[this.routingTable,this,source]);
        });
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
          destination.emitEvent('receive_packet',[this]);
        });

        PACKETS.push(this);
      }

      move(){
        var distance = Math.sqrt(Math.pow((this.x - this.destination.x), 2) + Math.pow((this.y - this.destination.y), 2));

        if(distance > radiusOfNode){
          this.x += packetSpeed * this.cos;
          this.y += packetSpeed * this.sin;
        }else{
          this.emitEvent('arrive');
        }
      }

  }

  class Link extends EventEmitter{
      constructor(origin,destination,isIntraAS){
        super();
        this.packets = [];

        this.origin = origin;
        this.destination = destination;

        LINKS.push(this);
        origin.connect(destination,isIntraAS,this);
        destination.connect(origin,isIntraAS,this);

        this.addListener('receive',(data,from) => {
          console.log(from);

          this.packets.push(new Packet(data.origin,data.destination,data.address));

        /*  var index = PACKETS.indexOf(packet);
          PACKETS.splice(index, 1);
          if(this.address !== packet.address) this.send(packet.address);*/
        });
      }

      getOtherSide(from){
        if(from === this.origin) return this.destination;
        return this.origin;
      }
  }

  function calculus(){
    LINKS.forEach(link => {
      link.packets.forEach(packet => packet.move());
    });

    render();

    window.requestAnimationFrame(calculus);
  }

  function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    for(var i=0;i<NODES.length;i++){
      ctx.fillStyle  = '#ffffff';
      ctx.fillText(`${NODES[i].graph}.${NODES[i].address}`,NODES[i].x,NODES[i].y,20)
      ctx.fillStyle  = NODES[i].color;
      ctx.beginPath();
      ctx.arc(NODES[i].x, NODES[i].y, NODES[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    for(var i=0;i<LINKS.length;i++){
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LINKS[i].origin.x,LINKS[i].origin.y);
      ctx.lineTo(LINKS[i].destination.x,LINKS[i].destination.y);
      ctx.stroke();
    }

    for(var i=0;i<PACKETS.length;i++){
      ctx.fillStyle  = packetColor;
      ctx.beginPath();
      ctx.arc(PACKETS[i].x, PACKETS[i].y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

  }

  window.onresize = function () {
    canvasEl.width = document.body.clientWidth;
    canvasEl.height = canvasEl.clientHeight;

    NODES = [];
    LINKS = [];
    PACKETS = [];

    generateNode();
    generateAS();
    generateGateway();
    connectAS();


    function generateNode(){
      for (var i = 0; i < numberOfNode; i++) {
        var x = Math.random() * canvasEl.width;
        var y = Math.random() * canvasEl.height;

        if(locationRuleOfNode(x,y)){
          new Node(x,y,i);
        }else{
          i--;
        }
      }
    }

    function generateAS(){
      NODES.forEach(function(node1){
        NODES.forEach(function(node2){
          var distance = Math.sqrt(Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2));
          if(distance < 150 && node2.links.length === 0){
            new Link(node1,node2,true);
          }
        });
      });

      for(var i=0;i<NODES.length;i++){
        let tem = [];
        for(var j=0;j<NODES.length;j++){
          if(NODES[j].graph == i) tem.push(NODES[j]);
        }

        if(tem.length !== 0) AS.push({
          nodes : tem,
          graphp : i
        });
      }
    }

    function generateGateway(){
      for(var i=0;i<AS.length;i++){
        AS[i].gateway = AS[i].nodes[0];
        AS[i].gateway.color = '#ffffff';
        AS[i].gateway.isGateway = true;
      }
    }

    function connectAS(){
      for(var i=0;i<AS.length-1;i++){
        new Link(AS[i].gateway,AS[i+1].gateway,false);
      }
    }

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
  console.log(AS);

})();
