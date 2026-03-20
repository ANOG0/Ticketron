// Authentication Module
const Auth = {    
    getCurrentUser() {
        return STATE.currentUser;
    },
    
    updateCurrentUser(updates) {
        // If no current use return false.
        if (!STATE.currentUser) return false;
        
        Object.assign(STATE.currentUser, updates);
        
        // Update in users array
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === STATE.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = STATE.currentUser;
            Storage.saveUsers(users);
        }
        
        Storage.saveCurrentUser(STATE.currentUser);
        
        return true;
    },

    checkTextForBad() {
        
    }
};