import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KafkaServices } from '../kafka/kafka-constants';
import { ClientKafka } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { of, throwError } from 'rxjs';
import { TimeoutError } from 'rxjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;
  let kafkaClient: ClientKafka;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockKafkaClient = {
    send: jest.fn(),
    subscribeToResponseOf: jest.fn(),
    connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: KafkaServices.USER_SEARCH_SERVICE,
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    kafkaClient = module.get<ClientKafka>(KafkaServices.USER_SEARCH_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user if not existing', async () => {
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    mockKafkaClient.send.mockReturnValue(of(null)); // No user exists
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const expectedUser = { ...dto, password: hashedPassword };

    mockUserRepository.create.mockReturnValue(expectedUser);
    mockUserRepository.save.mockResolvedValue(expectedUser);

    const result = await service.create(dto);

    expect(result).toEqual({ name: dto.name, email: dto.email });
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: dto.name, email: dto.email }),
    );
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw if user already exists', async () => {
    mockKafkaClient.send.mockReturnValue(
      of({ id: '123', email: 'test@example.com' }),
    );

    await expect(
      service.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'pass',
      }),
    ).rejects.toThrow('Este correo ya está registrado.');
  });

  it('should throw ServiceUnavailableException on timeout', async () => {
    mockKafkaClient.send.mockReturnValue(throwError(() => new TimeoutError()));

    await expect(
      service.create({
        name: 'Timeout User',
        email: 'timeout@example.com',
        password: 'pass',
      }),
    ).rejects.toThrow(
      'El servicio de búsqueda de usuarios no respondió a tiempo',
    );
  });
});
