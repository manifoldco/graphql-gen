import swagger2, { Swagger2 } from './swagger-2-to-gql';

export default (spec: Swagger2, options?: { version?: number }) => {
  const version = (options && options.version) || 2;

  if (version === 1 || version === 3) {
    console.error('That version is not supported');
    return;
  }

  return swagger2(spec);
};
