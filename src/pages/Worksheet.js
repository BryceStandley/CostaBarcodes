import React, {useState} from "react";
import {ShipmentManager, ShipmentFilter} from "../objects/shipment";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Barcode from "react-barcode";
import PrintJob from "print-job";
import {FormCheck} from "react-bootstrap";



function Worksheet() {

    const [contentRender, setContentRender] = useState([]);
    const [tableKey, setTableKey] = useState(0);
    const [includeR, setIncludeR] = useState(false);
    const [exclusiveR, setExclusiveR] = useState(false);
    const [exclusiveF, setExclusiveF] = useState(false);
    const [exclusiveM, setExclusiveM] = useState(false);


    let shipmentManager = new ShipmentManager();

    function GenerateSheet()
    {
        let input = document.getElementById("mainInput").value;
        shipmentManager.Populate(input, new ShipmentFilter(includeR, exclusiveR, exclusiveF, exclusiveM));
        let i = document.getElementById("inputField");
        let r = document.getElementById("resetDiv");
        setTableKey(Math.random());
        const t = CreateSheetTable(shipmentManager.Get());
        i.setAttribute("hidden","");
        r.removeAttribute("hidden");
        const c = document.getElementById("content");
        c.removeAttribute("hidden");

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

        const c = document.getElementById("content");
        c.setAttribute("hidden","");

        setContentRender([]);

        shipmentManager.Clear();

    }

    function PrintPage()
    {
        PrintJob.print("#content");
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
                                <td><Barcode value={value.shipmentNumber} height={50} renderer="img"/></td>
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

    function ExclusiveROnChange(e)
    {
        if(e.target.checked)
        {
            const i = document.getElementById("includeRShipments");
            i.checked = false;
            i.disabled = true;
            const f = document.getElementById("exclusiveFShipments");
            const m = document.getElementById("exclusiveMShipments");
            f.checked = false;
            m.checked = false;

            setExclusiveR(true);
            setIncludeR(false);
            setExclusiveF(false);
            setExclusiveM(false);

        }
        else
        {
            const i = document.getElementById("includeRShipments");
            i.disabled = false;
            setExclusiveR(false);
        }
    }

    function IncludeROnChange(e)
    {
        if(e.target.checked)
        {
            setIncludeR(true);
            setExclusiveF(false);
            setExclusiveR(false);
            setExclusiveM(false);
        }
        else
        {
            setIncludeR(false);
        }
    }

    function ExclusiveFOnChange(e)
    {
        if(e.target.checked)
        {
            setExclusiveF(true);
            setExclusiveR(false);
            setExclusiveM(false);
            setIncludeR(false);
            const m = document.getElementById("exclusiveMShipments");
            const i = document.getElementById("includeRShipments");
            i.checked = false;
            i.disabled = true;
            const r = document.getElementById("exclusiveRShipments");
            m.checked = false;
            r.checked = false;
        }
        else
        {
            const i = document.getElementById("includeRShipments");
            i.disabled = false;
            setExclusiveF(false);
        }
    }

    function ExclusiveMOnChange(e)
    {
        if(e.target.checked)
        {
            setExclusiveM(true);
            setExclusiveF(false);
            setExclusiveR(false);
            setIncludeR(false);
            const i = document.getElementById("includeRShipments");
            const f = document.getElementById("exclusiveFShipments");
            i.checked = false;
            i.disabled = true;
            const r = document.getElementById("exclusiveRShipments");
            r.checked = false;
            f.checked = false;
        }
        else
        {
            const i = document.getElementById("includeRShipments");
            i.disabled = false;
            setExclusiveM(false);
        }
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
                    <FormCheck inline={true} type="switch" id="includeRShipments" label="Include R Shipments" onClick={IncludeROnChange} defaultChecked={false}/>
                    <FormCheck type="switch" id="exclusiveRShipments" inline={true} label="Only R Shipments" onClick={ExclusiveROnChange} defaultChecked={false}/>
                    <FormCheck type="switch" id="exclusiveFShipments" inline={true} label="Only F Shipments" onClick={ExclusiveFOnChange} defaultChecked={false}/>
                    <FormCheck type="switch" id="exclusiveMShipments" inline={true} label="Only Manual Shipments" onClick={ExclusiveMOnChange} defaultChecked={false}/>

                    <textarea
                        name="mainInput"
                        id="mainInput"
                        style={{
                            marginTop: '10px',
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
                <div>
                    <div id="content" hidden>
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