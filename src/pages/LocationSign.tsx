import React, {useRef, useState, ReactNode} from "react";
import { Button, InputGroup, FormGroup, Form} from "react-bootstrap";
import {Input} from "reactstrap";
import './LocationSign.css'
import jsPDF from "jspdf";
// @ts-ignore
import bwip from "bwip-js";

function LocationSign()
{

	const inputRef = useRef<HTMLDivElement>(null!);
	const resetBtnRef = useRef<HTMLDivElement>(null!);
	const viewerRef = useRef<HTMLDivElement>(null!);
    const pdfDoc = useRef<string>("");
	const [pdfViewer, setPdfViewer] = useState<ReactNode>([]);

	const locationRef = useRef<HTMLInputElement>(null!);
	const descRef = useRef<HTMLInputElement>(null!);
	const skuRef = useRef<HTMLInputElement>(null!);
	const [validated, setValidated] = useState<boolean>(false);

	const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (locationRef.current.value) {
			locationRef.current.value = locationRef.current.value.toUpperCase();
            GenerateOnClick();
			setPdfViewer(DisplayViewer());
        }
		
		
		setValidated(true);

    };

	function GenerateOnClick()
    {
		const doc = new jsPDF({
            orientation: "l",
            format: "a4"
        })

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();


            let canvas = document.createElement('canvas');
            bwip.toCanvas(canvas, {
                bcid: "code128",
                text: locationRef.current.value,
                parse: true,
                });

            doc.setFontSize(60);
            doc.text(locationRef.current.value,
                (pageWidth/2) - doc.getTextWidth(locationRef.current.value)/2,
                (pageHeight/4)
                );

            doc.addImage(canvas.toDataURL('image/png'), 'image/png', 
                (pageWidth/2) - ((canvas.width) / 2),
                ((pageHeight/4) * 2) - ((canvas.height / 2) /2),
                (canvas.width),
                (canvas.height / 4)
                );

			doc.setFontSize(48);
            doc.text(descRef.current.value,
                (pageWidth/2) - doc.getTextWidth(descRef.current.value)/2,
                ((pageHeight/5) * 3) + doc.getTextDimensions(descRef.current.value).h
                );

			doc.setFontSize(38);
			const sku = "SKU: " + skuRef.current.value;
			doc.text(sku,
				(pageWidth/2) - doc.getTextWidth(sku)/2,
				((pageHeight/5) * 4) + doc.getTextDimensions(sku).h
				);

		pdfDoc.current = doc.output("dataurlstring");
    }

	function DisplayViewer()
	{
		resetBtnRef.current.removeAttribute('hidden');
		inputRef.current.setAttribute('hidden', '');
		viewerRef.current.removeAttribute('hidden');

		const doc = pdfDoc.current +"#zoom=70"
		return(
			<div>
				<object data={doc} type="application/pdf"  style={{width: '85%', height: '625px'}}>Error loading PDF</object>
			</div>
		);
	}

	function ResetOnClick()
	{
		resetBtnRef.current.setAttribute('hidden', '');
		viewerRef.current.setAttribute('hidden', '');
		inputRef.current.removeAttribute('hidden');
		locationRef.current.value = "";
		descRef.current.value = "";
		pdfDoc.current = "";
		skuRef.current.value = "";
		setPdfViewer([]);
		setValidated(false);
	}

	document.title = 'Costa Barcodes | Location Sign';

	return(
		<div>
			<div style={{
				textAlign: 'center',
				margin: '30px'
			}}>
				<div>
					<h1>Location Signage</h1>
					<hr/>
					<p>Generate a temporary location sign with barcode and product description. <strong>Description</strong> and <strong>SKU</strong> are optional</p>
					<div ref={inputRef}>
						<Form noValidate validated={validated} onSubmit={handleSubmit}>
							<FormGroup>
								<div className="locationSignForm" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
									<InputGroup style={{margin: '10px'}}>
										<InputGroup.Text id="ig-location">Location</InputGroup.Text>
										<Input id="locationInput" name="locationInput" innerRef={locationRef}  required={true} type="text"/>
									</InputGroup>
									<Form.Control.Feedback type="invalid"/>

									<InputGroup style={{margin: '10px' }}>
										<InputGroup.Text id="ig-description">Description</InputGroup.Text>
										<Input id="descInput" name="descInput" innerRef={descRef} required={false} type="text" />
									</InputGroup>
									<Form.Control.Feedback type="invalid"/>

									<InputGroup style={{margin: '10px'}}>
										<InputGroup.Text id="ig-sku">SKU</InputGroup.Text>
										<Input id="skuInput" name="skuInput" innerRef={skuRef} required={false} type="text" />
									</InputGroup>
									<Form.Control.Feedback type="invalid"/>
								</div>
							</FormGroup>

							<div style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<Button variant="success" style={{margin: '30px'}}  type="submit">Generate</Button>
							</div>
						</Form>
						<br/>
					</div>
					<div ref={resetBtnRef} hidden>
						<Button variant="danger" style={{margin: '30px'}}  onClick={ResetOnClick}>Reset</Button>
					</div>
					<div hidden ref={viewerRef}>
						{pdfViewer}
					</div>
				</div>
			</div>
		</div>
	);
}

export default LocationSign;