import * as actions from './eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';
import { fetchSampleData } from '../../data/mockApi';
import { toastr } from 'react-redux-toastr';

export const createEvent = (event) => {
    return async dispatch => {
        try {
            dispatch({
                type: actions.CREATE_EVENT,
                payload: {
                    event
                }
            });

            toastr.success('Success!', 'Event has been created');
        } catch (error) {
            toastr.error('Oops!', 'Something went wrong');
        }
    }
}

export const updateEvent = (event) => {
    return async dispatch => {
        try {
            dispatch({
                type: actions.UPDATE_EVENT,
                payload: {
                    event
                }
            });

            toastr.success('Success!', 'Event has been updated');
        } catch (error) {
            toastr.error('Oops!', 'Something went wrong');
        }
    }
}

export const deleteEvent = (eventId) => {
    return {
        type: actions.DELETE_EVENT,
        payload: {
            eventId
        }
    }
}

export const fetchEvents = (events) => {
    return {
        type: actions.FETCH_EVENTS,
        payload: events
    }
}

export const loadEvents = () => {
    return async dispatch => {
        try {
            dispatch(asyncActionStart());
            let events = await fetchSampleData();
            dispatch(fetchEvents(events));
            dispatch(asyncActionFinish());
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
        }
    }
}