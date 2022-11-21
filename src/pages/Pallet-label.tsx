import './Pallet-label.css';
import React, {ReactNode, useRef, useState, ClipboardEvent} from "react";
import {Button} from "react-bootstrap";
import Pallet from "../objects/palletLabel";
import jsPDF from 'jspdf';
// @ts-ignore
import bwip from 'bwip-js';
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function PalletLabel()
{
    const generateBtnRef = useRef<HTMLDivElement>(null!);
    const viewerRef = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const [pallets, setPallets] = useState<Pallet[]>([])
    const pdfDoc = useRef<string>("");
    const [pdfViewer, setPdfViewer] = useState<ReactNode>([]);
    const viewerHeightRef = useRef<number>(0);

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    function GeneratePage()
    {

        const doc = new jsPDF({
            orientation: "l",
            unit: 'px',
            format: "a6"
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidthMargin = pageWidth - 30;
        
        pallets?.forEach((value, i) => {
            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: 'code128',
                text: value.caseNumber,
            });

            let barcodeW = canvas.width;

            if(canvas.width > pageWidthMargin)
            {
                barcodeW = pageWidthMargin;
            }


            const barcodeH = ((canvas.height / canvas.width) * barcodeW) * 0.75;

            const data = canvas.toDataURL('image/png');

            doc.addImage(data, 'image/png',
                ((pageWidth/2) - (barcodeW / 2)),
                ((pageHeight / 2) - (barcodeH / 2)),
                barcodeW,
                barcodeH,
                "",
                "MEDIUM",
                0);


            let fontSize = 28;
            if(doc.getTextDimensions(value.caseNumber, {fontSize: 28}).w > pageWidth)
            {
                const unit = doc.getStringUnitWidth(value.caseNumber);
                fontSize *= ((barcodeW) / doc.getTextDimensions(value.caseNumber, {fontSize: 28}).w);
                //console.log(fontSize);
            }

            doc.setFontSize(fontSize);
            //console.log(doc.getFontSize());


            doc.text(value.caseNumber,
                ((pageWidth/2) - (doc.getTextDimensions(value.caseNumber).w / 2)),
                ((pageHeight/2) + (barcodeH / 2) + (doc.getTextDimensions(value.caseNumber).h)));

            if(i+1 !== pallets.length)
            {
                doc.addPage();
            }
            viewerHeightRef.current += pageHeight;
            //console.log(viewerHeightRef.current);
        })

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
        const doc = pdfDoc.current +"#zoom=50"
        return(
            <div>
                <Button style={{margin: "30px"}} variant="danger" type="button" onClick={ResetOnClick}>Reset</Button>
                <div>
                    <object data={doc} type="application/pdf" style={{width: '85%', height: '600px'}}>Error loading PDF</object>
                </div>
            
            </div>
        );
    }

    function ProcessPallets(caseNumbers: string)
    {
        let line = caseNumbers.split("\n");

        line.forEach((value) =>
        {
            value = value.trim();

            if(value) {
                pallets.push(new Pallet(value));
            }
        })

        return pallets.length !== 0;
    }

    function GenerateOnClick()
    {
        if(inputRef.current.value === "") return;

        if(ProcessPallets(inputRef.current.value))
        {
            GeneratePage();
            inputRef.current.value = "";
            setPallets([])
            inputRef.current.setAttribute("hidden", "");
            generateBtnRef.current.setAttribute("hidden", "");
        }

    }

    function ResetOnClick()
    {
        viewerRef.current.setAttribute("hidden", "");
        setPdfViewer([]);
        pdfDoc.current = "";

        generateBtnRef.current.removeAttribute("hidden");
        inputRef.current.removeAttribute("hidden");
    }

    const OnPasteEvent = (e :ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        let paste = e.clipboardData.getData('text');
        inputRef.current.value += paste;
        inputRef.current.value += "\n";
        inputRef.current.scrollTop = inputRef.current.scrollHeight;
        
    }

    function SetPDFViewerHeight()
    {
        var d = document.getElementById('viewerDiv');
        d?.style.setProperty('height', Math.ceil(viewerHeightRef.current).toString() +'px');
        return(<div></div>);
    }


        return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px'
                }}>
                    <div>
                        <h1>Pallet Labels</h1>
                        <hr />
                        <p>Generate case number labels by entering any amount of case numbers and pressing generate.</p>
                        <p>Strictly <em><strong>one</strong></em> case number per line.</p>
                        <textarea
                            id="caseNumberInput"
                            ref={inputRef}
                            style={{
                                marginTop: '10px',
                                width: '90%',
                                height: '400px'
                            }}
                            onPasteCapture={OnPasteEvent}
                        />
                        <div ref={generateBtnRef}>
                            <Button style={{margin: "30px"}}  variant="success" type="button" onClick={GenerateOnClick}>Generate</Button>
                        </div>
                    </div>
                    <div hidden ref={viewerRef}>
                        {pdfViewer}
                    </div>
                </div>
            </div>
        );
}

export default PalletLabel;