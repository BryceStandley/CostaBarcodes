import jsPDF from "jspdf";
import React, { useRef, useState, ReactNode } from "react";
import {Button, InputGroup, FormGroup, Form} from "react-bootstrap";
import {Input} from "reactstrap";
import ScaleUser from "../objects/scaleUser";
// @ts-ignore
import bwip from "bwip-js";


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
    const [validated, setValidated] = useState<boolean>(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (usernameRef.current.value && passwordRef.current.value) {

            GenerateOnClick();
        }

        setValidated(true);

    }

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
        const doc = generatedPDFRef.current +"#zoom=100"
		return(
			<div>
				<object data={doc} type="application/pdf"  style={{width: '85%', height: '500px'}}>Error loading PDF</object>
			</div>
		);
    }

    function ResetOnClick()
    {
        usernameRef.current.value = "";
        passwordRef.current.value = "";
        generatedPDFRef.current = "";

        setViewer([]);
        setValidated(false);
        viewerRef.current.setAttribute("hidden", "");
        inputRef.current.removeAttribute("hidden");
        resetBtnRef.current.setAttribute("hidden", "");

    }

    document.title = 'Costa Barcodes | Scale Login';

    return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px',
                    paddingBottom: '100px'
                }}>
                    <div>
                        <h1>Scale Login</h1>
                        <p>Generate user login cards for Scale by entering the username and password of the account</p>
                        <hr/>
                        <p>Username:  <strong>FirstName.LastName</strong> OR  <strong>FirstName.LastName@costas.local</strong></p>
                        <p>Passwords can be any combination</p>
                        <hr />
                        <div ref={inputRef}>
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <FormGroup>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <InputGroup style={{margin: '10px'}}>
                                            <InputGroup.Text id="ig-username">Username</InputGroup.Text>
                                            <Input id="usernameInput" name="usernameInput" innerRef={usernameRef} required={true} type="text"/>
                                        </InputGroup>
                                        <Form.Control.Feedback type="invalid"/>

                                        <InputGroup style={{margin: '10px'}}>
                                            <InputGroup.Text id="ig-password">Password</InputGroup.Text>
                                            <Input id="passwordInput" name="passwordInput" innerRef={passwordRef} required={true} type="text" />
                                        </InputGroup>
                                        <Form.Control.Feedback type="invalid"/>
                                    </div>
                                </FormGroup>

                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Button style={{margin: "30px"}} variant="success" type="submit">Process</Button>
                                </div>
                            </Form>
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