import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDTO } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDTO, EditBookmarkDTO } from 'src/bookmark/dto';

const apiURL = 'http://localhost:3333';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(apiURL);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDTO = {
      email: 'test@email.com',
      password: 'test_password',
    };
    describe('SignUp', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: '',
            password: 123,
          })
          .expectStatus(400);
      });
      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'sdfas@email.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw error if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: 'email.com' })
          .expectStatus(400);
      });
      it('should throw error if body is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });
    });
    describe('SignIn', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('shuld throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: '',
            password: 123,
          })
          .expectStatus(400);
      });
      it('shuld throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'sdfas@email.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw error if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: 'email.com' })
          .expectStatus(400);
      });
      it('should throw error if body is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({})
          .expectStatus(400);
      });
    });
  });
  describe('Users', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'TestFirstName',
          lastName: 'TestLastName',
        };
        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .expectStatus(200)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });
  describe('Bookmarks', () => {
    const dto: CreateBookmarkDTO = {
      title: 'test-title',
      link: 'test-link',
      description: 'test-description',
    };
    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });

      it('should not be able to create bookmark without login', () => {
        return pactum.spec().post('/bookmarks').withBody(dto).expectStatus(401);
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('should not be able to get bookmarks without login', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('should not be able to get bookmark by id without login', () => {
        return pactum.spec().get('/bookmarks/$S{bookmarkId}').expectStatus(401);
      });

      it('should not be able to get bookmark by id if id is not valid', () => {
        return pactum
          .spec()
          .get('/bookmarks/123')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403);
      });
    });

    describe('Edit bookmark', () => {
      it('should be able to edit bookmark', () => {
        const dto: EditBookmarkDTO = {
          title: 'test-title-edited',
          link: 'test-link-edited',
          description: 'test-description-edited',
        };
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .expectBodyContains(dto.description);
      });

      it('should not be able to edit bookmark without login', () => {
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .expectStatus(401);
      });

      it('should not be able to edit non existing bookmark', () => {
        return pactum.spec().patch('/bookmarks/123').expectStatus(401);
      });
    });

    describe('Delete bookmark', () => {
      it('should be able to delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('should not be able to delete bookmark without login', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bookmarkId}')
          .expectStatus(401);
      });

      it('should get empty bookmarks list after delete', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('');
      });
    });
  });
});
