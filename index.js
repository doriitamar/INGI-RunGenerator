let global = require('./global');

function getStudentInput(problemId) {
    return "getinput \""+problemId+"\" > "+global.STUDENT_FILE+"."+global.EXTENSION+"\n";
}

function compile() {
    switch (global.EXTENSION) {
        case 'cpp':
            return "g++ -o "+global.STUDENT_FILE+".out "+global.STUDENT_FILE+"."+global.EXTENSION+" &> compiler\n";
        case 'java':
            return "javac "+global.STUDENT_FILE+"."+global.EXTENSION+" &> compiler\n";
        default: 
            return "\n";
    }
}

function prepareCaseInput(caseInput) {
    if(caseInput && caseInput.length > 0) {
        let prepareCase = "";

        // Overwrite everything in the file and then append
        prepareCase = prepareCase.concat('echo "'+ caseInput[0] +'" > input\n');
        for(let i = 1; i < caseInput.length; i++) {
            prepareCase = prepareCase.concat('echo "'+ caseInput[i] +'" >> input\n');
        }

        return (prepareCase);
    } else {
        return "";
    }
}

function runFile() {
    switch (global.EXTENSION) {
        case 'cpp':
            return "./"+global.STUDENT_FILE+".out < input > output 2>error\n";
        case 'java':
            return "java "+global.STUDENT_FILE+" < input > output 2>error\n";
        case 'py':
            return "python "+global.STUDENT_FILE+".py < input > output 2>error\n";
        default:
            return "";
    }
}

function writeTests(currCase) {
    let index = 0;
    let toReturn = 'output=$(<output)\n';
    toReturn = toReturn.concat('compiler=$(<compiler)\n');
	toReturn = toReturn.concat('errors=$(<error)\n');
    toReturn = toReturn.concat("##Escape characters\noutput=$(echo \"$output\" | sed -e \"s/[\\]/\\\\\\\\\\\\\\\/g\")\n");
    toReturn = toReturn.concat("compiler=$(echo \"$compiler\" | sed -e  \"s/[\\\"]/'/g\")\n");
    toReturn = toReturn.concat("errors=$(echo \"$errors\" | sed -e  \"s/[\\\"]/'/g\")\n");

    for(let [index, currFile] of currCase.outputFiles.entries()) {
        toReturn = toReturn.concat('file'+index+'=$(<'+currFile.name+')\n');
    }

    toReturn = toReturn.concat("feedback-msg -aem \"{\\\"status\\\": \\\"ok\\\",\\\"compiler\\\":\\\"$compiler\\\",\\\"error\\\": \\\"$errors\\\", \\\"output\\\": \\\"$output\\\", \\\"files\\\":[");
    
    for(let [index, currFile] of currCase.outputFiles.entries()) {
        if(index != currCase.outputFiles.length - 1) {
            toReturn = toReturn.concat("{\\\"name\\\":\\\""+currFile.name+"\\\", \\\"content\\\":\\\"$file"+index+"\\\"},");
        } else {
            toReturn = toReturn.concat("{\\\"name\\\":\\\""+currFile.name+"\\\", \\\"content\\\":\\\"$file"+index+"\\\"}");
        }
    }
    toReturn = toReturn.concat("]}\"\n");

    return toReturn;
}

function prepareCaseInputFiles(inputFiles) {
    let toReturn = "## Case Input files\n";

    for(file of inputFiles) {
        toReturn = toReturn.concat("touch "+file.name+"\n");
        toReturn = toReturn.concat('printf "'+ file.content.replaceAll("\n","\\n") +'" > '+file.name+"\n");
    }

    toReturn = toReturn.concat("\n");
    return toReturn;
}


/**
 * cases : [{input: [], inputFiles:[], outputFiles:[]}...]
 */
module.exports.generateRun = (language, cases, problemId) => {
    String.prototype.replaceAll = function(str1, str2, ignore) {  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g, "$$$$"):str2)};

    // Set language
    global.setLanguage(language);

    // Initialize bash script
    let run = "#!/bin/bash\n\n";
    run = run.concat("## Parsing input for "+problemId+"\n");
    run = run.concat(getStudentInput(problemId));

    run = run.concat("\n## Compiling using "+language+" compiler\n");
    run = run.concat(compile());
    
    // Preparing input stream, in case the program expects input
    run = run.concat("\ntouch input\n");

    run = run.concat('feedback-msg -aem "["\n');
    // Per case phase
    for(let [index, currCase] of cases.entries()) {
        run = run.concat("\n## Case #"+index+":\n")
        run = run.concat(prepareCaseInput(currCase.input));
        run = run.concat(prepareCaseInputFiles(currCase.inputFiles));
      

        // Run file, save and print output
        run = run.concat(runFile());

        run = run.concat(writeTests(currCase));

        if(index != cases.length -1 ) {
            run = run.concat('feedback-msg -aem ","\n');
        }
    }

    run = run.concat('feedback-msg -aem "]"\n');

    run = run.concat("\n## Failing every automatic-generated test, since CodeIT handles validations\n");
    run = run.concat('feedback-result failed');

    return run;
}