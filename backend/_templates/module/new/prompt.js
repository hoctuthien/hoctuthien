const toPascalCase = (value) =>
  value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

module.exports = {
  prompt: async ({ inquirer, args }) => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Tên module (số ít, ví dụ: user):',
        initial: args.name,
        validate: (value) =>
          value && value.trim().length > 0
            ? true
            : 'Vui lòng nhập tên module hợp lệ',
      },
      {
        type: 'input',
        name: 'route',
        message: 'Route prefix (mặc định dùng tên module dạng số nhiều):',
        initial: args.route,
      },
    ]);

    const normalizedName = answers.name.trim().toLowerCase();
    const pluralName = normalizedName.endsWith('s') ? normalizedName : `${normalizedName}s`;

    return {
      ...answers,
      name: normalizedName,
      className: toPascalCase(normalizedName),
      route:
        answers.route && answers.route.trim().length > 0
          ? answers.route.trim().toLowerCase()
          : pluralName,
      pluralName,
    };
  },
};
