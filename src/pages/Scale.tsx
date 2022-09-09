import jsPDF from "jspdf";
import React, { useRef } from "react";
import {Button, InputGroup} from "react-bootstrap";
import {Input} from "reactstrap";
import ScaleUser from "../objects/scaleUser";
// @ts-ignore
import bwip from "bwip-js";

type SState = {
    user: ScaleUser;
}

class Scale extends React.Component<any, SState>
{
    usernameRef = useRef<HTMLInputElement>(null!);
    passwordRef = useRef<HTMLInputElement>(null!);

    constructor(props: any) {
        super(props);

        this.GenerateOnClick = this.GenerateOnClick.bind(this);
        this.ProcessLogin = this.ProcessLogin.bind(this);
        this.GeneratePDF = this.GeneratePDF.bind(this);
    }

    ProcessLogin(username: string, password: string)
    {
        this.setState({user: new ScaleUser(username, password)});
    }

    GeneratePDF()
    {
        const doc = new jsPDF({
            orientation: "l",
            unit: "mm",
            format: "a7"
        })

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();


            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: "qrcode",
                text: this.state.user.qrData,
                parse: true,
                });

            doc.setFontSize(22);
            doc.text(this.state.user.name,
                (pageWidth/2) - doc.getTextWidth(this.state.user.name)/2,
                (pageHeight/4),
                );

            doc.addImage(canvas.toDataURL('image/png'), 'image/png', 
                (pageWidth/2) - canvas.width / 8,
                ((pageHeight/5) * 2),
                canvas.width,
                canvas.height
                );


        doc.output("dataurlnewwindow");
    }


    GenerateOnClick()
    {
        if(this.usernameRef.current.value === "" || this.passwordRef.current.value === "") return;

        this.ProcessLogin(this.usernameRef.current.value, this.passwordRef.current.value);

            this.GeneratePDF();

            this.usernameRef.current.value = "";
            this.passwordRef.current.value = "";
            //this.setState({user: null});
    }

    render()
    {
        return(
            <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px'
                }}>
                    <div>
                        <h1>Scale Login</h1>
                        <p>Generate scale user login barcode cards by entering the username and password of the account</p>
                        <p>The username input will accept any value with or without the @costa.local</p>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                            }}>
                            <InputGroup style={{margin: '10px'}}>
                                <InputGroup.Text id="ig-username">Username</InputGroup.Text>
                                <Input id="usernameInput" name="usernameInput" type="text" placeholder="bryce.standley"/>
                            </InputGroup>

                            <InputGroup style={{margin: '10px'}}>
                                <InputGroup.Text id="ig-password">Password</InputGroup.Text>
                                <Input id="passwordInput" name="passwordInput" type="text" placeholder="hk35TG9TBAW3iz"/>
                            </InputGroup>
                        </div>
                        <br />
                        <Button style={{margin: "30px"}} variant="success" type="button" onClick={this.GenerateOnClick}>Process</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Scale;