import jsPDF from "jspdf";
import React from "react";
import {Button, InputGroup} from "react-bootstrap";
import {Input} from "reactstrap";
import ScaleUser from "../objects/scaleUser";
import bwip from "bwip-js";

class Scale extends React.Component
{

    constructor(props) {
        super(props);
        this.state = {
            user: []
        };
        this.GenerateOnClick = this.GenerateOnClick.bind(this);
        this.ProcessLogin = this.ProcessLogin.bind(this);
        this.GeneratePDF = this.GeneratePDF.bind(this);
    }

    ProcessLogin(username, password)
    {
        this.state.user.push(new ScaleUser(username, password));

        if(this.state.user.length > 0)
            return true;
        else
            return false;
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

        this.state.user.forEach(value => {

            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: "qrcode",
                text: value.qrData,
                parse: true,
                });

            doc.setFontSize(22);
            doc.text(value.name,
                (pageWidth/2) - doc.getTextWidth(value.name)/2,
                (pageHeight/4),
                );

            doc.addImage(canvas.toDataURL('image/png'), 'image/png', 
                (pageWidth/2) - canvas.width / 8,
                ((pageHeight/5) * 2)
            );

        });

        doc.output("dataurlnewwindow");
    }


    GenerateOnClick(e)
    {
        const u = document.getElementById("usernameInput");
        const p = document.getElementById("passwordInput");
        if((u === null || u.value === "") || (p === null || p.value === "")) return;

        if(this.ProcessLogin(u.value, p.value))
        {
            this.GeneratePDF();

            u.value = "";
            p.value = "";
            this.setState({user: []});
        }
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