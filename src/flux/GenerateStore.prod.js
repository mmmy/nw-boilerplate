
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import reducers from './reducers';

const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, promiseMiddleware)(createStore);

export default function generateStore(initialState) {

	const store = createStoreWithMiddleware(reducers, initialState);

	return store;
}
