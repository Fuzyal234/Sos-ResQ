export const validateProfileUpdateFields = (body: any) => {
  console.log('body :>> ', body);
  const errors: {field: string; message: string}[] = [];

  const requiredFields = [
    'full_name',
    'gender',
    'date_of_birth',
    'address',
    'avatar',
  ];

  requiredFields.forEach(field => {
    if (!body[field]) {
      errors.push({field, message: `The '${field}' field is required.`});
    }
  });

  if (
    body.gender &&
    !['male', 'female', 'other'].includes(body.gender?.value)
  ) {
    errors.push({
      field: 'gender',
      message: "Gender must be 'male', 'female', or 'other'",
    });
  }

  const date = new Date(body.date_of_birth?.value);
  if (
    body.date_of_birth &&
    (isNaN(date.getTime()) || date > new Date() || date.getFullYear() < 1900)
  ) {
    errors.push({field: 'date_of_birth', message: 'Date of birth is invalid'});
  }

  if (body.address && body.address?.value?.length > 100) {
    errors.push({
      field: 'address',
      message: 'Address cannot be more than 100 characters',
    });
  }

  return errors;
};
