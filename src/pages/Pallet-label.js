import React, { useState } from "react";
import {Button, ListGroup, FormControl, InputGroup} from "react-bootstrap";
import PrintJob from 'print-job';
import Barcode from "react-barcode";
import Pallet from "../objects/palletLabel";
import {Input} from "reactstrap";

class PalletLabel extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
          caseNumber: 0,
          skuNumber: 0,
            quantity: 0,
            pallets: [],
            labels: []
        };
        this.caseNumberOnChange = this.caseNumberOnChange.bind(this);
        this.skuNumberOnChange = this.skuNumberOnChange.bind(this);
        this.quantityOnChange = this.quantityOnChange.bind(this);
        this.GenerateLabels = this.GenerateLabels.bind(this);
        this.PrintLabels = this.PrintLabels.bind(this);
        this.AddButtonClicked = this.AddButtonClicked.bind(this);
        this.ClearButtonClicked = this.ClearButtonClicked.bind(this);
        this.DisplayList = this.DisplayList.bind(this);
        this.ProcessPallets = this.ProcessPallets.bind(this);

        window.addEventListener('afterprint', (e) => {
           let l = document.getElementById("labelContent");
           l.setAttribute("hidden", "");
        });
    }

    caseNumberOnChange(e)
    {
        const num = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = num;
        this.setState({caseNumber: num})
    }

    skuNumberOnChange(e)
    {
        const num = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = num;
        this.setState({skuNumber: e.target.value})
    }

    quantityOnChange(e)
    {
        const num = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = num;
        this.setState({quantity: e.target.value})
    }

    GenerateLabels()
    {

        if(this.state.caseNumber !== 0) {
            const label = this.ProcessForm();
        }

    }

    ProcessForm()
    {
        return(
            <div key={Math.random()}>
                <Barcode value={this.state.caseNumber} renderer="img" key={Math.random()} displayValue={true} height={50} />
                {this.state.skuNumber > 0 &&
                    <p>SKU: {this.state.skuNumber}</p>
                }
                {this.state.quantity > 0 &&
                    <p>Qty: {this.state.quantity}</p>
                }
            </div>
        );
    }

    ProcessPallets()
    {
        return(
            <div>
                {
                this.state.pallets.map((value, key) => (
                    <div key={Math.random()} style={{
                        display: "block",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "150mm",
                        height: "100mm"
                    }}>
                        <div><Barcode style={{maxWidth: "100mm", height: "auto"}} renderer={"img"} value={value.caseNumber} height={25} width={2}/></div>
                        <br/>
                        {value.skuNumber !== 0 ? <h3>SKU: {value.skuNumber}</h3> : ""}
                        <br/>
                        {value.quantity !== 0 ? <h3>Qty: {value.quantity}</h3> : ""}
                    </div>
                ))}
            </div>

        );
    }

    PrintLabels()
    {
        if(this.state.pallets.length === 0) return;

        const l = document.getElementById("labelContent");
        l.style.width = "100mm";
        const h = this.state.pallets.length * 100;
        l.style.height = h + "mm"
        const o = this.ProcessPallets();
        this.setState({labels: o});

        l.removeAttribute("hidden");

        //Print
        async function DelayPrint()
        {
            await new Promise(resolve => setTimeout(resolve, 1000));
            PrintJob.print("#labelContent")
        }
        DelayPrint();
    }



    AddButtonClicked(e)
    {
        const i = document.getElementById("caseNumberInput");
        if(this.state.caseNumber === 0) return;
        const p = new Pallet(this.state.caseNumber, this.state.skuNumber === 0 ? 0 : this.state.skuNumber, this.state.quantity === 0 ? 0 : this.state.quantity);
        this.state.pallets.push(p);

        this.setState({caseNumber: 0});
        i.value = "";

    }

    ClearButtonClicked(e)
    {
        this.setState({pallets: []});
        this.setState({labels: []})
        const l = document.getElementById("labelContent");
        l.style.width = "";
        l.style.height = "";
    }

    DisplayList()
    {
        return(
            <div>
                {this.state.pallets.length > 0 ?
                    <ListGroup horizontal>
                        {this.state.pallets.map((value, key) => (
                            <ListGroup.Item key={Math.random()}>
                                <div className="ms-2 me-auto">Case: {value.caseNumber}</div>
                                <div className="ms-2 me-auto">SKU: {value.skuNumber !== 0 ? value.skuNumber : "No SKU"}</div>
                                <div className="ms-2 me-auto">Qty: {value.quantity !== 0 ? value.quantity : "No Qty"}</div>
                            </ListGroup.Item>
                        ))}

                    </ListGroup>
                    :
                    <p>No Pallet Labels Entered</p>
                }
            </div>
        );
    }

    render() {
        return(
            <div style={{
                textAlign: "center"
            }}>
                <div>
                    <h1>
                        Pallet Labels
                    </h1>
                    <p>
                        Generate pallet label barcodes with SKU and quantity values printed
                    </p>
                </div>
                <hr/>
                <div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <InputGroup className="mb-3" style={{
                            marginLeft: "10px",
                            marginRight: "10px"
                        }}>
                            <InputGroup.Text id="inputGroup-CaseNumberText">Case Number</InputGroup.Text>
                            <Input
                                id="caseNumberInput"
                                aria-label="Case Number"
                                aria-describedby="inputGroup-CaseNumberText"
                                type="tel"
                                aria-required={true}
                                placeholder="123456"
                                onInput={this.caseNumberOnChange}
                                pattern="^-?[0-9]\d*\.?\d*$"
                            />
                        </InputGroup>

                        <InputGroup className="mb-3" style={{
                            marginLeft: "10px",
                            marginRight: "10px"
                        }}>
                            <InputGroup.Text id="inputGroup-SKUNumberText">SKU</InputGroup.Text>
                            <FormControl
                                id="skuInput"
                                aria-label="SKU"
                                aria-describedby="inputGroup-SKUNumberText"
                                type="tel"
                                aria-required={true}
                                placeholder="1234567"
                                onChange={this.skuNumberOnChange}
                            />
                        </InputGroup>

                        <InputGroup className="mb-3" style={{
                            marginLeft: "10px",
                            marginRight: "10px"
                        }}>
                            <InputGroup.Text id="inputGroup-QuantityText">Qty</InputGroup.Text>
                            <FormControl
                                id="quantityInput"
                                aria-label="Qty"
                                aria-describedby="inputGroup-QuantityText"
                                type="tel"
                                aria-required={true}
                                placeholder="36"
                                onChange={this.quantityOnChange}
                            />
                        </InputGroup>

                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <InputGroup style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Button style={{margin: "10px"}} variant="success" type="button" onClick={this.AddButtonClicked}>Add</Button>
                            <Button variant="danger" type="button" onClick={this.ClearButtonClicked}>Clear</Button>
                            <Button style={{margin: "10px"}} variant="warning" type="button" onClick={this.PrintLabels}>Print</Button>
                        </InputGroup>
                    </div>
                    <hr/>
                    <div>
                        <this.DisplayList/>
                    </div>
                    <div id="labelContent" hidden>
                        {this.state.labels}
                    </div>
                </div>
            </div>
        );
    }
}

export default PalletLabel;