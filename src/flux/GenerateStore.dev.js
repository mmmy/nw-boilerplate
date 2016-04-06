
import { compose, createStore, applyMiddleware } from 'redux';
import DevTools from '../containers/DevTools';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';

const createStoreWithMiddleware = compose(
  applyMiddleware(thunkMiddleware),
  DevTools.instrument()
)(createStore);

export default function generateStore(initialState) {

	const store = createStoreWithMiddleware(reducers, initialState);

	return store;
}
