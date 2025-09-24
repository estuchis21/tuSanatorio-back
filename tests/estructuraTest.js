// ejemplo.test.js

describe('Mi conjunto de tests', () => {

  test('toBe compara valores primitivos', () => {
    expect(2 + 3).toBe(5);
  });

  test('toEqual compara objetos o arrays', () => {
    expect({a: 1}).toEqual({a: 1});
    expect([1, 2]).toEqual([1, 2]);
  });

  test('toBeTruthy y toBeFalsy', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  test('toContain revisa si un array contiene un valor', () => {
    expect([1, 2, 3]).toContain(2);
  });

  test('toHaveLength revisa la longitud de un array o string', () => {
    expect([1, 2, 3]).toHaveLength(3);
    expect('hola').toHaveLength(4);
  });

});
