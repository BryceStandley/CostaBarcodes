import { library } from '@fortawesome/fontawesome-svg-core'
import { Link } from 'react-router-dom';
import React from "react";
import { faHome, faFileAlt, faSignOutAlt, faSignInAlt, faLightbulb, faUser, faBarcode, faSignsPost } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import latestRepoStats from 'objects/repo_stats'

library.add(faHome, faFileAlt, faSignInAlt, faSignOutAlt, faLightbulb, faUser, faBarcode, faSignsPost, faGithub);

function NavigationBar()
{

    return (
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark text-center" style={{width: '280px', height: '100vh'}}>
                <Link className='nav-link nav-brand' to="/worksheet">
                    <h3>
                        <strong>
                            Costa Barcodes
                        </strong>
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
                <div className='d-flex align-items-center text-white' style={{position: 'relative', fontSize: 12, opacity: '0.5'}}>
                    <div className='flex-row' style={{width: '280px'}}>
                        <div className='flex-column'>
                            Version -
                            <strong style={{paddingLeft: '20px'}}>
                                {latestRepoStats.latestCommit?.Title}
                            </strong>
                        </div>
                        <div className='flex-column'>
                                Updated -
                                <strong style={{paddingLeft: '22px'}}>
                                    {latestRepoStats.latestCommit?.Date}
                                </strong>
                        </div>
                        <div className='flex-column'>
                                Commit -
                            <strong style={{paddingLeft: '32px'}}>
                                <a className='nav-link d-inline' href={latestRepoStats.latestCommit?.URL} target="_blank" rel="noopener noreferrer" style={{color: '#06d6a0'}}>
                                    {"#" +latestRepoStats.latestCommit?.SHA}
                                </a>
                            </strong>
                        </div>
                    </div>
                </div>
                <hr />
                <div className='d-flex align-items-center text-white text-decoration-none' style={{position: 'relative'}}>
                    <div className='flex-row' style={{width: '280px'}}>
                        <div className='flex-column'>
                            <strong>
                                <a className='nav-link text-white d-inline' href='https://github.com/BryceStandley' target="_blank" rel="noopener noreferrer">
                                    &copy; 2022 - Bryce Standley
                                    <FontAwesomeIcon icon={faGithub} style={{paddingLeft: '10px'}} />
                                </a>
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default NavigationBar;