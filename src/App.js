import './App.css';
import * as ReactDOM from "react-dom/client";
import NavigationBar from './components/navbar';
import Button from 'react-bootstrap/Button';
import { ShipmentManager } from './objects/shipment'
import Table from 'react-bootstrap/Table';
import PrintJob from 'print-job';

function App() {

    let shipmentManager = new ShipmentManager();

    function GenerateSheet()
    {
        let input = document.getElementById("mainInput").value;
        shipmentManager.Populate(input);
        let i = document.getElementById("inputField");
        let r = document.getElementById("resetDiv");
        const t = CreateSheetTable(shipmentManager.Get());
        const root = ReactDOM.createRoot(document.getElementById("contentRender"));
        root.render(t);
        i.setAttribute("hidden","");
        r.removeAttribute("hidden");
    }

    function ResetInputs()
    {
        let t = document.getElementById("mainInput");
        t.value = "";
        let i = document.getElementById("inputField");
        i.removeAttribute("hidden");
        let r = document.getElementById("resetDiv");
        r.setAttribute("hidden","");
        let c = document.getElementById("contentRender");
        c.innerHTML = "";

    }

    function PrintPage()
    {
        let t = document.getElementById("contentRender");
        PrintJob.print(t);
    }

    //style={{backgroundImage: `url(${value.barcodeURL})`}}
    function CreateSheetTable(shipments)
    {
        return(
            <Table bordered>
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
                        return (
                            <tr key={key}>
                                <td className="barcode"><img alt="Barcode" width="100%" height="100%" align="center" src={value.barcodeURL}/> </td>
                                <td>{value.shipmentNumber}</td>
                                <td>{value.vendor}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </Table>
        );
    }

    return (
        <div>
            <NavigationBar />
            <div style={{textAlign: 'center',
                margin: '30px'}}>
                <div id="inputField">
                    <h1>Receival Worksheet</h1>
                    <p>Copy and paste shipment numbers and vendor names from WMS into the text box and hit generate to create a SCI like worksheet</p>
                    <textarea
                        name="mainInput"
                        id="mainInput"
                        style={{
                            width: '90%',
                            height: '400px',
                        }}
                    />
                    <br/>
                    <Button variant="success" style={{margin: '30px'}} onClick={GenerateSheet}>Generate</Button>
                </div>
                <div id="resetDiv" hidden >
                    <Button variant="primary" onClick={PrintPage}style={{
                        margin: '30px'
                    }}>Print</Button>
                    <Button variant="danger" onClick={ResetInputs}>Reset</Button>
                </div>
                <hr/>
                <div>
                    <div id="contentRender">

                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
