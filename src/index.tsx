import React from 'react';
import ReactDOM from 'react-dom';

import ContactList from './components/contacts/contactList';
import Charts from './components/charts/charts';

import "bootstrap/dist/css/bootstrap.css";
import './index.scss';
import EventEmitter from 'eventemitter3';

export const URL_BASE = "http://localhost/wacg/backend/";

export const EE = new EventEmitter();

ReactDOM.render(
  <>
    <div className="container-fluid">
      <div className="row flex-column flex-md-row">
        <div className="col-12 col-md-3 pt-4 pb-4">
          <ContactList />
        </div>
        <div className="col-12 col-md-9">
          <Charts />
        </div>
      </div>
    </div>
  </>,
  document.getElementById('root')
);