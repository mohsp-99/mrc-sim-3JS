/**
 * Validates a configuration object against the MRC Module Configuration schema
 * @param {Object} cfg - The configuration object to validate
 * @throws {Error} If the configuration is invalid
 */
export function validateConfig(cfg) {
  // Check if cfg is an object
  if (typeof cfg !== 'object' || cfg === null || Array.isArray(cfg)) {
    throw new Error('Configuration must be a JSON object.');
  }

  // Check for required "modules" property
  if (!('modules' in cfg)) {
    throw new Error('Missing required "modules" property.');
  }

  // Check that modules is an array with at least one item
  if (!Array.isArray(cfg.modules)) {
    throw new Error('"modules" must be an array.');
  }
  
  if (cfg.modules.length === 0) {
    throw new Error('"modules" array must contain at least one item.');
  }

  // Validate each module
  for (const mod of cfg.modules) {
    // Check module is an object
    if (typeof mod !== 'object' || mod === null || Array.isArray(mod)) {
      throw new Error('Each module must be an object.');
    }

    // Check required fields
    if (!('id' in mod)) {
      throw new Error('Module is missing required "id" property.');
    }
    
    if (!('position' in mod)) {
      throw new Error(`Module with ID ${mod.id} is missing required "position" property.`);
    }

    // Validate id
    if (typeof mod.id !== 'number' || !Number.isInteger(mod.id) || mod.id < 1) {
      throw new Error(`Module ID must be a positive integer, found: ${mod.id}`);
    }

    // Validate position
    const position = mod.position;
    if (typeof position !== 'object' || position === null || Array.isArray(position)) {
      throw new Error(`Module ${mod.id}: position must be an object.`);
    }

    // Check position has required x, y, z properties
    if (!('x' in position)) {
      throw new Error(`Module ${mod.id}: position is missing required "x" property.`);
    }
    if (!('y' in position)) {
      throw new Error(`Module ${mod.id}: position is missing required "y" property.`);
    }
    if (!('z' in position)) {
      throw new Error(`Module ${mod.id}: position is missing required "z" property.`);
    }

    // Validate position x, y, z are numbers
    if (typeof position.x !== 'number') {
      throw new Error(`Module ${mod.id}: position.x must be a number.`);
    }
    if (typeof position.y !== 'number') {
      throw new Error(`Module ${mod.id}: position.y must be a number.`);
    }
    if (typeof position.z !== 'number') {
      throw new Error(`Module ${mod.id}: position.z must be a number.`);
    }

    // Validate optional properties
    if ('color' in mod && typeof mod.color !== 'string') {
      throw new Error(`Module ${mod.id}: color must be a string.`);
    }
    
    if ('pinned' in mod && typeof mod.pinned !== 'boolean') {
      throw new Error(`Module ${mod.id}: pinned must be a boolean.`);
    }
    
    if ('mass' in mod && typeof mod.mass !== 'number') {
      throw new Error(`Module ${mod.id}: mass must be a number.`);
    }

    // Check for no additional properties
    const allowedProps = ['id', 'position', 'color', 'pinned', 'mass'];
    for (const prop in mod) {
      if (!allowedProps.includes(prop)) {
        throw new Error(`Module ${mod.id}: contains unsupported property "${prop}".`);
      }
    }
  }

  // Validate connections if present
  if ('connections' in cfg) {
    if (!Array.isArray(cfg.connections)) {
      throw new Error('"connections" must be an array.');
    }

    for (const conn of cfg.connections) {
      // Check connection is an object
      if (typeof conn !== 'object' || conn === null || Array.isArray(conn)) {
        throw new Error('Each connection must be an object.');
      }

      // Check required fields
      if (!('from' in conn)) {
        throw new Error('Connection is missing required "from" property.');
      }
      if (!('to' in conn)) {
        throw new Error('Connection is missing required "to" property.');
      }
      if (!('dir' in conn)) {
        throw new Error('Connection is missing required "dir" property.');
      }

      // Validate from and to
      if (typeof conn.from !== 'number' || !Number.isInteger(conn.from)) {
        throw new Error(`Connection "from" must be an integer, found: ${conn.from}`);
      }
      if (typeof conn.to !== 'number' || !Number.isInteger(conn.to)) {
        throw new Error(`Connection "to" must be an integer, found: ${conn.to}`);
      }

      // Validate dir is one of the enum values
      if (typeof conn.dir !== 'string') {
        throw new Error('Connection "dir" must be a string.');
      }
      const validDirs = ['posX', 'negX', 'posY', 'negY', 'posZ', 'negZ'];
      if (!validDirs.includes(conn.dir)) {
        throw new Error(`Connection "dir" must be one of: ${validDirs.join(', ')}. Found: ${conn.dir}`);
      }

      // Validate optional properties
      if ('type' in conn && typeof conn.type !== 'string') {
        throw new Error('Connection "type" must be a string.');
      }
      if ('mode' in conn && typeof conn.mode !== 'string') {
        throw new Error('Connection "mode" must be a string.');
      }
      if ('strength' in conn && typeof conn.strength !== 'number') {
        throw new Error('Connection "strength" must be a number.');
      }

      // Check for no additional properties
      const allowedProps = ['from', 'to', 'dir', 'type', 'mode', 'strength'];
      for (const prop in conn) {
        if (!allowedProps.includes(prop)) {
          throw new Error(`Connection contains unsupported property "${prop}".`);
        }
      }
    }
  }

  // Check for no additional properties in the root object
  const allowedRootProps = ['modules', 'connections'];
  for (const prop in cfg) {
    if (!allowedRootProps.includes(prop)) {
      throw new Error(`Configuration contains unsupported property "${prop}".`);
    }
  }
}