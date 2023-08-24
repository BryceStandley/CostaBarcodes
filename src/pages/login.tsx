import React, { useEffect, useContext, useRef, useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import { Link } from 'react-router-dom';

import { useNavigate } from "react-router-dom";
import "./login.css";

import { getAuth, signInWithEmailAndPassword, browserSessionPersistence, setPersistence, signOut } from "firebase/auth";
import { initializeApp } from 'firebase/app';

library.add(faUser, faLock);

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

let isInitial = true;



function Login() {
    const authenticated = useRef<boolean>(false);

    document.title = 'Costa Barcodes | Login';
    const navigate = useNavigate();
    const auth = getAuth(firebaseApp);

    const emailInputRef = useRef<HTMLInputElement>(null!);
    const passwordInputRef = useRef<HTMLInputElement>(null!);
    setPersistence(auth, browserSessionPersistence);

    if(auth.currentUser !== null)
    {
        authenticated.current = true;
    }

    const submitHandler = useCallback(async(e) => {
        e.preventDefault();
        if(auth.currentUser === null)
        {
            await signInWithEmailAndPassword(auth, emailInputRef.current.value, passwordInputRef.current.value)
            .then((userCredential) => {
                authenticated.current = true;
                navigate('/bookings');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error Code:', errorCode);
                console.log('Error Msg:', errorMessage);
            });
        }
    }, [auth, navigate]);

    const onLogoutClick = useCallback(async (e) => {
        e.preventDefault();

        if(auth.currentUser)
        {
            await signOut(auth).then(() => {
                console.log('logged out');
                authenticated.current = false;
                navigate('/bookings');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error Code:', errorCode);
                console.log('Error Msg:', errorMessage);
            });
        }
    }, [auth, navigate]);

    return (
        <div>
            <div style={{
                textAlign: 'center',
                margin: '30px'
            }}>
                <div>
                    <h1>Login</h1>
                    <hr/>
                </div>
                <div>
                    <form onSubmit={submitHandler}>
                        <div>
                            <FontAwesomeIcon icon={faUser} style={{paddingRight: '10px'}}/>
                            <input
                            type="email"
                            id="user-name"
                            name="user-name"
                            autoComplete="on"
                            placeholder="Username or E-mail"
                            ref={emailInputRef}
                            ></input>
                        </div>

                        <div>
                            <FontAwesomeIcon icon={faLock} style={{paddingRight: '10px'}}/>
                            <input
                            type="password"
                            id="user-password"
                            name="user-password"
                            autoComplete="off"
                            placeholder="Password"
                            ref={passwordInputRef}
                            ></input>
                        </div>
                            <Button className="logBtn"  type={'submit'}>
                                Login
                            </Button>
                            <Button className="logBtn" type={'submit'} onClick={onLogoutClick}>
                                Logout
                            </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
