
class Pallet
{
    caseNumber = 0;
    skuNumber = 0;
    quantity = 0;

    constructor(caseNo, sku, qty) {
        this.caseNumber = caseNo;
        this.skuNumber = sku;
        this.quantity = qty;
    }
}

export default Pallet;