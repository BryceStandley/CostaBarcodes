import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLiraSign, fas } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';
import React from "react";

import { faHome, faFileAlt, faSignOutAlt, faSignInAlt, faLightbulb, faUser, faBarcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faHome, faFileAlt, faSignInAlt, faSignOutAlt, faLightbulb, faUser, faBarcode);

function NavigationBar() {
    return (
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark text-center" style={{width: '280px', height: '100vh'}}>
                <Link className='nav-link text-white' to="/worksheet">
                    <h3>
                        Costa Barcodes
                    </h3>
                </Link>
                <hr />
                <ul className='nav nav-pills flex-column mb-auto'>
                    <span>
                        <FontAwesomeIcon icon={faSignInAlt} style={{paddingRight: '10px'}}/>
                        Inbound
                        <hr className='nav-title-separator' />
                    </span>

                    <li className='nav-item' >
                        <Link className='nav-link text-white' to='/worksheet'>
                            <FontAwesomeIcon icon={faHome} style={{paddingRight: '10px'}}/>
                            Worksheet
                        </Link>
                    </li>
                    <li className='nav-item' >
                        <Link className='nav-link text-white' to='/pallet-label'>
                            <FontAwesomeIcon icon={faFileAlt} style={{paddingRight: '10px'}}/>
                            Pallet Labels
                        </Link>
                    </li>

                    <hr />

                    <span>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{paddingRight: '10px'}}/>
                        Outbound
                        <hr className='nav-title-separator' />
                    </span>
                    <li>
                        <span>
                            empty
                        </span>
                    </li>

                    <hr />

                    <span>
                        <FontAwesomeIcon icon={faLightbulb} style={{paddingRight: '10px'}} />
                        Misc
                        <hr className='nav-title-separator' />
                    </span>
                    <li className='nav-item'>
                        <Link className='nav-link text-white' to='/scale-login'>
                            <FontAwesomeIcon icon={faUser} style={{paddingRight: '10px'}}/>
                            Scale Login
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link text-white' to='/ltbarcode'>
                            <FontAwesomeIcon icon={faBarcode} style={{paddingRight: '10px'}} />
                            Lt. Barcode
                        </Link>
                    </li>
                </ul>
            <hr />
                <div className='d-flex align-items-center text-white text-decoration-non' style={{position: 'relative'}}>
                    <strong>&copy; 2022 - Bryce Standley</strong>
                </div>
            </div>
    );
}

function SetupNavClasses()
{
    

    for(var i = 0; i < 1; i++)
    {
        var navLink = document.getElementById('navLink'+i);
        if(navLink != null)
        {
            navLink.classList.add('nav-link text-white');
        }
    }

    var footerText = document.getElementById('footerText');
    if(footerText != null)
    {
        footerText.classList.add('d-flex align-items-center text-white text-decoration-non');
    }

}

export default NavigationBar;