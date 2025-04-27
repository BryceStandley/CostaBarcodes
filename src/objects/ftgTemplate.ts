const ftgTemplate = `
    <?xml version="1.0" encoding="UTF-8"?>
    <ftgTemplate xmlns="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsi="http://www.w3.org/2001/XMLSchema" xsi:noNamespaceSchemaLocation="http://www.w3.org/2001/XMLSchema-instance">
    <order>
        <Receipt>
            <ReceiptId>{date}</ReceiptId>
            <ReceiptType>PO</ReceiptType>
            <ReceiptDate>{date}</ReceiptDate>
            <Item>
                <ItemId>1111</ItemId>
                <Quantity>{qty}</Quantity>
                <QuantityUOM>UN</QuantityUOM>
            </Item>
        </Receipt>
    </order>
`;

export default ftgTemplate;