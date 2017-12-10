const LANGUAGES = ['cpp', 'python', 'java'];
module.exports.STUDENT_FILE = "student_code";

module.exports.setLanguage = (language) => {
    if(LANGUAGES.indexOf(language) > -1) {
        module.exports.EXTENSION = (language == "python") ? "py" : language;        
    } else {
        throw Error("Not supporting this language")
    }
}