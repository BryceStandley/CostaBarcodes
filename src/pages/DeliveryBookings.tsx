import React, {useRef, useState, forwardRef, ReactNode, ClipboardEvent,} from "react";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import bookingRecord from "../objects/bookingRecord";

// @ts-ignore
import { Utils } from 'Utils';

library.add(faCalendarDay);



function DeliveryBookings()
{
    const contentDivRef = useRef<HTMLDivElement>(null!);
    const [startDate, setStartDate] = useState(new Date());
    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });

    const recordTableRef = useRef<HTMLDivElement>(null!);
    const [recordTable, setRecordTable] = useState(null!);
    const [loadedRecords, setLoadedRecords] = useState<bookingRecord[] | null>()

    async function AdjustBookingTime(id, newTime)
    {
        //find and update the time of the booking
        //update table
    }

    async function RescheduleBooking(id, newDate, newTime)
    {
        //find and update record with new date and time
        //remove record from loaded records if not the current selected day
        //update table
    }

    async function ToggleHasArrived(id)
    {
        //toggle booking has arrived
        //update table
    }

    function BuildRecordTable()
    {
        //build table
    }

    async function loadNewRecords(date)
    {
        const d = date.getDate();
        const m = date.getMonth()  +1;
        const y = date.getFullYear();
        const fullDate = d +"/" + m + "/" + y;
        if(loadedRecords !== null)
        {
            //check for loaded records at current date
        }
        setLoadedRecords(null);
        //fetch new records from the db
        //set new records
        //build table
    }

	document.title = 'Costa Barcodes | Bookings';

    const handleDateChanged = (e) => {
        setStartDate(e);
        
        loadNewRecords(e);
    }

    return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px'
                }}>
                    <div>
                        <h1>Delivery Bookings</h1>
                        <hr/>
                        <p>Create & Manage delivery bookings</p>
						<div ref={contentDivRef}>
                            <DatePicker
                                selected={startDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(e) => handleDateChanged(e)}
                                customInput={<DatePickerButton />}
                                todayButton="Today"
                                withPortal
                            />
                        </div>
                        <div ref={recordTableRef}>
                            {recordTable}
                        </div>
                    </div>
                </div>
            </div>
        );

}

export default DeliveryBookings;