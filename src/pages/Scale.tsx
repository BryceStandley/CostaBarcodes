import jsPDF from "jspdf";
import React, { useRef, useState, ReactNode } from "react";
import {Button, InputGroup} from "react-bootstrap";
import {Input} from "reactstrap";
import ScaleUser from "../objects/scaleUser";
// @ts-ignore
import bwip from "bwip-js";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';


function Scale()
{
    const generatedPDFRef = useRef<string>("");
    const resetBtnRef = useRef<HTMLButtonElement>(null!);
    const viewerRef = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLDivElement>(null!);
    const usernameRef = useRef<HTMLInputElement>(null!);
    const passwordRef = useRef<HTMLInputElement>(null!);
    const user = useRef<ScaleUser>(new ScaleUser());
    const [viewer, setViewer] = useState<ReactNode>([])

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    function ProcessLogin(username: string, password: string)
    {
        user.current.SetAndProcess(username, password);
    }

    function GeneratePDF()
    {
        const doc = new jsPDF({
            orientation: "l",
            format: "a7"
        })

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();


            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: "qrcode",
                text: user.current.qrData,
                parse: true,
                });

            doc.setFontSize(22);
            doc.text(user.current.name,
                (pageWidth/2) - doc.getTextWidth(user.current.name)/2,
                (pageHeight/4)
                );

            doc.addImage(canvas.toDataURL('image/png'), 'image/png', 
                (pageWidth/2) - ((canvas.width / 4) / 2),
                ((pageHeight/5) * 2),
                (canvas.width / 4),
                (canvas.height / 4)
                );


        generatedPDFRef.current = doc.output("dataurlstring");
    }


    function GenerateOnClick()
    {
        if(usernameRef.current === null || passwordRef.current === null) return;
        if(usernameRef.current.value === "" || passwordRef.current?.value === "") return;


        ProcessLogin(usernameRef.current.value, passwordRef.current.value);

        GeneratePDF();

        DisplayPDFViewer();

    }

    function DisplayPDFViewer()
    {
        if(generatedPDFRef.current === "") return;

        viewerRef.current.removeAttribute("hidden");
        inputRef.current.setAttribute("hidden", "");
        resetBtnRef.current.removeAttribute("hidden");

        setViewer(GenerateViewer());

    }

    function GenerateViewer()
    {
        return(
            <Worker workerUrl={process.env.PUBLIC_URL +"/assets/js/pdf.worker.js"}>
                <div style={{height: '750px'}}>
                    <Viewer fileUrl={generatedPDFRef.current} defaultScale={1} plugins={[defaultLayoutPluginInstance,]}/>
                </div>
            </Worker>
        );
    }

    function ResetOnClick()
    {
        usernameRef.current.value = "";
        passwordRef.current.value = "";
        generatedPDFRef.current = "";

        setViewer([]);
        viewerRef.current.setAttribute("hidden", "");
        inputRef.current.removeAttribute("hidden");
        resetBtnRef.current.setAttribute("hidden", "");

    }

    return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px'
                }}>
                    <div>
                        <h1>Scale Login</h1>
                        <p>Generate scale user login barcode cards by entering the username and password of the account</p>
                        <p>The login card displays the users full name and a single QR Code for quick and easy login with a single scan</p>
                        <hr/>
                        <p>Username:  <strong>FirstName.LastName</strong> OR  <strong>FirstName.LastName@costa.local</strong></p>
                        <p>Passwords can be any combination</p>
                        <hr />
                        <div ref={inputRef}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                            <InputGroup style={{margin: '10px'}}>
                                <InputGroup.Text id="ig-username">Username</InputGroup.Text>
                                <Input id="usernameInput" name="usernameInput" innerRef={usernameRef} type="text"/>
                            </InputGroup>

                            <InputGroup style={{margin: '10px'}}>
                                <InputGroup.Text id="ig-password">Password</InputGroup.Text>
                                <Input id="passwordInput" name="passwordInput" innerRef={passwordRef} type="text" />
                            </InputGroup>
                            </div>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Button style={{margin: "30px"}} variant="success" type="button" onClick={GenerateOnClick}>Process</Button>
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Button style={{margin: "30px"}} ref={resetBtnRef} hidden variant="danger" type="button" onClick={ResetOnClick}>Reset</Button>
                        </div>

                        <div hidden ref={viewerRef}>
                            {viewer}
                        </div>
                    </div>
                </div>
            </div>
        );

}

export default Scale;