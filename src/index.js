(function(){
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');

  const backgroundColor = '#000';
  const nodeColor = '#0a32c8';
  const edgeColor = '#0527af';
  const packetColor = '#2f5af0';
  const packetSpeed = 6;
  const radiusOfNode = 3;

  const numberOfNode = 6;

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

        this.network = address;
        this.host = address;
        this.ID = address;


        this.isGateway;
        initRoutingTable(this,this.links);

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


        function initRoutingTable(node,links){
          for(var i=0;i<links.length;i++)
            node.routingTable.push({
              address: links[0].address,
              linkID: i,
              hops: 1,
            });
        }
      }

      /*connect(node,isIntraAS,link){
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
      }*/

      send(address){
        this.links[2].emitEvent('receive_packet_from_node',[this,address]);

        function Routing(){

        }
      }

      /*  var linkID = getLinkID.call(this);

        if(linkID != undefined){
          var data = {origin:this,
            destination:this.links[linkID],
            address};
          this.links[linkID].emitEvent('receive_packet',[data,this]);

        }else{
          console.error('You cannot send packet to yourself!');
        }


        function getLinkID(){
          var link = this.routingTable.filter((item)=>{
            if(item.address === address) return true;
          })[0];

          if(link) return link.linkID;
          return undefined;
        }*/

      sendAdvertisement(source,from){
        this.links.forEach((node) => {
          if(node.getAnotherSide(this) != from)
            node.getAnotherSide(this).emitEvent('receive_advertisement',[this.routingTable,this,source]);
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

        this.lside = origin.ID;
        this.rside = destination.ID;

        origin.links.push(this);
        destination.links.push(this);
        LINKS.push(this);

        this.addListener('receive_packet_from_node',(from,address) => {
          var packet;
          var origin = getNodeByID(this.lside);
          var destination = getNodeByID(this.rside);

          if(from == origin) packet = new Packet(origin,destination,address);
          packet = new Packet(destination,origin,address);

          this.packets.push(packet);

        /*  var index = PACKETS.indexOf(packet);
          PACKETS.splice(index, 1);
          if(this.address !== packet.address) this.send(packet.address);*/
        });
      }

      transfer(){
        this.packets.forEach(item => {
          item.move();
        });
      }

      getAnotherSide(from){
        if(from === this.origin) return this.destination;
        return this.origin;
      }
  }

  function calculus(){
    LINKS.forEach(link => {
      link.transfer();
    });

    render();

    window.requestAnimationFrame(calculus);
  }

  function render() {

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
        ctx.fillText(`${NODES[i].network}.${NODES[i].network}`,NODES[i].x,NODES[i].y,20)
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

        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lside.x,lside.y);
        ctx.lineTo(rside.x,rside.y);
        ctx.stroke();
      }
    }

    function renderPackets(){
      for(var i=0;i<PACKETS.length;i++){
        ctx.fillStyle  = packetColor;
        ctx.beginPath();
        ctx.arc(PACKETS[i].x, PACKETS[i].y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  function getNodeByID(ID){
    return NODES[ID];
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
      createLinkOfNodes();
      createAS();

      function createLinkOfNodes(){
        for(var i=0;i<NODES.length;i++){
          for(var j=i+1;j<NODES.length;j++){
            var node1 = NODES[i];
            var node2 = NODES[j];

            var distance = Math.sqrt(Math.pow((node1.x - node2.x), 2) + Math.pow((node1.y - node2.y), 2));

            if(distance < 500 && node2.links.length === 0){
              new Link(node1,node2,true);
            }
          }
        }
      }

      function createAS(){
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

/*  setInterval(function(){
    var origin = parseInt(Math.random()*numberOfNode);
    var destination = parseInt(Math.random()*numberOfNode);
    if(origin != destination){
      NODES[origin].send(destination);
    }
  },250);*/
  NODES[0].send(1);
  console.log(NODES);
  console.log(LINKS);

})();
