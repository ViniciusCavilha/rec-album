describe('Rec Álbum com SQLite', () => {
  it('cadastra usuário e mantém álbum após recarregar', () => {
    const email = `sqlite-${Date.now()}@teste.com`

    cy.visit('/cadastro')
    cy.get('ion-input').eq(0).shadow().find('input').type('Aluno Teste')
    cy.get('ion-input').eq(1).shadow().find('input').type(email)
    cy.get('ion-input').eq(2).shadow().find('input').type('123456')
    cy.contains('ion-button', 'Começar minha coleção').click()
    cy.contains('Discos que merecem replay.').should('be.visible')

    cy.visit('/app/novo-album')
    cy.get('ion-input').eq(0).shadow().find('input').type('Álbum SQLite')
    cy.get('ion-input').eq(1).shadow().find('input').type('Artista Teste')
    cy.get('ion-input').eq(2).shadow().find('input').clear().type('2026')
    cy.get('ion-input').eq(3).shadow().find('input').type('Primeira faixa')
    cy.contains('ion-button', 'Guardar na coleção').click()
    cy.contains('Álbum SQLite').should('be.visible')

    cy.reload()
    cy.contains('Álbum SQLite').should('be.visible')
  })
})
