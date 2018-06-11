import moment from 'moment';

export const objectToArray = (object) => {
    if (object) {
        return Object.entries(object).map(e => Object.assign(e[1], { id: e[0] }))
    }
}

export const createNewEvent = (user, photoURL, event) => {

    // Convert event date to Javascript Object
    event.date = moment(event.date).toDate();

    return {
        ...event,
        hostUid: user.uid,
        hostedBy: user.displayName,
        hostPhotoURL: photoURL || '/assets/user.png',
        created: Date.now(),
        attendees: {
            // Represents key of object, so in this case, the users id
            [user.uid]: {
                going: true,
                joinDate: Date.now(),
                photoURL: photoURL || '/assets/user.png',
                displayName: user.displayName,
                host: true
            }
        }
    }
}

// Used for reply tree in Event comments section
export const createDataTree = dataset => {
    // Initialize "hashTable" equal to a null object
    let hashTable = Object.create(null);

    // Fore each item in this data set, add an item into hashTable with an ID, then spread the data across, and add an array called "childNodes"
    dataset.forEach(a => hashTable[a.id] = {...a, childNodes: []});

    // Set "dataTree" to an empty array
    let dataTree = [];

    // Loop over our dataset again, if parent ID not equal to 0, then populate childNodes with the children of that parent,
    // else if it is the parent, then we push the item into the hash table
    dataset.forEach(a => {
        if (a.parentId) hashTable[a.parentId].childNodes.push(hashTable[a.id]);
        else dataTree.push(hashTable[a.id])
    });

    // Then return the data tree as a whole
    return dataTree
};