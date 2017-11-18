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

const EventEmitter = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"EventEmitter.min.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

(function(){

  /*
   * constant configuration
   */
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');

  const backgroundColor = '#000';
  const nodeColor = '#0a32c8';
  const edgeColor = '#0527af';
  const packetColor = '#2f5af0';
  const packetSpeed = 6;
  const radiusOfNode = 3;
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

  var NODES = [];
  var LINKS = []
  var NETWORKS = [];

  class Node extends EventEmitter{
      constructor(x,y,address){
        super();

        /*
         * configuration
         */
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

        this.isGateway = false;

        /*
         * define event of object
         */
        this.addListener('receive_advertisement',(newTable,from,source) => {
          addNewItemToRoutingTable.call(this);
          updateItemInformationInRoutingTable.call(this);
          broadcost.call(this);


          function addNewItemToRoutingTable(){
            newTable.forEach((newItem,index) => {
              var isNotHaveItem = this.routingTable.every((item,index) => {
                if(item.IP !== newItem.IP && newItem.IP !== this.getIP()) return true;
              });

              if(isNotHaveItem){
                this.routingTable.push({
                  IP: newItem.IP,
                  address: newItem.address,
                  linkID: undefined,
                  hops: 1000,
                });
              }
            });

          }

          function updateItemInformationInRoutingTable(){
            var links = this.links;

            this.routingTable.forEach((item,index) => {
              var newItem = getItemWithAddress(this.routingTable[index].IP,newTable);

              if(newItem && item.hops > (newItem.hops + 1)){
                item.hops = newItem.hops + 1;
                item.linkID = getLinkIdOfFrom.call(this);
              }
            });


            function getItemWithAddress(IP,table){
              for(var i=0;i<table.length;i++){
                if(table[i].IP == IP) return table[i];
              }
            }

            function getLinkIdOfFrom(){
              for(var i=0;i<this.links.length;i++){
                if(from === getNodeByID(this.links[i].getAnotherSideID(this)).getIP()){
                  return i;
                };
              }
            }

          }

          function broadcost(){
            var isSend;

            for(var i=0;i<this.routingTable.length;i++){
              if(this.routingTable [i].IP === source){
                for(var j=0;j<this.links.length;j++){
                  if(this.links[j].getAnotherSideID(this) === from && this.routingTable[i].linkID === j){
                    isSend = true;
                  }
                }
              }
            }


            if(isSend){
              this.sendAdvertisement(source,this.getIP());
            }
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

      getTextOfIP(){
        return `${this.network}.${this.host}`
      }

      getNetwork(){
        return this.network;
      }

      getHost(){
        return this.host;
      }

      //function about IP
      sendAdvertisement(source,from){
        if(source === undefined) var source = this.getIP();

        this.links.forEach((link) => {
          var anotherNodeID = link.getAnotherSideID(this);

          if(anotherNodeID !== from){
            if(getNodeByID(anotherNodeID).isGateway && this.isGateway){
              var routingTableToSended = [];

              this.routingTable.forEach((item) => {
                if((item.IP >> 8) != this.getNetwork()) routingTableToSended.push(item);
              });
            }else{
              var routingTableToSended = this.routingTable;
            }

            getNodeByID(anotherNodeID).emitEvent('receive_advertisement',[routingTableToSended,this.getIP(),source]);
          }

        });
      }

      send(address){
        this.links[2].emitEvent('receive_packet_from_node',[this,address]);

        function Routing(){

        }
      }
  }

  class Packet extends EventEmitter{
      constructor(origin,destination,address){
        var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));
        super();

        /*
         * configuration
         */

        this.origin = origin;
        this.destination = destination;
        this.sin = (destination.y - origin.y) / distance;
        this.cos = (destination.x - origin.x) / distance;
        this.address = address;

        this.x = origin.x;
        this.y = origin.y;

        /*
         * define event of object
         */
        this.addListener('arrive',function arriveListener(){
          this.removeListener('arrive',arriveListener);
          destination.emitEvent('receive_packet',[this]);
        });
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
      constructor(origin,destination,config){
        var {isCrossNetwork,color} = config;

        super();

        /*
         * configuration
         */
        this.packets = [];
        this.lside = origin.ID;
        this.rside = destination.ID;
        this.color = color;

        if(!isCrossNetwork) updateNetworkNumber();

        LINKS.push(this);

        origin.emitEvent('create_new_link',[this]);
        destination.emitEvent('create_new_link',[this]);

        /*
         * define event of object
         */
        this.addListener('receive_packet_from_node',(from,address) => {
          var packet;
          var origin = getNodeByID(this.lside);
          var destination = getNodeByID(this.rside);

          if(from == origin) packet = new Packet(origin,destination,address);
          packet = new Packet(destination,origin,address);

          this.packets.push(packet);
        });

        function updateNetworkNumber(){
          if(origin.network < destination.network)
            destination.network = origin.network;
          else
            origin.network = destination.network;
        }

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

      getPackets(){
        return this.packets;
      }
  }

  /*
   * basic function
   */
  function getNodeByID(ID){
    return NODES[ID];
  }

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

            if(distance < lengthOfLink && node2.links.length === 0){
              new Link(node1,node2,{
                color: edgeColor
              });
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
        new Link(NETWORKS[i].gateway,NETWORKS[i+1].gateway,{
          isCrossNetwork: true,
          color: '#f90403'
        });
    }

    function generateRoutingTable(){
      //为何要循环三次？？？这里似乎有个bug(只循环一次路由表项目缺失)，我还没有修复
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
  NODES[0].send(1);
  console.log(NODES);
  console.log(LINKS);
  console.log(NETWORKS);

})();


/***/ })
/******/ ]);