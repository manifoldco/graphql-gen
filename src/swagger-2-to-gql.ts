import * as prettier from 'prettier';

export interface Swagger2 {
  definitions: {
    [id: string]: Swagger2Definition;
  };
}

export interface Swagger2Definition {
  $ref?: string;
  enum?: string[];
  description?: string;
  items?: Swagger2Definition;
  properties?: { [key: string]: Swagger2Definition };
  required?: boolean;
  type: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';
}

// Primitives only!
const TYPES: { [index: string]: string } = {
  boolean: 'Boolean',
  integer: 'Int',
  number: 'Number',
  string: 'String',
};

function camelCase(name: string) {
  return name.replace(/(-|_|\.|\s)+[a-z]/g, letter =>
    letter.toUpperCase().replace(/[^0-9a-z]/gi, '')
  );
}

function snakeCase(name: string) {
  return name
    .replace(/(-|\.|\s)/g, '_')
    .replace(/[A-Z]/g, letter => `_${letter}`)
    .toUpperCase();
}

function parse(spec: Swagger2) {
  const queue: [string, Swagger2Definition][] = [];
  const enumQueue: [string, (string | number)[]][] = [];
  const output: string[] = [];

  const { definitions } = spec;

  function getRef(lookup: string): [string, Swagger2Definition] {
    const ref = lookup.replace('#/definitions/', '');
    return [ref, definitions[ref]];
  }

  function getType(definition: Swagger2Definition, nestedName: string) {
    const { $ref, items, type, ...value } = definition;

    if ($ref) {
      const [refName, refProperties] = getRef($ref);
      if (refName === 'ID') return 'ID';
      return `[${TYPES[refProperties.type] || refName || 'scalar'}]`;
    }

    if (type === 'array' && items) {
      if (items.$ref) {
        const [refName, refProperties] = getRef(items.$ref);
        if (refName === 'ID') return 'ID';
        return `[${TYPES[refProperties.type] || refName || 'scalar'}]`;
      }
      return `[${TYPES[items.type] || 'scalar'}]`;
    }

    if (value.properties) {
      // If this is a nested object, let’s add it to the stack for later
      queue.push([nestedName, { $ref, items, type, ...value }]);
      return nestedName;
    }

    return TYPES[type] || type || 'scalar';
  }

  function buildNextEnum([ID, options]: [string, (string | number)[]]) {
    output.push(`enum ${ID} {`);
    options.forEach(option => {
      if (typeof option === 'number' || isNaN(parseInt(option, 10)) === false) {
        const lastWord = ID.search(/[A-Z](?=[^A-Z]*$)/);
        const name = ID.substr(lastWord, ID.length);
        output.push(`${name}${option}`);
      } else {
        output.push(snakeCase(option));
      }
    });
    output.push('}');
  }

  function buildNextObject() {
    const nextObject = queue.pop();
    if (!nextObject) return; // Geez TypeScript it’s going to be OK
    const [ID, { properties, required }] = nextObject;

    // We can skip this if it’s a primitive or array of something else
    if (typeof properties !== 'object') {
      return;
    }

    // Open type
    output.push(`type ${camelCase(ID)} {`);

    // Populate type
    Object.entries(properties).forEach(([key, value]) => {
      const optional = !Array.isArray(required) || required.indexOf(key) === -1;
      const nonNullable = optional ? '' : '!';
      const name = camelCase(key);
      const newID = camelCase(`${ID}_${key}`);
      const type = getType(value, newID);

      if (typeof value.description === 'string') {
        // Print out descriptions as comments, but only if there’s something there (.*)
        output.push(`"${value.description.replace(/\n$/, '').replace(/\n/g, '')}"`);
      }

      // Save enums for later
      if (Array.isArray(value.enum)) {
        enumQueue.push([newID, value.enum]);
        output.push(`${name}: ${newID}${nonNullable}`);
        return;
      }

      output.push(`${name}: ${type}${nonNullable}`);
    });

    // Close type
    output.push('}');

    // Clean up enumQueue
    while (enumQueue.length > 0) {
      const nextEnum = enumQueue.pop();
      if (nextEnum) buildNextEnum(nextEnum);
    }
  }

  // Begin parsing top-level entries
  Object.entries(definitions).forEach(entry => queue.push(entry));
  queue.sort((a, b) => a[0].localeCompare(b[0]));
  while (queue.length > 0) {
    buildNextObject();
  }

  return prettier.format(output.join('\n'), { parser: 'graphql' });
}

export default parse;
