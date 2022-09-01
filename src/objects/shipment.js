
class Shipment {
    shipmentNumber = "";
    vendor = "";
    manualShipment = false;
    rShipment = false;
    fShipment = false;

    constructor(shipmentNumber, vendor) {
        this.shipmentNumber = shipmentNumber;
        this.vendor = vendor;
    }
}

class ShipmentFilter {
    IncludeRShipment = false;
    ExclusiveRShipment = false;
    ExclusiveFShipment = false;
    ExclusiveMShipment = false;

    constructor(includeR, exclusiveR, exclusiveF, exclusiveM) {
        this.IncludeRShipment = includeR;
        this.ExclusiveRShipment = exclusiveR;
        this.ExclusiveFShipment = exclusiveF;
        this.ExclusiveMShipment = exclusiveM;
    }
}

class ShipmentManager {
    shipments = [];
    unsortedShipments = [];

    Populate(shipmentInputString, filter)
    {
        let temp = shipmentInputString.split("\n");

        for(let i = 0; i < temp.length; i++)
        {
            const line = temp[i];
            const split = line.split(/\s/);
            let vendor = "";
            let shipmentNo = split[0];
            if(shipmentNo === "")
                continue;

            for(let k = 1; k < split.length; k++)
            {
                if(split[k] !== "")
                {
                    vendor += split[k] + " ";
                }
            }

            if(vendor === "")
            {

                if(filter.ExclusiveRShipment && !shipmentNo.includes("F") && !shipmentNo.includes("/"))
                {
                    const s = new Shipment(shipmentNo, "");
                    s.rShipment = true;
                    this.unsortedShipments.push(s);
                }
                else if(filter.IncludeRShipment || !filter.ExclusiveRShipment)
                {
                    if(shipmentNo.includes("F") && !filter.ExclusiveMShipment)
                    {
                        const s = new Shipment(shipmentNo, "");
                        s.fShipment = true;
                        this.unsortedShipments.push(s);
                    }
                    else if(shipmentNo.includes("/") && !filter.ExclusiveFShipment)
                    {
                        const s = new Shipment(shipmentNo, "");
                        s.manualShipment = true;
                        this.unsortedShipments.push(s);
                    }
                    else if(filter.IncludeRShipment) {
                        const s = new Shipment(shipmentNo, "");
                        s.rShipment = true;
                        this.unsortedShipments.push(s);
                    }


                }

            }
            else {
                if(filter.ExclusiveRShipment && !shipmentNo.includes("F") && !shipmentNo.includes("/")) {
                    const s = new Shipment(shipmentNo, vendor);
                    s.rShipment = true;
                    this.unsortedShipments.push(s);
                }
                else if(filter.ExclusiveFShipment && shipmentNo.includes("F"))
                {
                    const s = new Shipment(shipmentNo, vendor);
                    s.fShipment = true;
                    this.unsortedShipments.push(s);
                }
                else if(filter.ExclusiveMShipment && shipmentNo.includes("/"))
                {
                    const s = new Shipment(shipmentNo, vendor);
                    s.manualShipment = true;
                    this.unsortedShipments.push(s);
                }
                else if(filter.IncludeRShipment || !filter.ExclusiveRShipment)
                {
                        if(shipmentNo.includes("F") && !filter.ExclusiveMShipment)
                        {
                            const s = new Shipment(shipmentNo, vendor);
                            s.fShipment = true;
                            this.unsortedShipments.push(s);
                        }
                        else if(shipmentNo.includes("/") && !filter.ExclusiveFShipment)
                        {
                            const s = new Shipment(shipmentNo, vendor);
                            s.manualShipment = true;
                            this.unsortedShipments.push(s);
                        }
                        else if(filter.IncludeRShipment)
                        {
                            const s = new Shipment(shipmentNo, vendor);
                            s.rShipment = true;
                            this.unsortedShipments.push(s);
                        }
                }
            }
        }
        this.Sort();
    }

    Sort()
    {
        //Sort the list of shipments by manual first then F then R
        let f = [];
        let m = [];
        let r = [];

        for(let i = 0; i < this.unsortedShipments.length; i++)
        {
            if(this.unsortedShipments[i].fShipment)
            {
                f.push(this.unsortedShipments[i])
            }
            if(this.unsortedShipments[i].manualShipment)
            {
                m.push(this.unsortedShipments[i]);
            }
            if(this.unsortedShipments[i].rShipment)
            {
                r.push(this.unsortedShipments[i]);
            }
        }

        this.shipments = [...m, ...f, ...r];

    }


    Get()
    {
        return this.shipments;
    }

    Clear() {
        this.shipments = [];
    }

}

export {ShipmentManager, Shipment, ShipmentFilter};