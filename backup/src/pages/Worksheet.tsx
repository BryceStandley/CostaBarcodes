import React, {useRef, ReactNode} from "react";
import Button from "react-bootstrap/Button";
import {ShipmentManager, Shipment} from "../objects/shipment";
import Table from "react-bootstrap/Table";
// @ts-ignore
import Barcode from "react-barcode";
// @ts-ignore
import PrintJob from "print-job";


type WSState = {
    shipmentManager: ShipmentManager;
    contentRender: ReactNode;
};

class Worksheet extends React.Component<any, WSState>
{
    inputRef = useRef<HTMLTextAreaElement>(null!);
    inputDivRef = useRef<HTMLDivElement>(null!);
    genBtnDivRef = useRef<HTMLDivElement>(null!);
    contentDivRef = useRef<HTMLDivElement>(null!);

    constructor(props: any) {
        super(props);
        this.setState({shipmentManager: new ShipmentManager()});

        this.CreateSheetTable = this.CreateSheetTable.bind(this);
        this.GenerateOnClick = this.GenerateOnClick.bind(this);
        this.ResetInputs = this.ResetInputs.bind(this);
    }

    ResetInputs()
    {
        this.inputRef.current.value = "";
        this.inputDivRef.current.removeAttribute("hidden");
        this.genBtnDivRef.current.setAttribute("hidden", "");
        this.contentDivRef.current.setAttribute("hidden", "");

        this.setState({contentRender: null});

        this.state.shipmentManager.Clear();

    }

    GenerateOnClick()
    {
        this.state.shipmentManager.Populate(this.inputRef.current.value);
        const t = this.CreateSheetTable(this.state.shipmentManager.Get());
        this.inputDivRef.current.setAttribute("hidden", "");
        this.genBtnDivRef.current.removeAttribute("hidden");
        this.contentDivRef.current.removeAttribute("hidden");
        this.setState({contentRender: t});
    }

    PrintPage()
    {
        PrintJob.print("#content");
    }

    CreateSheetTable(shipments: Shipment[]): ReactNode
    {
        return(
            <Table bordered key={Math.random()} id="mainTable">
                <thead>
                <tr>
                    <th>Barcode</th>
                    <th>Shipment</th>
                    <th>Vendor</th>
                </tr>
                </thead>
                <tbody>
                {
                    shipments.map((value, key) => {
                        return(
                            <tr key={key}>
                                <td><Barcode value={value.shipmentNumber} height={50} renderer="img"/></td>
                                <td>{value.shipmentNumber}</td>
                                <td>{value.vendor}</td>
                            </tr>
                        )})
                }
                </tbody>
            </Table>
        );
    }

    render()
    {
        return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px'
                }}>
                    <div id="inputField" ref={this.inputDivRef}>
                        <h1>Receival Worksheet</h1>
                        <p>Copy and paste shipment numbers and vendor names from WMS into the text box and hit generate
                            to create a SCI like worksheet</p>

                        <textarea
                            name="mainInput"
                            id="mainInput"
                            ref={this.inputRef}
                            style={{
                                marginTop: '10px',
                                width: '90%',
                                height: '400px',
                            }}
                        />
                        <br/>
                        <Button variant="success" style={{margin: '30px'}} onClick={this.GenerateOnClick}>Generate</Button>
                    </div>
                    <div id="resetDiv" hidden ref={this.genBtnDivRef}>
                        <Button variant="primary" onClick={this.PrintPage} style={{
                            margin: '30px'
                        }}>Print</Button>
                        <Button variant="danger" onClick={this.ResetInputs}>Reset</Button>
                    </div>
                    <div>
                        <div id="content" hidden ref={this.contentDivRef}>
                            <hr/>
                            <h1>Receival Worksheet</h1>
                            {this.state.contentRender}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Worksheet;