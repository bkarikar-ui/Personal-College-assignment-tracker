'use strict';

// Sprint 1 prototype data. Assignments live in browser memory and reset on refresh.
const assignments = [
  { id: 1, title: 'Differential Calculus problem set', course: 'MA 121', dueDate: futureDate(2), priority: 'High', completed: false },
  { id: 2, title: 'Mobile project reflection', course: 'ENGR 211', dueDate: futureDate(4), priority: 'Medium', completed: false },
  { id: 3, title: 'Chemistry lab conclusion', course: 'CH 115', dueDate: futureDate(1), priority: 'High', completed: false },
  { id: 4, title: 'Read software design notes', course: 'CS 101', dueDate: futureDate(-1), priority: 'Low', completed: true }
];
let nextId = 5;
let activeFilter = 'All';
let editingId = null;
let toastTimeout;

const elements = {
  total: document.querySelector('#total-count'),
  pending: document.querySelector('#pending-count'),
  completed: document.querySelector('#completed-count'),
  progressPercent: document.querySelector('#progress-percent'),
  progressFill: document.querySelector('#progress-fill'),
  progressCaption: document.querySelector('#progress-caption'),
  allFilterCount: document.querySelector('#all-filter-count'),
  list: document.querySelector('#assignment-list'),
  empty: document.querySelector('#empty-state'),
  form: document.querySelector('#assignment-form'),
  formTitle: document.querySelector('#form-title'),
  title: document.querySelector('#assignment-title'),
  course: document.querySelector('#assignment-course'),
  dueDate: document.querySelector('#assignment-due'),
  priority: document.querySelector('#assignment-priority'),
  error: document.querySelector('#form-error'),
  saveButton: document.querySelector('#save-assignment-button'),
  sort: document.querySelector('#sort-select'),
  planPreview: document.querySelector('#plan-preview'),
  generatePlan: document.querySelector('#generate-plan-button'),
  toast: document.querySelector('#toast')
};

function futureDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDueLabel(assignment) {
  if (assignment.completed) return 'Completed';
  const today = futureDate(0);
  if (assignment.dueDate < today) return `Overdue · ${formatDate(assignment.dueDate)}`;
  if (assignment.dueDate === today) return 'Due today';
  if (assignment.dueDate === futureDate(1)) return 'Due tomorrow';
  return `Due ${formatDate(assignment.dueDate)}`;
}

function priorityRank(priority) {
  return ({ High: 0, Medium: 1, Low: 2 })[priority] ?? 3;
}

function getVisibleAssignments() {
  let visible = assignments.filter(assignment => {
    if (activeFilter === 'Pending') return !assignment.completed;
    if (activeFilter === 'Completed') return assignment.completed;
    return true;
  });

  if (elements.sort.value === 'priority') {
    visible.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.dueDate.localeCompare(b.dueDate));
  } else if (elements.sort.value === 'course') {
    visible.sort((a, b) => a.course.localeCompare(b.course) || a.dueDate.localeCompare(b.dueDate));
  } else {
    visible.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || priorityRank(a.priority) - priorityRank(b.priority));
  }
  return visible;
}

function renderAssignments() {
  const visible = getVisibleAssignments();
  elements.list.innerHTML = visible.map(assignment => {
    const dueLabel = getDueLabel(assignment);
    const overdue = dueLabel.startsWith('Overdue');
    const priorityClass = `priority-${assignment.priority.toLowerCase()}`;
    return `
      <article class="assignment-item ${assignment.completed ? 'is-completed' : ''}" data-assignment-id="${assignment.id}" data-status="${assignment.completed ? 'completed' : 'pending'}">
        <button class="complete-toggle" type="button" data-action="toggle" aria-label="${assignment.completed ? 'Mark incomplete' : 'Mark complete'}: ${escapeHTML(assignment.title)}" aria-pressed="${assignment.completed}">${assignment.completed ? '✓' : ''}</button>
        <div class="assignment-main">
          <div class="assignment-title-row"><span class="assignment-title">${escapeHTML(assignment.title)}</span></div>
          <div class="assignment-meta"><span class="course-label">${escapeHTML(assignment.course)}</span><span>${assignment.completed ? 'Finished' : 'Assignment'}</span></div>
        </div>
        <div class="assignment-side">
          <span class="priority-badge ${priorityClass}">${escapeHTML(assignment.priority)} priority</span>
          <span class="due-label ${overdue ? 'overdue' : ''}">${escapeHTML(dueLabel)}</span>
          <div class="item-actions"><button class="small-action" type="button" data-action="edit">Edit</button><button class="small-action" type="button" data-action="delete">Delete</button></div>
        </div>
      </article>`;
  }).join('');

  elements.empty.classList.toggle('hidden', visible.length > 0);
  elements.list.classList.toggle('hidden', visible.length === 0);
  elements.allFilterCount.textContent = assignments.length;
  updateDashboard();
}

