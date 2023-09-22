
import React, {ReactNode, useState, useRef} from "react";
import {Button, Form, FormGroup, InputGroup} from "react-bootstrap";
import {Input} from "reactstrap";

import jsPDF from "jspdf";
import bwip from "bwip-js";


function BarcodeGen()
{
    const barcodeDataRef = useRef<HTMLInputElement>(null!);
    const formRef = useRef<HTMLFormElement>(null!);
    const [validated, setValidated] = useState<boolean>(false);
    const [viewerContent, setViewerContent] = useState<ReactNode>([]);
    const viewer = useRef<HTMLDivElement>(null!);
    const pdf = useRef<string>("");

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(barcodeDataRef.current.value)
        {
            GenerateBarcode();
        }
        setValidated(true);
    }

    function GenerateBarcode()
    {
        const doc = new jsPDF({
            unit: "px"
        })

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let canvas = document.createElement('canvas');
        bwip.toCanvas(canvas, {
            bcid: "code128",
            text: barcodeDataRef.current.value,
        });


        doc.setFontSize(32);
        doc.text(barcodeDataRef.current.value,
            (pageWidth/2) - doc.getTextWidth(barcodeDataRef.current.value)/2,
            (pageHeight/2) - (doc.getTextDimensions(barcodeDataRef.current.value).h / 2)
        );

        let barcodeW = 0;
        if(canvas.width > pageWidth)
        {
            barcodeW = pageWidth - 20;
        }
        else
        {
            barcodeW = canvas.width;
        }

        doc.addImage(canvas.toDataURL('image/png'), 'image/png',
            (pageWidth/2) - ((barcodeW /2)),
            ((pageHeight/2) + (doc.getTextDimensions(barcodeDataRef.current.value).h / 2)),
            ((barcodeW)),
            (canvas.height)
        );


        pdf.current = doc.output("dataurlstring");
        setViewerContent(LoadPDF());

        formRef.current.setAttribute("hidden", "");
        viewer.current.removeAttribute("hidden");
    }

    function ResetOnClick()
    {
        formRef.current.removeAttribute("hidden");
        setValidated(false);
        barcodeDataRef.current.value = "";

        viewer.current.setAttribute("hidden", "");
        pdf.current = "";
    }

    function LoadPDF()
    {
        const doc = pdf.current +"#zoom=50";
        return (
            <div>
                <Button variant={"danger"} onClick={ResetOnClick} style={{margin: "10px"}}>Reset</Button>
                <div>
				    <object data={doc} type="application/pdf"  style={{width: '85%', height: '625px'}}>Error loading PDF</object>
                </div>
            </div>
        );
    }

    document.title = 'Costa Barcodes | Lt. Barcode';

        return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px',
                    paddingBottom: '100px'
                }}>
                    <h1>Lt. Barcode</h1>
                    <p>Generate general use barcodes for any type of use.</p>
                    <p><strong>Options currently under construction.</strong></p>
                    <hr />

                    <Form noValidate validated={validated} onSubmit={handleSubmit} ref={formRef}>
                        <FormGroup>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <InputGroup style={{margin: '10px'}}>
                                    <InputGroup.Text id="ig-data">Barcode Data</InputGroup.Text>
                                    <Input type={"text"} innerRef={barcodeDataRef} required></Input>
                                </InputGroup>
                            </div>
                            <Form.Control.Feedback type={"invalid"}/>
                        </FormGroup>


                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Button style={{margin: "30px"}} variant="success" type="submit">Generate</Button>
                        </div>
                    </Form>

                    <div ref={viewer} hidden>
                        {viewerContent}
                    </div>
                </div>
            </div>
        );


}

export default BarcodeGen;