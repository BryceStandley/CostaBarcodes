
import React, {ReactNode} from "react";
import {Button} from "react-bootstrap";
import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHeartCrack} from "@fortawesome/free-solid-svg-icons";

type BGState = {
    barcode: string;
    errorCode: ReactNode;
}

class BarcodeGen extends React.Component<any, BGState>
{
    constructor(props: any) {
        super(props);
        this.GenerateOnClick = this.GenerateOnClick.bind(this);

        library.add(faHeartCrack);
    }

    CreateErrorCode()
    {
        return(
            <p>
                <FontAwesomeIcon icon="heart-crack"/>
                ...Too bad so sad... This page is still a work in progress and currently unavailable... Stop snooping...
                <FontAwesomeIcon icon="heart-crack"/>
            </p>
        );
    }

    GenerateOnClick()
    {
        this.setState({errorCode: this.CreateErrorCode()})
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
                        <h1>General Barcode Creator</h1>
                        <p>Generate a general barcode for any type of use. Select from the basic barcode type presets and options, enter the barcode data and press generate to create a printable PDF with the containing barcode</p>
                        <hr />
                        <div>{this.state.errorCode}</div>
                        <br />
                        <Button style={{margin: "30px"}} variant="success" type="button" onClick={this.GenerateOnClick}>Generate</Button>
                    </div>
                </div>
            </div>
        );
    }


}

export default BarcodeGen;