import React, {useRef, useState, forwardRef, ReactNode, ClipboardEvent, useEffect, useMemo, useCallback} from "react";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faL } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection,  getDocs, query, where, deleteDoc, updateDoc, addDoc, doc} from 'firebase/firestore/lite';

import { useMediaQuery } from 'react-responsive'


import moment from 'moment';
import 'moment/locale/en-au';
import { SortDirection } from "ag-grid-community";
moment.locale('en-au');

library.add(faCalendarDay);

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MESUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseDB = getFirestore(firebaseApp);
const firebaseAnalytics = getAnalytics(firebaseApp);

function DeliveryBookings()
{
    document.title = 'Costa Barcodes | Bookings';
    const contentDivRef = useRef<HTMLDivElement>(null!);
    const [startDate, setStartDate] = useState(new Date());
    const [selectedBookingDate, setselectedBookingDate] = useState(new Date());
    const startDateRef = useRef<Date>(startDate);
    const selectedBookingDateRef = useRef<Date>(selectedBookingDate);
    const rescheduleDisable = useRef<boolean>(true);
    const deleteRowBtn = useRef<HTMLButtonElement>(null!);
    const rescheduleBtn = useRef<HTMLButtonElement>(null!);
    const arrivedBtn = useRef<HTMLButtonElement>(null!);
    const reloadBtn = useRef<HTMLButtonElement>(null!);

    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });
    const DateTimeRescheduleButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button disabled={props.disabled} id="rescheduleBtn" variant="primary" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>Reschedule</Button>
    });
    
    const selectedRow = useRef<any>(undefined);
    const recordTableRef = useRef<HTMLDivElement>(null!);
    const [rowData, setRowData] = useState<any>(null);
    const [tempRow, setTempRow] = useState({});
    const datePicker = useRef<DatePicker>(null!);
    const dateTimePicker = useRef<DatePicker>(null!);
    const rescheduling = useRef<boolean>(false);
    const totalPalletsForDate = useRef<HTMLSpanElement>(null!);
    const [editing, setEditing] = useState<boolean>(false);

    const isDesktopOrLaptop = useMediaQuery({query: '(min-width: 1224px)'})
    const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
    const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })

    // AG Grid API ref
    const gridRef = useRef<any>({});

    // Default Column value formatter for placeholder row and time column
    const formatter = (params) => {
        if (isEmptyPinnedCell(params)) 
        {
            return createPinnedCellPlaceholder(params);
        }
        else if(params.colDef.field === 'time')
        {
            let t = "0000";

            params.value === null ? t = "0000" : t = params.value;
            
            const hours = parseInt(t.slice(0, 2));
            const minutes = parseInt(t.slice(2));

            const ampm = hours >= 12 ? 'PM' : 'AM';
            const adjustedHours = hours > 12 ? hours - 12 : hours;
            const formattedMinutes = minutes === 0 ? "" : minutes < 10 ? `:0${minutes}` : ":" + minutes;

            return `${adjustedHours}${formattedMinutes}${ampm}`;

        }
        
    }

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'time',
            editable: true,
            sort: 'asc' as SortDirection,
            valueFormatter: formatter as any,
            
        },
        {
            field: 'deliveryName',
            editable: true,
            valueFormatter: formatter as any,
        },
        {
            headerName: 'PO/Description',
            field: 'purchaseOrder',
            editable: true,
            valueFormatter: formatter as any,
        },
        {
            field: 'pallets',
            editable: true,
            cellDataType: 'number',
            valueFormatter: formatter as any,
        },
    ]);

    // Check if placeholder cell is empty
    function isEmptyPinnedCell(params) {
        return (
            (params.node.rowPinned === 'top' && params.value == null) ||
            (params.node.rowPinned === 'top' && params.value === '')
        );
    }

    // Generating data for the placeholder row cells
    function createPinnedCellPlaceholder({ colDef }) {
        if(colDef.field === 'purchaseOrder')
        {
            return 'PO or Description...';
        }

        if(colDef.field === 'pallets')
        {
            return '38...'
        }

        return colDef.field[0].toUpperCase() + colDef.field.slice(1) + '...';
    }
    
    // Has the placeholder row data been completed
    function isPinnedRowDataCompleted(params) {
        if (params.rowPinned !== 'top') return;

        if(columnDefs.every((def) => tempRow[def.field]))
        {
            return true;
        }
        else if(tempRow['time'] && tempRow['deliveryName'] && tempRow['pallets'])
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    // Has row data been updated
    function hasRowDataChanged(params) {
        if (params.rowPinned !== undefined) return;
        return params.valueChanged;
    }

    // Cell Clicked event
    const cellClickedListener = useCallback( event => {
        if(event.rowPinned !== undefined) return;

        const row = event.api.getSelectedRows()[0];
        //console.log("Cell Clicked", row);
        if(row === undefined || editing)
        {
            //setSelectedRow(undefined);
            selectedRow.current = undefined;
            disableBtns();
        }
        else
        {
            //setSelectedRow(row);
            selectedRow.current = row;
            setselectedBookingDate(moment(row.datetime, 'YYYY-MM-DD hh:mm').toDate())
            selectedBookingDateRef.current = moment(row.datetime, 'YYYY-MM-DD hh:mm').toDate()
            enableBtns();
        }

    }, []);

    // DefaultColDef sets props common to all Columns
    //@ts-ignore
    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizeable: true,
        width: 984 / 4,
        cellStyle: {justifyContent: 'center'},
        suppressHorizontalScroll: true,
    }));

    function sizeToFit() {
        gridRef.current.api.sizeColumnsToFit();
      }

    // Row Styling
    const getRowStyle: any = useCallback(({node}) => { 
        if(node.rowPinned)
        {
            return { fontWeight: 'bold', fontStyle: 'italic', color: 'gray'};
        }
        else
        {
            return {};
        }
    },[]);

    // Row Styling Classes
    const getRowClass = params => {
        if(params.data.arrived)
        {
            return 'booking-grid-arrived';
        }
        return '';
    }

    // Row Styling Classes Rules
    const rowClassRules = {
        'booking-grid-arrived': 'data.arrived',
    }

    //On Row Editing Started Event
    const onRowEditingStarted = useCallback(async (params) => 
    {
        setEditing(true);
    },
    [rowData, tempRow]
    );

    // On Row Editing Stopped Event
    const onRowEditingStopped = useCallback(async (params) => 
    {
        if(params.rowPinned)
        {
            if (isPinnedRowDataCompleted(params)) 
            {
                setEditing(false);
                
                const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
                // Insert new record
                try {
                    let data = tempRow;
                    data['date'] = moment(startDateRef.current).format('L');
                    data['arrived'] = false;
                    data['time'] = convertTime(data['time']);
                    data['deliveryName'] = data['deliveryName'].toUpperCase();
                    data['purchaseOrder'] = data['purchaseOrder'].toUpperCase();
                    let dt = moment(startDateRef.current).format('L');
                    dt += " " + data['time'];
                    data['datetime'] = moment(dt, 'DD/MM/YYYY hhmm').format('YYYY-MM-DDThh:mm:ss');
                    await addDoc(col, tempRow).then(doc => {
                        console.log("Document Added Successfully with ID: ", doc.id);
                        tempRow['date'] = moment(startDateRef.current).format('L');
                        tempRow['id'] = doc.id;
                        tempRow['arrived'] = false;
                        tempRow['datetime'] = data['datetime'];
                    });
                    setRowData([...rowData, tempRow]);
                    setTempRow({});
                }
                catch (error) {
                    console.error(error);
                }

            }
        }
    },
    [rowData, tempRow]
    );

    const onRowValueChanged = useCallback(async (e) => {
        setEditing(false);
        if(!e.rowPinned)
        {
            //Update firebase record
            try {
                const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', e.data.id);
                const data = { time: convertTime(e.data.time), deliveryName: e.data.deliveryName.toUpperCase(), purchaseOrder: e.data.purchaseOrder.toUpperCase(), pallets: e.data.pallets };
                await updateDoc(d, data).then(() => {
                    console.log("Document Updated Successfully");
                    loadRecords(startDateRef.current);
                    selectedRow.current = undefined;
                    disableBtns();
                });
                    
            }
            catch (error) {
                console.error(error);
            }
        }
    }, []);
    
    //Converts a time string into the correct format
    function convertTime(time)
    {
        let t = time.split(/(?:AM|PM|:)/).join('');
        if(t.length > 4)
        {
            return "0000";
        }
        else if(t.length === 4)
        {
            return t;
        }
        else if(t.length === 3)
        {
            return "0" + t;
        }
        else if(t.length === 2)
        {
            return t + "00";
        }
        else if(t.length === 1)
        {
            return "0" + t + "00";
        }
        else
        {
            return t;
        }
    }

    // Load Records from firebase
    async function loadRecords(date)
    {
        const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
        await getDocs(query(col, where('date', '==', moment(date).format('L')))).then((snapshot) => {
            let lst: any = [];
            let total = 0;
            let totArr = 0;
            snapshot.docs.forEach((doc) => {
                let d = doc.data();
                d.id = doc.id;
                let dt = moment(date).format('L');
                dt += " " + d.time;
                d.datetime = moment(dt, 'DD/MM/YYYY hhmm').format('YYYY-MM-DD hh:mm');
                lst.push(d);
                const i = parseInt(d.pallets);
                if(!Number.isNaN(i))
                {
                    total += i
                    if(d.arrived)
                    {
                        totArr += i;
                    }
                }
            });
            setRowData(lst);
            totalPalletsForDate.current.innerHTML = "";
            const t = isDesktopOrLaptop ? '<span class=\'totalsSpans\'>Total Pallets: <span class=\'totalsSpansNumber\'>' + total.toString() + '</span></span>' : '<p class=\'totalsSpans\'>Total Pallets: <span class=\'totalsSpansNumber\'>' + total.toString() + '</span></p>' ;
            const a = isDesktopOrLaptop ? '<span class=\'totalsSpans\'>Total Arrived: <span class=\'totalsSpansNumber\'>' + totArr.toString() + '</span></span>' : '<p class=\'totalsSpans\'>Total Arrived: <span class=\'totalsSpansNumber\'>' + totArr.toString() + '</span></p>';
            const r = isDesktopOrLaptop ? '<span class=\'totalsSpans\'>Total Remaining: <span class=\'totalsSpansNumber\'>' + (total - totArr).toString() + '</span></span>' : '<p class=\'totalsSpans\'>Total Remaining: <span class=\'totalsSpansNumber\'>' + (total - totArr).toString() + '</span></p>';


            totalPalletsForDate.current.innerHTML = t + a + r;

            sizeToFit();
            //totalPalletsForDate.current.innerText = "Total Pallets: " + total.toString() + "    |    Total Arrived: " + totArr.toString() + '&nbsp;' +"|      Total Remaining: " + (total - totArr).toString();
        });
    }

    // Date selection changed handler
    const handleDateChanged = useCallback(async (e) => {
        setStartDate(e);
        startDateRef.current = e;
        loadRecords(e);
        selectedRow.current = undefined;
        disableBtns(); 
    },[]);

    // Date selection changed handler
    const handleBookingReschedule = useCallback(async (e) => {
        console.log(selectedBookingDateRef.current)
        if(selectedRow.current !== undefined && selectedBookingDateRef.current !== selectedRow.current.datetime)
        {
            //Reschedule to selected date/time and reload to current date set
            // Update Date/time
            try {
                const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
                const data = { date: moment(selectedBookingDateRef.current).format('L'), time: moment(selectedBookingDateRef.current).format('hhmm'), datetime: moment(selectedBookingDateRef.current).format('YYYY-MM-DD hh:mm')};
                await updateDoc(d, data).then(() => {
                    console.log("Document Rescheduled Successfully");
                    loadRecords(startDateRef.current);
                    selectedRow.current = undefined;
                    disableBtns();
                });
            }
            catch (error) {
                console.error(error);
            }
        }
 
    },[]);

    //Enable Buttons
    const enableBtns = () => {
        deleteRowBtn.current.removeAttribute('disabled');
        document.getElementById('rescheduleBtn')?.removeAttribute('disabled');
        dateTimePicker.current.disabled = false;
        rescheduleDisable.current = false;
        arrivedBtn.current.removeAttribute('disabled');
    }

    // Disable Buttons
    const disableBtns = () => {
        deleteRowBtn.current.setAttribute('disabled', 'true');
        document.getElementById('rescheduleBtn')?.setAttribute('disabled', 'true');
        dateTimePicker.current.disabled = true;
        rescheduleDisable.current = true;
        arrivedBtn.current.setAttribute('disabled', 'true');
    }

    // Delete Selected Row
    const onDeleteBtnClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
            const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
            await deleteDoc(d).then(() => {
                console.log("Document", selectedRow.current.id, "deleted");
                loadRecords(startDateRef.current);
                selectedRow.current = undefined;
                disableBtns();
            });
        }
        catch (error) {
            console.error(error);
        }
        
    }

    // Reschedule Button Click Event
    const onRescheduleBtnClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        rescheduling.current = true;
        dateTimePicker.current.input.click();
    }

    const onReloadBtnClick = async (e) => {
        handleDateChanged(startDateRef.current);
    }

    // Toggle Arrived Button Click Event
    const onArrivedBtnClick = async (e) => {
        if(selectedRow.current !== undefined)
        {
            try {
                const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
                const data = { arrived: !selectedRow.current.arrived };
                await updateDoc(d, data).then(() => {
                    console.log("Document Updated Successfully - Arrived Toggle");
                    loadRecords(startDateRef.current);
                    selectedRow.current = undefined;
                    disableBtns();
                });
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    const onGridReady = async () => {
        await loadRecords(new Date());
        //@ts-ignore
        document.getElementById('deletebtn').onclick = onDeleteBtnClick;
        //@ts-ignore
        document.getElementById('rescheduleBtn').onclick = handleBookingReschedule;
        //@ts-ignore
        document.getElementById('arrivedBtn').onclick = onArrivedBtnClick;
        //@ts-ignore
        document.getElementById('reloadBtn').onclick = onReloadBtnClick;

    };
    //<Button disabled variant="primary" id={'rescheduleBtn'} style={{margin: '30px'}} ref={rescheduleBtn} type={'submit'}>Reschedule</Button>

    // Render
    return(
            <div>
                <div style={{
                    textAlign: 'center',
                    margin: '30px',
                    paddingBottom: '100px'
                }}>
                    <div>
                        <h1>Delivery Bookings</h1>
                        <hr/>
                        <p>Create & Manage delivery bookings</p>
						<div ref={contentDivRef}>
                            <DatePicker
                                id={'datePickler'}
                                ref={datePicker}
                                selected={startDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(e) => handleDateChanged(e)}
                                customInput={<DatePickerButton />}
                                todayButton="Today"
                                withPortal
                            />
                        </div>
                        <div>
                            <span ref={totalPalletsForDate}></span>
                        </div>
                        <Button disabled variant="danger" id={'deletebtn'} style={{margin: '30px'}} ref={deleteRowBtn} type={'submit'}>Delete</Button>
                        
                        <div style={{display: 'inline-block'}}>
                            <DatePicker
                                    id={'rescheduleDateTimePicker'}
                                    ref={dateTimePicker}
                                    selected={selectedBookingDate}
                                    disabled={(selectedRow.current ? false : true)}
                                    showTimeSelect
                                    dateFormat="yyyy-MM-dd hh:mm"
                                    onChange={(e) => {setselectedBookingDate(e); selectedBookingDateRef.current = e}}
                                    onCalendarClose={(e) => handleBookingReschedule(e)}
                                    customInput={<DateTimeRescheduleButton />}
                                    todayButton="Today"
                                    withPortal
                                    
                                />
                        </div>
                        
                        <Button disabled variant="success" id={'arrivedBtn'} style={{margin: '30px'}} ref={arrivedBtn} type={'submit'}>Toggle Arrived</Button>
                        <Button variant="warning" id={'reloadBtn'} style={{margin: '30px'}} ref={reloadBtn} type={'submit'}>Reload Records</Button>
                        
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <div ref={recordTableRef} className="ag-theme-alpine, bookingGrid" style={{height: 500, width: 1000}}>
                                <AgGridReact

                                    ref={gridRef}
                                    rowData={rowData}
                                    
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    rowSelection={'single'}
                                    rowMultiSelectWithClick={true}

                                    animateRows={true}
                                    editType={'fullRow'}
                                    stopEditingWhenCellsLoseFocus={true}
                                    pinnedTopRowData={[tempRow]}
                                    
                                    getRowStyle={getRowStyle}
                                    getRowClass={getRowClass}

                                    rowClassRules={rowClassRules}

                                    onRowEditingStopped={onRowEditingStopped}
                                    onRowValueChanged={onRowValueChanged}
                                    onCellClicked={cellClickedListener}
                                    onRowEditingStarted={onRowEditingStarted}
                                    onGridReady={onGridReady}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

}

export default DeliveryBookings;