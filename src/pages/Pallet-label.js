import React, { useState } from "react";
import { Button, Form} from "react-bootstrap";
import PrintJob from 'print-job';
import Barcode from "react-barcode";

function PalletLabel()
{
    const [caseNumber, setCaseNumber] = useState(0);
    const [skuNumber, setSkuNumber] = useState(0);
    const [quantity, setQuantity] = useState(0);

    const [labelPreview, setLabelPreview] = useState([]);

    const caseNumberOnChange = e => {
        setCaseNumber(e.target.value);
    }

    const skuNumberOnChange = e => {
        setSkuNumber(e.target.value);
    }

    const quantityOnChange = e => {
        setQuantity(e.target.value);
    }

    function Clear()
    {
        setLabelPreview([...labelPreview, []]);
    }

    function GenerateLabel()
    {
        Clear();

        if(caseNumber !== 0) {
            const label = ProcessForm();
            setLabelPreview([...labelPreview, label])
        }

    }

    function ProcessForm()
    {
        return(
            <div key={Math.random()}>
                <Barcode value={caseNumber} renderer="img" key={Math.random()} displayValue={true} height={50} />
                {skuNumber > 0 &&
                    <p>SKU: {skuNumber}</p>
                }
                {quantity > 0 &&
                    <p>Qty: {quantity}</p>
                }
            </div>
        );
    }

    function PrintLabel()
    {

    }

    const handleSubmit = event => {
        event.preventDefault();
        GenerateLabel();
    };

    function RenderPage()
    {
        return(
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Form>
                        <Form.Group className="mb-3" controlId="caseNumber">
                            <Form.Label>Case Number/License Plate</Form.Label>
                            <Form.Control type="number" placeholder="1234567" onChange={caseNumberOnChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="skuNumber">
                            <Form.Label>SKU</Form.Label>
                            <Form.Control type="number" placeholder="1234567" onChange={skuNumberOnChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="quantityNumber">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" placeholder="36" onChange={quantityOnChange}/>
                        </Form.Group>
                        <Button variant="success" onClick={GenerateLabel} type="button" style={{marginTop: "10px"}}>Generate</Button>
                    </Form>
                </div>
                <hr/>
                <div>
                    {labelPreview}
                </div>
            </div>
        );
    }

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
            <p>Current Work In Progress</p>
        </div>
    )
}

export default PalletLabel;