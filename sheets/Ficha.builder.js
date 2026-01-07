import SheetBuilder from '../src/sheetBuilder.js';

const b = new SheetBuilder({
  title: 'Fronteira - Ficha (exemplo) (built)',
  id: 'ficha_teste_built',
  description: 'Ficha criada via builder',
  cols: 6,
  rows: 90
});

// Character name + avatar
b.addRow([
  b.submatrix({id: 'nomes',cols:3,rows:2, cells:[
    [b.field({ id: 'nome_personagem', label: 'Nome do Personagem', fieldType: 'text', colspan: 3 })],
    [b.field({ id: 'nome_jogador', label: 'Nome do Jogador', fieldType: 'text', colspan: 1 })],
  ],colspan:5}),
  b.image({ id: 'avatar', label: 'Avatar', width: 100, height: 100 })
]);

// Section title
b.addRow([ b.static('CARACTERÍSTICAS', { colspan: 2 }) ]);

// Attributes submatrix (example)
const attributes = {
  id: 'attributes', label: 'Atributos', rows: 2, cols: 6, colspan: 6,
  cells: [
    [
      b.field({ id: 'forca_fisica', label: 'Força Física', fieldType: 'number', value: 10 }),
      b.field({ id: 'agilidade', label: 'Agilidade', fieldType: 'number', value: 10 }),
      b.field({ id: 'intelecto', label: 'Intelecto', fieldType: 'number', value: 10 }),
      b.field({ id: 'astucia', label: 'Astúcia', fieldType: 'number', value: 10 }),
      b.field({ id: 'forca_vontade', label: 'Força de Vontade', fieldType: 'number', value: 10 }),
      b.field({ id: 'porte', label: 'Porte', fieldType: 'number', value: 10 })
    ],
    [
      b.computed({ id: 'mod_forca_fisica', label: 'Mod', expr: 'Math.floor((forca_fisica-10)/2)' }),
      b.computed({ id: 'mod_agilidade', label: 'Mod', expr: 'Math.floor((agilidade-10)/2)' }),
      b.computed({ id: 'mod_intelecto', label: 'Mod', expr: 'Math.floor((intelecto-10)/2)' }),
      b.computed({ id: 'mod_astucia', label: 'Mod', expr: 'Math.floor((astucia-10)/2)' }),
      b.computed({ id: 'mod_forca_vontade', label: 'Mod', expr: 'Math.floor((forca_vontade-10)/2)' }),
      b.computed({ id: 'mod_porte', label: 'Mod', expr: 'Math.floor((porte-10)/2)' })
    ]
  ]
};

b.addRow([ b.submatrix(attributes) ]);

// Perícias
b.addRow([ b.static('PERÍCIAS E HABILIDADES', { colspan: 6 }) ]);
b.addRow([
  b.list({
    id: 'pericias', label: 'Perícias', colspan: 6,
    itemTemplate: [
      { type: 'field', id: 'skill_name', label: 'Perícia', fieldType: 'text' },
      { type: 'field', id: 'skill_val', label: 'Valor', fieldType: 'number' }
    ],
    items: []
  })
]);

const sheet = b.build();
export default sheet;
