const ftgTemplate = `<?xml version="1.0" encoding="utf-8"?>
<ns0:Receipts xmlns:ns0="http://www.manh.com/ILSNET/Interface">
	<ns0:Receipt>
		<ns0:Action>NEW</ns0:Action>
		<ns0:UserDef6>Y</ns0:UserDef6>
		<ns0:UserDef7>0{dateRev}</ns0:UserDef7>
		<ns0:UserDef8>0{dateRev}</ns0:UserDef8>
		<ns0:UserStamp>ILSSRV</ns0:UserStamp>
		<ns0:Company>PER-CO-FTG</ns0:Company>
		<ns0:ReceiptDate>{dateRevDash}T00:00:00</ns0:ReceiptDate>
		<ns0:ReceiptId>{date}</ns0:ReceiptId>
		<ns0:ReceiptIdType>PO</ns0:ReceiptIdType>
		<ns0:Vendor>
			<ns0:Company>PER-CO-FTG</ns0:Company>
			<ns0:Source>853540</ns0:Source>
			<ns0:SourceAddress>
				<ns0:Name>FRESH TO GO FOODS-853540</ns0:Name>
			</ns0:SourceAddress>
			<ns0:ShipFrom>853540</ns0:ShipFrom>
			<ns0:ShipFromAddress>
				<ns0:Name>FRESH TO GO FOODS-853540</ns0:Name>
			</ns0:ShipFromAddress>
		</ns0:Vendor>
		<ns0:Warehouse>PER</ns0:Warehouse>
		<ns0:Details>
			<ns0:ReceiptDetail>
				<ns0:Action>NEW</ns0:Action>
				<ns0:ErpOrderLineNum>1</ns0:ErpOrderLineNum>
				<ns0:SKU>
					<ns0:Company>PER-CO-FTG</ns0:Company>
					<ns0:HarmCode/>
					<ns0:Item>1111</ns0:Item>
					<ns0:Quantity>{qty}</ns0:Quantity>
					<ns0:QuantityUm>UN</ns0:QuantityUm>
				</ns0:SKU>
			</ns0:ReceiptDetail>
		</ns0:Details>
	</ns0:Receipt>
</ns0:Receipts>
`;

export default ftgTemplate;