import { library } from '@fortawesome/fontawesome-svg-core'
import { Link } from 'react-router-dom';
import React from "react";

import { faHome, faFileAlt, faSignOutAlt, faSignInAlt, faLightbulb, faUser, faBarcode, faSignsPost } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faHome, faFileAlt, faSignInAlt, faSignOutAlt, faLightbulb, faUser, faBarcode, faSignsPost, faGithub);

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
                    <span className='nav-title'>
                        <FontAwesomeIcon icon={faSignInAlt} style={{paddingRight: '10px'}}/>
                        <strong>Inbound</strong>    
                    </span>
                    
                    <hr className='nav-title-separator' />

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

                    <span className='nav-title'>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{paddingRight: '10px'}}/>
                        <strong>Outbound</strong>
                    </span>
                    <hr className='nav-title-separator' />
                    <li className='nav-item' >
                        <Link className='nav-link text-white' to='/location-sign'>
                            <FontAwesomeIcon icon={faSignsPost} style={{paddingRight: '10px'}}/>
                            Location Sign
                        </Link>
                    </li>

                    <hr />

                    <span className='nav-title'>
                        <FontAwesomeIcon icon={faLightbulb} style={{paddingRight: '10px'}} />
                        <strong>Misc</strong>
                    </span>
                    <hr className='nav-title-separator' />

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
                    <strong>&copy; 2022 - Bryce Standley
                    <a className='nav-link text-white d-inline' href='https://github.com/BryceStandley' target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faGithub} style={{paddingLeft: '10px'}} />
                    </a>
                    </strong>
                </div>
            </div>
    );
}

export default NavigationBar;