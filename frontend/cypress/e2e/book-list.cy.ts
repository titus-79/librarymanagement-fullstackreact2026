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

    cy.get('#title').type('Fondation');
    cy.get('#author').type('Isaac Asimov');
    cy.get('#copies').type('{selectall}2').should('have.value', '2');
    
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
});