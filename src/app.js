import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';


import Root from './containers/Root';
import GenerateStore from './flux/GenerateStore';

import store from './store';

window.store = store;

module.exports = function(){
  ReactDOM.render(<Provider store={store}><Root /></Provider>, document.getElementById('app'));
}
