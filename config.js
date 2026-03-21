// Application Configuration
const CONFIG = {
    APP_NAME: 'Ticketron',
    VERSION: '1.0.0',
    STORAGE_PREFIX: 'TicketronStore',
    
    // Post types
    TICKET_TYPES: ['pass', 'office', 'nurse', 'other', 'library', 'restroom', 'counselor', 'locker'],
    
    // Member types
    MEMBER_TYPES: {
        FREE: 'free',
        DEVELOPER: 'developer'
    },
    
    // Validation Rules
    VALIDATION: {
        USERNAME_MIN: 4,
        USERNAME_MAX: 24,
        USERNAME_PATTERN: /^[a-zA-Z0-9]+$/, // Only letters and numbers
        PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d).+$/, // At least one letter and one number
        DESCRIPTION_MAX: 200,
    },
};

// Api Information
const CURSE_API = {
    url: 'https://api.api-ninjas.com/v1/profanityfilter',
    timeout: 5000
};

// Global state
const STATE = {
    currentUser: null,
    currentPage: 1,
};