import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

const initialState = {
  count: 0,
  username: 'sunhangye'
}

const ADD_TYPE = 'add';
const RENAME_TYPE = 'rename_type'


function countreducer (state = initialState, action) {
  
  switch (action.type) {
    case ADD_TYPE:
      return {
        ...state,
        count: state.count + (action.num || 1)
      }
    case RENAME_TYPE:
      return {
        ...state,
        username: action.username
      }
    default:
      return state
  }
}

const store = initializeStore()

export  const addType = (num) => ({
  type: ADD_TYPE,
  num
})

export const renameType = (username) => ({
  type: RENAME_TYPE,
  username
})

export function addAsync(num) {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(addType(num))
    }, 1000)
  }
}



store.subscribe(() => {
  console.log('state changes', store.getState());
})

export default function initializeStore(state) {
  const store = createStore(
    countreducer,
    Object.assign({}, initialState, state),
    composeWithDevTools(applyMiddleware(reduxThunk))
    )

  return store
}


