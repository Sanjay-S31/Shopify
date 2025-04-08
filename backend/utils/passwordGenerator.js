const generateSecurePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=<>?';
    
    // Generate a random length between 8 and 15
    const passwordLength = Math.floor(Math.random() * 8) + 8; // 8-15 range
    
    // Ensure at least one character from each required set
    let password = '';
    
    // Add one character from each required set
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // All character types for the rest of the password
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    // Fill the remaining length with random characters
    for (let i = 4; i < passwordLength; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters to avoid predictable patterns
    password = shuffleString(password);
    
    return password;
};


const shuffleString = (str) => {
    const array = str.split('');
    
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    
    return array.join('');
};

module.exports = {
    generateSecurePassword
};