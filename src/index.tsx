import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import latestRepoStats from 'objects/repo_stats'
import { Utils } from 'Utils';
latestRepoStats.LoadStats().then(() => {

  //Once stats are loaded, render the app then fade loading screen out
  // @ts-ignore
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
  );

  
  //Remove loading screen
  const index = document.getElementById('indexLoadingContent');
  
  //wait 1 seconds for react to render in the window
  //add animation to loading container
  //wait 3 seconds for animation to end
  //remove loading container from the page
  
  (async () => {
    index?.classList.add('indexFadeAnimation');
    Utils.delay(2500).then(() => {
      document.getElementById('indexLoadingContent')?.remove();
      const r = document.getElementById('root');
      r?.classList.remove('rootLoading');
    });
  })();
  

})



