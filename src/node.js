const EventEmitter = require('wolfy87-eventemitter');
const physics = require('./physics');

const getNodeByID = physics.getNodeByID;

const nodeColor = '#0a32c8';
const radiusOfNode = 3;

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
        this.ID = address;


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
    getTextOfIP(){ return `${this.network}.${this.host}`
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

module.exports = Node;
