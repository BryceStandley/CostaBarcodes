import './Pallet-label.css';
import React, {ReactNode, useRef, useState} from "react";
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
    const generateBtnRef = useRef<HTMLButtonElement>(null!);
    const viewerRef = useRef<HTMLDivElement>(null!);
    const resetRef = useRef<HTMLButtonElement>(null!);
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const openPDFRefOld = useRef<HTMLButtonElement>(null!);
    const openPDFRefNew = useRef<HTMLButtonElement>(null!);
    const [pallets, setPallets] = useState<Pallet[]>([])
    const [pdf, setPDF] = useState<string>("");
    let pdfString = "";
    const pdfDoc = useRef<string>("");
    const [pdfViewer, setPdfViewer] = useState<ReactNode>([]);

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    function GeneratePage()
    {

        const doc = new jsPDF({
            orientation: "l",
            unit: 'mm',
            format: "a6"
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        pallets?.forEach((value, i) => {
            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: 'code128',
                text: value.caseNumber,
            });

            const imgWidth = canvas.width > pageWidth ? pageWidth - 15 : canvas.width;
            const imgHeight = pageHeight / 3;

            const data = canvas.toDataURL('image/png');

            doc.addImage(data, 'image/png', (pageWidth - imgWidth) / 2, 25, imgWidth , imgHeight);

            doc.setFontSize(30);
            doc.text(value.caseNumber,
                (pageWidth-doc.getTextWidth(value.caseNumber)) / 2,
                (25 + imgHeight + 15));

            if(i+1 !== pallets.length)
            {
                doc.addPage();
            }
        })

        const p = doc.output("dataurlstring");

        setPDF(p);
        pdfString = p;
        pdfDoc.current = p;
        DisplayPage();
    }

    function DisplayPage()
    {
        if(pdfString === "") return;

        viewerRef.current.removeAttribute("hidden");

        setPdfViewer(CreateViewer());

    }

    function CreateViewer()
    {
        return(
            <Worker workerUrl={process.env.PUBLIC_URL +"/assets/js/pdf.worker.js"}>
                <div style={{height: '750px'}}>
                    <Viewer fileUrl={pdfDoc.current} defaultScale={1} plugins={[defaultLayoutPluginInstance,]}/>
                </div>
            </Worker>
        );
    }

    function ProcessPallets(caseNumbers: string)
    {
        let line = caseNumbers.split("\n");

        line.forEach((value) =>
        {
            value = value.trim();
            pallets.push(new Pallet(value));
        })

        if(pallets.length > 0)
            return true;
        else
            return false;
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
            openPDFRefOld.current.removeAttribute("hidden");
            openPDFRefNew.current.removeAttribute("hidden");
            resetRef.current.removeAttribute("hidden");
        }

    }

    function OnOpenClickOld()
    {
        if(pdf === "") return;

        window.open(pdf);
    }

    function OnOpenClickNew()
    {
        if(pdfDoc.current === "") return;

        window.open(pdfDoc.current);
    }

    function ResetOnClick()
    {
        openPDFRefOld.current.setAttribute("hidden", "");
        openPDFRefNew.current.setAttribute("hidden", "");
        resetRef.current.setAttribute("hidden", "");
        setPDF("");
        pdfString = "";
        viewerRef.current.setAttribute("hidden", "");
        setPdfViewer([]);
        pdfDoc.current = "";

        generateBtnRef.current.removeAttribute("hidden");
        inputRef.current.removeAttribute("hidden");
    }


        return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px'
                }}>
                    <div>
                        <h1>Pallet Labels</h1>
                        <p>Generate pallet label barcodes by copying and pasting any amount of case numbers from WMS and hit generate to create a printable PDF with a page for each label.</p>
                        <p>Note. Open PDF buttons may or may not open the generated PDF due to network size limits</p>
                        <hr/>
                        <p>When opening a PDF, if it doesn't initially load, refresh the new tab. Note if '#blocked' is in the URL, the network has blocked opening the PDF due to size constraints. Try generating less labels at once.</p>
                            <textarea
                                id="caseNumberInput"
                                ref={inputRef}
                                style={{
                                    marginTop: '10px',
                                    width: '90%',
                                    height: '400px'
                                }}
                            />
                            <br />
                            <Button style={{margin: "30px"}} ref={generateBtnRef} variant="success" type="button" onClick={GenerateOnClick}>Generate</Button>
                            <Button hidden ref={openPDFRefOld} style={{margin: "30px"}} variant="primary" type="button" onClick={OnOpenClickOld}>Open PDF(Old)</Button>
                            <Button hidden ref={openPDFRefNew} style={{margin: "30px"}} variant="primary" type="button" onClick={OnOpenClickNew}>Open PDF(New)</Button>
                            <Button hidden ref={resetRef} style={{margin: "30px"}} variant="danger" type="button" onClick={ResetOnClick}>Reset</Button>

                        <div hidden ref={viewerRef}>
                            {pdfViewer}
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default PalletLabel;