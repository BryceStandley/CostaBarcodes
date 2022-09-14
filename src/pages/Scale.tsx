import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import {Button, InputGroup} from "react-bootstrap";
import {Input} from "reactstrap";
import ScaleUser from "../objects/scaleUser";
// @ts-ignore
import bwip from "bwip-js";


function Scale()
{
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<ScaleUser>(new ScaleUser());

    function ProcessLogin(username: string, password: string)
    {
        user.SetAndProcess(username, password);
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
                text: user.qrData,
                parse: true,
                });

            doc.setFontSize(22);
            doc.text(user.name,
                (pageWidth/2) - doc.getTextWidth(user.name)/2,
                (pageHeight/4)
                );

            doc.addImage(canvas.toDataURL('image/png'), 'image/png', 
                (pageWidth/2) - canvas.width / 6,
                ((pageHeight/5) * 2),
                (canvas.width / 3),
                (canvas.height / 3)
                );


        doc.output("dataurlnewwindow");
    }


    function GenerateOnClick()
    {
        if(usernameRef.current === null || passwordRef.current === null) return;
        if(usernameRef.current.value === "" || passwordRef.current?.value === "") return;


        ProcessLogin(usernameRef.current.value, passwordRef.current.value);

            GeneratePDF();

            usernameRef.current.value = "";
            passwordRef.current.value = "";
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
                        <p>The login card displays the users full name and a single QR Code for quick and easy login with a single scan </p>

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
                        <br />
                        <Button style={{margin: "30px"}} variant="success" type="button" onClick={GenerateOnClick}>Process</Button>
                    </div>
                </div>
            </div>
        );

}

export default Scale;