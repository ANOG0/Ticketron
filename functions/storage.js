// Storage Management
const Storage = {
    // Tickets
    getTicketsByTeacher(teacher) {
        const data = localStorage.getItem(CONFIG.STORAGE_PREFIX + teacher + 'tickets');
        return data ? JSON.parse(data) : [];
    },
    
    saveTicketsByTeacher(teacher, posts) {
        localStorage.setItem(CONFIG.STORAGE_PREFIX + teacher + 'tickets', JSON.stringify(posts));
    },

    addTeacher(teacher) {
        localStorage.setItem(CONFIG.STORAGE_PREFIX + teacher, JSON.stringify(teacher));
    },

    doesTeacherExist(teacher) {
        const data = localStorage.getItem(CONFIG.STORAGE_PREFIX + teacher);
        return data & true || false;
    }
};