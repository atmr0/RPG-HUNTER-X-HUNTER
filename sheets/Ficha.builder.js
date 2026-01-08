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
    [ 
      b.field('nome_jogador').fieldType('text').label('Nome do Jogador').colspan(1).background('red'),
      b.select('nen_type').label('Tipo de Nen').options(['Não descoberto','Aprimorador','Emissor','Manipulador','Transmutador','Conjurador','Especialista']).colspan(1),
    ]
  ] }).background('blue'),
  b.image('avatar').label('Avatar').width(79).height(70)
]);

// Section title
b.addRow([ b.static('CARACTERÍSTICAS').colspan(2) ]);

// Attributes submatrix (example) — created via helper
const attributes = b.characterAttributes([
  { id: 'forca_fisica', label: 'Força Física', value: 10 },
  { id: 'agilidade', label: 'Agilidade', value: 10 },
  { id: 'intelecto', label: 'Intelecto', value: 10 },
  { id: 'astucia', label: 'Astúcia', value: 10 },
  { id: 'forca_vontade', label: 'Força de Vontade', value: 10 },
  { id: 'porte', label: 'Porte', value: 10 }
], { id: 'attributes', label: 'Atributos', colspan: 6 });

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
