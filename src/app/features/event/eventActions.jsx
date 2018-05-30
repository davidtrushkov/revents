import * as actions from './eventConstants';

export const createEvent = (event) => {
    return {
        type: actions.CREATE_EVENT,
        payload: {
            event
        }
    }
}

export const updateEvent = (event) => {
    return {
        type: actions.UPDATE_EVENT,
        payload: {
            event
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