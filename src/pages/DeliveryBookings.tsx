import React, {useRef, useState, forwardRef, ReactNode, ClipboardEvent, useEffect, useMemo, useCallback} from "react";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import bookingRecord from "../objects/bookingRecord";

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection,  getDocs, query, where, deleteDoc, updateDoc, addDoc, doc} from 'firebase/firestore/lite';

// @ts-ignore
import { Utils } from 'Utils';

import moment from 'moment';
import 'moment/locale/en-au';
import { JsxElement } from "typescript";
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
    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });
    const deleteRowBtn = useRef<HTMLButtonElement>(null!);
    const rescheduleBtn = useRef<HTMLButtonElement>(null!);
    const arrivedBtn = useRef<HTMLButtonElement>(null!);
    const selectedRow = useRef<any>(undefined);
    const recordTableRef = useRef<HTMLDivElement>(null!);
    const [rowData, setRowData] = useState<any>(null);
    const [tempRow, setTempRow] = useState({});
    const datePicker = useRef<DatePicker>(null!);
    const rescheduling = useRef<boolean>(false);
    const totalPalletsForDate = useRef<HTMLSpanElement>(null!);

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
            const hours = parseInt(params.value.slice(0, 2));
            const minutes = parseInt(params.value.slice(2));

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
        return columnDefs.every((def) => tempRow[def.field]);
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
        if(row === undefined)
        {
            //setSelectedRow(undefined);
            selectedRow.current = undefined;
            disableBtns();
        }
        else
        {
            //setSelectedRow(row);
            selectedRow.current = row;
            enableBtns();
        }

    }, []);

    // DefaultColDef sets props common to all Columns
    //@ts-ignore
    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        width: 900/4,
        cellStyle: {justifyContent: 'center'},
        
    }));

    


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

    // On Row Editing Stopped Event
    const onRowEditingStopped = useCallback(async (params) => 
    {
        if(params.rowPinned)
        {
            if (isPinnedRowDataCompleted(params)) 
            {
                const col = collection(firebaseDB, 'deliveryBookings');
                // Insert new record
                try {
                    let data = tempRow;
                    data['date'] = moment(startDate).format('L');
                    data['arrived'] = false;
                    await addDoc(col, tempRow).then(doc => {
                        console.log("Document Added Successfully with ID: ", doc.id);
                        tempRow['date'] = moment(startDate).format('L');
                        tempRow['id'] = doc.id;
                        tempRow['arrived'] = false;
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
        //Update firebase record
        try {
            const d = doc(firebaseDB, 'deliveryBookings', e.data.id);
            const data = { time: e.data.time, deliveryName: e.data.deliveryName, purchaseOrder: e.data.purchaseOrder, pallets: e.data.pallets };
            await updateDoc(d, data).then(() => {
                console.log("Document Updated Successfully");
                loadRecords(startDate);
                selectedRow.current = undefined;
                disableBtns();
            });
                
        }
        catch (error) {
            console.error(error);
        }
    }, []);

    // Load Records from firebase
    async function loadRecords(date)
    {
        const col = collection(firebaseDB, 'deliveryBookings');
        await getDocs(query(col, where('date', '==', moment(date).format('L')))).then((snapshot) => {
            let lst: any = [];
            let total = 0;
            snapshot.docs.forEach((doc) => {
                let d = doc.data();
                d.id = doc.id;
                lst.push(d);
                const i = parseInt(d.pallets);
                !Number.isNaN(i) ? total += i : total += 0; 
            });
            setRowData(lst);

            totalPalletsForDate.current.innerText = "Total Pallets: " + total;
        });
    }

    // Date selection changed handler
    const handleDateChanged = useCallback(async (e) => {
        if(selectedRow.current !== undefined && rescheduling.current)
        {
            //Reschedule to selected date and reload to current date set
                // Update Date
                try {
                    const d = doc(firebaseDB, 'deliveryBookings', selectedRow.current.id);
                    const data = { date: moment(e).format('L') };
                    await updateDoc(d, data).then(() => {
                        console.log("Document Rescheduled Successfully");
                        loadRecords(startDate);
                        selectedRow.current = undefined;
                        disableBtns();
                    });
                }
                catch (error) {
                    console.error(error);
                }
        }
        else
        {
            setStartDate(e);
            loadRecords(e);
            selectedRow.current = undefined;
            disableBtns();
        }    
    },[]);

    //Enable Buttons
    const enableBtns = () => {
        deleteRowBtn.current.removeAttribute('disabled');
        rescheduleBtn.current.removeAttribute('disabled');
        arrivedBtn.current.removeAttribute('disabled');
    }

    // Disable Buttons
    const disableBtns = () => {
        deleteRowBtn.current.setAttribute('disabled', 'true');
        rescheduleBtn.current.setAttribute('disabled', 'true');
        arrivedBtn.current.setAttribute('disabled', 'true');
    }

    // Delete Selected Row
    const onDeleteBtnClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const col = collection(firebaseDB, 'deliveryBookings');
            const d = doc(firebaseDB, 'deliveryBookings', selectedRow.current.id);
            await deleteDoc(d).then(() => {
                console.log("Document", selectedRow.current.id, "deleted");
                loadRecords(startDate);
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
        datePicker.current.input.click();
    }

    // Toggle Arrived Button Click Event
    const onArrivedBtnClick = async (e) => {
        if(selectedRow.current !== undefined)
        {
            try {
                const d = doc(firebaseDB, 'deliveryBookings', selectedRow.current.id);
                const data = { arrived: !selectedRow.current.arrived };
                await updateDoc(d, data).then(() => {
                    console.log("Document Updated Successfully - Arrived Toggle");
                    loadRecords(startDate);
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
        document.getElementById('rescheduleBtn').onclick = onRescheduleBtnClick;
        //@ts-ignore
        document.getElementById('arrivedBtn').onclick = onArrivedBtnClick;


    };

    // Render
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
                        <Button disabled variant="primary" id={'rescheduleBtn'} style={{margin: '30px'}} ref={rescheduleBtn} type={'submit'}>Reschedule</Button>
                        <Button disabled variant="success" id={'arrivedBtn'} style={{margin: '30px'}} ref={arrivedBtn} type={'submit'}>Toggle Arrived</Button>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <div ref={recordTableRef} className="ag-theme-alpine" style={{width: 902, height: 500,  }}>
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