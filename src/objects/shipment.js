
class Shipment {
    shipmentNumber = "";
    vendor = "";

    constructor(shipmentNumber, vendor) {
        this.shipmentNumber = shipmentNumber;
        this.vendor = vendor;
    }
}

class ShipmentManager {
    shipments = [];

    Populate(shipmentInputString)
    {
        let temp = shipmentInputString.split("\n");

        for(let i = 0; i < temp.length; i++)
        {
            const line = temp[i];
            const split = line.split(/\s/);
            let vendor = "";
            let shipmentNo = split[0];
            for(let k = 1; k < split.length; k++)
            {
                if(split[k] !== "")
                {
                    vendor += split[k] + " ";
                }
            }

            if(vendor === "")
            {
                //If theres no vendor, the shipment is either a extra sub shipment of another manual or is a R shipment
                let tempNo = shipmentNo.split('/');
                if(tempNo.length > 1)
                {

                    this.shipments.push(new Shipment(shipmentNo, ""));


                }


            }
            else {
                this.shipments.push(new Shipment(shipmentNo, vendor));
            }
        }
    }

    Get()
    {
        return this.shipments;
    }

    Clear() {
        this.shipments = [];
    }

}

export {ShipmentManager, Shipment};