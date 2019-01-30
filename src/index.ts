import swagger2gen, { Swagger2 } from './swagger-2';

export default function(spec: Swagger2, options?: { output?: string; swagger?: number }) {
  const swagger = (options && options.swagger) || 2;

  if (swagger !== 2) {
    throw new Error(`Swagger version ${swagger} is not supported`);
  }

  return swagger2gen(spec);
}
