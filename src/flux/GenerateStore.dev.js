
import { compose, createStore, applyMiddleware } from 'redux';
import DevTools from '../containers/DevTools';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import reducers from './reducers';

//Env===dev
// import createLogger from 'redux-logger';
//
// const logger = createLogger({
//   duration: true,
//   collapsed: true
// });

const createStoreWithMiddleware = compose(
  applyMiddleware(thunkMiddleware, promiseMiddleware), //!\ logger must be last middleware in chain
  DevTools.instrument()
)(createStore);

export default function generateStore(initialState) {

	const store = createStoreWithMiddleware(reducers, initialState);

	return store;
}
