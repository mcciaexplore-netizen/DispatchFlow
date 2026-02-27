export function validateSlipForm(formData) {
  const errors = {};

  if (!formData.itemDescription?.trim()) {
    errors.itemDescription = "Item description is required";
  }
  if (!formData.customerName?.trim()) {
    errors.customerName = "Customer name is required";
  }
  if (formData.quantity && isNaN(Number(formData.quantity))) {
    errors.quantity = "Quantity must be a number";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
