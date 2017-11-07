import React from 'react';
import ReactDOM from 'react-dom';
//import jQuery from 'jquery';
//import 'bootstrap';
import './index.css';
import Calculator from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Calculator />, document.getElementById('app'));
registerServiceWorker();
