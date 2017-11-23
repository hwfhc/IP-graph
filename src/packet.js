const EventEmitter = require('wolfy87-eventemitter');

class Packet extends EventEmitter{
    constructor(origin,destination,address){
        var distance = Math.sqrt(Math.pow((origin.x - destination.x), 2) + Math.pow((origin.y - destination.y), 2));
        super();

        this.origin = origin;
        this.destination = destination;
        this.sin = (destination.y - origin.y) / distance;
        this.cos = (destination.x - origin.x) / distance;

        this.x = origin.x;
        this.y = origin.y;

        /*
         * configuration
         */

        this.radius = 3;
        this.packetSpeed = 6;

        this.address = address;

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

        if(distance > this.radius){
            this.x += this.packetSpeed * this.cos;
            this.y += this.packetSpeed * this.sin;
        }else{
            if(a==0){
                a = 1;
                console.log(this.radius);

            }
            //this.emitEvent('arrive');
        }
    }

}
var a= 0;

module.exports = Packet;
