import React, {useState} from "react";
import {ShipmentManager} from "../objects/shipment";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Barcode from "react-barcode";
import printJS from "print-js";
import print from "print.js/src/js/print";


function Worksheet() {

    const [contentRender, setContentRender] = useState([]);
    const [tableKey, setTableKey] = useState(0);

    let shipmentManager = new ShipmentManager();

    function GenerateSheet()
    {
        let input = document.getElementById("mainInput").value;
        shipmentManager.Populate(input);
        let i = document.getElementById("inputField");
        let r = document.getElementById("resetDiv");
        setTableKey(Math.random());
        const t = CreateSheetTable(shipmentManager.Get());
        i.setAttribute("hidden","");
        r.removeAttribute("hidden");

        setContentRender([...contentRender, t]);
    }

    function ResetInputs()
    {
        let t = document.getElementById("mainInput");
        t.value = "";
        let i = document.getElementById("inputField");
        i.removeAttribute("hidden");
        let r = document.getElementById("resetDiv");
        r.setAttribute("hidden","");

        setContentRender([]);

        shipmentManager.Clear();

    }

    function PrintPage()
    {
        //let t = document.getElementById("contentRender");
        //PrintJob.print("#contentRender");

        printJS({
            printable: "contentRender",
            type: 'html',
            targetStyles: ['*']
        });
    }

    function CreateSheetTable(shipments)
    {
        return(
            <Table bordered key={tableKey} id="mainTable">
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
                        return (
                            <tr key={key}>
                                <td><Barcode value={value.shipmentNumber}/></td>
                                <td>{value.shipmentNumber}</td>
                                <td>{value.vendor}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </Table>
        );
    }

    return (
        <div>
            <div style={{
                textAlign: 'center',
                margin: '30px'
            }}>
                <div id="inputField">
                    <h1>Receival Worksheet</h1>
                    <p>Copy and paste shipment numbers and vendor names from WMS into the text box and hit generate
                        to create a SCI like worksheet</p>
                    <textarea
                        name="mainInput"
                        id="mainInput"
                        style={{
                            width: '90%',
                            height: '400px',
                        }}
                    />
                    <br/>
                    <Button variant="success" style={{margin: '30px'}} onClick={GenerateSheet}>Generate</Button>
                </div>
                <div id="resetDiv" hidden>
                    <Button variant="primary" onClick={PrintPage} style={{
                        margin: '30px'
                    }}>Print</Button>
                    <Button variant="danger" onClick={ResetInputs}>Reset</Button>
                </div>
                <hr/>
                <div>
                    <div id="contentRender">
                        {contentRender}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Worksheet;