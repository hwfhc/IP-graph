const Packet = require('./packet');
const EventEmitter = require('wolfy87-eventemitter');
const physics = require('./physics');

const getNodeByID = physics.getNodeByID;


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

module.exports = Link;
