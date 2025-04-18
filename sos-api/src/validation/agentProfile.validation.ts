export const validateAgentProfileUpdateFields = (body: any) => {
  console.log('body :>> ', body);
  const errors: { field: string; message: string }[] = [];

  const requiredFields = ['first_name', 'last_name', 'gender', 'date_of_birth', 'avatar'];

  requiredFields.forEach(field => {
    if (!body[field]) {
      errors.push({ field, message: `The '${field}' field is required.` });
    }
  });

  const date = new Date(body.date_of_birth?.value);

  if (body.date_of_birth && (isNaN(date.getTime()) || date > new Date() || date.getFullYear() < 1900)) {
    errors.push({ field: 'date_of_birth', message: 'Date of birth is invalid' });
  }

  return errors;
};
