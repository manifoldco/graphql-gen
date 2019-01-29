import swagger2, { Swagger2 } from './swagger-2';

export default (spec: Swagger2, options?: { output: string; swagger?: number }) => {
  const swagger = (options && options.swagger) || 2;

  if (swagger === 1 || swagger === 3) {
    console.error('That version is not supported');
    return;
  }

  return swagger2(spec);
};
