import * as actionTypes from './testConstants';
import { createReducer } from '../../common/util/reducerUtil';

const initialState = {
    data: 42
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

export default createReducer(initialState, {
    [actionTypes.INCREMENT_COUNTER]: incrementCounter,
    [actionTypes.DECREMENT_COUNTER]: decrementCounter
});