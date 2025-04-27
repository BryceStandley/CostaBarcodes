
import React, { useRef, useState, forwardRef, useCallback } from "react";
import { Button, Form, FormGroup, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCode } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { Tooltip } from 'react-tooltip';
import DatePicker from "react-datepicker";

import ftgTemplate from "../objects/ftgTemplate";

import moment from 'moment';
import 'moment/locale/en-au';
import { Input } from "reactstrap";

moment.locale('en-au');
library.add(faCalendarDay);

interface FreshToGoProps {
}


const FreshToGo: React.FC<FreshToGoProps> = () => {


    const formRef = useRef<HTMLFormElement>(null!);
    const ftgTemplateRef = useRef<HTMLTextAreaElement>(null!);
    const [ftgTemplateValue, setFtgTemplateValue] = useState(ftgTemplate);
    const [ftgTemplateShowing, setFtgTemplateShowing] = useState<boolean>(false);
    const ftgQtyRef = useRef<HTMLInputElement>(null!);
    const ftgDateRef = useRef<Date>(new Date());
    const [validated, setValidated] = useState<boolean>(false);
    const [ftgDate, setFtgDate] = useState(new Date());
    const ftgDatePickerRef = useRef<DatePicker>(null!);


    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button className='selectDateButton' variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });

    function fillTemplate(template: string, data: Record<string, string | number>): string {
        return template.replace(/{(.*?)}/g, (_, key: string) => {
        return key in data ? String(data[key]) : "";
        });
    }

    const GenerateInterfaceXML = () => {
        var date = moment(ftgDateRef.current).format("DDMMYYYY");
        //var filledXml = ftgTemplate.replace("{date}", date).replace("{qty}", ftgQtyRef.current.value);

        const data = {
            date: date,
            qty: ftgQtyRef.current.value
        };
        console.log(data);

        var filledXml = fillTemplate(ftgTemplateValue, data);

        const blob = new Blob([filledXml], { type: "text/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PER-CO-FTG-FreshToGo-${moment(ftgDateRef.current).format("DD-MM-YYYY")}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        ftgQtyRef.current.value = "0";

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(ftgQtyRef.current.value && Number(ftgQtyRef.current.value) > 0)
        {
            setValidated(true);
            console.log(ftgQtyRef.current.value);
            console.log(ftgDateRef.current);
            console.log(ftgDate);
            GenerateInterfaceXML();
        }

        setValidated(false);
    }

    
    const handleTemplateUpdate = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setFtgTemplateValue(ftgTemplateRef.current.value);
        console.log(ftgTemplateRef.current.value);
    },[]);

    const handleTemplateClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setFtgTemplateShowing(!ftgTemplateShowing);
    },[ftgTemplateShowing]);


    // Date selection changed handler
    const handleDateChanged = useCallback(async (e) => {
        setFtgDate(e);
        ftgDateRef.current = e;
        
    },[]);

    return (
        <div>
                <div style={{
                    textAlign: "center",
                    margin: '30px',
                    paddingBottom: '100px'
                }}>
                    <h1>Fresh To Go</h1>
                    <p>Creates a Scale Interface XML file to create a Fresh To Go Receipt to be received.</p>
                    <p>Place exported XML file into the Scale input folder to be interfaced.</p>
                    <hr />

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <FormGroup>
                        <DatePicker
                        id={'datePickler'}
                        ref={ftgDatePickerRef}
                        selected={ftgDate}
                        dateFormat="dd/MM/yyyy"
                        onChange={(e) => handleDateChanged(e)}
                        customInput={<DatePickerButton />}
                        todayButton="Today"
                        withPortal
                        />
                        <InputGroup style={{margin: '10px'}}>
                            <InputGroup.Text id="ig-quantity">Quantity</InputGroup.Text>
                            <Input id="quantityInput" name="quantityInput" innerRef={ftgQtyRef}  required={true} type="number" defaultValue={0}/>
                        </InputGroup>
                        <Form.Control.Feedback type="invalid"/>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Button style={{margin: "30px"}} variant="success" type="submit">Generate</Button>
                            
                        </div>
                        </FormGroup>
                    </Form>


                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Button style={{margin: "30px"}} variant="primary" type="button" onClick={handleTemplateClick}><FontAwesomeIcon icon={faCode} style={{paddingRight: '10px'}}/>View Template</Button>
                    </div>
                    <div>
                        { ftgTemplateShowing ? <div>
                                <InputGroup style={{margin: '10px', height: '300px'}}>
                                    <Input id="templateInput" name="templateInput" innerRef={ftgTemplateRef}  required={true} type="textarea" defaultValue={ftgTemplateValue}/>
                                </InputGroup>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Button style={{margin: "30px"}} variant="success" type="button" onClick={handleTemplateUpdate}>Update Template</Button>
                                    
                                </div>
                            </div>
                        : null}
                    </div>
                </div>
            </div>
    );
}

export default FreshToGo;