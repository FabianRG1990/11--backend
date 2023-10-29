import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService

    ){}

  async create(createUserDto: CreateUserDto): Promise<User> {  

      try{
      // 1- encriptar la contraseña
      const { password, ...userData} = createUserDto;

      const newUser = new this.userModel( {
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      } );

      // 2- guardar el usuario
      
      // 3- generar el JWT [jason wed token]

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      
      return user;
      
      // const newUser = new this.userModel( createUserDto );
      // return await newUser.save();
    }catch(error){
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email}  ya existe`)
      }
      throw new InternalServerErrorException('Algo salio mal')
    }

  }

  async login( loginDto: LoginDto ){
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('credenciales no validadas - email');
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('credenciales no validadas - password');

    }const {password:_, ...rest} = user.toJSON();

    return {
      user:rest,
      token: this.getJwtToken({ id: user.id }),
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken( palyload: JwtPayload ) {
    const token = this.jwtService.sign(palyload);
    return token;
  }
}
