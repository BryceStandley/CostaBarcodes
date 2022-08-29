
class Shipment {
    barcodeURL = "";
    shipmentNumber = "";
    vendor = "";

    constructor(url, shipmentNumber, vendor) {
        this.barcodeURL = url;
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

            if(vendor !== "")
            {
                let url = "https://bwipjs-api.metafloor.com/?bcid=code128&text=";
                let tempNo = shipmentNo.split('/');
                if(tempNo.length > 1) {
                    url += tempNo[0] + "%2f" + tempNo[1];
                }
                else {
                    url += shipmentNo;
                }
                url += "&scaleX=2&scaleY=2";

                this.shipments.push(new Shipment(url, shipmentNo, vendor));
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