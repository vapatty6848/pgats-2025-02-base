const request = require('supertest');
const { expect } = require('chai');


require('dotenv').config();

describe('User Registration and Login  - Usando api externa', () => {

  let token;


 beforeEach(async () => {
  // Registra o usuário via GraphQL
  await request(process.env.BASE_URL_GRAPHQL)
    .post('/graphql')
    .send({
      query: `
        mutation Register($name: String!, $email: String!, $password: String!) {
          register(name: $name, email: $email, password: $password) {
            name
            email
          }
        }
      `,
      variables: {
        name: 'Alice',
        email: 'alice@email.com',
        password: '123456'
      }
    });

    // Faz login via GraphQL e armazena o token
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post('/graphql')
      .send({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
            }
          }
        `,
        variables: {
          email: 'alice@email.com',
          password: '123456'
        }
      });
    token = resposta.body.data.login.token;
  });


  it('1 - Quando tento registrar um email já cadastrado  resposta email já cadastrado', async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post('/graphql')
      .send({
      query: `
        mutation Register($name: String!, $email: String!, $password: String!) {
          register(name: $name, email: $email, password: $password) {
            name
            email
          }
        }
      `,
      variables: {
        name: 'Alice',
        email: 'alice@email.com',
        password: '123456'
      }
    });
    expect(resposta.body.errors[0].message).to.match(/Email já cadastrado/);
  });



  it('2 - Quando faço login com usuário válido recebo token', async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post('/graphql')
      .send({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
            }
          }
        `,
        variables: {
          email: 'alice@email.com',
          password: '123456'
        }
      });
    expect(resposta.body.data.login).to.have.property('token');
  });

  it('3 - Checkout: retorna 200 e valorFinal', async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
            checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
              valorFinal
            }
          }
        `,
        variables: {
          items: [{ productId: 1, quantity: 2 }],
          freight: 10,
          paymentMethod: 'boleto'
        }
      });
    expect(resposta.body.data.checkout).to.have.property('valorFinal');
  });

    it('4 - Checkout: token inválido', async () => {
      token = ' ';
      const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
            checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
              valorFinal
            }
          }
        `,
        variables: {
          items: [{ productId: 1, quantity: 2 }],
          freight: 10,
          paymentMethod: 'boleto'
        }
      });
    expect(resposta.body.errors[0].message).to.match(/Token inválido/);
    });

});
