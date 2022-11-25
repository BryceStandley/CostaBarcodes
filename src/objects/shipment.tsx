
enum ShipmentType {
    None, Manual, R, F
}

class Shipment {
    shipmentNumber: string = "";
    vendor: string = "";
    shipmentType: ShipmentType = ShipmentType.None;

    constructor(shipmentNumber: string, vendor: string, type: ShipmentType) {
        this.shipmentNumber = shipmentNumber;
        this.vendor = vendor;
        this.shipmentType = type;
    }
}

class ShipmentManager {
    shipments: Shipment[] = [];
    unsortedShipments: Shipment[] = [];

    Populate(shipmentInputString: string)
    {
        let lines = shipmentInputString.split("\n");

        for(let i = 0; i < lines.length; i++)
        {
            const line = lines[i];
            let shipNum = "";
            let vendor = "";
            let vendorless = false;

            //console.log("Line: " + line);

            const trimmedLine = line.trim();

            //find shipment number
            const shipStart = trimmedLine.search(/\w/);
            //console.log("Shipment Start: " + shipStart);
            let shipEnd = 0;
            if (shipStart !== -1) {
                shipEnd = trimmedLine.slice(shipStart).search(/\s/);
                //console.log("Shipment End: " + shipEnd);
                if (shipEnd !== -1) {
                    shipNum = trimmedLine.slice(shipStart, shipEnd);
                }
                else
                {
                    shipNum = trimmedLine;
                    vendorless = true;
                }
            } else {
                continue;
            }
            //console.log("Shipment: " + shipNum);

            if(!vendorless) {
                const remaning = trimmedLine.slice(shipEnd).trim();

                //Find Vendor
                const venStart = remaning.search(/\w/);
                //console.log("Vendor Start: " + venStart);
                ;
                if (venStart !== -1) {

                    vendor = remaning.slice(venStart);

                }
                //console.log("Vendor: " + vendor);
            }

            //Further Process and sort
            if (shipNum.indexOf("/") !== -1) // If a / is found in the shipment number, its a manual shipment
            {
                this.unsortedShipments.push(new Shipment(shipNum, vendor, ShipmentType.Manual));
            } else if (shipNum.indexOf("F") !== -1) // If a F is found is a F shipment
            {
                this.unsortedShipments.push(new Shipment(shipNum, vendor, ShipmentType.F));
            } else // If not a manual or F shipment, Assume its a R shipment
            {
                this.unsortedShipments.push(new Shipment(shipNum, vendor, ShipmentType.R));
            }
        }

        this.Sort();
    }

    Sort()
    {
        //Sort the list of shipments by manual first then F then R
        let f: Shipment[] = [];
        let m: Shipment[] = [];
        let r: Shipment[] = [];

        this.unsortedShipments.forEach(value => {
            switch (value.shipmentType)
            {
                case ShipmentType.Manual:
                    m.push(value);
                    break;
                case ShipmentType.F:
                    f.push(value);
                    break;
                case ShipmentType.R:
                    r.push(value);
                    break;
                case ShipmentType.None:
                    r.push(value);
                    break;
                default:
                    r.push(value);
                    break;
            }
        })

        this.shipments = [...r, ...m, ...f];

    }

    GetJSON()
    {
        return JSON.stringify(this.shipments);
    }


    Get()
    {
        return this.shipments;
    }

    Clear() {
        this.shipments = [];
        this.unsortedShipments = [];
    }

}

export {ShipmentManager, Shipment};