import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  EMAIL: 'nico@las.test',
  PASSWORD: 'testPassword',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create user account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              createAccount(input:{
                email: "${testUser.EMAIL}",
                password: "${testUser.PASSWORD}"
                role: Client
              }){
                ok,
                error
              }
            }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              createAccount(input:{
                email: "${testUser.EMAIL}",
                password: "${testUser.PASSWORD}"
                role: Client
              }){
                ok,
                error
              }
            }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeFalsy();
          expect(res.body.data.createAccount.error).toBe(
            'There is a user with that email already',
          );
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input:{
              email: "${testUser.EMAIL}",
              password: "${testUser.PASSWORD}"
            }){
              ok,
              token,
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBeTruthy();
          expect(login.error).toBeNull();
          expect(login.token).toEqual(expect.any(String));

          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input:{
              email: "${testUser.EMAIL}",
              password: "wrongPassword"
            }){
              ok,
              token,
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBeFalsy();
          expect(login.error).toEqual('Wrong password');
          expect(login.token).toBeNull();
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
        {
          userProfile(userId: ${userId}){
            error,
            ok,
            user {
              id,
              email,
              role
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;

          console.log(res.body);

          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(id).toBe(userId);
        });
    });

    it("shouldn't find a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
        {
          userProfile(userId: 111){
            error,
            ok,
            user {
              id,
              email,
              role
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;

          console.log(res.body);

          expect(ok).toBeFalsy();
          expect(error).toBe('User Not Found');
          expect(user).toBeNull();
        });
    });

    describe('me', () => {
      it('should find my profile', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            {
              me {
                id,
                email,
                role,
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  me: { email },
                },
              },
            } = res;

            expect(email).toBe(testUser.EMAIL);
          });
      });

      it('should not allow logged out user', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            {
              me {
                id,
                email,
                role,
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: { errors },
            } = res;

            const [error] = errors;

            expect(error.message).toBe('Forbidden resource');
          });
      });
    });

    describe('editProfile', () => {
      const NEW_EMAIL = 'yoon@heavymetal.universe';

      it('should change email', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            mutation {
              editProfile(input: {
                email: "${NEW_EMAIL}"
              }){
                ok,
                error
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  editProfile: { ok, error },
                },
              },
            } = res;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should have new email', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            {
              me {
                id,
                email,
                role,
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  me: { email },
                },
              },
            } = res;

            expect(email).toBe(NEW_EMAIL);
          });
      });
    });

    describe('verifyEmail', () => {
      let verificationCode: string;

      beforeAll(async () => {
        const [verification] = await verificationRepository.find();
        console.log(verification);
        verificationCode = verification.code;
      });

      it('should fail on verification code not found', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            mutation {
              verifyEmail(input: {
                code: "wrong code"
              }){
                ok,
                error
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  verifyEmail: { ok, error },
                },
              },
            } = res;

            expect(ok).toBeFalsy();
            expect(error).toBe('Verification not found.');
          });
      });

      it('should verify email', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            mutation {
              verifyEmail(input: {
                code: "${verificationCode}"
              }){
                ok,
                error
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  verifyEmail: { ok, error },
                },
              },
            } = res;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should fail call verifyEmail twice', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            mutation {
              verifyEmail(input: {
                code: "${verificationCode}"
              }){
                ok,
                error
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body);
            const {
              body: {
                data: {
                  verifyEmail: { ok, error },
                },
              },
            } = res;

            expect(ok).toBeFalsy();
            expect(error).toBe('Verification not found.');
          });
      });
    });

    it.todo('getVerifyCode');
  });
});
