const EventEmitter = require('wolfy87-eventemitter');

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

module.exports = Packet;
