const STORAGE_HELPER = [
    function getTickets(){
        try{
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'tickets')) || [];
        } catch { 
            return []; 
        }
    },

    function saveTickets(t){
        localStorage.setItem(CONFIG.STORAGE_PREFIX + 'tickets', JSON.stringify(t));
    },

    function getSettings(){
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'settings')) || this.defaultSettings()
        } catch {
            return this.defaultSettings()
        }
    },

    function defaultSettings() {
        return {
            ticketsOpen: true,
            maxActive: 5,
            maxPerStudent: 3,
            windowMinutes: 60
        }
    },
]