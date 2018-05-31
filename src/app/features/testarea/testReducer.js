import * as actionTypes from './testConstants';
import { createReducer } from '../../common/util/reducerUtil';

const initialState = {
    data: 42,
    loading: false
}

export const incrementCounter = (state, payload) => {
    return {
        ...state,
        data: state.data + 1
    };
}

export const decrementCounter = (state, payload) => {
    return {
        ...state,
        data: state.data - 1
    };
}

export const counterActionStarted = (state, payload) => {
    return {
        ...state, 
        loading: true
    }
}

export const counterActionFinished = (state, payload) => {
    return {
        ...state, 
        loading: false
    }
}

export default createReducer(initialState, {
    [actionTypes.INCREMENT_COUNTER]: incrementCounter,
    [actionTypes.DECREMENT_COUNTER]: decrementCounter,
    [actionTypes.COUNTER_ACTION_STARTED]: counterActionStarted,
    [actionTypes.COUNTER_ACTION_FINISHED]: counterActionFinished
});



// const testReducer = (state = initialState, action) => {
//     switch (action.type) {
//         case actionTypes.INCREMENT_COUNTER:
//             return {
//                 ...state,
//                 data: state.data + 1
//             };
//         case actionTypes.DECREMENT_COUNTER:
//             return {
//                 ...state,
//                 data: state.data - 1
//             };
//         default:
//             return state;
//     }
// }