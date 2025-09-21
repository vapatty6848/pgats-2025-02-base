const request = require('supertest');
const { expect } = require('chai');
const app = require('../../rest/app');

describe('User Registration and Login  - User Login', () => {
  let token;

  beforeEach(async () => {
    // Garante que o usuário existe antes do login
    await request(app)
      .post('/api/users/register')
      .send({
        name: 'Alice',
        email: 'alice@email.com',
        password: '123456'
      });

    // Faz login e armazena o token
    const resposta = await request(app)
      .post('/api/users/login')
      .send({
        email: 'alice@email.com',
        password: '123456'
      });
    token = resposta.body.token;
  });

  it('1 - Quando tento registrar um email já cadastrado  resposta email já cadastrado', async () => {
    const resposta = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Alice',
        email: 'alice@email.com',
        password: '123456'
      });
    expect(resposta.body).to.have.property('error', 'Email já cadastrado');
  });

  it('2 - Quando registro um novo usuário recebo 201 e os dados ', async () => {
    const resposta = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Charlie',
        email: 'charlie@gmail.com',
        password: '123456'
      });
    expect(resposta.status).to.equal(201);
    expect(resposta.body.user).to.have.property('name', 'Charlie');
    expect(resposta.body.user).to.have.property('email', 'charlie@gmail.com');
  });

  it('3 - Quando faço login com usuário válido recebo token', async () => {
    const resposta = await request(app)
      .post('/api/users/login')
      .send({
        email: 'alice@email.com',
        password: '123456'
      });
    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.have.property('token');
  });

  it('4 - Checkout: retorna 200 e valorFinal', async () => {
    const resposta = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 1, quantity: 2 }],
        freight: 10,
        paymentMethod: 'boleto'
      });
    console.log(resposta.body);
    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.have.property('valorFinal');
  });
});
