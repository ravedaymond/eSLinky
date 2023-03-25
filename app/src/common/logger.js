function winslinkLogger(log, ...args) {
    if(!log) { return; }
    const util = require('util');
    const fs = require('fs');
    const os = require('os');
    
    args.forEach(arg => {
        log = util.format(log, arg);
    });
    console.log(log);
    const outStream = fs.createWriteStream(path.join(paths.logs, 'session.log'), { flags: 'a' });
    outStream.write(util.format(new Date().toJSON(), `${log}${os.EOL}`));
    outStream.close();
}