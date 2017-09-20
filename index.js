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

  var lans = [];

  function constructLan() {
    for (var i = 0,maxTry = 0; i < 1 && maxTry < 200; i++,maxTry++) {
      var lan = {
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        radius: 50
      };
      lan.nodes=[];

      if(isValid(lan)){
        lans.push(lan);
        constructNode(lan);
        constructCable(lan);
      }else{
        i--;
      }
    }

    refreshRoutingTable();
    demo = new constructPacket(lans[0].nodes[0],lans[0].nodes[1]);

    function isValid(lan){
      return lans.every(function(item, index, array){
        if(Math.sqrt(Math.pow((item.x - lan.x), 2) + Math.pow((item.y - lan.y), 2)) > lan.radius + item.radius /*&&
           lan.x - lan.radius > 0 &&
           lan.x + lan.radius < canvasEl.width &&
           lan.y - lan.radius > 0 &&
           lan.y + lan.radius < canvasEl.height*/) return true;
      });
    }

  }

  function constructNode(lan) {
    for (var i = 0; i < 5; i++) {
      var node = {
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        lan,
        radius: radiusOfNode
      };
      node.cables = [];

      if(isValid(lan,node)){
        if(lan.nodes[lan.nodes.length - 1]) node.cables.push(lan.nodes[lan.nodes.length - 1]);
        lan.nodes.push(node);
      }else{
        i--;
      }
    }

    function isValid(lan,node){
      if(Math.sqrt(Math.pow((lan.x - node.x), 2) + Math.pow((lan.y - node.y), 2)) < lan.radius - paddingOfLan) return true;
    }

  }

  function constructCable(edge) {
    lans.forEach(function (lan){
      lan.nodes.forEach(function (node1){
        lan.nodes.forEach(function (node2){
          if(Math.random() > 0.2){
            return;
          }
          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node1.x,node1.y);
          ctx.lineTo(node2.x,node2.y);
          ctx.stroke();
        });
      });
    });
  }

  function constructPacket(origin,destination){
    var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));

    this.origin = origin;
    this.destination = destination;
    this.sin = (destination.y - origin.y) / distance;
    this.cos = (destination.x - origin.x) / distance;

    this.x = origin.x;
    this.y = origin.y;
  }

  function step(){
    var distance = Math.sqrt(Math.pow((demo.x - demo.destination.x), 2) + Math.pow((demo.y - demo.destination.y), 2));

    if(distance > radiusOfNode / 3){
      demo.x += 0.3 * demo.cos;
      demo.y += 0.3 * demo.sin;
    }else{
      demo = undefined;
    }

    render();

    window.requestAnimationFrame(step);
  }

  function refreshRoutingTable(){
    lans.forEach(function(lan){
      lan.nodes.forEach(function(node){
        node.cables.forEach(function(cable){
          if(!isInArray(cable.cables,node)) cable.cables.push(node);
        })
      });
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

    lans.forEach(function (lan) {
      ctx.strokeStyle  = lanBorderColor;
      ctx.beginPath();
      ctx.arc(lan.x, lan.y, lan.radius, 0, 2 * Math.PI);
      ctx.stroke();

      lan.nodes.forEach(function (node) {
        ctx.fillStyle  = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fill();

        node.cables.forEach(function(objNode){
          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x,node.y);
          ctx.lineTo(objNode.x,objNode.y);
          ctx.stroke();
        });
      });
    });

    if(demo){
      ctx.fillStyle  = packetColor;
      ctx.beginPath();
      ctx.arc(demo.x, demo.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  window.onresize = function () {
    canvasEl.width = document.body.clientWidth;
    canvasEl.height = canvasEl.clientHeight;

    lans = [];

    constructLan();
    render();
  };

  window.onresize();
  window.requestAnimationFrame(step);

  console.log(demo);
  console.log(lans);
}).call(this);
