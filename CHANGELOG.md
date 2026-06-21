# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

## [1.1.0] - 19-06-2026

### Added

- Teacher role with UserFactory (Factory) and Singleton Logger; admin-only user creation endpoint
- Ability for Admins to assign teachers to subjects (Proxy-guarded), with create-teacher and assignment UI
- Added assignment priority and new sorting strategies
- Teacher grading with Strategy (grading schemes) and Builder (feedback); grading endpoints and teacher grading panel
- Assignment submission lifecycle with State pattern 
- Student "My Grades" page to view grades and feedback
- Teacher-authored assignments that auto-assign to enrolled students, with teacher authoring page
- Admin-managed student enrolment in subjects (Proxy-guarded)
- Role-aware navigation and dashboards for student, teacher and admin
- Added archive and restore functionality so students can remove assignments from their active tracker without deleting them and vise versa (Command Pattern).
- Updated assignment list actions to fit edit, archive and submit assignments.

### Changed

- Students no longer create their own assignments; they receive teacher-set work and can only update progress, submit, and view grades

## [1.0.0] - 12-06-2026

### Added

- Initial release from A1
- Setup devops environment 

