import React, {useRef, useState, ReactNode, ClipboardEvent,} from "react";
import { Button } from "react-bootstrap";
import {ShipmentManager} from "../objects/shipment";
// @ts-ignore
import bwip from "bwip-js";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { Utils } from 'Utils';


function Worksheet()
{
    const pdfLoading = process.env.PUBLIC_URL + "/assets/img/pdf_loading.gif";

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
        let shipments = shipmentManager.current.shipments;


        let tempCanvas: HTMLCanvasElement[] = [];
        let tableCols :Array<Array<string>> = [];
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

        for(let i = 0; i < totalPages; i++)
        {
            const pageNum = "page: " + (i+1).toString() +" of " + totalPages.toString();
            doc.setFontSize(10);
            doc.text(pageNum, 20, headerY);
            doc.setFontSize(22);
            doc.text(ws, headerX, headerY);


            autoTable(doc, {
                head: [['Barcode', 'Shipment', 'Vendor']],
                body: tableCols.slice( i * 12, 12 * (i+1)),
                styles: {lineWidth: 1, lineColor: '#000000' },
                theme: 'grid',
                columnStyles: {0: {halign: 'center', minCellHeight: ((pageH/10) - 20), cellWidth: ((pageW/3) - 20)}, 2: { cellWidth: 'auto'}},
                didDrawCell: (data) => {
                    if(data.section === 'body' && data.column.index === 0)
                    {
                        const canvas = tempCanvas[data.row.index + (i * 12)];
                        if(typeof canvas !== 'undefined')
                        {
                            doc.addImage(canvas.toDataURL('image/png'), 'image/png', data.cell.x + 10, data.cell.y + 5, data.cell.width - 20, data.cell.height - 10);
                        }
                    }
                }
            });

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
        const blob = new Blob([Utils.Base64ToBlob(pdfDoc.current)], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
    
        return(
            <div>
                <Button style={{margin: "30px"}} variant="danger" type="button" onClick={ResetInputs}>Reset</Button>
                <div>
                <embed src={fileURL} type="application/pdf" style={{width: '85%', height: '700px'}}/>
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


    document.title = 'Costa Barcodes | Worksheet';

    return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px',
                    height: '1000px'
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
                        <Button variant="success" style={{margin: '30px'}} ref={genBtnRef} onClick={handleSubmit} type="submit">Generate</Button>
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