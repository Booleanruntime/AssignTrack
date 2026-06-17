
// Factory to build different "account" objects based on a user's role. This is useful because
// A persisted User in Mongo is just data + a role string. The behaviour that
// depends on that role (what can this account do? where does it land after
// login?) lives here in small role classes. UserFactory.create() hands back the
// right class for a given user document so callers never branch on role
// themselves - they just ask the object what it can do.


class AccountUser {
    #user;

    constructor(user) {
        this.#user = user;
    }

    get id() {
        return this.#user.id;
    }

    get name() {
        return this.#user.name;
    }

    get role() {
        return this.#user.role;
    }

    // base capabilities, subclasses will widen this
    permissions() {
        return ['view:own-profile'];
    }

    canGrade() {
        return false;
    }

    canManageSubjects() {
        return false;
    }

    // where the frontend should send this user after login
    homeRoute() {
        return '/dashboard';
    }

    // shape we hand back to the client alongside the token
    toAuthPayload() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            permissions: this.permissions(),
            home: this.homeRoute(),
        };
    }
}

class StudentUser extends AccountUser {
    permissions() {
        return [...super.permissions(), 'manage:own-tasks', 'view:grades'];
    }
}

class TeacherUser extends AccountUser {
    permissions() {
        return [...super.permissions(), 'view:assigned-subjects', 'grade:tasks', 'create:feedback'];
    }

    canGrade() {
        return true;
    }

    homeRoute() {
        return '/teacher';
    }
}

class AdminUser extends AccountUser {
    permissions() {
        return [...super.permissions(), 'manage:subjects', 'assign:teachers', 'manage:users'];
    }

    canManageSubjects() {
        return true;
    }

    homeRoute() {
        return '/subjects';
    }
}

const ROLE_CLASSES = {
    student: StudentUser,
    teacher: TeacherUser,
    admin: AdminUser,
};

class UserFactory {
    static create(user) {
        if (!user || !user.role) {
            throw new Error('Cannot build account: user or role missing');
        }

        const RoleClass = ROLE_CLASSES[user.role];
        if (!RoleClass) {
            throw new Error(`Unknown user role: ${user.role}`);
        }

        return new RoleClass(user);
    }
}

module.exports = { UserFactory, AccountUser, StudentUser, TeacherUser, AdminUser };
