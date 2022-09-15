import React, {useRef, useState, ReactNode} from "react";
import Button from "react-bootstrap/Button";
import {ShipmentManager, Shipment} from "../objects/shipment";
import Table from "react-bootstrap/Table";
// @ts-ignore
import Barcode from "react-barcode";
// @ts-ignore
import PrintJob from "print-job";

function Worksheet()
{
    const shipmentManager = useRef<ShipmentManager>(new ShipmentManager());
    const [contentRender, setContentRender] = useState<ReactNode>();
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const inputDivRef = useRef<HTMLDivElement>(null!);
    const genBtnDivRef = useRef<HTMLDivElement>(null!);
    const contentDivRef = useRef<HTMLDivElement>(null!);

    function ResetInputs()
    {
        inputRef.current.value = "";
        inputDivRef.current.removeAttribute("hidden");
        genBtnDivRef.current.setAttribute("hidden", "");
        contentDivRef.current.setAttribute("hidden", "");

        //setContentRender({contentRender: null});

        shipmentManager.current.Clear();

    }

    function GenerateOnClick()
    {
        if(inputRef.current.value === "" ) return;

        shipmentManager.current.Populate(inputRef.current.value);
        const t = CreateSheetTable(shipmentManager.current.Get());
        inputDivRef.current.setAttribute("hidden", "");
        genBtnDivRef.current.removeAttribute("hidden");
        contentDivRef.current.removeAttribute("hidden");
        setContentRender(t);
    }

    function PrintPage()
    {
        PrintJob.print("#content");
    }

    function CreateSheetTable(shipments: Shipment[]): ReactNode
    {
        return(
            <Table bordered key={Math.random()} id="mainTable">
                <thead>
                <tr>
                    <th>Barcode</th>
                    <th>Shipment</th>
                    <th>Vendor</th>
                </tr>
                </thead>
                <tbody>
                {
                    shipments.map((value, key) => {
                        return(
                            <tr key={key}>
                                <td><Barcode value={value.shipmentNumber} height={50} renderer="img"/></td>
                                <td>{value.shipmentNumber}</td>
                                <td>{value.vendor}</td>
                            </tr>
                        )})
                }
                </tbody>
            </Table>
        );
    }

    return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px'
                }}>
                    <div id="inputField" ref={inputDivRef}>
                        <h1>Receival Worksheet</h1>
                        <p>Copy and paste shipment numbers and vendor names from WMS into the text box and hit generate
                            to create a SCI like worksheet</p>
                        <p>Strictly one Shipment per line</p>
                        <hr/>
                        <p>Line format: <em><strong>ShipmentNumber Vendor</strong></em> OR <em><strong>ShipmentNumber</strong></em> </p>
                        <p>The first text in the line found is always treated as the shipment number and all remaining text is the vendor. The shipment and vendor details <strong>MUST</strong> be seperated by a space</p>
                        <p>If no vendor text is found, the shipment is generated with a empty vendor</p>

                        <textarea
                            name="mainInput"
                            id="mainInput"
                            ref={inputRef}
                            style={{
                                marginTop: '10px',
                                width: '90%',
                                height: '400px',
                            }}
                        />
                        <br/>
                        <Button variant="success" style={{margin: '30px'}} onClick={GenerateOnClick}>Generate</Button>
                    </div>
                    <div id="resetDiv" hidden ref={genBtnDivRef}>
                        <Button variant="primary" onClick={PrintPage} style={{
                            margin: '30px'
                        }}>Print</Button>
                        <Button variant="danger" onClick={ResetInputs}>Reset</Button>
                    </div>
                    <div>
                        <div id="content" hidden ref={contentDivRef}>
                            <hr/>
                            <h1>Receival Worksheet</h1>
                            {contentRender}
                        </div>
                    </div>
                </div>
            </div>
        );

}

export default Worksheet;