import React, {useRef, useState, ReactNode, ClipboardEvent,} from "react";
import { Button, Form } from "react-bootstrap";
import {ShipmentManager, Shipment} from "../objects/shipment";
// @ts-ignore
import bwip from "bwip-js";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'

const pdfLoading = process.env.PUBLIC_URL + "/assets/img/pdf_loading.gif";

function Worksheet()
{
    const shipmentManager = useRef<ShipmentManager>(new ShipmentManager());
    const viewerRef = useRef<HTMLDivElement>(null!);
    const pdfDoc = useRef<string>("");
    const [pdfViewer, setPdfViewer] = useState<ReactNode>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const inputDivRef = useRef<HTMLDivElement>(null!);
    const genBtnRef = useRef<HTMLButtonElement>(null!);

    function ResetInputs()
    {
        inputRef.current.value = "";
        inputDivRef.current.removeAttribute("hidden");
        viewerRef.current.setAttribute('hidden', '');

        shipmentManager.current.Clear();

    }

    function GenerateOnClick()
    {
        if(inputRef.current.value === "" ){
            setPdfViewer(null);
            inputDivRef.current.removeAttribute("hidden");
            viewerRef.current.setAttribute("hidden","");
            return;
        }

        shipmentManager.current.Populate(inputRef.current.value);

        GeneratePage();
        inputRef.current.value = "";
        inputDivRef.current.setAttribute("hidden", "");
    }

    function ShowLoading()
    {
        return(
            <div>
                <img src={pdfLoading} alt="loading"/>
            </div>
        );
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
        //const tableStart = headerY + 10;
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
                let canvas = document.createElement('canvas');
                        bwip.toCanvas(canvas, {
                        bcid: "code128",
                        text: shipments[0].shipmentNumber,
                    });
                    tempCanvas.push(canvas);
                let tableCols :[[string, string ,string]] = [['', shipments[0].shipmentNumber, shipments[0].vendor]];
                for(let j = 1; j < 12; j++)
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
                let canvas = document.createElement('canvas');
                        bwip.toCanvas(canvas, {
                        bcid: "code128",
                        text: shipments[0].shipmentNumber,
                    });
                    tempCanvas.push(canvas)
                let tableCols :[[string, string ,string]] = [['', shipments[0].shipmentNumber, shipments[0].vendor]];
                for(let j = 1; j < shipments.length; j++)
                {
                    let canvas = document.createElement('canvas');
                        bwip.toCanvas(canvas, {
                        bcid: "code128",
                        text: shipments[j].shipmentNumber,
                    });
                    tempCanvas.push(canvas);
                    tableCols.push(['', shipments[j].shipmentNumber, shipments[j].vendor]);
                }

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

    const OnPasteEvent = (e :ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        let paste = e.clipboardData.getData('text');
        inputRef.current.value += paste;
        inputRef.current.value += "\n";
        inputRef.current.scrollTop = inputRef.current.scrollHeight;
        
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputDivRef.current.setAttribute("hidden", "");
        viewerRef.current.removeAttribute("hidden");
        setPdfViewer(ShowLoading());
        GenerateOnClick();
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

                    <Form onSubmit={handleSubmit}>
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
                        <Button variant="success" style={{margin: '30px'}} ref={genBtnRef} type="submit">Generate</Button>
                    </Form>
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