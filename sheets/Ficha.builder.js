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
  b.submatrix({ id: 'nomes', cols: 3, rows: 2, colspan: 5, cells: [
    [ b.field('nome_personagem').fieldType('text').label('Nome do Personagem').colspan(3) ],
    [ b.field('nome_jogador').fieldType('text').label('Nome do Jogador').colspan(1) ]
  ] }).background('red'),
  b.image('avatar').label('Avatar').width(100).height(100)
]);

// Section title
b.addRow([ b.static('CARACTERÍSTICAS').colspan(2) ]);

// Attributes submatrix (example)
const attributes = b.submatrix({
  id: 'attributes',
  label: 'Atributos',
  rows: 2,
  cols: 6,
  colspan: 6,
  cells: [
    [
      b.field('forca_fisica').fieldType('number').label('Força Física').value(10),
      b.field('agilidade').fieldType('number').label('Agilidade').value(10),
      b.field('intelecto').fieldType('number').label('Intelecto').value(10),
      b.field('astucia').fieldType('number').label('Astúcia').value(10),
      b.field('forca_vontade').fieldType('number').label('Força de Vontade').value(10),
      b.field('porte').fieldType('number').label('Porte').value(10)
    ],
    [
      b.computed('mod_forca_fisica').label('Mod').expr('Math.floor((forca_fisica-10)/2)'),
      b.computed('mod_agilidade').label('Mod').expr('Math.floor((agilidade-10)/2)'),
      b.computed('mod_intelecto').label('Mod').expr('Math.floor((intelecto-10)/2)'),
      b.computed('mod_astucia').label('Mod').expr('Math.floor((astucia-10)/2)'),
      b.computed('mod_forca_vontade').label('Mod').expr('Math.floor((forca_vontade-10)/2)'),
      b.computed('mod_porte').label('Mod').expr('Math.floor((porte-10)/2)')
    ]
  ]
});

b.addRow([ attributes ]);

// Perícias
b.addRow([ b.static('PERÍCIAS E HABILIDADES').colspan(6) ]);
b.addRow([
  b.list({
    id: 'pericias', label: 'Perícias',
    itemTemplate: [
      { type: 'field', id: 'skill_name', label: 'Perícia', fieldType: 'text' },
      { type: 'field', id: 'skill_val', label: 'Valor', fieldType: 'number' }
    ],
    items: []
  }).colspan(6)
]);

const sheet = b.build();
export default sheet;
