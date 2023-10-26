import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private userModel: Model<User>){}

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
}
