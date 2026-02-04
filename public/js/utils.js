// ca2 frontend - message and field error display helpers

// show error message in element (pass the id of the element)
function showError(id, text) {
  var msgBox = document.getElementById(id);
  if (msgBox === null) return;
  msgBox.textContent = text;
  msgBox.className = 'message error';
  msgBox.classList.remove('hidden');
}

// show success message
function showSuccess(id, text) {
  var msgBox = document.getElementById(id);
  if (msgBox === null) return;
  msgBox.textContent = text;
  msgBox.className = 'message success';
  msgBox.classList.remove('hidden');
}

// hide message element
function hideMessage(id) {
  var msgBox = document.getElementById(id);
  if (msgBox !== null) msgBox.classList.add('hidden');
}

// show field-level error
function showFieldError(fieldId, text) {
  var errBox = document.getElementById(fieldId + '-error');
  if (errBox !== null) {
    errBox.textContent = text;
    errBox.classList.remove('hidden');
  }
  var inputBox = document.getElementById(fieldId);
  if (inputBox !== null) inputBox.classList.add('input-error');
}

// hide field-level error
function hideFieldError(fieldId) {
  var errBox = document.getElementById(fieldId + '-error');
  if (errBox !== null) errBox.classList.add('hidden');
  var inputBox = document.getElementById(fieldId);
  if (inputBox !== null) inputBox.classList.remove('input-error');
}

// clear all field errors
function clearAllFieldErrors() {
  var allErrors = document.querySelectorAll('.field-error');
  for (var i = 0; i < allErrors.length; i++) {
    allErrors[i].classList.add('hidden');
  }
  var allInputs = document.querySelectorAll('.input-error');
  for (var j = 0; j < allInputs.length; j++) {
    allInputs[j].classList.remove('input-error');
  }
}
