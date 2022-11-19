import React, {useRef, useState, ReactNode, ClipboardEvent} from "react";
import Button from "react-bootstrap/Button";
import {ShipmentManager, Shipment} from "../objects/shipment";
import Table from "react-bootstrap/Table";
import ReactDOMServer from "react-dom/server";
// @ts-ignore
import Barcode from "react-barcode";
// @ts-ignore
import PrintJob from "print-job";

import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import jsPDF from "jspdf";

function Worksheet()
{
    const shipmentManager = useRef<ShipmentManager>(new ShipmentManager());
    const [contentRender, setContentRender] = useState<ReactNode>();
    const viewerRef = useRef<HTMLDivElement>(null!);
    const pdfDoc = useRef<string>("");
    const [pdfViewer, setPdfViewer] = useState<ReactNode>([]);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const inputDivRef = useRef<HTMLDivElement>(null!);
    const genBtnRef = useRef<HTMLButtonElement>(null!);
    const contentDivRef = useRef<HTMLDivElement>(null!);

    function ResetInputs()
    {
        inputRef.current.value = "";
        inputDivRef.current.removeAttribute("hidden");
        viewerRef.current.setAttribute('hidden', '');

        shipmentManager.current.Clear();

    }

    function GenerateOnClick()
    {
        if(inputRef.current.value === "" ) return;

        shipmentManager.current.Populate(inputRef.current.value);

        GeneratePage();
        inputRef.current.value = "";
        inputDivRef.current.setAttribute("hidden", "");
    }

    function GeneratePage()
    {
        const doc = new jsPDF({
            orientation: "p",
            unit: 'px',
            format: "a4"
        });

        //...
        var table = CreateSheetTable(shipmentManager.current.shipments);
        doc.addHTML(ReactDOMServer.renderToString(table.children);

        pdfDoc.current = doc.output("dataurlstring");
        DisplayPage();
    }

    function DisplayPage()
    {
        if(pdfDoc.current === "") return;

        viewerRef.current.removeAttribute("hidden");

        setPdfViewer(CreateViewer());

    }


    function PrintPage()
    {
        PrintJob.print("#content");
    }

    function CreateViewer()
    {
        return(
            <div>
                <Button style={{margin: "30px"}} variant="danger" type="button" onClick={ResetInputs}>Reset</Button>
                <p>To rotate the page, use the PDF preview <em><strong>More Actions</strong></em> button on the right</p>
                <div style={{width: '50%', height: '1000px', margin: '0 auto'}}>
                    <Viewer fileUrl={pdfDoc.current} defaultScale={1} plugins={[defaultLayoutPluginInstance,]}/>
                </div>

            </div>
        );
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

    const OnPasteEvent = (e :ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        let paste = e.clipboardData.getData('text');
        inputRef.current.value += paste;
        inputRef.current.value += "\n";
        inputRef.current.scrollTop = inputRef.current.scrollHeight;
        
    }

    return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px'
                }}>
                    <div id="inputField" ref={inputDivRef}>
                        <h1>Receival Worksheet</h1>
                        <hr/>
                        <p>Copy and paste shipment numbers and vendor names from WMS into the text box and hit generate
                            to create a SCI like worksheet</p>
                        <p>Strictly one Shipment per line in the format: <em><strong>"ShipmentNumber Vendor"</strong></em> OR <em><strong>"ShipmentNumber"</strong></em> </p>
                        <p>The shipment and vendor details <em><strong>MUST</strong></em> be seperated by a space.
                         If no vendor text is found, the shipment is generated with a empty vendor</p>

                        <textarea
                            name="mainInput"
                            id="mainInput"
                            ref={inputRef}
                            style={{
                                marginTop: '10px',
                                width: '90%',
                                height: '400px',
                            }}
                            onPasteCapture={OnPasteEvent}
                        />
                        <br/>
                        <Button variant="success" style={{margin: '30px'}} ref={genBtnRef} onClick={GenerateOnClick}>Generate</Button>
                    </div>
                    <div hidden ref={viewerRef}>
                        <h1>Receival Worksheet</h1>
                        {pdfViewer}
                    </div>
                </div>
            </div>
        );

}

export default Worksheet;