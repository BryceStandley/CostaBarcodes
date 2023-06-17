
class bookingRecord
{
    id: number|null = null;
	date: string = "";
	time: string = "";
	deliveryName: string ="";
	purchaseOrder: string ="";
	pallets: number = 0;
	hasArrived: boolean = false;

    constructor(props) {
        this.id = props.id;
		this.date = props.date;
		this.time = props.time;
		this.deliveryName = props.deliveryName;
		this.purchaseOrder = props.purchaseOrder;
		this.pallets = props.pallets;
		this.hasArrived = props.hasArrived;
    }
}

export default bookingRecord;