import './Pallet-label.css';
import React, { useRef, useState } from "react";
import {Button} from "react-bootstrap";
import Pallet from "../objects/palletLabel";
import jsPDF from 'jspdf';
// @ts-ignore
import bwip from 'bwip-js';
import {WaitOnType} from "pdfjs-dist/types/web/event_utils";

function PalletLabel()
{
    const resetRef = useRef<HTMLButtonElement>(null!);
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const openPDFRef = useRef<HTMLButtonElement>(null!);
    const [pallets, setPallets] = useState<Pallet[]>([])
    const [pdf, setPDF] = useState<string>("");
    let id = 0;

    const time = ms => new Promise(res => setTimeout(res,ms));

    function waitForPDF() {
        console.log("waiting...")
        if (pdf !== "") {
            window.open(pdf);
        } else {
            setTimeout(waitForPDF, 500);
        }
    }

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

        setPDF(doc.output("dataurlstring"));
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
            waitForPDF();
            inputRef.current.value = "";
            setPallets([])
            openPDFRef.current.removeAttribute("hidden");
            resetRef.current.removeAttribute("hidden");
        }

    }

    function OnOpenClick()
    {
        if(pdf === "") return;

        window.open(pdf);
    }

    function ResetOnClick()
    {
        openPDFRef.current.setAttribute("hidden", "");
        resetRef.current.setAttribute("hidden", "");
        setPDF("");
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
                        <Button style={{margin: "30px"}} variant="success" type="button" onClick={GenerateOnClick}>Generate</Button>
                        <Button hidden ref={openPDFRef} style={{margin: "30px"}} variant="primary" type="button" onClick={OnOpenClick}>Open PDF</Button>
                        <Button hidden ref={resetRef} style={{margin: "30px"}} variant="danger" type="button" onClick={ResetOnClick}>Reset</Button>
                    </div>
                </div>
            </div>
        );
}

export default PalletLabel;