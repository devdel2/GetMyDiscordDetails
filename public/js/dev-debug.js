const test = (string) =>{
    return console.log(`Test String: ${string}`);
}

const debugObject = (string, object) =>{
    return console.log(`${string}:\n${JSON.stringify(object)}`)
}

const DevDebug = {
    test: test,
    debugObject: debugObject,
}

module.exports = DevDebug;