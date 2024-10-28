import React, {useRef, useState, forwardRef, useMemo, useCallback} from "react";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import { Tooltip } from 'react-tooltip'
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
    const copyBtn = useRef<HTMLButtonElement>(null!);

    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button className='selectDateButton' variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });
    const DateTimeRescheduleButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button className='rescheduleButton' disabled={props.disabled} id="rescheduleBtn" variant="primary" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>Reschedule</Button>
    });
    
    const selectedRow = useRef<any>(undefined);
    const recordTableRef = useRef<HTMLDivElement>(null!);
    const [rowData, setRowData] = useState<any>([]);
    const [tempRow, setTempRow] = useState({});
    const datePicker = useRef<DatePicker>(null!);
    const dateTimePicker = useRef<DatePicker>(null!);
    const totalPalletsForDate = useRef<HTMLSpanElement>(null!);
    const [editing, setEditing] = useState<boolean>(false);

    const [totalPallets, setTotalPallets] = useState<string>('');
    const [totalReceived, setTotalReceived] = useState<string>('');
    const [totalRemaining, setTotalRemaining] = useState<string>('');
    const [totalUnconfirmed, setTotalUnconfirmed] = useState<string>('');
    const [totalConfirmed, setTotalConfirmed] = useState<string>('');

    const isDesktopOrLaptop = useMediaQuery({query: '(min-width: 1224px)'})

    firebaseAnalytics.app.automaticDataCollectionEnabled = true;
    
    
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

    // Load Records from firebase
    const loadRecords = useCallback( async (date) => {
        const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
        await getDocs(query(col, where('date', '==', moment(date).format('L')))).then((snapshot) => {
            let lst: any = [];
            let total = 0;
            let totArr = 0;
            let totUnConf = 0;
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
                    //console.log(d.transport);
                    if(d.transport === undefined || d.transport === '' || d.transport === null)
                    {
                        totUnConf += i;
                    }
                }
            });
            setRowData(lst);
            setTotalPallets(total.toString());
            setTotalReceived(totArr.toString());
            setTotalRemaining((total - totArr).toString());
            setTotalUnconfirmed(totUnConf.toString());
            setTotalConfirmed((total - totUnConf).toString());
            sizeToFit();
        });
    },[]);

    

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'time',
            editable: true,
            sort: 'asc' as SortDirection,
            valueFormatter: formatter as any,
            
        },
        {
            headerName: 'Transport',
            field: 'transport',
            editable: true,
            valueFormatter: formatter as any,
        },
        {
            headerName: 'Delivery/Vendor',
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
            return 'PO/Description...';
        }
        if(colDef.field === 'deliveryName')
        {
            return 'VENDOR NAME...';
        }
        if(colDef.field === 'transport')
        {
            return 'TRANSPORT COMPANY...';
        }

        if(colDef.field === 'pallets')
        {
            return 'PALLET COUNT...'
        }

        return colDef.field.toUpperCase() + '...';
    }
    

    // Cell Clicked event
    const cellClickedListener = useCallback( event => {
        if(event.rowPinned !== undefined) return;

        const row = event.api.getSelectedRows()[0];
        if(row === undefined || editing)
        {
            selectedRow.current = undefined;
            disableBtns();
        }
        else
        {
            selectedRow.current = row;
            setselectedBookingDate(moment(row.datetime, 'YYYY-MM-DD hh:mm').toDate())
            selectedBookingDateRef.current = moment(row.datetime, 'YYYY-MM-DD hh:mm').toDate()
            enableBtns();
        }

    }, [selectedRow, editing]);

    // DefaultColDef sets props common to all Columns
    //@ts-ignore
    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true,
        width: 1000 / 5,
        cellStyle: {justifyContent: 'center'},
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
        
    },[]);

    // On Row Editing Stopped Event
    const onRowEditingStopped = useCallback(async (params) => 
    {
        // Has the placeholder row data been completed
        const isPinnedRowDataCompleted = (params) => {
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
                    data['transport'] = data['transport'] ===  undefined ? null : data['transport'].toUpperCase();
                    data['deliveryName'] = data['deliveryName'].toUpperCase();
                    data['purchaseOrder'] = data['purchaseOrder'].toUpperCase();
                    let dt = moment(startDateRef.current).format('L');
                    dt += " " + data['time'];
                    data['datetime'] = moment(dt, 'DD/MM/YYYY hhmm').format('YYYY-MM-DDThh:mm:ss');
                    await addDoc(col, data).then(doc => {
                        //console.log("Document Added Successfully with ID: ", doc.id);
                        tempRow['date'] = moment(startDateRef.current).format('L');
                        tempRow['id'] = doc.id;
                        tempRow['arrived'] = false;
                        tempRow['datetime'] = data['datetime'];
                    });
                    setRowData([...rowData, tempRow]);
                    setTempRow({});
                    loadRecords(startDateRef.current);
                }
                catch (error) {
                    console.error(error);
                }

            }
        }
    },[rowData, tempRow, columnDefs, loadRecords]);

    const onRowValueChanged = useCallback(async (e) => {
        setEditing(false);
        if(!e.rowPinned)
        {
            //Update firebase record
            try {
                const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', e.data.id);
                const data = { time: convertTime(e.data.time), transport: e.data.transport === null ? null : e.data.transport.toUpperCase(), deliveryName: e.data.deliveryName.toUpperCase(), purchaseOrder: e.data.purchaseOrder.toUpperCase(), pallets: e.data.pallets };
                await updateDoc(d, data).then(() => {
                    loadRecords(startDateRef.current);
                    selectedRow.current = undefined;
                    disableBtns();
                });
                    
            }
            catch (error) {
                console.error(error);
            }
        }
    }, [loadRecords]);
    
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

    

    // Date selection changed handler
    const handleDateChanged = useCallback(async (e) => {
        setStartDate(e);
        startDateRef.current = e;
        loadRecords(e);
        selectedRow.current = undefined;
        disableBtns(); 
    },[loadRecords]);

    // Date selection changed handler
    const handleBookingReschedule = useCallback(async (e) => {
        if(selectedRow.current !== undefined && selectedBookingDateRef.current !== selectedRow.current.datetime)
        {
            try {
                const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
                const data = { date: moment(selectedBookingDateRef.current).format('L'), time: moment(selectedBookingDateRef.current).format('hhmm'), datetime: moment(selectedBookingDateRef.current).format('YYYY-MM-DD hh:mm')};
                await updateDoc(d, data).then(() => {
                    loadRecords(startDateRef.current);
                    selectedRow.current = undefined;
                    disableBtns();
                });
            }
            catch (error) {
                console.error(error);
            }
        }
    },[loadRecords]);

    //Enable Buttons
    const enableBtns = () => {
        deleteRowBtn.current.removeAttribute('disabled');
        document.getElementById('rescheduleBtn')?.removeAttribute('disabled');
        dateTimePicker.current.disabled = false;
        rescheduleDisable.current = false;
        arrivedBtn.current.removeAttribute('disabled');
        copyBtn.current.removeAttribute('disabled');
    }

    // Disable Buttons
    const disableBtns = () => {
        deleteRowBtn.current.setAttribute('disabled', 'true');
        document.getElementById('rescheduleBtn')?.setAttribute('disabled', 'true');
        dateTimePicker.current.disabled = true;
        rescheduleDisable.current = true;
        arrivedBtn.current.setAttribute('disabled', 'true');
        copyBtn.current.setAttribute('disabled', 'true');
    }

    const onGridReady = useCallback(async () => {
        // Toggle Arrived Button Click Event
        const onArrivedBtnClick = async (e) => {
            if(selectedRow.current !== undefined)
            {
                try {
                    const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
                    const data = { arrived: !selectedRow.current.arrived };
                    await updateDoc(d, data).then(() => {
                        //console.log("Document Updated Successfully - Arrived Toggle");
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

        // Copy Record Button Click Event - Currently duplicates the record that then can be rescheduled to a different day
        const onCopyBtnClick =  async (e) => {
            if(selectedRow.current !== undefined)
                {
                    //Duplicate to selected booking and reload
                    try {
                        const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
                        let data = {
                            date: selectedRow.current.date,
                            time: selectedRow.current.time,
                            datetime: selectedRow.current.datetime,
                            arrived: selectedRow.current.arrived,
                            transport: selectedRow.current.transport,
                            deliveryName: selectedRow.current.deliveryName,
                            purchaseOrder: selectedRow.current.purchaseOrder,
                            pallets: selectedRow.current.pallets
                        }
                        await addDoc(col, data).then(() => {
                            handleDateChanged(startDateRef.current);
                            selectedRow.current = undefined;
                            disableBtns();
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
        }

        // Reload Records Button Click Event
        const onReloadBtnClick = async (e) => {
            handleDateChanged(startDateRef.current);
        }

        // Delete Selected Row
        const onDeleteBtnClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            //const col = collection(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings');
            const d = doc(firebaseDB, process.env.REACT_APP_IS_PROD === '1' ? 'deliveryBookings' : 'dev_deliveryBookings', selectedRow.current.id);
            await deleteDoc(d).then(() => {
                //console.log("Document", selectedRow.current.id, "deleted");
                loadRecords(startDateRef.current);
                selectedRow.current = undefined;
                disableBtns();
            });
        }
        catch (error) {
            console.error(error);
        }
        
    }

        await loadRecords(new Date()).then(() => {
            deleteRowBtn.current !== null ? deleteRowBtn.current.onclick = onDeleteBtnClick : console.warn('Delete Button ref is null');
            rescheduleBtn.current !== null ? rescheduleBtn.current.onclick = handleBookingReschedule : console.warn('Reschedule Button ref is null');
            arrivedBtn.current !== null ? arrivedBtn.current.onclick = onArrivedBtnClick : console.warn('Arrived Button ref is null');
            reloadBtn.current !== null ? reloadBtn.current.onclick = onReloadBtnClick : console.warn('Reload Button ref is null');
            copyBtn.current !== null ? copyBtn.current.onclick = onCopyBtnClick : console.warn('Copy Button ref is null');
        })
    },[loadRecords, handleBookingReschedule, handleDateChanged]);

    const onCellEditingStarted = useCallback((e) => {
    },[])

    const onCellEditingStoped = useCallback((e) => {
    },[])

    // Render
    return(
            <div className={"pageContainer"}>
                <div style={{
                    textAlign: 'center',
                    margin: '30px',
                    paddingBottom: '100px'
                }}>
                    <div>
                        <h1>Delivery Bookings</h1>
                        <hr/>
                        <p>Create & Manage delivery bookings</p>
                        <em>Note: Booking is Unconfirmed if no Transport is entered</em>
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
                            <span ref={totalPalletsForDate}>
                                {isDesktopOrLaptop ?
                                    <div>
                                        <span className="totalsSpans">Pallets: <span className="totalsSpansNumber">{totalPallets} </span></span>
                                        <span className="totalsSpans">Unconfirmed: <span className="totalsSpansNumber">{totalUnconfirmed} </span></span>
                                        <span className="totalsSpans">Confirmed: <span className="totalsSpansNumber">{totalConfirmed} </span></span>
                                        <span className="totalsSpans">Arrived: <span className="totalsSpansNumber">{totalReceived}</span></span>
                                        <span className="totalsSpans">Remaining: <span className="totalsSpansNumber">{totalRemaining}</span></span>
                                    </div>
                                : 
                                    <div>
                                        <p className="totalsSpansMobile">Pallets: <span className="totalsSpansNumber">{totalPallets}</span></p>
                                        <p className="totalsSpansMobile">Unconfirmed: <span className="totalsSpansNumber">{totalUnconfirmed}</span></p>
                                        <p className="totalsSpansMobile">Confirmed: <span className="totalsSpansNumber">{totalConfirmed}</span></p>
                                        <p className="totalsSpansMobile">Arrived: <span className="totalsSpansNumber">{totalReceived}</span></p>
                                        <p className="totalsSpansMobile">Remaining: <span className="totalsSpansNumber">{totalRemaining}</span></p>
                                    </div>
                                }
                            </span>
                        </div>
                        <Button className='deleteButton' disabled variant="danger" id={'deletebtn'} style={{margin: '30px'}} ref={deleteRowBtn} type={'submit'}>Delete</Button>
                        <Button className='duplicateButton' disabled variant="info" id={'copybtn'} style={{margin: '30px'}} ref={copyBtn} type={'submit'}>Duplicate</Button>
                        <div style={{display: 'inline-block'}}>
                            <DatePicker
                                    id={'rescheduleDateTimePicker'}
                                    ref={dateTimePicker}
                                    selected={selectedBookingDate}
                                    disabled={(selectedRow.current ? false : true)}
                                    showTimeSelect
                                    minTime={new Date(selectedBookingDate).setHours(4, 0)}
                                    maxTime={new Date(selectedBookingDate).setHours(11, 30)}
                                    dateFormat="yyyy-MM-dd hh:mm"
                                    onChange={(e) => {setselectedBookingDate(e); selectedBookingDateRef.current = e}}
                                    onCalendarClose={(e) => handleBookingReschedule(e)}
                                    customInput={<DateTimeRescheduleButton />}
                                    todayButton="Today"
                                    withPortal
                                />
                        </div>
                        
                        <Button className='arrivedButton' disabled variant="success" id={'arrivedBtn'} style={{margin: '30px'}} ref={arrivedBtn} type={'submit'}>Toggle Arrived</Button>
                        <Button className='reloadButton' variant="warning" id={'reloadBtn'} style={{margin: '30px'}} ref={reloadBtn} type={'submit'}>Reload Records</Button>
                        
                        <Tooltip anchorSelect='.selectDateButton' place="top">Select the date of booking's</Tooltip>
                        <Tooltip anchorSelect='.deleteButton' place="top">Delete selected booking</Tooltip>
                        <Tooltip anchorSelect='.duplicateButton' place="top">Duplicate selected booking</Tooltip>
                        <Tooltip anchorSelect='.rescheduleButton' place="top">Reschedule selected booking</Tooltip>
                        <Tooltip anchorSelect='.arrivedButton' place="top">Toggle booking as arrived or not</Tooltip>
                        <Tooltip anchorSelect='.reloadButton' place="top">Reload bookings for selected day</Tooltip>

                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <div ref={recordTableRef} className="ag-theme-alpine, bookingGrid" style={{height: 550, width: 1002}}>
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

                                    onCellEditingStarted={onCellEditingStarted}
                                    onCellEditingStopped={onCellEditingStoped}

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