const SubjectList = ({
  subjects,
  editingSubject,
  editDescription,
  setEditDescription,
  startEditingSubject,
  handleUpdateSubject,
  handleDeleteSubject,
  setEditingSubject,
  startManagingTeachers,
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      {/* Table header */}
      <div className="bg-surface-container-low px-lg py-sm border-b border-outline-variant grid grid-cols-12 gap-sm items-center">
        <div className="col-span-4 font-label-sm text-label-sm text-on-secondary-container uppercase tracking-wider">Subject Name</div>
        <div className="col-span-5 font-label-sm text-label-sm text-on-secondary-container uppercase tracking-wider">Description</div>
        <div className="col-span-3 font-label-sm text-label-sm text-on-secondary-container uppercase tracking-wider text-right">Actions</div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-outline-variant">
        {subjects.length === 0 && (
          <div className="px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
            No subjects yet. Add one to get started.
          </div>
        )}

        {subjects.map((subject) => {
          const isEditing = editingSubject?._id === subject._id;
          return (
            <div
              key={subject._id}
              className="group grid grid-cols-12 gap-sm px-lg py-md items-center hover:bg-surface-bright transition-colors"
            >
              <div className="col-span-4">
                <span className="font-title-lg text-title-lg text-on-surface">{subject.name}</span>
                <div className="flex flex-wrap gap-xs mt-xs">
                  {(subject.teachers || []).length === 0 ? (
                    <span className="font-body-sm text-body-sm text-on-surface-variant italic">No teachers assigned</span>
                  ) : (
                    subject.teachers.map((teacher) => (
                      <span
                        key={teacher._id || teacher}
                        className="inline-flex items-center gap-xs px-sm py-[2px] rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        {teacher.name || 'Teacher'}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="col-span-5 pr-md">
                {isEditing ? (
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-md py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                    placeholder="Description"
                    autoFocus
                  />
                ) : (
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {subject.description || 'No description'}
                  </p>
                )}
              </div>

              <div className="col-span-3 flex justify-end gap-sm">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleUpdateSubject(subject._id)}
                      className="px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubject(null);
                        setEditDescription('');
                      }}
                      className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="flex gap-sm opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <button
                      onClick={() => startManagingTeachers(subject)}
                      title="Assign Teachers"
                      className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all bg-surface-container-lowest"
                    >
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </button>
                    <button
                      onClick={() => startEditingSubject(subject)}
                      title="Edit Description"
                      className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all bg-surface-container-lowest"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject._id)}
                      title="Delete Subject"
                      className="p-xs rounded-lg border border-outline-variant text-error hover:bg-error-container hover:border-error transition-all bg-surface-container-lowest"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectList;
