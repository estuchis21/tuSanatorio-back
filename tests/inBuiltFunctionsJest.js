expect(value).toBe(expected);        // Igualdad estricta (===)
expect(value).toEqual(expected);     // Igualdad profunda (objetos/arrays)
expect(value).not.toBe(expected);    // Negación
expect(value).toBeNull();            // null
expect(value).toBeUndefined();       // undefined
expect(value).toBeDefined();         // definido
expect(value).toBeTruthy();          // truthy
expect(value).toBeFalsy();           // falsy
expect(value).toBeGreaterThan(3);    // mayor que
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(3);
expect(value).toBeLessThanOrEqual(3);
expect(value).toBeCloseTo(0.1 + 0.2); // para floats
expect(value).toMatch(/regex/);       // regex para strings
expect(value).toContain(item);        // arrays o strings
expect(array).toHaveLength(3);



/*matchers*/
expect(obj).toHaveProperty('key');        // objeto tiene propiedad
expect(obj).toHaveProperty('key.subkey'); // anidado
expect(obj).toMatchObject({a: 1, b: 2});  // compara parcialmente


/*para errores*/
expect(() => someFn()).toThrow();               // lanza cualquier error
expect(() => someFn()).toThrow('mensaje');     // mensaje específico
expect(() => someFn()).toThrowError(TypeError); // tipo de error





