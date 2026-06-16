const { expect } = require('chai');
const Logger = require('../utils/Logger');

describe('Logger (Singleton pattern)', () => {
    it('getInstance always returns the same instance', () => {
        const a = Logger.getInstance();
        const b = Logger.getInstance();
        expect(a).to.equal(b);
    });

    it('the constructor also hands back the shared instance', () => {
        const a = Logger.getInstance();
        const b = new Logger();
        expect(b).to.equal(a);
    });

    it('shares logged history across references', () => {
        const a = Logger.getInstance();
        a.info('first message');
        const b = Logger.getInstance();
        expect(b.getHistory()).to.include('[INFO] first message');
    });
});