function updateDashboard() {
  const total = assignments.length;
  const completed = assignments.filter(assignment => assignment.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  elements.total.textContent = total;
  elements.pending.textContent = pending;
  elements.completed.textContent = completed;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressFill.style.width = `${percent}%`;
  elements.progressFill.setAttribute('aria-valuenow', String(percent));
  elements.progressCaption.textContent = total === 0 ? 'Add an assignment to get started.' : `${completed} of ${total} assignments completed.`;
}

function showForm(assignment = null) {
  editingId = assignment ? assignment.id : null;
  elements.form.reset();
  elements.error.textContent = '';
  elements.formTitle.textContent = assignment ? 'Edit assignment' : 'Add an assignment';
  elements.saveButton.textContent = assignment ? 'Save changes' : 'Save assignment';
  if (assignment) {
    elements.title.value = assignment.title;
    elements.course.value = assignment.course;
    elements.dueDate.value = assignment.dueDate;
    elements.priority.value = assignment.priority;
  } else {
    elements.dueDate.value = futureDate(1);
    elements.priority.value = 'Medium';
  }
  elements.form.classList.remove('hidden');
  elements.title.focus();
}

function hideForm() {
  elements.form.classList.add('hidden');
  elements.error.textContent = '';
  editingId = null;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderAssignments();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const title = elements.title.value.trim();
  const course = elements.course.value.trim();
  const dueDate = elements.dueDate.value;
  const priority = elements.priority.value;

  if (!title || !course || !dueDate) {
    elements.error.textContent = 'Please enter a title, course, and due date.';
    return;
  }
  if (dueDate < futureDate(0)) {
    elements.error.textContent = 'Choose today or a future date for the due date.';
    return;
  }

  if (editingId !== null) {
    const existing = assignments.find(assignment => assignment.id === editingId);
    if (!existing) return;
    Object.assign(existing, { title, course, dueDate, priority });
    showToast('Assignment updated.');
  } else {
    assignments.push({ id: nextId++, title, course, dueDate, priority, completed: false });
    showToast('Assignment added.');
  }
  hideForm();
  setFilter('All');
}

function handleAssignmentAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const card = button.closest('[data-assignment-id]');
  const id = Number(card?.dataset.assignmentId);
  const assignment = assignments.find(item => item.id === id);
  if (!assignment) return;

  if (button.dataset.action === 'toggle') {
    assignment.completed = !assignment.completed;
    renderAssignments();
    showToast(assignment.completed ? 'Nice work — marked complete!' : 'Assignment marked pending.');
  } else if (button.dataset.action === 'delete') {
    const index = assignments.findIndex(item => item.id === id);
    assignments.splice(index, 1);
    renderAssignments();
    showToast('Assignment deleted.');
  } else if (button.dataset.action === 'edit') {
    showForm(assignment);
    document.querySelector('#assignments').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function generateStudyPlan() {
  const pending = assignments.filter(assignment => !assignment.completed).sort((a, b) => {
    const dateDifference = a.dueDate.localeCompare(b.dueDate);
    return dateDifference || priorityRank(a.priority) - priorityRank(b.priority);
  });

  if (pending.length === 0) {
    elements.planPreview.innerHTML = '<div class="plan-preview-icon">✓</div><h3>You are all caught up!</h3><p>There are no pending assignments. Add another assignment whenever new work comes in.</p>';
    showToast('No pending assignments to plan.');
    return;
  }

  const topTasks = [...pending].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  const planItems = topTasks.map((assignment, index) => `
    <div class="plan-item"><span class="plan-number">${index + 1}</span><div><strong>${escapeHTML(assignment.title)}</strong><p>${escapeHTML(assignment.course)} · ${escapeHTML(getDueLabel(assignment))} · ${escapeHTML(assignment.priority)} priority</p></div></div>`).join('');
  const remaining = pending.length - topTasks.length;
  elements.planPreview.innerHTML = `<div class="plan-results"><div><p class="eyebrow">SUGGESTED ORDER</p><h3 style="margin-top:5px">Start with these tasks</h3></div>${planItems}<p class="plan-summary">${remaining > 0 ? `You have ${remaining} more pending ${remaining === 1 ? 'assignment' : 'assignments'} after these.` : 'Focus on one task at a time and take a short break between tasks.'}</p></div>`;
  showToast('Your study plan is ready.');
}

document.querySelector('#show-form-button').addEventListener('click', () => showForm());
document.querySelector('#empty-add-button').addEventListener('click', () => showForm());
document.querySelector('#close-form-button').addEventListener('click', hideForm);
document.querySelector('#cancel-form-button').addEventListener('click', hideForm);
elements.form.addEventListener('submit', handleFormSubmit);
elements.list.addEventListener('click', handleAssignmentAction);
elements.sort.addEventListener('change', renderAssignments);
elements.generatePlan.addEventListener('click', generateStudyPlan);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));

document.querySelector('#today-label').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
renderAssignments();
