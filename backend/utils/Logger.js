// Singleton logger. We only ever want one logging instance shared across the
// whole app so every controller writes through the same place (and one day we
// could swap console for a file/transport without touching call sites).

class Logger {
    constructor() {
        if (Logger._instance) {
            return Logger._instance;
        }
        this._history = [];
        Logger._instance = this;
    }

    static getInstance() {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    _write(level, message) {
        const line = `[${level}] ${message}`;
        this._history.push(line);
        // eslint-disable-next-line no-console
        console.log(line);
        return line;
    }

    info(message) {
        return this._write('INFO', message);
    }

    warn(message) {
        return this._write('WARN', message);
    }

    error(message) {
        return this._write('ERROR', message);
    }

    // handy for tests to assert what was logged without scraping stdout
    getHistory() {
        return [...this._history];
    }
}

module.exports = Logger;
