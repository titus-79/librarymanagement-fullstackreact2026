describe('Book list', () => {
  it('should display books returned by the API', () => {
    cy.intercept('GET', 'http://localhost:3000/books', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Dune',
          author: 'Frank Herbert',
          available_copies: 3,
          total_copies: 3,
        },
      ],
    }).as('getBooks');

    cy.visit('http://localhost:4200');

    cy.wait('@getBooks');

    cy.get('.book-item')
      .should('have.length.at.least', 1)
      .and('contain.text', 'Dune');
  });

  it('should add a book', () => {
    cy.intercept('POST', 'http://localhost:3000/books', {
        statusCode: 201,
        body: {
            id: 2,
            title: 'Fondation',
            author:'Isaac Asimov',
            available_copies: 2,
            total_copies: 2,
        },
    }).as('postBooks');

    cy.visit('http://localhost:4200/add');

    cy.get('[data-cy="title"]').type('Fondation');
    cy.get('[data-cy="author"]').type('Isaac Asimov');
    cy.get('[data-cy="copies"]').type('{selectall}2').should('have.value', '2');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@postBooks').then((interception) => {
        expect(interception.request.body).to.deep.equal({
            title: 'Fondation',
            author: 'Isaac Asimov',
            available_copies: 2,
            total_copies: 2,
        });
    });
    cy.url().should('eq', 'http://localhost:4200/');
    
  });

  // Test : si tu supprimes un livre, il ne doit plus apparaître dans la liste

it('should disappear a book when deleted', () => {
  cy.intercept('GET', 'http://localhost:3000/books', {
    statusCode: 200,
    body: [
      { id: 1, title: 'Dune', author: 'Frank Herbert', available_copies: 3, total_copies: 3 },
    ],
  }).as('getBooks');

  cy.intercept('DELETE', 'http://localhost:3000/books/1', {
    statusCode: 200,
    body: {},
  }).as('deleteBook');

  cy.visit('http://localhost:4200');
  cy.wait('@getBooks');

  cy.intercept('GET', 'http://localhost:3000/books', {
    statusCode: 200,
    body: [],
  }).as('getBooksAfterDelete');

  cy.get('[data-cy="delete"]').click();

  cy.wait('@deleteBook');
  cy.wait('@getBooksAfterDelete');

  cy.get('[data-cy="book-item"]').should('not.exist');
});

  // Test : si tu empruntes un livre, son nombre d'exemplaires disponibles doit diminuer
it('should decrease available_copies when borrowing a book', () => {
  cy.intercept('GET', 'http://localhost:3000/books', {
    statusCode: 200,
    body: [
      { id: 1, title: 'Dune', author: 'Frank Herbert', available_copies: 3, total_copies: 3 },
    ],
  }).as('getBooks');

  cy.intercept('PUT', 'http://localhost:3000/books/1/borrow', {
    statusCode: 200,
    body: {},
  }).as('borrowBook');

  cy.visit('http://localhost:4200');
  cy.wait('@getBooks');

  cy.intercept('GET', 'http://localhost:3000/books', {
    statusCode: 200,
    body: [
      { id: 1, title: 'Dune', author: 'Frank Herbert', available_copies: 2, total_copies: 3 },
    ],
  }).as('getBooksAfterBorrow');

  cy.get('[data-cy="borrow"]').click();

  cy.wait('@borrowBook');
  cy.wait('@getBooksAfterBorrow');

  cy.get('[data-cy="available_copies"]')
    .should('have.length.at.least', 1)
    .and('contain.text', '2');
});
});