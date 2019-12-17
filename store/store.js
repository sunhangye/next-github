import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

const userInitialState = {}

const allReducers = combineReducers({
  user: userReducer
})

function userReducer(state = userInitialState, action) {
  switch (action.type) {
    default:
      return state
  }
}


export default function initializeStore(state) {
  const store = createStore(
    allReducers,
    Object.assign({}, {user: userInitialState}, state),
    composeWithDevTools(applyMiddleware(reduxThunk))
    )

  return store
}


