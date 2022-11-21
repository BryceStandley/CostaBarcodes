import React, {useRef, useState, ReactNode, ClipboardEvent} from "react";
import Button from "react-bootstrap/Button";
import {ShipmentManager, Shipment} from "../objects/shipment";
import Table from "react-bootstrap/Table";
import ReactDOMServer from "react-dom/server";
// @ts-ignore
import Barcode from "react-barcode";
// @ts-ignore
import bwip from "bwip-js";

import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'

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

        let totalPages = 1;
        if(shipmentManager.current.shipments.length > 12)
        {
            totalPages = Math.ceil(shipmentManager.current.shipments.length / 12);
        }
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const ws = "Receival Worksheet";
        const headerX = (pageW / 2) - (doc.getTextDimensions(ws).w / 2) - 20;
        const headerY = doc.getTextDimensions(ws).h + 10;
        const tableStart = headerY + 10;
        let shipments = shipmentManager.current.shipments;
        for(let i = 0; i < totalPages; i++)
        {
            const pageNum = "page: " + (i+1).toString() +" of " + totalPages.toString();
            doc.setFontSize(10);
            doc.text(pageNum, 10, headerY);

            doc.setFontSize(22);
            doc.text(ws, headerX, headerY);

            let tempShipments: Shipment[] = [];
            let tempCanvas: HTMLCanvasElement[] = [];
            //..loop over shipments
            if(shipments.length > 12)
            {
                let tableCols :[[string, string ,string]] = [['','','']];
                for(let j = 0; j < 12; j++)
                {
                    
                    let canvas = document.createElement('canvas');
                        bwip.toCanvas(canvas, {
                        bcid: "code128",
                        text: shipments[j].shipmentNumber,
                    });
                    tempCanvas.push(canvas);
                    tempShipments.push(shipments[j])
                    tableCols.push(['', shipments[j].shipmentNumber, shipments[j].vendor]);
                }
                tableCols.splice(0, 1);
                autoTable(doc, {
                    head: [['Barcode', 'Shipment', 'Vendor']],
                    body: tableCols,
                    columnStyles: {0: {halign: 'center', minCellHeight: ((pageH/10) - 20), minCellWidth: ((pageW/3) - 20)}, 2: { cellWidth: 'auto'}},
                    didDrawCell: (data) => {
                        if(data.section === 'body' && data.column.index === 0 && data.row.index < 12)
                        {
                            const canvas = tempCanvas[data.row.index];
                            doc.addImage(canvas.toDataURL('image/png'), 'image/png', data.cell.x + 10, data.cell.y + 5, data.cell.width - 20, data.cell.height - 10);
                        }
                    }
                });
                tempCanvas.length = 0;
                tableCols.splice(0, tableCols.length);
            }
            else
            {
                let tableCols :[[string, string ,string]] = [['','','']];
                for(let j = 0; j < shipments.length; j++)
                {
                    let canvas = document.createElement('canvas');
                        bwip.toCanvas(canvas, {
                        bcid: "code128",
                        text: shipments[j].shipmentNumber,
                    });
                    tempCanvas.push(canvas);
                    tableCols.push(['', shipments[j].shipmentNumber, shipments[j].vendor]);
                }

                tableCols.splice(0, 1);
                autoTable(doc, {
                    head: [['Barcode', 'Shipment', 'Vendor']],
                    body: tableCols,
                    columnStyles: {0: {halign: 'center', minCellHeight: ((pageH/10) - 20), minCellWidth: ((pageW/3) - 20)}, 2: { cellWidth: 'auto'}},
                    didDrawCell: (data) => {
                        if(data.section === 'body' && data.column.index === 0 && data.row.index < 12)
                        {
                            const canvas = tempCanvas[data.row.index];
                            doc.addImage(canvas.toDataURL('image/png'), 'image/png', data.cell.x + 10, data.cell.y + 5, data.cell.width - 20, data.cell.height - 10);
                        }
                    }
                });
                tempCanvas.length = 0;
                tableCols.splice(0, tableCols.length);
            }

            if(tempShipments.length > 0)
            {
                shipments = shipments.filter((x) => !tempShipments.includes(x));
            }

            if(i+1 < totalPages)
            {
                doc.addPage();
            }
        }

        pdfDoc.current = doc.output("dataurlstring");
        DisplayPage();
    }

    function DisplayPage()
    {
        if(pdfDoc.current === "") return;

        viewerRef.current.removeAttribute("hidden");

        setPdfViewer(CreateViewer());

    }


    function CreateViewer()
    {
        const doc = pdfDoc.current +"#zoom=100";

        return(
            <div>
                <Button style={{margin: "30px"}} variant="danger" type="button" onClick={ResetInputs}>Reset</Button>
                <div>
                    <object data={doc} type="application/pdf" style={{width: '85%', height: '700px'}}>Error loading PDF</object>
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
                        <p>Generate a receival worksheet from copied shipment numbers and vender names from WMS</p>
                        <p>Strictly <em><strong>ONE</strong></em> Shipment per line. The shipment number and vendor <em><strong>MUST</strong></em> be separated by a space.</p>

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