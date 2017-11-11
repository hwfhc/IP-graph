/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

(function(){
  const EventEmitter = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"EventEmitter.min.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

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
  var NETWORKS = [];

  class Node extends EventEmitter{
      constructor(x,y,address){
        super();

        //configuration about canvas
        this.x = x;
        this.y = y;
        this.radius = radiusOfNode;
        this.color = nodeColor;
        this.ID = NODES.length;
        NODES.push(this);


        //configuration about IP
        this.routingTable = [];
        this.links = [];

        this.network = address;
        this.host = address;

        this.isGateway;



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

        this.addListener('create_new_link',link => {
          this.links.push(link);

          var node = getNodeByID(link.getAnotherSideID(this));
          var IP = node.getIP();
          var textOfIP = `${node.network}.${node.host}`;

          this.routingTable.push({
            IP: IP,
            address: textOfIP,
            linkID: this.links.length - 1,
            hops: 1,
          });

        });
      }

      getIP(){
        return (this.network << 8) + this.host;
      }

      //function about IP
      sendAdvertisement(source,from){
        this.links.forEach((link) => {
          if(link.getAnotherSideID(this) != from)
            link.getAnotherSideID(this).emitEvent('receive_advertisement',[this.routingTable,this,source]);
        });
      }

      send(address){
        this.links[2].emitEvent('receive_packet_from_node',[this,address]);

        function Routing(){

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

        LINKS.push(this);

        origin.emitEvent('create_new_link',[this]);
        destination.emitEvent('create_new_link',[this]);

        this.addListener('receive_packet_from_node',(from,address) => {
          var packet;
          var origin = getNodeByID(this.lside);
          var destination = getNodeByID(this.rside);

          if(from == origin) packet = new Packet(origin,destination,address);
          packet = new Packet(destination,origin,address);

          this.packets.push(packet);
        });
      }

      transfer(){
        this.packets.forEach(item => {
          item.move();
        });
      }

      getAnotherSideID(from){
        if(from.ID === this.lside) return this.rside;
        return this.lside;
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
    generateNetwork();
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

    function generateNetwork(){
      createLinkOfNodes();
      createNetwork();

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

      //或许我需要写一个DFS算法来获取局域网内所有节点
      function createNetwork(){
        for(var i=0;i<NODES.length;i++){
          let tem = [];
          for(var j=0;j<NODES.length;j++){
            if(NODES[j].network == i) tem.push(NODES[j]);
          }

          if(tem.length !== 0) NETWORKS.push({
            nodes : tem,
            graphp : i
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

    function connectAS(){
      for(var i=0;i<AS.length-1;i++){
        new Link(AS[i].gateway,AS[i+1].gateway,false);
      }
    }

    /*NODES.forEach(function(node){
      node.sendAdvertisement(node.address);
    });*/
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
  console.log(NETWORKS);

})();


/***/ })
/******/ ]);