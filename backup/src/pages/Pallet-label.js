import './Pallet-label.css';
import React from "react";
import {Button} from "react-bootstrap";
import Pallet from "../objects/palletLabel";
import jsPDF from 'jspdf';
import bwip from 'bwip-js';


class PalletLabel extends React.Component
{

    constructor(props) {
        super(props);
        this.state = {
            pallets: [],
        };
        this.GeneratePage = this.GeneratePage.bind(this);
        this.GenerateOnClick = this.GenerateOnClick.bind(this);
        this.ProcessPallets = this.ProcessPallets.bind(this);
    }


    GeneratePage()
    {

        const doc = new jsPDF({
            orientation: "l",
            unit: 'mm',
            format: "a6"
        });

        for(let i = 0; i < this.state.pallets.length; i++)
        {
            const value = this.state.pallets[i];
            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: 'code128',
                text: value.caseNumber,
                includetext: true,
                textsize: 12,
                width: 100,
                height: 30
            });

            const data = canvas.toDataURL('image/png');

            doc.addImage(data, 'image/png', 10, 25)

            if(i+1 !== this.state.pallets.length)
            {
                doc.addPage();
            }
        }

        doc.output("dataurlnewwindow");

    }

    ProcessPallets(caseNumbers)
    {
        let temp = caseNumbers.split("\n");

        temp.forEach((value) =>
        {
            value = value.replace(/\s/g, "");
            //console.log(value);
            if(value !== "")
                this.state.pallets.push(new Pallet(value));
        })

        if(this.state.pallets.length > 0)
            return true;
        else
            return false;
    }



    GenerateOnClick(e)
    {
        const input = document.getElementById("caseNumberInput");
        if(input === null || input.value === "") return; 

        if(this.ProcessPallets(input.value))
        {
            this.GeneratePage();
            input.value = "";
            this.setState({pallets: []})
        }

    }


    render() {
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
                            style={{
                                marginTop: '10px',
                                width: '90%',
                                height: '400px'
                            }}
                        />
                        <br />
                        <Button style={{margin: "30px"}} variant="success" type="button" onClick={this.GenerateOnClick}>Generate</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default PalletLabel;