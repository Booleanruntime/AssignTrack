const SubjectService = require('../services/SubjectService');
const Logger = require('../utils/Logger');

const logger = Logger.getInstance();

// protection proxy - same methods as SubjectService, but checks the account can
// manage subjects before passing the call through. routes only ever see the
// proxy, so there's no way around the check. the "can manage" answer comes from
// the role classes in UserFactory.
class SubjectAccessProxy {
    constructor(account, service = new SubjectService()) {
        this.account = account;
        this.service = service;
    }

    _denyIfNotAllowed(action) {
        if (!this.account || !this.account.canManageSubjects()) {
            logger.warn(`Denied ${action} for ${this.account?.role || 'unknown'} account`);
            const err = new Error('Only admins can manage teacher assignments');
            err.status = 403;
            throw err;
        }
    }

    async setTeachers(subjectId, teacherIds) {
        this._denyIfNotAllowed('setTeachers');
        const subject = await this.service.setTeachers(subjectId, teacherIds);
        logger.info(`Admin ${this.account.name} set ${teacherIds.length} teacher(s) on subject ${subjectId}`);
        return subject;
    }

    async listTeachers(subjectId) {
        // anyone who can see subjects can read the roster, so no gate here
        return this.service.listTeachers(subjectId);
    }

    async setStudents(subjectId, studentIds) {
        this._denyIfNotAllowed('setStudents');
        const subject = await this.service.setStudents(subjectId, studentIds);
        logger.info(`Admin ${this.account.name} enrolled ${studentIds.length} student(s) in subject ${subjectId}`);
        return subject;
    }

    async listStudents(subjectId) {
        return this.service.listStudents(subjectId);
    }
}

module.exports = SubjectAccessProxy;
