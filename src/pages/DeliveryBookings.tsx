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
    const contentDivRef = useRef<HTMLDivElement>(null!);
    const [startDate, setStartDate] = useState(new Date());
    const DatePickerButton = forwardRef<HTMLButtonElement>((props: any, ref) => {
        return <Button variant="success" style={{margin: '30px'}} ref={ref} onClick={props.onClick} type="submit"><FontAwesomeIcon icon={faCalendarDay} style={{paddingRight: '10px'}}/>{props.value}</Button>
    });

    const deleteRowBtn = useRef<HTMLButtonElement>(null!);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const recordTableRef = useRef<HTMLDivElement>(null!);
    const [rowData, setRowData] = useState<any>(null);
    const [loadedRecords, setLoadedRecords] = useState<bookingRecord[] | null>()
    
    const [tempRow, setTempRow] = useState({});

    useEffect(() => {
        const load = async () => {
            await loadRecords(new Date());
        }
        load();
    }, [])

    const gridRef = useRef();

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'time',
            editable: true,
        },
        {
            field: 'deliveryName',
            editable: true,
        },
        {
            field: 'purchaseOrder',
            editable: true,
        },
        {
            field: 'pallets',
            editable: true
        },
    ]);

    function isEmptyPinnedCell(params) {
        return (
            (params.node.rowPinned === 'top' && params.value == null) ||
            (params.node.rowPinned === 'top' && params.value === '')
        );
    }

    function createPinnedCellPlaceholder({ colDef }) {
        return colDef.field[0].toUpperCase() + colDef.field.slice(1) + '...';
    }
    
    function isPinnedRowDataCompleted(params) {
        if (params.rowPinned !== 'top') return;
        return columnDefs.every((def) => tempRow[def.field]);
    }

    function hasRowDataChanged(params) {
        if (params.rowPinned !== undefined) return;
        return params.valueChanged;
    }

    // Example of consuming Grid Event
    const cellClickedListener = useCallback( event => {
        if(event.rowPinned !== undefined) return;

        const row = event.api.getSelectedRows()[0];
        if(row === undefined)
        {
            setSelectedRow(undefined);
            deleteRowBtn.current.setAttribute('disabled', 'true');
        }
        else
        {
            setSelectedRow(row);
            deleteRowBtn.current.removeAttribute('disabled');
        }

    }, []);

    // DefaultColDef sets props common to all Columns
    //@ts-ignore
    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        width: 900/4,
        cellStyle: {justifyContent: 'center'},
        valueFormatter: undefined as any,
    }));

    defaultColDef.valueFormatter = params => {
        if (isEmptyPinnedCell(params)) 
        {
            return createPinnedCellPlaceholder(params);
        }
        else
        { 
            return undefined;
        }
    }



    const onSelectionChanged = useCallback(event => {
      }, []);

      const getRowStyle: any = useCallback(({node}) =>
          node.rowPinned ? { fontWeight: 'bold', fontStyle: 'italic', color: 'gray'} : {},
        []
      );

    const onCellEditingStopped = useCallback((params) => 
    {
        if(params.rowPinned)
        {
            if (isPinnedRowDataCompleted(params)) 
            {
                setRowData([...rowData, tempRow]);
                setTempRow({});
            }
        }
        else if(hasRowDataChanged(params))
        {
            //Update firebase record
        }
    },
    [rowData, tempRow]
    );

    const onDeleteRowClick = useCallback(async () => {
        console.log(selectedRow.id);
        const col = collection(firebaseDB, 'deliveryBookings');
        const d = await doc(firebaseDB, 'deliveryBookings', selectedRow.id);

        const res = await deleteDoc(d).then(() => {console.log("doc deleted")});
        return;
    },
    []
    );

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


    async function loadRecords(date)
    {
        const col = collection(firebaseDB, 'deliveryBookings');
        const snapshot = await getDocs(query(col, where('date', '==', moment(date).format('L'))));

        let lst: any = [];
        snapshot.docs.forEach((doc) => {
            let d = doc.data();
            console.log(d);
            d.id = doc.id;
            lst.push(d);
        });
        //@ts-ignore
        setRowData(lst);
    }

    

	document.title = 'Costa Barcodes | Bookings';

    const handleDateChanged = (e) => {
        setStartDate(e);
        loadRecords(e);
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
                        <Button disabled variant="danger" style={{margin: '30px'}} ref={deleteRowBtn} onClick={onDeleteRowClick}>Delete Row</Button>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <div ref={recordTableRef} className="ag-theme-alpine" style={{width: 900, height: 500,  }}>
                                <AgGridReact
                                    //@ts-ignore
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

                                    onCellEditingStopped={onCellEditingStopped}
                                    onSelectionChanged={onSelectionChanged}
                                    onCellClicked={cellClickedListener}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

}

export default DeliveryBookings;